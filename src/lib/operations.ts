import { isNumber } from "ts-type-guards";

import { Condition } from "./environment";
import { Err, Ok, Result } from "./results";

export type ActionResult = Result<null, string>;
type OperationResult = Result<null, OperationFailure>;



type SpecifiedDependency<E extends Element> = { selector: string, elementType: new () => E };

type ExtractElementType<S extends SpecifiedDependency<Element>> = InstanceType<S["elementType"]>;




type FdGeneralDepsSpec = { [k in string]: SpecifiedDependency<Element> };

type Realized<S extends FdGeneralDepsSpec> = { [k in keyof S]: ExtractElementType<S[k]> };

// const spec = { foo: { selector: "foo", elementType: HTMLBodyElement }} satisfies Spec;



function f<S extends FdGeneralDepsSpec>(spec: S): Realized<S> {
    const keysAndQueryResults = Object.entries(spec).map(([ key, specifiedDep ]) => [ key, getIt(specifiedDep) ] as const);

    const lel: Array<[ key: string, element: Element ]> = [];
    const errors: Array<DependencyFailure> = [];

    for (const [ key, maybeElement ] of keysAndQueryResults) {
        if (maybeElement.tag === "Err") {
            errors.push(maybeElement.error);
        } else {
            lel.push([ key, maybeElement.value ]);
        }
    }

    return (Object as any /* TODO */).fromEntries(lel) as Realized<S>;
}

function getIt<E extends Element>(specDep: SpecifiedDependency<E>): Result<E, DependencyFailure> {
    const element = document.querySelector(specDep.selector);
    if (element === null) {
        return Err({ tag: "DoesNotExist" });
    }

    return (
        element instanceof specDep.elementType
            ? Ok(element)
            : Err({ tag: "IsNotA", elementType: specDep.elementType, actualTagName: element.tagName })
    );
}

type DependencyFailure = (
    | { tag: "DoesNotExist" }
    | { tag: "IsNotA", elementType: new () => Element, actualTagName: string }
);




export type OperationFailure = Readonly<{
    reason: "Dependencies"
    dependencies: ReadonlyArray<{ key: string, selector: string }>
} | {
    reason: "Internal"
    message: string
}>;

export type OperationAndFailure<Dependencies extends FdGeneralDepsSpec> = Readonly<{
    operation: Operation<Dependencies>
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
type DependentOperationSpec<Dependencies extends FdGeneralDepsSpec> = BaseOperation & Readonly<{
    dependencies: Dependencies
    action: (e: Realized<Dependencies>) => ActionResult
}>;

type IndependentOperationSpec = BaseOperation & Readonly<{
    dependencies?: undefined
    action: () => ActionResult
}>;

export type Operation<Dependencies extends FdGeneralDepsSpec> = DependentOperationSpec<Dependencies> | IndependentOperationSpec;

export function operation<Dependencies extends FdGeneralDepsSpec>(spec: Operation<Dependencies>): Operation<FdGeneralDepsSpec> {
    return spec as Operation<FdGeneralDepsSpec>;
}

export type FailuresHandler = (failures: ReadonlyArray<OperationAndFailure<FdGeneralDepsSpec>>) => void;

export type Plan = Readonly<{
    operations: ReadonlyArray<Operation<FdGeneralDepsSpec>>
    interval: number // time between each try in milliseconds
    tryUntil: (state: DocumentReadyState) => boolean // when to stop trying
    extraTries: number // number of extra tries after tryUntil is satisfied
    handleFailures: FailuresHandler
}>;

export function run(plan: Plan): void {
    function recurse(
        operations: ReadonlyArray<Operation<FdGeneralDepsSpec>>,
        failures: Array<OperationAndFailure<FdGeneralDepsSpec>>,
        triesLeft?: number,
    ): void {
        const lastTry = isNumber(triesLeft) && triesLeft <= 0;
        const operationsToRunNow: Array<Operation<FdGeneralDepsSpec>> = [];
        const remaining: Array<Operation<FdGeneralDepsSpec>> = [];
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

function tryToPerform(o: Operation<FdGeneralDepsSpec>): OperationResult {
    if (o.dependencies === undefined) {
        return fromActionResult(o.action());
    }

    const lelelel = f(o.dependencies);

    return fromActionResult(o.action(lelelel));


    /*
    const dependencies = o.dependencies === undefined ? {} as { [k in keyof Dependencies]: string } : o.dependencies;
    const queryResults = Object.entries<string>(dependencies).map(([ key, selector ]) => ({
        key, selector, element: document.querySelector<HTMLElement>(selector),
    }));
    const missingDependencies = queryResults.filter(x => isNull(x.element));
    if (missingDependencies.length > 0) {
        return Err({ reason: "Dependencies", dependencies: missingDependencies });
    }
    const e = queryResults.reduce(
        (acc, x) => Object.defineProperty(acc, x.key, { value: x.element, enumerable: true }),
        {} as Dependencies,
    );
    return fromActionResult(o.action(e));
    */
}

function fromActionResult(r: ActionResult): OperationResult {
    switch (r.tag) {
        case "Ok":
            return r;

        case "Err":
            return Err({ reason: "Internal", message: r.error });
    }
}
