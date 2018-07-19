import * as Utils from "./utils";
import * as IO from "./io";
import * as Metadata from "./metadata";
import {
    Config,
    isRecognizedConfigProperty,
    parseConfig,
} from "./config";
const not = Utils.not;
const REGEX_JSON_KEY = /\s*"([^\r\n:"]+?)"\s*:/;

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

export function logDefinePropertiesMessage(): void {
    console.log(`If you want to tweak which properties I should understand, you can do so by editing these files:`);
    console.log("");
    Utils.logList([
        IO.FILE_CONFIG_PROPERTIES_REQUIRED,
        IO.FILE_CONFIG_PROPERTIES_OPTIONAL,
    ].map(IO.format));
}

export function unrecognizedConfigProperties(config: Config): string[] {
    return Object.keys(config).filter(not(isRecognizedConfigProperty));
}

export function isDuplicate_filter<T>(item: T, index: number, array: T[]): boolean {
    return Utils.isDuplicateIn(array)(item);
}

export function duplicateConfigProperties(configFileContent: string): string[] {
    const matches_keyWithJunk = configFileContent.match(new RegExp(REGEX_JSON_KEY.source, "g")) || [];
    const duplicates_recognized = matches_keyWithJunk
        .map(match => (match.match(REGEX_JSON_KEY) || [])[1]) // keys without junk
        .filter(isDuplicate_filter) // only duplicates
        .reduce((acc: string[], key: string) => acc.includes(key) ? acc : acc.concat(key), []) // duplicates merged
        .filter(isRecognizedConfigProperty); // only recognized keys
    return duplicates_recognized;
}

export function duplicateConfigPropertiesWithValues(configFileContent: string): string[] {
    const keys = duplicateConfigProperties(configFileContent);
    const config = parseConfig(configFileContent);
    return keys.map(key => key + ": " + JSON.stringify(config[key]));
}

export function logFunctionsToRemove(logLevel: LOG_LEVEL): string[] {
    return (<string[]> []).concat(...LOG_FUNCTIONS_BY_LEVEL.slice(0, logLevel));
}
