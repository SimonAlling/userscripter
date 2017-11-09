const Utils = require("./utils");
const IO = require("./io");
const Userscripter = require("./userscripter");
const Metadata = require("./metadata");

const log = Utils.log;
const logWarning = Utils.logWarning;
const logList = Utils.logList;
const stringifyNumber = Utils.stringifyNumber;

// This script assumes that all relevant files exist and contain valid content. This can be ensured by running init.js first.

try {
    log("");
    log("Assembling userscript...");
    const metadata = Userscripter.populate(Userscripter.readMetadata());
    const script = Utils.readFileContent(IO.FILE_WEBPACK_OUTPUT);
    Metadata.validate(metadata);

    // Final .user.js file:
    const outputFileName = Userscripter.readConfig().id + IO.EXTENSION_USERSCRIPT;
    const outputFileContent = metadata + "\n" + script;
    Utils.writeFileContent(
        outputFileName,
        outputFileContent
    );

    // Delete Webpack output:
    Utils.deleteFile_async(IO.FILE_WEBPACK_OUTPUT);
    log("Done!");

    // Check for unrecognized config properties:
    const unrecognizedKeys = Userscripter.unrecognizedConfigProperties();
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
        logList(Userscripter.REPLACEMENT_KEYS);
        log("");
        Userscripter.logDefinePropertiesMessage();
        log("");
    }

    // Check for duplicate config keys:
    const duplicateProperties = Userscripter.duplicateConfigPropertiesWithValues();
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
