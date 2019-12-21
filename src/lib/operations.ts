import { isNull, isNumber, isString } from "ts-type-guards";

import { Condition, isDesired } from "./environment";

type ActionResult = string | void;
type OperationResult = OperationFailure | undefined;
const SUCCESS = undefined;

export const enum Reason { DEPENDENCIES, INTERNAL }

export type OperationFailure = Readonly<{
    reason: Reason.DEPENDENCIES
    dependencies: ReadonlyArray<{ key: string, selector: string }>
} | {
    reason: Reason.INTERNAL
    message: string
}>;

export type OperationAndFailure<K extends string> = Readonly<{
    operation: Operation<K>
    result: OperationFailure
}>;

/*
The type of `condition` is chosen so that side-effects can be deferred from the time of declaring operations to when they are executed.
A prime example is if a condition should be based on the content of document.head:
In some scenarios, e.g. a WebExtension running in Google Chrome, document.head is null when the operations are declared.
*/
type BaseOperation = Readonly<{
    condition: Condition
    description: string
    deferUntil?: (state: DocumentReadyState) => boolean
}>;

// The purpose of these types is to enforce the dependencies–action relationship.
type DependentOperationSpec<K extends string> = BaseOperation & Readonly<{
    dependencies: { [k in K]: string }
    action: (e: { [k in K]: HTMLElement }) => ActionResult
}>;

type IndependentOperationSpec = BaseOperation & Readonly<{
    dependencies?: undefined
    action: () => ActionResult
}>;

export type Operation<K extends string> = DependentOperationSpec<K> | IndependentOperationSpec;

export function operation<K extends string>(spec: Operation<K>): Operation<any> {
    return spec as Operation<any>;
}

export type FailuresHandler = (failures: ReadonlyArray<OperationAndFailure<any>>) => void;

export type OperationsPlan = Readonly<{
    operations: ReadonlyArray<Operation<any>>
    interval: number // time between each try in milliseconds
    tryUntil: (state: DocumentReadyState) => boolean // when to stop trying
    extraTries: number // number of extra tries after tryUntil is satisfied
    handleFailures: FailuresHandler
}>;

export function runOperations(plan: OperationsPlan): void {
    function run(
        operations: ReadonlyArray<Operation<any>>,
        failures: Array<OperationAndFailure<any>>,
        triesLeft?: number,
    ): void {
        const lastTry = isNumber(triesLeft) && triesLeft <= 0;
        const operationsToRunNow: Array<Operation<any>> = [];
        const remaining: Array<Operation<any>> = [];
        const readyState = document.readyState;
        // Decide which operations to run now:
        for (const o of operations) {
            const shouldRunNow = o.deferUntil === undefined || o.deferUntil(readyState);
            (shouldRunNow ? operationsToRunNow : remaining).push(o);
        }
        // Run the operations and collect failures:
        for (const o of operationsToRunNow) {
            const result = tryToPerform(o);
            if (result !== SUCCESS) {
                switch (result.reason) {
                    case Reason.DEPENDENCIES:
                        lastTry ? failures.push({ result, operation: o }) : remaining.push(o);
                        break;
                    case Reason.INTERNAL:
                        failures.push({ result, operation: o });
                        break;
                }
            }
        }
        // Check how things went and act accordingly:
        if (remaining.length > 0) {
            setTimeout(
                () => run(remaining, failures, (
                    isNumber(triesLeft)
                    ? triesLeft - 1
                    : plan.tryUntil(readyState) ? plan.extraTries : undefined
                )),
                plan.interval,
            );
        } else if (failures.length > 0) {
            plan.handleFailures(failures);
        }
    }

    run(plan.operations.filter(isDesired), []);
}

function tryToPerform<K extends string>(o: Operation<K>): OperationResult {
    const dependencies = o.dependencies === undefined ? {} as { [k in K]: string } : o.dependencies;
    const queryResults = Object.entries<string>(dependencies).map(([ key, selector ]) => ({
        key, selector, element: document.querySelector<HTMLElement>(selector),
    }));
    const missingDependencies = queryResults.filter(x => isNull(x.element));
    if (missingDependencies.length > 0) {
        return { reason: Reason.DEPENDENCIES, dependencies: missingDependencies };
    }
    const e = queryResults.reduce(
        (acc, x) => Object.defineProperty(acc, x.key, { value: x.element }),
        {} as { [k in K]: HTMLElement },
    );
    return fromActionResult(o.action(e));
}

function fromActionResult(r: ActionResult): OperationResult {
    return isString(r) ? { reason: Reason.INTERNAL, message: r } : SUCCESS;
}
