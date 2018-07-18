import * as Utils from "./utils";
import * as IO from "./io";
import * as Userscripter from "./userscripter";
import * as Metadata from "./metadata";
import unvalidatedMetadata from "../../config/metadata";

const log = Utils.log;
const logWarning = Utils.logWarning;
const logList = Utils.logList;
const stringifyNumber = Utils.stringifyNumber;

// This script assumes that all relevant files exist and contain valid content. This can be ensured by running init.js first.

try {
    log("");
    log("Assembling userscript...");
    const configFileContent = Utils.readJSON(IO.FILE_CONFIG).raw;
    const metadata = Metadata.validate(unvalidatedMetadata);
    const script = Utils.readFileContent(IO.FILE_WEBPACK_OUTPUT);

    // Final .user.js file:
    const outputFileName = IO.outputFileName(Userscripter.readConfig().id);
    const outputFileContent = metadata + "\n" + script;
    Utils.writeFileContent(
        outputFileName,
        outputFileContent
    );

    // Delete Webpack output:
    Utils.deleteFile_async(IO.FILE_WEBPACK_OUTPUT);
    Utils.deleteFile_async(IO.FILE_METADATA_OUTPUT);
    log("Done!");

    // Check for unrecognized config properties:
    const config = Userscripter.parseConfig(configFileContent);
    const unrecognizedKeys = Userscripter.unrecognizedConfigProperties(config);
    const numberOfUnrecognizedKeys = unrecognizedKeys.length;
    if (numberOfUnrecognizedKeys > 0) {
        const plural = numberOfUnrecognizedKeys > 1;
        log("");
        logWarning(`Unrecognized config propert${plural ? "ies" : "y"}.`)
        log("");
        log(`This file contained ${stringifyNumber(numberOfUnrecognizedKeys)} propert${plural ? "ies" : "y"} that I didn't consider because I didn't recognize ${plural ? "them" : "it"}:`);
        log("");
        logList([IO.format(IO.FILE_CONFIG)]);
        log("");
        log(`${plural ? "These are" : "This is"} the key${plural ? "s" : ""} I'm having trouble with:`);
        log("");
        logList(unrecognizedKeys);
        log("");
        log(`I skip properties that I don't recognize, so you may want to check your config file for typos and make sure you only use these keys:`);
        log("");
        logList(Userscripter.CONFIG_KEYS);
        log("");
        Userscripter.logDefinePropertiesMessage();
        log("");
    }

    // Check for duplicate config keys:
    const duplicateProperties = Userscripter.duplicateConfigPropertiesWithValues(configFileContent);
    const numberOfDuplicateProperties = duplicateProperties.length;
    if (numberOfDuplicateProperties > 0) {
        const plural = numberOfDuplicateProperties > 1;
        log("");
        logWarning(`Duplicate key${plural ? "s" : ""} in config file.`);
        log("");
        log(`It seems that ${stringifyNumber(numberOfDuplicateProperties)} key${plural ? "s" : ""} occur${plural ? "" : "s"} more than once in this file:`);
        log("");
        logList([IO.format(IO.FILE_CONFIG)]);
        log("");
        log(`${plural ? "These are" : "This is"} the key${plural ? "s" : ""} I found duplicates of and the value${plural ? "s" : ""} I used:`);
        log("");
        logList(duplicateProperties);
        log("");
        log(`You may want to check your config file, and I'd recommend using unique keys only.`);
        log("");
    }

    log("");
    log(`Userscript saved as ${outputFileName}.`);
} catch (err) {
    log("");
    Utils.logError(err.message);
    log("");
    process.exitCode = 1;
}
