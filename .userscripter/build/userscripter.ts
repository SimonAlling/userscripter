import * as Utils from "./utils";
import * as IO from "./io";
import * as Metadata from "./metadata";
const not = Utils.not;
const RequiredPropertyMissingException = Utils.RequiredPropertyMissingException;
const REGEX_JSON_KEY = /\s*"([^\r\n:"]+?)"\s*:/;

type Config = { [key: string]: string };

// These keys must be present in the config file:
export const CONFIG_KEYS_REQUIRED = Utils.readJSONStringArray(IO.FILE_CONFIG_PROPERTIES_REQUIRED);
// These keys are recognized but not required:
export const CONFIG_KEYS_OPTIONAL = Utils.readJSONStringArray(IO.FILE_CONFIG_PROPERTIES_OPTIONAL);
// All recognized replacement keys:
export const CONFIG_KEYS = CONFIG_KEYS_REQUIRED.concat(CONFIG_KEYS_OPTIONAL);

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

export function isRecognizedConfigProperty(key: string): boolean {
    return CONFIG_KEYS.includes(key);
}

export function readConfig(): Config {
    try {
        return parseConfig(Utils.readJSON(IO.FILE_CONFIG).raw);
    } catch (err) {
        if (err instanceof Utils.JSONException) {
            throw new TypeError(Utils.errorMessage_expectedContent({
                filename: IO.FILE_CONFIG,
                expected: err.expected,
                actual: err.actual,
            }));
        } else throw err;
    }
}

export function parseConfig(configFileContent: string): Config {
    const config = Utils.parseJSONStringRecord(configFileContent);
    const missingKeys = CONFIG_KEYS_REQUIRED.filter(key => !config.hasOwnProperty(key));
    if (missingKeys.length > 0) {
        const plural = missingKeys.length > 1;
        throw new RequiredPropertyMissingException(
            `Required propert${plural ? "ies" : "y"} ${Utils.formattedItems(missingKeys)} not found in ${IO.format(IO.FILE_CONFIG)}.`,
            missingKeys
        );
    }
    return config;
}

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
