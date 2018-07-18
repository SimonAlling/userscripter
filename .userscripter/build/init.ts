import * as Utils from "./utils";
import * as IO from "./io";
import * as Conflicts from "./conflicts";

const crlf = require('crlf-helper');

try {
    const example = process.argv.includes(IO.ARGUMENT_EXAMPLE);

    let content = "";
    process.stdin.on("data", function(buffer) {
        content += buffer.toString();
    });
    process.stdin.on("end", function() {
        process.stdout.write(
            Conflicts.conflictResolver(example ? "EXAMPLE" : "CLEAN")(
                crlf.setLineEnding(content, "LF")
            )
        );
    });
} catch (err) {
    Utils.logError(err.message);
    process.exitCode = 1;
}
