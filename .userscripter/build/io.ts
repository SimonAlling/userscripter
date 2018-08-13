export const DIR_CONFIG     = "./config/";
export const DIR_SOURCE     = "./src/";
export const DIR_LIBRARY    = "./.userscripter/lib/";
export const DIR_BUILD      = "./.userscripter/build/";
export const DIR_VALIDATION = "./config/validation/";
export const DIR_DIST       = "./dist/";

export const COMMAND_INIT = "./init";
export const COMMAND_BUILD = "./build";
export const ARGUMENT_CLEAN = "clean";
export const ARGUMENT_EXAMPLE = "example";

export const FILE_METADATA               = DIR_CONFIG + "metadata.ts";
export const FILE_METADATA_VALIDATION    = DIR_VALIDATION + "metadata-validation.ts";

export const FILE_CONFIG                     = DIR_CONFIG + "userscript.ts";
export const FILE_CONFIG_PROPERTIES_REQUIRED = DIR_VALIDATION + "userscript-required.ts";
export const FILE_CONFIG_PROPERTIES_OPTIONAL = DIR_VALIDATION + "userscript-optional.ts";
export const FILE_WEBPACK_CONFIG = "webpack.config.ts";
export const FILE_TS_CONFIG = "tsconfig.json";
export const FILE_TS_CONFIG_TS_NODE = DIR_BUILD + "tsconfig.webpack.json";
export const FILE_GLOBALS_CONFIG = DIR_SOURCE + "globals-config.ts";
export const FILE_GLOBALS_SITE = DIR_SOURCE + "globals-site.ts";

export const FILE_MAIN            = DIR_SOURCE + "main.ts";
export const EXTENSION_USERSCRIPT = ".user.js";
export const EXTENSION_METADATA   = ".meta.js";

export const USERSCRIPT_CONTENT_BUILDING = "Building...\n";
export const USERSCRIPT_CONTENT_BUILD_FAILED = "*** Build failed! ***\n";

function slashed(path: string): string {
    return path.replace(/\/?$/, "/");
}

export const distFileName = (
    (extension: string) => (id: string) => id + extension
);

export const distFileNameWithPath = (
    (dir: string | null) => (extension: string) => (id: string) => (
        (dir === null ? "" : slashed(dir)) + distFileName(extension)(id)
    )
);

export const outputFile_userscript = distFileNameWithPath(DIR_DIST)(EXTENSION_USERSCRIPT);
export const outputFile_metadata = distFileNameWithPath(DIR_DIST)(EXTENSION_METADATA);

export function format(path: string): string {
    return path.replace(/(^\.\/)|(\/$)/g, "");
}

export function url(options: {
    withDistDir: boolean,
}) {
    return (hostedAt: string, id: string) => {
        const completeFileName = distFileNameWithPath(options.withDistDir ? DIR_DIST : null);
        return (type: "download" | "update") => (
            slashed(hostedAt) + format(completeFileName(
                type === "update"
                ? EXTENSION_METADATA
                : EXTENSION_USERSCRIPT
            )(id))
        );
    };
}
