import * as SITE from "globals-site";
import * as CONFIG from "globals-config";
import { log, logInfo, logWarning, logError } from "userscripter/logging";
import {
// <<<<<<< EXAMPLE
    BooleanPreference,
    StringPreference,
    IntegerRangePreference,
// =======
// >>>>>>> CLEAN
} from "ts-preferences";

export default {
// <<<<<<< EXAMPLE
    foobars: {
        label: "Foobars",
        _: {
            insert: new BooleanPreference({
                key: "insert_foobars",
                label: "Insert foobars",
                description: "Insert some foobars",
                default: true,
            }),
            number: new IntegerRangePreference({
                key: "number_of_foobars",
                label: "Number of foobars",
                description: "Number of foobars to insert",
                min: 0,
                max: 100,
                default: 5,
            }),
        },
    },
    username: new StringPreference({
        key: "username",
        label: "Username",
        description: "Your username",
        default: "John Smith",
        multiline: false,
        maxLength: 50,
        constraints: [
            {
                requirement: v => !/^\s/.test(v),
                message: v => `Leading whitespace not allowed.`,
            },
            {
                requirement: v => !/\s$/.test(v),
                message: v => `Trailing whitespace not allowed.`,
            },
        ],
    }),
// =======
// >>>>>>> CLEAN
};
