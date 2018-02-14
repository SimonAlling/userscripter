import { ConditionalOperation, SUCCESS, FAILURE } from "lib/operation-manager";
import * as SITE from "globals-site";
import * as CONFIG from "globals-config";
import { log, logInfo, logWarning, logError } from "userscripter/logging";
import { Preferences } from "userscripter/preference-handling";
import P from "preferences";
// <<<<<<< EXAMPLE

import ACTION_INSERT_FOOBARS from "operations/foobars";
// =======
// >>>>>>> CLEAN

const ALWAYS: boolean = true;
const NONE: string[] = [];

/*
******** README ********

Operations to run as soon as possible during page load are declared in this file.

Every item must be an object with the following structure:
{
    description : a brief description of the operation in the infinitive sense, whose main purpose is to identify operations failing as a consequence of the host site changing its content
    condition   : whether the operation should run at all (e.g. some saved preference value)
    selectors   : CSS selectors matching elements required to run the operation
    action      : what to do (e.g. insert a custom element); a function that will be called with the required elements as arguments, in the order they appear in `selectors`
}

`action` may return a boolean (SUCCESS or FAILURE) indicating whether or not it succeeded.

Not returning anything is equivalent to returning undefined, which is equivalent to returning SUCCESS.
*/

const OPERATIONS: ConditionalOperation[] = [
// <<<<<<< EXAMPLE
    // Change heading content:
    {
        description: "change heading content",
        condition: ALWAYS, // This action should always be run.
        selectors: [SITE.SELECTOR_HEADING], // Heading is used in action, so it has to exist first.
        action: (heading) => { // This function will be called with the element(s) matching the selector(s).
            heading.textContent = CONFIG.USERSCRIPT_NAME + " working!";
        },
    },

    // Insert foobars:
    {
        description: "insert foobars",
        condition: Preferences.get(P.insert_foobars), // Run this action only if the corresponding preference is set to true.
        selectors: [SITE.SELECTOR_MAIN], // Needs the main element in order to run.
        action: ACTION_INSERT_FOOBARS, // This action is imported from its own module.
    },

    // Change title:
    {
        description: "change title",
        condition: ALWAYS,
        selectors: NONE, // This action needs no DOM elements in order to run.
        action: () => {
            document.title = document.title + ` [${CONFIG.USERSCRIPT_NAME} ${CONFIG.USERSCRIPT_VERSION_STRING}]`;
        },
    },
// =======
// >>>>>>> CLEAN
];

export default OPERATIONS;
