import { equals, compose, fromMaybeUndefined } from "./utilities";
import { is, isBoolean } from "ts-type-guards";

export const SUCCESS: boolean = true;
export const FAILURE: boolean = false;

export interface OperationDefinition {
    condition: boolean;
    description: string;
    waitForDOMContentLoaded?: boolean;
}

export interface IndependentOperationDefinition extends OperationDefinition {
    action: () => boolean | void;
}

export interface DependentOperationDefinition<K extends string> extends OperationDefinition {
    selectors: { [k in K]: string };
    action: (e: { [k in K]: HTMLElement }) => boolean | void;
}

export abstract class Operation {
    public readonly condition: boolean;
    public readonly description: string;
    public readonly waitForDOMContentLoaded: boolean;
    constructor(definition: OperationDefinition) {
        this.condition = definition.condition;
        this.description = definition.description;
        this.waitForDOMContentLoaded = fromMaybeUndefined(false, definition.waitForDOMContentLoaded);
    }
}

export class IndependentOperation extends Operation {
    public readonly action: () => boolean | void;
    constructor(definition: IndependentOperationDefinition) {
        super(definition);
        this.action = definition.action;
    }
}

export class DependentOperation<K extends string> extends Operation {
    public readonly selectors: { [k in K]: string };
    public readonly action: (e: { [k in K]: HTMLElement }) => boolean | void;
    constructor(definition: DependentOperationDefinition<K>) {
        super(definition);
        this.selectors = definition.selectors;
        this.action = definition.action;
    }
}

// allOperations : List of Operations to perform.
// interval : Time between each try in milliseconds.
// errorCallback : Function to call with Operation as argument for each operation that has not succeeded before stop() is called.
// successCallback : Function to call if all operations have succeeded when stop() is called.
export function OperationManager(
    allOperations: Operation[],
    interval: number,
    errorCallback: <K extends string>(operation: DependentOperation<K>) => void,
    successCallback: () => void,
) {
    let keepTrying: boolean = true;
    let DOMHasLoaded: boolean = false;
    document.addEventListener("DOMContentLoaded", () => {
        DOMHasLoaded = true;
    });

    function handleError(operation: Operation): void {
        if (is(DependentOperation)(operation)) {
            errorCallback(operation);
        }
    }

    function perform(operation: Operation): boolean {
        const result = (<K extends string>() => {
            if (is(IndependentOperation)(operation)) {
                return operation.action();
            } else if (is(DependentOperation)(operation)) {
                const selectors = operation.selectors;
                const selectorMatches = Object.keys(selectors).map(k => ({
                    key: k,
                    element: document.querySelector(selectors[k as K]),
                }));
                if (selectorMatches.map(m => m.element).some(equals(null))) {
                    return FAILURE;
                }
                const e: { [k in K]: HTMLElement } = selectorMatches.reduce(
                    (acc, match) => Object.defineProperty(acc, match.key, { value: match.element }),
                    {},
                );
                return operation.action(e);
            } else {
                throw new TypeError("Unknown operation type.");
            }
        })();
        return isBoolean(result) ? result : SUCCESS;
    }

    function run(operations: Operation[]): void {
        if (keepTrying) {
            // Run all operations and keep those that failed:
            const operationsToRunAfterDOMContentLoaded = operations.filter(o => o.waitForDOMContentLoaded);
            const operationsToRunNow = (
                operations.filter(o => !o.waitForDOMContentLoaded)
                .concat(DOMHasLoaded ? operationsToRunAfterDOMContentLoaded : [])
            );
            const remainingOperations = (
                operationsToRunNow.filter(compose(equals(FAILURE), perform))
                .concat(DOMHasLoaded ? [] : operationsToRunAfterDOMContentLoaded)
            );
            if (remainingOperations.length > 0) {
                setTimeout(() => { run(remainingOperations); }, interval);
            }
        } else {
            if (operations.length > 0) {
                operations.forEach(handleError);
            } else {
                successCallback();
            }
        }
    }

    function start(): void {
        run(allOperations);
    }

    function stop(): void {
        keepTrying = false;
    }

    return {
        start,
        stop,
    };
}
