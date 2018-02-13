import * as SITE from "globals-site";
import * as CONFIG from "globals-config";
import { log, logInfo, logWarning, logError } from "userscripter/logging";
import {
// <<<<<<< EXAMPLE
    BooleanPreference,
    NumericPreference,
// =======
// >>>>>>> CLEAN
} from "ts-preferences";

export default Object.freeze({
// <<<<<<< EXAMPLE
    insert_foobars: new BooleanPreference({
        key: "insert_foobars",
        label: "Insert foobars",
        description: "Insert some foobars",
        default: true,
    }),
    number_of_foobars: new NumericPreference({
        key: "number_of_foobars",
        label: "Number of foobars",
        description: "Number of foobars to insert",
        default: 5,
    }),
// =======
// >>>>>>> CLEAN
});
