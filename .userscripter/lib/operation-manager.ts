import { not, equals, compose } from "./utilities";
import { is, isBoolean, only } from "ts-type-guards";

export const SUCCESS: boolean = true;
export const FAILURE: boolean = false;

export type Operation = {
    description: string;
    selectors: string[];
    action: (...elements: Element[]) => boolean | void;
}

export type ConditionalOperation = Operation & {
    condition: boolean;
}

// allOperations : List of Operations to perform.
// interval : Time between each try in milliseconds.
// errorCallback : Function to call with Operation as argument for each operation that has not succeeded before stop() is called.
// successCallback : Function to call if all operations have succeeded when stop() is called.
export function OperationManager(allOperations: Operation[], interval: number, errorCallback: (operation: Operation) => void, successCallback: () => void) {
    allOperations.forEach(operation => {
        if (operation.selectors.length < operation.action.length) {
            throw new Error(`Operation "${operation.description}" depends on ${operation.action.length} element(s), but has only ${operation.selectors.length} dependency selector(s).`);
        }
    });

    let keepTrying: boolean = true;

    function handleError(operation: Operation): void {
        errorCallback(operation);
    }

    function perform(operation: Operation): boolean {
        const selectorMatches = operation.selectors.map(s => document.querySelector(s));
        if (selectorMatches.some(equals(null))) {
            return FAILURE;
        }
        const result = operation.action(...only(Element)(selectorMatches));
        return isBoolean(result) ? result : SUCCESS;
    }

    function run(operations: Operation[]): void {
        if (keepTrying) {
            // Run all operations and keep those that failed:
            const remainingOperations = operations.filter(compose(equals(FAILURE), perform));
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
