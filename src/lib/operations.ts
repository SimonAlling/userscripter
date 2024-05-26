import { isNull, isNumber } from "ts-type-guards";

import { Condition } from "./environment";
import { Err, Result } from "./results";

export type ActionResult = Result<null, string>;
type OperationResult = Result<null, OperationFailure>;

export type OperationFailure = Readonly<{
    reason: "Dependencies"
    dependencies: ReadonlyArray<{ key: string, selector: string }>
} | {
    reason: "Internal"
    message: string
}>;

export type OperationAndFailure<K extends string> = Readonly<{
    operation: Operation<K>
    result: OperationFailure
}>;

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

export function operation<K extends string>(spec: Operation<K>): Operation<string> {
    return spec as Operation<string>;
}

export type FailuresHandler = (failures: ReadonlyArray<OperationAndFailure<string>>) => void;

export type Plan = Readonly<{
    operations: ReadonlyArray<Operation<string>>
    interval: number // time between each try in milliseconds
    tryUntil: (state: DocumentReadyState) => boolean // when to stop trying
    extraTries: number // number of extra tries after tryUntil is satisfied
    handleFailures: FailuresHandler
}>;

export function run(plan: Plan): void {
    function recurse(
        operations: ReadonlyArray<Operation<string>>,
        failures: Array<OperationAndFailure<string>>,
        triesLeft?: number,
    ): void {
        const lastTry = isNumber(triesLeft) && triesLeft <= 0;
        const operationsToRunNow: Array<Operation<string>> = [];
        const remaining: Array<Operation<string>> = [];
        const readyState = document.readyState;
        // Decide which operations to run now:
        for (const o of operations) {
            const shouldRunNow = o.deferUntil === undefined || o.deferUntil(readyState);
            (shouldRunNow ? operationsToRunNow : remaining).push(o);
        }
        // Run the operations and collect failures:
        for (const o of operationsToRunNow) {
            const result = tryToPerform(o);
            if (result.tag !== "Ok") {
                switch (result.error.reason) {
                    case "Dependencies":
                        if (lastTry) {
                            failures.push({ result: result.error, operation: o });
                        } else {
                            remaining.push(o);
                        }
                        break;
                    case "Internal":
                        failures.push({ result: result.error, operation: o });
                        break;
                }
            }
        }
        // Check how things went and act accordingly:
        if (remaining.length > 0) {
            setTimeout(
                () => recurse(remaining, failures, (
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

    recurse(plan.operations.filter(o => o.condition(window)), []);
}

function tryToPerform<K extends string>(o: Operation<K>): OperationResult {
    const dependencies = o.dependencies === undefined ? {} as { [k in K]: string } : o.dependencies;
    const queryResults = Object.entries<string>(dependencies).map(([ key, selector ]) => ({
        key, selector, element: document.querySelector<HTMLElement>(selector),
    }));
    const missingDependencies = queryResults.filter(x => isNull(x.element));
    if (missingDependencies.length > 0) {
        return Err({ reason: "Dependencies", dependencies: missingDependencies });
    }
    const e = queryResults.reduce(
        (acc, x) => Object.defineProperty(acc, x.key, { value: x.element, enumerable: true }),
        {} as { [k in K]: HTMLElement },
    );
    return fromActionResult(o.action(e));
}

function fromActionResult(r: ActionResult): OperationResult {
    switch (r.tag) {
        case "Ok":
            return r;

        case "Err":
            return Err({ reason: "Internal", message: r.error });
    }
}
