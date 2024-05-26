import { isNumber } from "ts-type-guards";

import { Condition } from "./environment";
import { DependencyFailure } from "./internal/DependencyFailure";
import { Err, Ok, Result } from "./results";

export type ActionResult = Result<null, string>;
type OperationResult = Result<null, OperationFailure>;

type DependenciesSpec = { [k in string]: SingleDependencySpec<Element> };

type SingleDependencySpec<E extends Element> = { selector: string, elementType: new () => E };

type ResolvedDependencies<Spec extends DependenciesSpec> = { [k in keyof Spec]: InstanceType<Spec[k]["elementType"]> };

export type OperationFailure = Readonly<{
    reason: "Dependencies"
    dependencies: ReadonlyArray<DependencyFailure>
} | {
    reason: "Internal"
    message: string
}>;

export type OperationAndFailure<Spec extends DependenciesSpec> = Readonly<{
    operation: Operation<Spec>
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
type DependentOperationSpec<Spec extends DependenciesSpec> = BaseOperation & Readonly<{
    dependencies: Spec
    action: (e: ResolvedDependencies<Spec>) => ActionResult
}>;

type IndependentOperationSpec = BaseOperation & Readonly<{
    dependencies?: undefined
    action: () => ActionResult
}>;

export type Operation<Spec extends DependenciesSpec> = DependentOperationSpec<Spec> | IndependentOperationSpec;

export function operation<Spec extends DependenciesSpec>(spec: Operation<Spec>): Operation<DependenciesSpec> {
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

    const resolution = resolveDependencies(o.dependencies);

    switch (resolution.tag) {
        case "Err":
            return Err({ reason: "Dependencies", dependencies: resolution.error });

        case "Ok":
            return fromActionResult(o.action(resolution.value));
    }
}

function resolveDependencies<Spec extends DependenciesSpec>(spec: Spec): Result<ResolvedDependencies<Spec>, Array<DependencyFailure>> {
    const keysAndQueryResults = Object.entries(spec).map(([ key, specifiedDep ]) => [ key, resolveDependency(key, specifiedDep) ] as const);

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

    return Ok((Object as any /* TODO */).fromEntries(resolvedDependencies) as ResolvedDependencies<Spec>);
}

function resolveDependency<E extends Element>(key: string, spec: SingleDependencySpec<E>): Result<E, DependencyFailure> {
    const element = document.querySelector(spec.selector);
    if (element === null) {
        return Err({ tag: "DoesNotExist", key: key, selector: spec.selector });
    }

    return (
        element instanceof spec.elementType
            ? Ok(element)
            : Err({ tag: "IsOfWrongType", elementType: spec.elementType, actualTagName: element.tagName })
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
