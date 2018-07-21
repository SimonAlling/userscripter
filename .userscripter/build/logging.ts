import * as color from "colors/safe";
import { trimLeadingAndTrailingLine } from "./utils";

export const WARNING_PREFIX = "\n---- WARNING ---------------------------------------------------\n\n";
export const ERROR_PREFIX   = "\n---- ERROR -----------------------------------------------------\n\n";

export function log(str: string): void {
    console.log(trimLeadingAndTrailingLine(str));
}

export function logSuccessLine(str: string): void {
    console.log(color.green(color.bold(trimLeadingAndTrailingLine(str))));
}

export function logWarning(str: string): void {
    logWarningLine(WARNING_PREFIX+trimLeadingAndTrailingLine(str));
}

export function logWarningLine(str: string): void {
    console.warn(color.yellow(str));
}

export function logError(str: string): void {
    logErrorLine(ERROR_PREFIX+trimLeadingAndTrailingLine(str));
}

export function logErrorLine(str: string): void {
    console.error(color.red(color.bold(str)));
}
