import { Metadata } from "userscript-metadata";
import { CommandLineOptions } from "command-line-args";
import * as IO from "../.userscripter/build/io";
import * as Options from "../.userscripter/build/options";
import U from "./userscript";

export default function metadata(args: CommandLineOptions): Metadata {
    // --hosted-at argument overrides hostedAt specified in userscript.ts:
    const hostedAt = (x => x ? x : U.hostedAt)(args[Options.HOSTED_AT]);
    const URL = IO.url({ withDistDir: false })(hostedAt, U.id);
    return {
        name: U.name,
        version: U.version,
        match: [
            `*://${U.hostname}/*`,
            `*://www.${U.hostname}/*`,
        ],
        run_at: U.runAt,
        downloadURL: URL("download"),
        updateURL: URL("update"),
    };
}
