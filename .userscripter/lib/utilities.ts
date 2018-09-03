/**
 * General utility functions.
 * @module utilities
 */

import { isNumber, isString, isNull } from "ts-type-guards";

const LIST_ITEM_PREFIX = "    ";
const QUOTATION_MARK = `'`;

/**
 * Boolean NOT as a composed function.
 * @param {Function} f The function to compose with NOT.
 *
 * @return {Function} Basically {@code !f}.
 *
 * @example
 * [1, 2, "three"].filter(not(isNumber)); // ["three"]
 */
export function not<T>(f: (x: T) => boolean): (x: T) => boolean {
    return x => !f(x);
}

export function equals(a: any): (b: any) => boolean {
    return (b: any) => a === b;
}

export function compose<X, I, Y>(outer: (x: I) => Y, inner: (x: X) => I): (x: X) => Y {
    return (x: X) => outer(inner(x));
}

export function isPositiveNumber(x: any): boolean {
    return isNumber(x) && x > 0;
}

export function isNonNegativeNumber(x: any): boolean {
    return isNumber(x) && x >= 0;
}

export function isInt(x: any): boolean {
    return isNumber(x) && x % 1 === 0;
}

export function isPositiveInt(x: any): boolean {
    return isInt(x) && x > 0;
}

export function isNonNegativeInt(x: any): boolean {
    return isInt(x) && x >= 0;
}

export function isNonEmptyString(x: any): boolean {
    return isString(x) && x.length > 0;
}

export function isPositive(x: number): boolean {
    return x > 0;
}

export function isNegative(x: number): boolean {
    return x < 0;
}

export function fromMaybeUndefined<T>(fallback: T, x?: T): T {
    return x === undefined ? fallback : x;
}

/**
 * Transforms a string into one with underscores instead of whitespace.
 * @param {string} s The string to transform.
 *
 * @return {string} {@code s} with every occurrence of whitespace replaced with an underscore.
 */
export function underscored(s: string): string {
    return s.replace(/\s+/g, "_");
}

/**
 * Creates a function which prefixes a string with a prefix.
 * @param {string} prefix The prefix to use.
 *
 * @return {Function} A function which takes a string and prepends {@code prefix} to it.
 *
 * @example
 * const p = prefixer("foo");
 * p("bar"); // "foobar"
 */
export function prefixer(prefix: string): (s: string) => string {
    return s => prefix + s;
}

/**
 * Converts any regex into one matching the whole string.
 * @param {RegExp} regex The regex to convert.
 *
 * @return {RegExp} Basically {@code ^regex$}.
 */
export function wholeStringRegex(regex: RegExp): RegExp {
    return new RegExp(regex.source.replace(/^\^*/, "^").replace(/\$*$/, "$"));
}

export function filter<T>(f: (x: T) => boolean): (xs: T[]) => T[] {
    return (xs: T[]): T[] => xs.filter((x, index, array) => f(x));
}

export function withoutNulls<T>(xs: (T | null)[]): T[] {
    // TS compiler doesn't understand .filter() and the like.
    let ts: T[] = [];
    xs.forEach(x => {
        if (!isNull(x)) {
            ts.push(x);
        }
    });
    return ts;
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
    return QUOTATION_MARK + str + QUOTATION_MARK;
}

export function formattedItems(items: any[]): string {
    return items.map(i => JSON.stringify(i)).join(", ");
}
