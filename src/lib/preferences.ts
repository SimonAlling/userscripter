import {
    AllowedTypes,
    PreferenceManager,
    RequestSummary,
    Response,
    Status,
} from "ts-preferences";

import * as log from "./log";

export function loggingResponseHandler<T extends AllowedTypes>(summary: RequestSummary<T>, preferences: PreferenceManager): Response<T> {
    const response = summary.response;
    switch (response.status) {
        case Status.OK:
            return response;

        case Status.INVALID_VALUE:
            if (summary.action === "get") {
                // response.saved is defined if and only if action is "get" and status is INVALID_VALUE:
                log.warning(`The saved value for preference '${summary.preference.key}' (${JSON.stringify(response.saved)}) was invalid. Replacing it with ${JSON.stringify(response.value)}.`);
                preferences.set(summary.preference, response.value);
            }
            if (summary.action === "set") {
                log.warning(`Could not set value ${JSON.stringify(response.value)} for preference '${summary.preference.key}' because it was invalid.`);
            }
            return response;

        case Status.TYPE_ERROR:
            if (summary.action === "get") {
                log.warning(`The saved value for preference '${summary.preference.key}' had the wrong type. Replacing it with ${JSON.stringify(response.value)}.`);
                preferences.set(summary.preference, response.value);
            }
            return response;

        case Status.JSON_ERROR:
            if (summary.action === "get") {
                log.warning(`The saved value for preference '${summary.preference.key}' could not be parsed. Replacing it with ${JSON.stringify(response.value)}.`);
                preferences.set(summary.preference, response.value);
            }
            return response;

        case Status.STORAGE_ERROR:
            switch (summary.action) {
                case "get":
                    log.error(`Could not read preference '${summary.preference.key}' because localStorage could not be accessed. Using value ${JSON.stringify(summary.preference.default)}.`);
                    break;
                case "set":
                    log.error(`Could not save value ${JSON.stringify(summary.response.value)} for preference '${summary.preference.key}' because localStorage could not be accessed.`);
                    break;
                default:
                    assertUnreachable(summary.action);
            }
            return response;

        default:
            return assertUnreachable(response.status);
    }
}

function assertUnreachable(x: never): never {
    throw new Error("assertUnreachable: " + x);
}
