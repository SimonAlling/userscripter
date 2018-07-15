const DIR_CONFIG     = "./config/";
const DIR_SOURCE     = "./src/";
const DIR_LIBRARY    = "./.userscripter/lib/";
const DIR_VALIDATION = "./config/validation/";

const ARGUMENT_EXAMPLE = "example";

const FILE_METADATA               = DIR_CONFIG + "metadata.ts";
const FILE_METADATA_REQUIRED_TAGS = DIR_VALIDATION + "metadata-required.json";

const FILE_CONFIG                     = DIR_CONFIG + "config.json";
const FILE_CONFIG_PROPERTIES_REQUIRED = DIR_VALIDATION + "config-required.json";
const FILE_CONFIG_PROPERTIES_OPTIONAL = DIR_VALIDATION + "config-optional.json";

const FILE_MAIN            = DIR_SOURCE + "main.ts";
const FILE_WEBPACK_OUTPUT  = ".webpack-output.js";
const FILE_METADATA_OUTPUT = ".metadata-output.txt";
const EXTENSION_USERSCRIPT = ".user.js";

const USERSCRIPT_CONTENT_BUILD_FAILED = "console.error('*** Userscripter build failed! ***');\n";

function outputFileName(id) {
	return id + EXTENSION_USERSCRIPT;
}

function format(path) {
	return path.replace(/^\.\//, "");
}

module.exports = {
	format,
	outputFileName,
    DIR_CONFIG,
    DIR_SOURCE,
    DIR_LIBRARY,
    DIR_VALIDATION,
    ARGUMENT_EXAMPLE,
    FILE_CONFIG,
    FILE_CONFIG_PROPERTIES_REQUIRED,
    FILE_CONFIG_PROPERTIES_OPTIONAL,
    FILE_METADATA,
    FILE_METADATA_REQUIRED_TAGS,
    FILE_MAIN,
    FILE_WEBPACK_OUTPUT,
    FILE_METADATA_OUTPUT,
    EXTENSION_USERSCRIPT,
    USERSCRIPT_CONTENT_BUILD_FAILED,
}
