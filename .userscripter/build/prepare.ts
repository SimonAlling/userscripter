import * as Utils from "./utils";
import * as IO from "./io";
import * as Config from "./config";
import * as Metadata from "./metadata";
import RAW_METADATA from "../../config/metadata";
import USERSCRIPT_CONFIG from "../../config/userscript";
const RequiredPropertyMissingException = Config.RequiredPropertyMissingException;
const IOException = Utils.IOException;

const log = Utils.log;
const logList = Utils.logList;
const logError = Utils.logError;

// This script validates the config file and metadata. It is intended to be run before actually building and assembling.

function logDefineRequiredPropertiesMessage() {
    console.log(`If you want to tweak which properties should be required, you can do so by editing this file:`);
    console.log("");
    Utils.logList([IO.format(IO.FILE_CONFIG_PROPERTIES_REQUIRED)]);
}

const outputFileName = IO.outputFileName(USERSCRIPT_CONFIG.id);
try {
    log("Checking config...");
    Config.validate(USERSCRIPT_CONFIG);
    log("Done!");
    log("Checking metadata...");
    Metadata.process(RAW_METADATA);
    log("Done!");
    // Wipe .user.js file:
    Utils.writeFileContent(outputFileName, IO.USERSCRIPT_CONTENT_BUILDING);
} catch (err) {
    log("");
    if (err instanceof RequiredPropertyMissingException) {
        const missingKeys = err.missingKeys;
        const plural = missingKeys.length > 1;
        logError(`Missing config propert${plural ? "ies" : "y"}.`);
        log("");
        log("Some properties are so important that I require their presence in this file:");
        log("");
        logList([IO.format(IO.FILE_CONFIG)]);
        log("");
        log(`I could not find ${plural ? "these" : "this"} required propert${plural ? "ies" : "y"}:`);
        log("");
        logList(missingKeys);
        log("");
        logDefineRequiredPropertiesMessage();
    } else {
        logError(err.message);
    }
    Utils.writeFileContent(outputFileName, IO.USERSCRIPT_CONTENT_BUILD_FAILED);
    process.exitCode = 1;
}
