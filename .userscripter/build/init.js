const Utils = require("./utils");
const IO = require("./io");
const conflicts = require("./conflicts");

const crlf = require('crlf-helper');

try {
    const example = process.argv.includes(IO.ARGUMENT_EXAMPLE);

    let content = "";
    process.stdin.on("data", function(buffer) {
        content += buffer.toString();
    });
    process.stdin.on("end", function() {
        process.stdout.write(
            conflicts.conflictResolver(example ? "EXAMPLE" : "CLEAN")(
                crlf.setLineEnding(content, "LF")
            )
        );
    });
} catch (err) {
    Utils.logError(err.message);
    process.exitCode = 1;
}
