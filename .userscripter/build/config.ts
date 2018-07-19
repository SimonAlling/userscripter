import {
    formattedItems,
    not,
    logList,
} from "./utils";
import {
    FILE_CONFIG,
    FILE_CONFIG_PROPERTIES_OPTIONAL,
    FILE_CONFIG_PROPERTIES_REQUIRED,
    format,
} from "./io";
// These keys must be present in the config file:
import CONFIG_KEYS_REQUIRED from "../../config/validation/userscript-required";
// These keys are recognized but not required:
import CONFIG_KEYS_OPTIONAL from "../../config/validation/userscript-optional";

export class RequiredPropertyMissingException extends Error {
    constructor(public message: string, public missingKeys: string[]) {
        super();
    }
}

export type Config = { [key: string]: string };

// All recognized replacement keys:
export const CONFIG_KEYS = CONFIG_KEYS_REQUIRED.concat(CONFIG_KEYS_OPTIONAL);

export function isRecognizedProperty(key: string): boolean {
    return CONFIG_KEYS.includes(key);
}

export function unrecognizedProperties(config: Config): string[] {
    return Object.keys(config).filter(not(isRecognizedProperty));
}

export function validate(config: Config): Config {
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

export function logDefinePropertiesMessage(): void {
    console.log(`If you want to tweak which properties I should understand, you can do so by editing these files:`);
    console.log("");
    logList([
        FILE_CONFIG_PROPERTIES_REQUIRED,
        FILE_CONFIG_PROPERTIES_OPTIONAL,
    ].map(format));
}
