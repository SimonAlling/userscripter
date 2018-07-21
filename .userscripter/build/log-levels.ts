import { EnumFromStringError, assertUnreachable } from "./utils";

export const enum LogLevel {
    ALL,
    INFO,
    WARNING,
    ERROR,
    NONE,
}

export class LogLevelFromStringError extends EnumFromStringError {}

export const LOG_LEVEL_ALL = "ALL";
export const LOG_LEVEL_INFO = "INFO";
export const LOG_LEVEL_WARNING = "WARNING";
export const LOG_LEVEL_ERROR = "ERROR";
export const LOG_LEVEL_NONE = "NONE";

export const LOG_LEVELS: ReadonlyArray<string> = [
    LOG_LEVEL_ALL,
    LOG_LEVEL_INFO,
    LOG_LEVEL_WARNING,
    LOG_LEVEL_ERROR,
    LOG_LEVEL_NONE,
];

export function fromString(s: string): LogLevel {
    switch (s) {
        case LOG_LEVEL_ALL:     return LogLevel.ALL;
        case LOG_LEVEL_INFO:    return LogLevel.INFO;
        case LOG_LEVEL_WARNING: return LogLevel.WARNING;
        case LOG_LEVEL_ERROR:   return LogLevel.ERROR;
        case LOG_LEVEL_NONE:    return LogLevel.NONE;
        default: throw new LogLevelFromStringError(s);
    }
}

export function toString(l: LogLevel): string {
    switch (l) {
        case LogLevel.ALL:     return LOG_LEVEL_ALL;
        case LogLevel.INFO:    return LOG_LEVEL_INFO;
        case LogLevel.WARNING: return LOG_LEVEL_WARNING;
        case LogLevel.ERROR:   return LOG_LEVEL_ERROR;
        case LogLevel.NONE:    return LOG_LEVEL_NONE;
        default: return assertUnreachable(l, "LogLevel.toString");
    }
}

export function isLogLevel(s: string): boolean {
    try {
        fromString(s);
        return true;
    } catch (_) {
        return false;
    }
}

type FunctionMap = ReadonlyArray<{
    level: LogLevel,
    functions: ReadonlyArray<string>,
}>

export function functionsToRemove(level: LogLevel, functionMap: FunctionMap): string[] {
    return ((<string[]> []).concat(
        ...functionMap
        .filter(x => x.level < level)
        .map(x => x.functions))
    );
}
