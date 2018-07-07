import { log, logError, logWarning } from "userscripter/logging";
import * as TSPreferences from "ts-preferences";
import { Status, Response, RequestSummary, PreferencesInterface, AllowedTypes } from "ts-preferences";
import * as CONFIG from "globals-config";
import PREFERENCES from "preferences";

export const Preferences = TSPreferences.init(PREFERENCES, CONFIG.USERSCRIPT_ID, responseHandler);

function responseHandler<T extends AllowedTypes>(summary: RequestSummary<T>, preferences: PreferencesInterface): Response<T> {
    const response = summary.response;
    switch (response.status) {
        case Status.OK:
            return response;

        case Status.INVALID_VALUE:
            if (summary.action === "get") {
                // response.saved is defined if and only if action is "get" and status is INVALID_VALUE:
                logWarning(`The value found in localStorage for preference '${summary.preference.key}' (${JSON.stringify(response.saved)}) was invalid. Replacing it with ${JSON.stringify(response.value)}.`);
                preferences.set(summary.preference, response.value);
            }
            if (summary.action === "set") {
                logWarning(`Could not set value ${JSON.stringify(response.value)} for preference '${summary.preference.key}' because it was invalid.`);
            }
            return response;

        case Status.TYPE_ERROR:
            if (summary.action === "get") {
                logWarning(`The value found in localStorage for preference '${summary.preference.key}' was not a ${typeof summary.preference.default}. Replacing it with ${JSON.stringify(response.value)}.`);
                preferences.set(summary.preference, response.value);
            }
            return response;

        case Status.JSON_ERROR:
            if (summary.action === "get") {
                logWarning(`The value found in localStorage for preference '${summary.preference.key}' could not be parsed. Replacing it with ${JSON.stringify(response.value)}.`);
                preferences.set(summary.preference, response.value);
            }
            return response;

        case Status.LOCALSTORAGE_ERROR:
            switch (summary.action) {
                case "get":
                    logError(`Could not read preference '${summary.preference.key}' because localStorage could not be accessed. Using value ${JSON.stringify(summary.preference.default)}.`);
                    return response;
                case "set":
                    logError(`Could not save value ${JSON.stringify(summary.response.value)} for preference '${summary.preference.key}' because localStorage could not be accessed.`);
                    return response;
            }
            return assertUnreachable(summary.action);
    }
    return assertUnreachable(response.status);
}

function assertUnreachable(x: never): never {
    throw new Error("assertUnreachable: " + x);
}
