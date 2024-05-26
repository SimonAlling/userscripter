import { isNumber } from "ts-type-guards";

import { Condition } from "./environment";
import { DependencyFailure } from "./internal/DependencyFailure";
import { Err, Ok, Result } from "./results";

export type ActionResult = Result<null, string>;
type OperationResult = Result<null, OperationFailure>;

type DependenciesSpec = { [k in string]: SingleDependencySpec<Element> };

type SingleDependencySpec<E extends Element> = { selector: string, elementType: new () => E };

type ResolvedDependencies<S extends DependenciesSpec> = { [k in keyof S]: InstanceType<S[k]["elementType"]> };

export type OperationFailure = Readonly<{
    reason: "Dependencies"
    dependencies: ReadonlyArray<DependencyFailure>
} | {
    reason: "Internal"
    message: string
}>;

export type OperationAndFailure<Dependencies extends DependenciesSpec> = Readonly<{
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
type DependentOperationSpec<Dependencies extends DependenciesSpec> = BaseOperation & Readonly<{
    dependencies: Dependencies
    action: (e: ResolvedDependencies<Dependencies>) => ActionResult
}>;

type IndependentOperationSpec = BaseOperation & Readonly<{
    dependencies?: undefined
    action: () => ActionResult
}>;

export type Operation<Dependencies extends DependenciesSpec> = DependentOperationSpec<Dependencies> | IndependentOperationSpec;

export function operation<Dependencies extends DependenciesSpec>(spec: Operation<Dependencies>): Operation<DependenciesSpec> {
    return spec as Operation<DependenciesSpec>;
}

export type FailuresHandler = (failures: ReadonlyArray<OperationAndFailure<DependenciesSpec>>) => void;

export type Plan = Readonly<{
    operations: ReadonlyArray<Operation<DependenciesSpec>>
    interval: number // time between each try in milliseconds
    tryUntil: (state: DocumentReadyState) => boolean // when to stop trying
    extraTries: number // number of extra tries after tryUntil is satisfied
    handleFailures: FailuresHandler
}>;

export function run(plan: Plan): void {
    function recurse(
        operations: ReadonlyArray<Operation<DependenciesSpec>>,
        failures: Array<OperationAndFailure<DependenciesSpec>>,
        triesLeft?: number,
    ): void {
        const lastTry = isNumber(triesLeft) && triesLeft <= 0;
        const operationsToRunNow: Array<Operation<DependenciesSpec>> = [];
        const remaining: Array<Operation<DependenciesSpec>> = [];
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

function tryToPerform(o: Operation<DependenciesSpec>): OperationResult {
    if (o.dependencies === undefined) {
        return fromActionResult(o.action());
    }

    const lelelel = resolveDependencies(o.dependencies);

    switch (lelelel.tag) {
        case "Err":
            return Err({ reason: "Dependencies", dependencies: lelelel.error });

        case "Ok":
            return fromActionResult(o.action(lelelel.value));
    }
}

function resolveDependencies<S extends DependenciesSpec>(spec: S): Result<ResolvedDependencies<S>, Array<DependencyFailure>> {
    const keysAndQueryResults = Object.entries(spec).map(([ key, specifiedDep ]) => [ key, getIt(key, specifiedDep) ] as const);

    const resolvedDependencies: Array<[ key: string, element: Element ]> = [];
    const errors: Array<DependencyFailure> = [];

    for (const [ key, maybeElement ] of keysAndQueryResults) {
        if (maybeElement.tag === "Err") {
            errors.push(maybeElement.error);
        } else {
            resolvedDependencies.push([ key, maybeElement.value ]);
        }
    }

    if (errors.length > 0) {
        return Err(errors);
    }

    return Ok((Object as any /* TODO */).fromEntries(resolvedDependencies) as ResolvedDependencies<S>);
}

function getIt<E extends Element>(key: string, specDep: SingleDependencySpec<E>): Result<E, DependencyFailure> {
    const element = document.querySelector(specDep.selector);
    if (element === null) {
        return Err({ tag: "DoesNotExist", key: key, selector: specDep.selector });
    }

    return (
        element instanceof specDep.elementType
            ? Ok(element)
            : Err({ tag: "IsNotA", elementType: specDep.elementType, actualTagName: element.tagName })
    );
}

function fromActionResult(r: ActionResult): OperationResult {
    switch (r.tag) {
        case "Ok":
            return r;

        case "Err":
            return Err({ reason: "Internal", message: r.error });
    }
}
