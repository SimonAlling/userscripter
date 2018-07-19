import USERSCRIPT_CONFIG from "../config/userscript";

function prefixer(prefix: string): (x: string) => string {
    return x => prefix + x;
}

export const USERSCRIPT_ID: string = USERSCRIPT_CONFIG.id;
export const USERSCRIPT_NAME: string = USERSCRIPT_CONFIG.name;
export const USERSCRIPT_VERSION_STRING: string = USERSCRIPT_CONFIG.version;
export const USERSCRIPT_AUTHOR: string = USERSCRIPT_CONFIG.author;

export const PREFIX_ID: string = USERSCRIPT_ID + "-";
export const PREFIX_CLASS: string = USERSCRIPT_ID + "-";

// How long to wait between performing operations (DOM manipulation etc) during page load:
export const INTERVAL_OPERATIONS: number = 200; // ms
// How long to wait after DOMContentLoaded before considering remaining operations failed:
export const TIMEOUT_OPERATIONS: number = 500; // ms

// Functions that prepend id and class prefixes:
const i = prefixer(PREFIX_ID);
const c = prefixer(PREFIX_CLASS);

export const ID_STYLE_ELEMENT: string = i("main-style-element");
// <<<<<<< EXAMPLE

// EXAMPLE CODE:
export const HEADING_PREFIX_AND_SUFFIX: string = " ★ ";

export const CLASS_FOOBAR: string = c("foobar");
export const CLASS_PREFERENCE_DESCRIPTION: string = c("preference-description");
// =======
// >>>>>>> CLEAN
