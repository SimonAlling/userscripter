import { unlines } from "lines-unlines";

import { DependencyFailure } from "./internal/DependencyFailure";
import { OperationAndFailure } from "./operations";

export type OperationContext = Readonly<{
    siteName: string
    extensionName: string
    location: Location
}>;

const INDENTATION = "  ";

function formatDependency(d: DependencyFailure): string {
    switch (d.tag) {
        case "DoesNotExist":
            return INDENTATION + "TODO not exist" + d.key + ": " + d.selector;

        case "IsOfWrongType":
            return INDENTATION + "TODO is not a" + d.expectedType.name + "; is " + d.actualTagName;
    }
}

export function explanation(failure: OperationAndFailure<any>): string {
    switch (failure.result.reason) {
        case "Dependencies":
            return unlines([
                `These dependencies were TODO:`,
                ``,
                unlines(failure.result.dependencies.map(formatDependency)),
            ]);
        case "Internal":
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
