import { StylesheetModule } from "lib/stylesheet-manager";
import { Preferences } from "userscripter/preference-handling";
import P from "preferences";
import * as SITE from "globals-site";
import * as CONFIG from "globals-config";

const ALWAYS: boolean = true;

/*
******** README ********

CSS modules to be inserted conditionally are declared in this file.

In practice, "conditionally" could mean e.g. that a certain preference is set. ALWAYS can also be used as a condition.

Every item must be an object with the following structure:
{
    condition : a boolean indicating whether this module should be inserted
    css       : the CSS code to insert
}
*/

const STYLESHEET_MODULES: StylesheetModule[] = [
    // Main stylesheet:
    {
        condition: ALWAYS,
        css: require("styles/stylesheet"),
    },
// <<<<<<< EXAMPLE

    // Foobars:
    {
        condition: Preferences.get(P.foobars._.insert),
        css: require("styles/foobars"),
    },
// =======
// >>>>>>> CLEAN
];

export default STYLESHEET_MODULES;
