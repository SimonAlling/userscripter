import { TypeGuard } from "ts-type-guards";

export type ParseResult<T> = Readonly<{
    kind: "valid", value: T,
} | {
    kind: "invalid", input: string,
}>;

export type Parser<T> = (input: string) => ParseResult<T>;

export function enumParser<T>(typeGuard: TypeGuard<T>) {
    return (input: string): ParseResult<T> => (
        typeGuard(input)
        ? { kind: "valid", value: input }
        : { kind: "invalid", input: input }
    );
}

export function booleanParser(input: string): ParseResult<boolean> {
    return (
        input === "true"
        ? { kind: "valid", value: true }
        : (
            input === "false"
            ? { kind: "valid", value: false }
            : { kind: "invalid", input: input }
        )
    );
}

export function urlParser(input: string): ParseResult<string> {
    try {
        return { kind: "valid", value: new URL(input).toString() };
    } catch (_) {
        return { kind: "invalid", input: input };
    }
}
