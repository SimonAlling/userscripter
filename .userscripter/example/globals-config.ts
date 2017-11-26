import { prefixer } from "lib/utilities";
import { Version } from "lib/versioning";

export const USERSCRIPT_ID: string = "%USERSCRIPT_CONFIG_id%";
export const USERSCRIPT_NAME: string = "%USERSCRIPT_CONFIG_name%";
export const USERSCRIPT_VERSION: Version = new Version("%USERSCRIPT_CONFIG_version%");
export const USERSCRIPT_VERSION_STRING: string = Version.stringify(USERSCRIPT_VERSION);
export const USERSCRIPT_AUTHOR: string = "%USERSCRIPT_CONFIG_author%";

export const PREFIX_ID = USERSCRIPT_ID + "-";
export const PREFIX_CLASS = USERSCRIPT_ID + "-";

// How long to wait between performing operations (DOM manipulation etc) during page load:
export const INTERVAL_OPERATIONS: number = 200; // ms
// How long to wait after DOMContentLoaded before considering remaining operations failed:
export const TIMEOUT_OPERATIONS: number = 500; // ms

// Functions that prepend id and class prefixes:
const i = prefixer(PREFIX_ID);
const c = prefixer(PREFIX_CLASS);

export const ID_STYLE_ELEMENT = i("main-style-element");
// <<<<<<< EXAMPLE

// EXAMPLE CODE:
export const HEADING_PREFIX_AND_SUFFIX: string = "★";

export const CLASS_FOOBAR = c("foobar");
// =======
// >>>>>>> CLEAN
