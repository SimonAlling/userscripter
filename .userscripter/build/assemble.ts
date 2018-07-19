import * as Utils from "./utils";
import * as IO from "./io";
import * as Config from "./config";
import * as Metadata from "./metadata";
import unvalidatedMetadata from "../../config/metadata";
import USERSCRIPT_CONFIG from "../../config/userscript";

const log = Utils.log;
const logWarning = Utils.logWarning;
const logList = Utils.logList;
const stringifyNumber = Utils.stringifyNumber;

// This script assumes that all relevant files exist and contain valid content. This can be ensured by running init.js first.

try {
    log("");
    log("Assembling userscript...");
    const metadata = Metadata.validate(unvalidatedMetadata).trim();
    const script = Utils.readFileContent(IO.FILE_WEBPACK_OUTPUT);

    // Final .user.js file:
    const outputFileName = IO.outputFileName(USERSCRIPT_CONFIG.id);
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
    const unrecognizedKeys = Config.unrecognizedProperties(USERSCRIPT_CONFIG);
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
        logList(Config.CONFIG_KEYS);
        log("");
        Config.logDefinePropertiesMessage();
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
