import * as fs from "fs";

export type Operation = "read" | "write" | "delete";

export class DirectoryException extends Error {}

export class FileException extends Error {
    constructor(public operation: Operation, public filename: string, public error: Error) {
        super();
    }
}

export function readFile(filename: string): string {
    try {
        return fs.readFileSync(filename, "utf8");
    } catch (err) {
        throw new FileException("read", filename, err);
    }
}

export function writeFile(filename: string, content: string): void {
    try {
        fs.writeFileSync(filename, content, { "encoding": "utf8" });
    } catch (err) {
        throw new FileException("write", filename, err);
    }
}

export function deleteFile(filename: string): void {
    try {
        fs.unlinkSync(filename);
    } catch (err) {
        throw new FileException("delete", filename, err);
    }
}

export function directoryExists(name: string): boolean {
    try {
        return fs.statSync(name).isDirectory();
    } catch (_) {
        return false;
    }
}

export function createDirectory(name: string): void {
    try {
        fs.mkdirSync(name);
    } catch (err) {
        throw new DirectoryException(err.message);
    }
}
