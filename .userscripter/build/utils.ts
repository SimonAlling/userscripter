import * as fs from "fs";

const LIST_ITEM_PREFIX = "    ";
const WARNING_PREFIX = "---- WARNING ---------------------------------------------------\n\n";
const ERROR_PREFIX   = "---- ERROR -----------------------------------------------------\n\n";

export class JSONException extends Error {
    constructor(public readonly expected: string, public readonly actual: string) {
        super();
    }
}

export class IOException extends Error {}

export class JSONTypeError extends TypeError {}

type StringRecord = { [key: string]: string };

interface Expectation {
    requirement: (x: any) => boolean
    description: string
}

interface FileContentError {
    filename: string
    expected: string
    actual: string
}

export function formatIO(path: string): string {
    return path.replace(/^\.\//, "");
}

export function errorMessage_expectedContent(file: FileContentError) {
    return `Invalid content in this file:

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

export function parseJSON(json: string, expect: Expectation): any {
    const parsedJSON = JSON.parse(json); // throws
    if (expect.requirement(parsedJSON)) {
        return parsedJSON;
    } else throw new JSONException(expect.description, parsedJSON);
}

export function readJSON(filename: string): { raw: string, parsed: any } {
    try {
        const fileContent = readFileContent(filename); // throws
        return { raw: fileContent, parsed: JSON.parse(fileContent) }; // throws
    } catch (err) {
        if (err instanceof SyntaxError) {
            err.message += `\n\nThis file is causing the problem:\n\n${formattedList([formatIO(filename)])}`;
        }
        throw err;
    }
}

export function readJSONWithParser<T>(filename: string, parser: (json: string) => T): T {
    try {
        return <T> parser(readJSON(filename).raw);
    } catch (err) {
        if (err instanceof JSONException) {
            throw new TypeError(errorMessage_expectedContent({
                filename: filename,
                expected: err.expected,
                actual: err.actual,
            }));
        } else throw err;
    }
}

export function parseJSONObject(json: string): object {
    return parseJSON(json, {
        requirement: x => !Array.isArray(x) && typeof x === "object" && x !== null,
        description: "a JSON-encoded object",
    });
}

export function readJSONObject(filename: string): object {
    return readJSONWithParser(filename, parseJSONObject);
}

export function parseJSONArray(json: string): any[] {
    return parseJSON(json, {
        requirement: Array.isArray,
        description: "a JSON-encoded array",
    });
}

export function readJSONArray(filename: string): any[] {
    return readJSONWithParser(filename, parseJSONArray);
}

export function parseJSONStringRecord(json: string): StringRecord {
    const parsed: any = parseJSONObject(json);
    Object.keys(parsed).forEach(key => {
        if (!isString(parsed[key])) {
            throw new JSONTypeError(`I expected string values only, but I found ${JSON.stringify(parsed[key])} for key ${quote(key)}.`);
        }
    });
    return <StringRecord> parsed;
}

export function readJSONStringRecord(filename: string): StringRecord {
    return readJSONWithParser(filename, parseJSONStringRecord);
}

export function parseJSONStringArray(json: string): string[] {
    const parsed = parseJSONArray(json);
    parsed.forEach(item => {
        if (!isString(item)) {
            throw new JSONException(
                "string values only",
                JSON.stringify(item),
            );
        }
    });
    return <string[]> parsed;
}

export function readJSONStringArray(filename: string): string[] {
    return readJSONWithParser(filename, parseJSONStringArray);
}
