import * as fs from "fs";

const LIST_ITEM_PREFIX = "    ";
const WARNING_PREFIX = "---- WARNING ---------------------------------------------------\n\n";
const ERROR_PREFIX   = "---- ERROR -----------------------------------------------------\n\n";

export class RequiredPropertyMissingException extends Error {
    constructor(public message: string, public missingKeys: string[]) {
        super();
    }
}

export class IOException extends Error {}

export function formatIO(path: string): string {
    return path.replace(/^\.\//, "");
}

interface FileContentError {
    filename: string
    expected: string
    actual: string
}

export function errorMessage_expectedContent(file: FileContentError) {
    return `I ran into an error while parsing this file:

${formattedList([formatIO(file.filename)])}

I expected to find ${file.expected}, but I found this:

` + formattedList([JSON.stringify(file.actual)]);
}


export function not<T>(f: (x: T) => boolean): (x: T) => boolean {
    return x => !f(x);
}

export function isString(x: any): x is string {
    return typeof x === "string";
}

export function log(str: string): void {
    console.log(str);
}

export function logWarning(str: string): void {
    console.warn(WARNING_PREFIX+str);
}

export function logError(str: string): void {
    console.error(ERROR_PREFIX+str);
}

export function logList(items: string[]): void {
    console.log(formattedList(items));
}

export function formattedList(items: string[]): string {
    return items.map(item => LIST_ITEM_PREFIX + item).join("\n");
}

export function lines(str: string): string[] {
    return str.split("\n");
}

export function unlines(strings: string[]): string {
    return strings.join("\n");
}

export function quote(str: string): string {
    return `"` + str + `"`;
}

export function formattedItems(items: string[]): string {
    return items.map(x => JSON.stringify(x)).join(", ");
}

export function stringifyNumber(n: number): string {
    const NUMBERS = [
        "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve",
    ];
    return n < NUMBERS.length && n >= 0 ? NUMBERS[n] : ""+n;
}

export function isDuplicateIn<T>(array: T[]): (x: T) => boolean {
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

export function readFileContent(filename: string): string {
    try {
        return fs.readFileSync(filename, "utf8");
    } catch (err) {
        throw new IOException(`I could not read the file ${filename} because I ran into this error:\n\n` + err.message);
    }
}

export function writeFileContent(filename: string, content: string): void {
    try {
        fs.writeFileSync(filename, content, { "encoding": "utf8" });
    } catch (err) {
        throw new IOException(`I could not write the file ${filename} because I ran into this error:\n\n` + err.message);
    }
}

export function deleteFile_async(filename: string): void {
    fs.unlink(filename, (err?: Error) => {
        if (err) {
            logError(`I could not delete the file ${filename} because I ran into this error:\n\n` + err.message);
        }
    });
}

export function readJSON(filename: string): any {
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

export function readJSONObject(filename: string): object {
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

export function readJSONArray(filename: string): any[] {
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

export function readJSONStringRecord(filename: string): { [k: string]: string } {
    const record = <{ [k: string]: any }> readJSONObject(filename); // throws
    Object.keys(record).forEach(key => {
        if (record.hasOwnProperty(key) && !isString(record[key])) {
            throw new TypeError(`Invalid property "${key}" in ${filename}. Only strings allowed (found ${JSON.stringify(record[key])}).`);
        }
    });
    return <{ [k: string]: string }> record;
}

export function readJSONStringArray(filename: string): string[] {
    const array = readJSONArray(filename); // throws
    array.forEach(item => {
        if (!isString(item)) {
            throw new TypeError(`Invalid item in ${filename}. Only strings allowed (found ${JSON.stringify(item)}).`);
        }
    });
    return <string[]> array;
}
