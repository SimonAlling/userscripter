import { Kind, ValidationError, Warning, tag } from "userscript-metadata";
import { indent, formattedList, plural } from "./utils";
import { FileException } from "./file-system";
import { LOG_LEVELS, LOG_LEVEL_NONE } from "./log-levels";
import * as Options from "./options";
import * as IO from "./io";
import { Mode } from "./mode";
import { LogLevel, toString as logLevelToString } from "./log-levels";
import * as Config from "./config";

// Single-line, non-parameterized messages:
export const checkingConfig = `Checking config...`;
export const checkingMetadata = `Checking metadata...`;
export const compiling = `Compiling userscript...`;
export const failed = `Build failed. Userscript file could not be assembled.`;


// Multiline and/or parameterized messages:

export const building = (mode: Mode, level: LogLevel) => `
Building for ${mode} with log level ${logLevelToString(level)}...
`;


export const success = (outputFileName: string) => `
Userscript saved as ${IO.format(outputFileName)}.
`;


export const invalidLogLevel = (s: string) => {
    const exampleCommand = `${IO.COMMAND_BUILD} --${Options.PRODUCTION} --${Options.LOG_LEVEL} ${LOG_LEVEL_NONE}`;
    return `
Invalid log level.

"${s}" is not a valid log level. I understand these:

${formattedList(LOG_LEVELS)}

Example:

${indent(exampleCommand)}

`;
};


export const directoryNotFound = (name: string) => `
I couldn't find ${IO.format(name)}/ in this directory.
`;


export const tryInit = `
Initialize a userscript with an example code base:

${indent(IO.COMMAND_INIT + " " + IO.ARGUMENT_EXAMPLE)}

Initialize a clean userscript:

${indent(IO.COMMAND_INIT + " " + IO.ARGUMENT_CLEAN)}

`;


export const tryThis = (command: string) => `
You can try this to fix this problem:

${indent(command)}

`;


export const missingConfigProperties = (keys: ReadonlyArray<string>) => `
Missing config properties.

I couldn't find ${plural(keys.length)("this", "these")} required propert${plural(keys.length)("y", "ies")} in ${IO.format(IO.FILE_CONFIG)}:

${formattedList(keys)}

`;


export const unrecognizedConfigProperties = (keys: ReadonlyArray<string>) => {
    const numberOfUnrecognizedKeys = keys.length;
    const p = plural(numberOfUnrecognizedKeys);
    return `
Unrecognized config propert${p("y", "ies")}.

${IO.format(IO.FILE_CONFIG)} contained ${numberOfUnrecognizedKeys} propert${p("y", "ies")} that I didn't consider because I didn't recognize ${p("it", "them")}:

${p("This is", "These are")} the key${p("", "s")} I'm having trouble with:

${formattedList(keys)}

I skip properties that I don't recognize, so you may want to check your config file for typos and make sure you only use these keys:

${formattedList(Config.CONFIG_KEYS)}

If you want to tweak which properties I should understand, you can do so by editing these files:

${formattedList([
    IO.FILE_CONFIG_PROPERTIES_REQUIRED,
    IO.FILE_CONFIG_PROPERTIES_OPTIONAL,
].map(IO.format))}

`;
};


export const metadataValidationHint = `
You can customize the rules used for metadata validation by editing this file:

${indent(IO.format(IO.FILE_METADATA_VALIDATION))}
`;


export const metadataWarning = (warning: Warning) => `
Metadata warning: ${warning.summary}

${warning.description}
`;


export const metadataError = (error: ValidationError) => {
    switch (error.kind) {
        case Kind.INVALID_KEY: return `Invalid key: "${error.entry.key}". ${error.reason}`;
        case Kind.INVALID_VALUE: return `Invalid ${tag(error.entry.key)} value: ${JSON.stringify(error.entry.value)}. ${error.reason}`;
        case Kind.MULTIPLE_UNIQUE: return `Multiple ${tag(error.item.key)} values. Only one value is allowed.`;
        case Kind.REQUIRED_MISSING: return `A ${tag(error.item.key)} entry is required, but none was found.`;
        case Kind.UNRECOGNIZED_KEY: return `Unrecognized key: "${error.entry.key}".`;
        default: throw new Error("Unknown metadata error.");
    }
}


export const webpackError = (err: Error) => `
Webpack failed with this error:

${err.message}
`;


export const fileSystemError = (err: FileException) => `
I could not ${err.operation} the file '${err.filename}' because I ran into this error:

${err.error.message}
`;




// function printHelp() {
//     echo "Usage: build [OPTION]..."
//     echo
//     echo "Options:"
//     echo "  -h, --help                    display this help and exit"
//     echo "  -l, --log-level LEVEL         set userscript logging verbosity to LEVEL"
//     echo "  -p, --production              transpile and minify userscript"
//     echo
//     echo "Examples:"
//     echo
//     echo "General development:"
//     echo
//     echo "${INDENTATION}build"
//     echo
//     echo "Transpiled, minified and no logging whatsoever:"
//     echo
//     echo "${INDENTATION}build --$FLAG_PRODUCTION --$FLAG_LOG_LEVEL $LOG_LEVEL_NONE"
//     echo
// }
