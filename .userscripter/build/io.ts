export const DIR_CONFIG     = "./config/";
export const DIR_SOURCE     = "./src/";
export const DIR_LIBRARY    = "./.userscripter/lib/";
export const DIR_BUILD      = "./.userscripter/build/";
export const DIR_VALIDATION = "./config/validation/";

export const ARGUMENT_EXAMPLE = "example";

export const FILE_METADATA               = DIR_CONFIG + "metadata.ts";
export const FILE_METADATA_REQUIRED_TAGS = DIR_VALIDATION + "metadata-required.ts";

export const FILE_CONFIG                     = DIR_CONFIG + "userscript.ts";
export const FILE_CONFIG_PROPERTIES_REQUIRED = DIR_VALIDATION + "userscript-required.ts";
export const FILE_CONFIG_PROPERTIES_OPTIONAL = DIR_VALIDATION + "userscript-optional.ts";

export const FILE_MAIN            = DIR_SOURCE + "main.ts";
export const FILE_WEBPACK_OUTPUT  = ".webpack-output.js";
export const FILE_METADATA_OUTPUT = ".metadata-output.txt";
export const EXTENSION_USERSCRIPT = ".user.js";

export const USERSCRIPT_CONTENT_BUILD_FAILED = "console.error('*** Userscripter build failed! ***');\n";

export function outputFileName(id: string): string {
    return id + EXTENSION_USERSCRIPT;
}

export function format(path: string): string {
    return path.replace(/^\.\//, "");
}
