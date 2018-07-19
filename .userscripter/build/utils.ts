import * as fs from "fs";

const LIST_ITEM_PREFIX = "    ";
const WARNING_PREFIX = "---- WARNING ---------------------------------------------------\n\n";
const ERROR_PREFIX   = "---- ERROR -----------------------------------------------------\n\n";

export class IOException extends Error {}

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
