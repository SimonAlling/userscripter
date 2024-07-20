import { unlines } from "lines-unlines";

import { OperationAndFailure, Reason } from "./operationsLol";

export type OperationContext = Readonly<{
    siteName: string
    extensionName: string
    location: Location
}>;

const INDENTATION = "  ";

function formatDependency(d: { key: string, selector: string }): string {
    return INDENTATION + d.key + ": " + d.selector;
}

export function explanation(failure: OperationAndFailure<any>): string {
    switch (failure.result.reason) {
        case Reason.DEPENDENCIES:
            return unlines([
                `These dependencies were not found:`,
                ``,
                unlines(failure.result.dependencies.map(formatDependency)),
            ]);
        case Reason.INTERNAL:
            return unlines([
                `The operation failed with this error:`,
                ``,
                failure.result.message,
            ]);
    }
}

export function failureDescriber(context: OperationContext): (failure: OperationAndFailure<any>) => string {
    return failure => unlines([
        `Could not ${failure.operation.description} on this page:`,
        ``,
        INDENTATION + location.href,
        ``,
        explanation(failure).trim(),
        ``,
        `This problem might be caused by ${context.siteName} changing its content/structure, in which case ${context.extensionName} needs to be updated accordingly. Otherwise, it's probably a bug in ${context.extensionName}.`,
        ``,
        `If you file a bug report, please include this message.`,
    ]);
}
