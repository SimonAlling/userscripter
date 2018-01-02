const Utils = require("./utils.js");
const IO = require("./io.js");
const Metadata = require("./metadata.js");
const not = Utils.not;
const RequiredPropertyMissingException = Utils.RequiredPropertyMissingException;
const REPLACEMENT_PREFIX = "%USERSCRIPT_CONFIG_";
const REPLACEMENT_SUFFIX = "%";
const REGEX_JSON_KEY = /\s*"([^\r\n:"]+?)"\s*:/;

// These keys must be present in the config file:
const REPLACEMENT_KEYS_REQUIRED = Utils.readJSONStringArray(IO.FILE_CONFIG_PROPERTIES_REQUIRED);
// These keys are recognized but not required:
const REPLACEMENT_KEYS_OPTIONAL = Utils.readJSONStringArray(IO.FILE_CONFIG_PROPERTIES_OPTIONAL);
// All recognized replacement keys:
const REPLACEMENT_KEYS = REPLACEMENT_KEYS_REQUIRED.concat(REPLACEMENT_KEYS_OPTIONAL);

const LOG_LEVELS = {
    ALL: 0,
    INFO: 1,
    WARNING: 2,
    ERROR: 3,
    NONE: 4,
};
// Index is level; higher level is less verbose:
const LOG_FUNCTIONS_BY_LEVEL = [
    [ "log"       , "console.log"   ],
    [ "logInfo"   , "console.info"  ],
    [ "logWarning", "console.warn"  ],
    [ "logError"  , "console.error" ],
];

function isRecognizedConfigProperty(key) {
    return REPLACEMENT_KEYS.includes(key);
}

function replacementSubstring(key) {
    return REPLACEMENT_PREFIX + key + REPLACEMENT_SUFFIX;
}

function readConfig() {
    const config = Utils.readJSONStringRecord(IO.FILE_CONFIG);
    const missingKeys = REPLACEMENT_KEYS_REQUIRED.filter(key => !config.hasOwnProperty(key));
    if (missingKeys.length > 0) {
        const plural = missingKeys.length > 1;
        throw new RequiredPropertyMissingException(
            `Required propert${plural ? "ies" : "y"} ${Utils.formattedItems(missingKeys)} not found in ${IO.format(IO.FILE_CONFIG)}.`,
            missingKeys
        );
    }
    return config;
}

function readMetadata() {
    const rawMetadata = Utils.readFileContent(IO.FILE_METADATA);
    Metadata.validate(rawMetadata);
    return rawMetadata;
}

function logDefinePropertiesMessage() {
    console.log(`If you want to tweak which properties I should understand, you can do so by editing these files:`);
    console.log("");
    Utils.logList([
        IO.FILE_CONFIG_PROPERTIES_REQUIRED,
        IO.FILE_CONFIG_PROPERTIES_OPTIONAL,
    ].map(IO.format));
}

function unrecognizedConfigProperties() {
    const config = readConfig();
    return Object.keys(config).filter(not(isRecognizedConfigProperty));
}

function isDuplicate_filter(item, index, array) {
    return Utils.isDuplicateIn(array)(item);
}

function duplicateConfigProperties() {
    const fileContent = Utils.readFileContent(IO.FILE_CONFIG);
    const matches_keyWithJunk = fileContent.match(new RegExp(REGEX_JSON_KEY.source, "g"));
    const duplicates_recognized = matches_keyWithJunk
        .map(match => match.match(REGEX_JSON_KEY)[1]) // keys without junk
        .filter(isDuplicate_filter) // only duplicates
        .reduce((acc, key) => acc.includes(key) ? acc : acc.concat(key), []) // duplicates merged
        .filter(isRecognizedConfigProperty); // only recognized keys
    return duplicates_recognized;
}

function duplicateConfigPropertiesWithValues() {
    const keys = duplicateConfigProperties();
    const config = readConfig();
    return keys.map(key => key + ": " + JSON.stringify(config[key]));
}

function populate(source) {
    const config = readConfig();
    // Create replacement mappings (from substring to replacement):
    const replacementMappings = REPLACEMENT_KEYS
        .filter(key => config.hasOwnProperty(key))
        .map(key => Object.freeze({
            substring: replacementSubstring(key),
            replacement: config[key],
        }));
    return replacementMappings.reduce((content, mapping) => content.replace(new RegExp(mapping.substring, "g"), mapping.replacement), source);
}

function logFunctionsToRemove(logLevel) {
    return [].concat(...LOG_FUNCTIONS_BY_LEVEL.slice(0, logLevel));
}

module.exports = {
    REPLACEMENT_KEYS,
    REPLACEMENT_KEYS_REQUIRED,
    REPLACEMENT_KEYS_OPTIONAL,
    LOG_LEVELS,
    readConfig,
    readMetadata,
    unrecognizedConfigProperties,
    duplicateConfigProperties,
    duplicateConfigPropertiesWithValues,
    logDefinePropertiesMessage,
    populate,
    logFunctionsToRemove,
};
