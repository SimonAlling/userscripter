import { Operation, DependentOperation, IndependentOperation, SUCCESS, FAILURE } from "lib/operation-manager";
import * as SITE from "globals-site";
import * as CONFIG from "globals-config";
import { log, logInfo, logWarning, logError } from "userscripter/logging";
import { Preferences } from "userscripter/preference-handling";
import P from "preferences";
// <<<<<<< EXAMPLE

import INSERT_FOOBARS from "operations/foobars";
// =======
// >>>>>>> CLEAN

const ALWAYS: boolean = true;

/*
******** README ********

Operations to run as soon as possible during page load are declared in this file.

Every item must be an Operation, whose constructor argument must have the following structure:
{
    description : a brief description of the operation in the infinitive form/present tense, whose main purpose is to identify operations failing as a consequence of the host site changing its content
    condition   : whether the operation should run at all (e.g. some saved preference value)
    selectors   : CSS selectors matching elements required to run the operation
    action      : what to do (e.g. insert a custom element); a function that will be called with the required elements in an object matching `selectors`
}

(An IndependentOperation takes no `selectors` and its `action` takes no argument.)

`action` may return a boolean (SUCCESS or FAILURE) indicating whether or not it succeeded.

Not returning anything is equivalent to returning undefined, which is equivalent to returning SUCCESS.
*/

const OPERATIONS: ReadonlyArray<Operation> = [
// <<<<<<< EXAMPLE
    // Change heading content:
    new DependentOperation({
        description: "change heading content",
        condition: ALWAYS, // This action should always be run.
        selectors: { heading: SITE.SELECTOR_HEADING }, // Heading is used in action, so it has to exist first.
        action: e => { // This function will be called with the element(s) matching the selector(s).
            e.heading.textContent = CONFIG.USERSCRIPT_NAME + " working!";
        },
    }),

    // Insert foobars:
    new DependentOperation({
        description: "insert foobars",
        condition: Preferences.get(P.foobars._.insert), // Run this action only if the corresponding preference is set to true.
        selectors: { mainDiv: SITE.SELECTOR_MAIN }, // Needs the main element in order to run.
        action: INSERT_FOOBARS, // This action is imported from its own module.
    }),

    // Change title:
    new IndependentOperation({
        description: "change title",
        condition: ALWAYS,
        action: () => {
            document.title = document.title + ` [${CONFIG.USERSCRIPT_NAME} ${CONFIG.USERSCRIPT_VERSION_STRING}]`;
        },
    }),
// =======
// >>>>>>> CLEAN
];

export default OPERATIONS;
