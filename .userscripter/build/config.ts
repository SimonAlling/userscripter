import { not } from "./utils";
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

export class UserscriptConfigError extends Error {}

export class MissingPropertiesException extends UserscriptConfigError {
    constructor(public keys: string[]) {
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
        throw new MissingPropertiesException(missingKeys);
    }
    return config;
}
