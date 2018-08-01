import { Metadata } from "userscript-metadata";
import U from "./userscript";

const metadata: Metadata = {
    name: U.name,
    version: U.version,
    match: [
        `*://${U.hostname}/*`,
        `*://www.${U.hostname}/*`,
    ],
    run_at: U.runAt,
};

export default metadata;
