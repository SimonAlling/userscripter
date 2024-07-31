import {
    AllowedTypes,
    Preference,
    PreferenceManager,
    RequestSummary,
    Response,
    ResponseHandler,
    Status,
} from "ts-preferences";

import * as log from "./log";

type Listener<T extends AllowedTypes> = (p: Preference<T>) => void;

export function subscriptable(handler: ResponseHandler): Readonly<{
    subscribe: (listener: Listener<any>) => void
    unsubscribe: (listener: Listener<any>) => void
    handler: ResponseHandler
}> {
    const changeListeners: Set<Listener<any>> = new Set();
    return {
        subscribe: (listener: Listener<any>) => { changeListeners.add(listener); },
        unsubscribe: (listener: Listener<any>) => { changeListeners.delete(listener); },
        handler: (summary, preferences) => {
            if (summary.action === "set") {
                changeListeners.forEach(f => f(summary.preference));
            }
            return handler(summary, preferences);
        },
    };
}

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

export function noopResponseHandler<T extends AllowedTypes>(summary: RequestSummary<T>, _: PreferenceManager): Response<T> {
    return summary.response;
}

function assertUnreachable(x: never): never {
    throw new Error("assertUnreachable: " + x);
}
