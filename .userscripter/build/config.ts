import {
    JSONException,
    readJSON,
    readJSONStringArray,
    parseJSONStringRecord,
    errorMessage_expectedContent,
    formattedItems,
} from "./utils";
import {
    FILE_CONFIG,
    FILE_CONFIG_PROPERTIES_REQUIRED,
    FILE_CONFIG_PROPERTIES_OPTIONAL,
    format,
} from "./io";

export class RequiredPropertyMissingException extends Error {
    constructor(public message: string, public missingKeys: string[]) {
        super();
    }
}

export type Config = { [key: string]: string };

// These keys must be present in the config file:
export const CONFIG_KEYS_REQUIRED = readJSONStringArray(FILE_CONFIG_PROPERTIES_REQUIRED);
// These keys are recognized but not required:
export const CONFIG_KEYS_OPTIONAL = readJSONStringArray(FILE_CONFIG_PROPERTIES_OPTIONAL);
// All recognized replacement keys:
export const CONFIG_KEYS = CONFIG_KEYS_REQUIRED.concat(CONFIG_KEYS_OPTIONAL);

export function isRecognizedConfigProperty(key: string): boolean {
    return CONFIG_KEYS.includes(key);
}

export function readConfig(): Config {
    try {
        return parseConfig(readJSON(FILE_CONFIG).raw);
    } catch (err) {
        if (err instanceof JSONException) {
            throw new TypeError(errorMessage_expectedContent({
                filename: FILE_CONFIG,
                expected: err.expected,
                actual: err.actual,
            }));
        } else throw err;
    }
}

export function parseConfig(configFileContent: string): Config {
    const config = parseJSONStringRecord(configFileContent);
    const missingKeys = CONFIG_KEYS_REQUIRED.filter(key => !config.hasOwnProperty(key));
    if (missingKeys.length > 0) {
        const plural = missingKeys.length > 1;
        throw new RequiredPropertyMissingException(
            `Required propert${plural ? "ies" : "y"} ${formattedItems(missingKeys)} not found in ${format(FILE_CONFIG)}.`,
            missingKeys
        );
    }
    return config;
}
