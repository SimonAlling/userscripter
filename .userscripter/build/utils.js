const fs = require("fs");

const LIST_ITEM_PREFIX = "    ";
const WARNING_PREFIX = "---- WARNING ---------------------------------------------------\n\n";
const ERROR_PREFIX   = "---- ERROR -----------------------------------------------------\n\n";

function RequiredPropertyMissingException(message, missingKeys) {
    this.name = "RequiredPropertyMissingException";
    this.message = message;
    this.missingKeys = missingKeys;
}
RequiredPropertyMissingException.prototype = Object.create(Error.prototype);
RequiredPropertyMissingException.prototype.constructor = RequiredPropertyMissingException;

function IOException(message) {
    this.name = "IOException";
    this.message = message;
}
IOException.prototype = Object.create(Error.prototype);
IOException.prototype.constructor = IOException;

function formatIO(path) {
    return path.replace(/^\.\//, "");
}

function errorMessage_expectedContent(file) {
    return `I ran into an error while parsing this file:

${formattedList([formatIO(file.filename)])}

I expected to find ${file.expected}, but I found this:

` + formattedList([JSON.stringify(file.actual)]);
}


function not(f) {
    // Returns a function!
    return x => !f(x);
}

function isString(x) {
    return typeof x === "string";
}

function log(str) {
    console.log(str);
}

function logWarning(str) {
    console.warn(WARNING_PREFIX+str);
}

function logError(str) {
    console.error(ERROR_PREFIX+str);
}

function logList(items) {
    console.log(formattedList(items));
}

function formattedList(items) {
    return items.map(item => LIST_ITEM_PREFIX + item).join("\n");
}

function lines(str) {
    return str.split("\n");
}

function unlines(strings) {
    return strings.join("\n");
}

function quote(str) {
    return `"` + str + `"`;
}

function formattedItems(items) {
    return items.map(JSON.stringify).join(", ");
}

function stringifyNumber(n) {
    const NUMBERS = [
        "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve",
    ];
    return n < NUMBERS.length && n >= 0 ? NUMBERS[n] : n;
}

function isDuplicateIn(array) {
    return value => {
        let hasSeenIt = false;
        for (let i = 0; i < array.length; i++) {
            if (array[i] === value) {
                if (hasSeenIt) {
                    return true;
                }
                hasSeenIt = true;
            }
        }
        return false;
    };
}

function readFileContent(filename) {
    try {
        return fs.readFileSync(filename, "utf8");
    } catch (err) {
        throw new IOException(`I could not read the file ${filename} because I ran into this error:\n\n` + err.message);
    }
}

function writeFileContent(filename, content) {
    try {
        fs.writeFileSync(filename, content, { "encoding": "utf8" });
    } catch (err) {
        throw new IOException(`I could not write the file ${filename} because I ran into this error:\n\n` + err.message);
    }
}

function deleteFile_async(filename) {
    fs.unlink(filename, err => {
        if (err) {
            logError(`I could not delete the file ${filename} because I ran into this error:\n\n` + err.message);
        }
    });
}

function readJSON(filename) {
    try {
        const fileContent = readFileContent(filename); // throws
        return JSON.parse(fileContent); // throws
    } catch (err) {
        if (err instanceof SyntaxError) {
            err.message += `\n\nThis file is causing the problem:\n\n${formattedList([formatIO(filename)])}`;
        }
        throw err;
    }
}

function readJSONObject(filename) {
    const parsedJSON = readJSON(filename);
    if (!Array.isArray(parsedJSON) && typeof parsedJSON === "object" && parsedJSON !== null) {
        return parsedJSON;
    } else {
        throw new TypeError(errorMessage_expectedContent({
            filename: filename,
            expected: "a JSON-encoded object",
            actual: parsedJSON,
        }));
    }
}

function readJSONArray(filename) {
    const parsedJSON = readJSON(filename);
    if (Array.isArray(parsedJSON)) {
        return parsedJSON;
    } else {
        throw new TypeError(errorMessage_expectedContent({
            filename: filename,
            expected: "a JSON-encoded array",
            actual: parsedJSON,
        }));
    }
}

function readJSONStringRecord(filename) {
    const record = readJSONObject(filename); // throws
    Object.keys(record).forEach(key => {
        if (record.hasOwnProperty(key) && !isString(record[key])) {
            throw new TypeError(`Invalid property "${key}" in ${filename}. Only strings allowed (found ${JSON.stringify(record[key])}).`);
        }
    });
    return record;
}

function readJSONStringArray(filename) {
    const array = readJSONArray(filename); // throws
    array.forEach(item => {
        if (!isString(item)) {
            throw new TypeError(`Invalid item in ${filename}. Only strings allowed (found ${JSON.stringify(item)}).`);
        }
    });
    return array;
}

module.exports = {
    RequiredPropertyMissingException,
    not,
    isString,
    log,
    logWarning,
    logError,
    logList,
    lines,
    unlines,
    quote,
    formattedList,
    formattedItems,
    stringifyNumber,
    isDuplicateIn,
    readFileContent,
    writeFileContent,
    deleteFile_async,
    readJSON,
    readJSONObject,
    readJSONArray,
    readJSONStringRecord,
    readJSONStringArray,
}
