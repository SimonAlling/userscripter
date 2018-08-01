const INDENTATION = "    ";
const LIST_ITEM_PREFIX = INDENTATION + "• ";

export class EnumFromStringError extends Error {
    constructor(public string: string, enumName?: string) {
        super(`Could not convert "${string}" to an enum${enumName === undefined ? "" : " of type "+enumName}.`);
    }
}

export function assertUnreachable(x: never, msg?: string): never {
    throw new Error(`assertUnreachable: ${x}${msg ? " ("+msg+")" : ""}`);
}

export function not<T>(f: (x: T) => boolean): (x: T) => boolean {
    return x => !f(x);
}

export function trimLeadingAndTrailingLine(s: string): string {
    return s.replace(/(?:^\n)|(?:\n$)/g, "");
}

export function formattedList(items: ReadonlyArray<string>): string {
    return items.map(item => LIST_ITEM_PREFIX + item).join("\n");
}

export function indent(s: string): string {
    return unlines(lines(s).map(line => INDENTATION + line));
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

export function plural(n: number): (singular: string, plural: string) => string {
    return (singular, plural) => n === 1 ? singular : plural;
}
