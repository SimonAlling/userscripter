import {
    PreferenceManager,
} from "ts-preferences";
import { loggingResponseHandler } from "userscripter/run-time/preferences";

import U from "~src/userscript";

export const P = {
} as const;

export const Preferences = new PreferenceManager(P, U.id + "-preference-", loggingResponseHandler);
