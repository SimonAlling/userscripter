import * as color from "colors/safe";
import * as Utils from "./utils";
import * as FileSystem from "./file-system";
import { log, logSuccessLine, logWarning, logError, logErrorLine } from "./logging";
import * as Messages from "./messages";
import * as Metadata from "./metadata";
import * as Config from "./config";
import * as IO from "./io";
import * as Options from "./options";
import { LogLevel, LogLevelFromStringError, fromString as logLevelFromString } from "./log-levels";
import { Mode } from "./mode";
import * as webpack from "webpack";
import * as commandLineArgs from "command-line-args";
import webpackConfiguration from "../../webpack.config";

import USERSCRIPT_CONFIG from "../../config/userscript";
import RAW_METADATA from "../../config/metadata";

const FILE_FINAL_OUTPUT = IO.outputFileName(USERSCRIPT_CONFIG.id);

const DEFAULT_LOG_LEVEL = LogLevel.ALL;
const DEFAULT_MODE = Mode.DEVELOPMENT;

const WEBPACK_STATS_TO_STRING_OPTIONS = {
    depth: false,
    hash: false,
    modules: false,
    entrypoints: false,
    colors: true,
};

function failWithError(reason: string): void {
    logError(reason + "\n\n");
    fail();
}

function fail(): void {
    logErrorLine(Messages.failed);
    FileSystem.writeFile(FILE_FINAL_OUTPUT, IO.USERSCRIPT_CONTENT_BUILD_FAILED);
    process.exit(1);
}

try {
    // Check options:
    const args = commandLineArgs(Options.COMMAND_LINE_OPTIONS);
    const mode: Mode = (x => x ? Mode.PRODUCTION : DEFAULT_MODE)(args[Options.PRODUCTION]);
    const logLevel: LogLevel = (x => x ? logLevelFromString(x) : DEFAULT_LOG_LEVEL)(args[Options.LOG_LEVEL]);

    // Arguments are valid.
    log(Messages.building(mode, logLevel));

    // Wipe .user.js file:
    FileSystem.writeFile(FILE_FINAL_OUTPUT, IO.USERSCRIPT_CONTENT_BUILDING);

    // Validate config and metadata:
    log(Messages.checkingConfig);
    Config.validate(USERSCRIPT_CONFIG);
    log(Messages.checkingMetadata);
    Metadata.process(RAW_METADATA);

    // Compile with Webpack:
    log(Messages.compiling);
    const webpackConfig: webpack.Configuration = webpackConfiguration({}, {
        mode,
        logLevel,
    });
    webpack([ webpackConfig ], (err: Error | null, stats?: webpack.Stats) => {
        // Check if Webpack failed:
        if (err instanceof Error) {
            failWithError(Messages.webpackError(err));
        }

        // Check if there were any compilation errors:
        if (stats) {
            log(stats.toString(WEBPACK_STATS_TO_STRING_OPTIONS));
            log("");
            if (stats.hasErrors()) {
                fail();
            }
        }

        // Assemble:
        log(Messages.assembling);
        const metadata = Metadata.process(RAW_METADATA);
        const script = FileSystem.readFile(IO.FILE_WEBPACK_OUTPUT);

        // Final .user.js file:
        const outputFileContent = metadata + "\n" + script;
        FileSystem.writeFile(
            FILE_FINAL_OUTPUT,
            outputFileContent,
        );

        // Delete Webpack output:
        FileSystem.deleteFile(IO.FILE_WEBPACK_OUTPUT);

        // Check for unrecognized config properties:
        const unrecognizedKeys = Config.unrecognizedProperties(USERSCRIPT_CONFIG);
        if (unrecognizedKeys.length > 0) {
            logWarning(Messages.unrecognizedConfigProperties(unrecognizedKeys));
        }

        log("");
        logSuccessLine(Messages.success(FILE_FINAL_OUTPUT));
    });
} catch (err) {
    if (err instanceof LogLevelFromStringError) {
        failWithError(Messages.invalidLogLevel(err.string));
    }
    if (err instanceof Config.UserscriptConfigError) {
        if (err instanceof Config.MissingPropertiesException) {
            failWithError(Messages.missingConfigProperties(err.keys));
        }
    }
    if (err instanceof Error) {
        // Error from commandLineArgs:
        if (err.name === "UNKNOWN_OPTION") {
            failWithError(err.message);
        }
        else {
            failWithError(err.message);
        }
    }
    else {
        logError(`Something that was not an instance of Error was thrown:`);
        logErrorLine(err);
    }
}
