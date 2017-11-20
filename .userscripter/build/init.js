const Utils = require("./utils");
const IO = require("./io");
// ./userscripter required further down
const RequiredPropertyMissingException = Utils.RequiredPropertyMissingException;
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

try {
    log("Checking config...");
    const Userscripter = require("./userscripter.js");
    Userscripter.readConfig();
    log("Done!");
    log("Checking metadata...");
    Userscripter.readMetadata();
    log("Done!");
    // Wipe .user.js file:
    const outputFileName = Userscripter.readConfig().id + IO.EXTENSION_USERSCRIPT;
    Utils.writeFileContent(outputFileName, IO.USERSCRIPT_CONTENT_BUILD_FAILED);
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
    process.exitCode = 1;
}
