import {
    BuildConfig,
} from "userscripter/build";
import { Metadata } from "userscript-metadata";

import U from "./src/userscript";

export default function(_: BuildConfig): Metadata {
    return {
        name: U.name,
        version: U.version,
        match: [
            `*://${U.hostname}/*`,
            `*://www.${U.hostname}/*`,
        ],
        run_at: U.runAt,
    };
}
