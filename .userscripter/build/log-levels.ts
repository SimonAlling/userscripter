export const enum LOG_LEVEL {
    ALL,
    INFO,
    WARNING,
    ERROR,
    NONE,
}

export function toLogLevel(s: string): LOG_LEVEL {
    switch (s) {
        case "ALL":     return LOG_LEVEL.ALL;
        case "INFO":    return LOG_LEVEL.INFO;
        case "WARNING": return LOG_LEVEL.WARNING;
        case "ERROR":   return LOG_LEVEL.ERROR;
        case "NONE":    return LOG_LEVEL.NONE;
        default: throw new Error(`toLogLevel could not convert ${JSON.stringify(s)} to a LOG_LEVEL.`);
    }
}

// Index is level; higher level is less verbose:
const LOG_FUNCTIONS_BY_LEVEL = [
    [ "log"       , "console.log"   ],
    [ "logInfo"   , "console.info"  ],
    [ "logWarning", "console.warn"  ],
    [ "logError"  , "console.error" ],
];

export function logFunctionsToRemove(logLevel: LOG_LEVEL): string[] {
    return (<string[]> []).concat(...LOG_FUNCTIONS_BY_LEVEL.slice(0, logLevel));
}
