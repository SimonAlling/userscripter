/**
 * Handles version numbers ("1.5.12") and version strings ("v1.5.12"). Any number of segments is OK.
 * @module versioning
 */

import { isString } from "ts-type-guards";
import { wholeStringRegex } from "./utilities";

/**
 * The prefix prepended to a version number to create a version string.
 * @export PREFIX
 */
export const PREFIX: string = "v";

const REGEX_SEGMENT: RegExp = /\d+/;
const REGEX_SEPARATOR: RegExp = /\./;
const REGEX_LEADING_SEGMENT: RegExp = new RegExp("^" + REGEX_SEGMENT.source);
const REGEX_LEADING_SEGMENT_INCLUDING_POSSIBLE_SEPARATOR: RegExp = new RegExp(REGEX_LEADING_SEGMENT.source + REGEX_SEPARATOR.source + "?");
const REGEX_LEADING_PREFIX: RegExp = new RegExp("^" + PREFIX);

const REGEX_VERSION_NUMBER:      RegExp = new RegExp("(?:" + REGEX_SEGMENT.source + REGEX_SEPARATOR.source + ")*" + REGEX_SEGMENT.source);
const REGEX_VERSION_NUMBER_ONLY: RegExp = wholeStringRegex(REGEX_VERSION_NUMBER);
const REGEX_VERSION_STRING:      RegExp = new RegExp(PREFIX + REGEX_VERSION_NUMBER.source);
const REGEX_VERSION_STRING_ONLY: RegExp = wholeStringRegex(REGEX_VERSION_STRING);

function find(requirePrefix: boolean): (s: string) => Version | null {
    return (s: string) => {
        const matches = s.match(requirePrefix ? REGEX_VERSION_STRING : REGEX_VERSION_NUMBER);
        return matches
             ? (requirePrefix ? Version.parse(matches[0]) : new Version(matches[0]))
             : null;
    };
}

export class Version {
    number: string;

    constructor(number: string) {
        assert_isValidVersionNumber(number);
        this.number = number;
    }

    toString() {
        return PREFIX + this.number;
    }

    compareTo(other: Version): number {
        return compare(this.number, other.number);
    }

    static findIn: (s: string) => (Version | null) = find(false);

    static findWithPrefixIn: (s: string) => (Version | null) = find(true);

    static stringify(version: Version): string {
        return version.toString();
    }

    static parse(string: string): Version {
        assert_isValidVersionString(string);
        return new Version(string.replace(new RegExp(REGEX_LEADING_PREFIX), ""));
    }
}

function assert_isValidVersionNumber(str: any): void {
    if (!isVersionNumber(str)) {
        throw new TypeError(`${JSON.stringify(str)} is not a valid version number.`);
    }
}

function assert_isValidVersionString(str: any): void {
    if (!isVersionString(str)) {
        throw new TypeError(`${JSON.stringify(str)} is not a valid version string.`);
    }
}

function withoutLeadingSegment(versionNumber: string): string {
    return versionNumber.replace(REGEX_LEADING_SEGMENT_INCLUDING_POSSIBLE_SEPARATOR, "");
}

function leadingSegmentNumber(versionNumber: string): number {
    const match = versionNumber.match(REGEX_LEADING_SEGMENT);
    return match ? parseInt(match[0]) : 0;
}

function compareRecursively(a: string, b: string): number {
    if (a === "" && b === "") {
        return 0;
    } else if (leadingSegmentNumber(a) < leadingSegmentNumber(b)) {
        return -1;
    } else if (leadingSegmentNumber(a) > leadingSegmentNumber(b)) {
        return 1;
    } else {
        return compareRecursively(withoutLeadingSegment(a), withoutLeadingSegment(b));
    }
}

/**
 * Compares two version numbers.
 * @param {string} a The first version number.
 * @param {string} b The second version number.
 *
 * @throws {TypeError} Both arguments must be valid version numbers (e.g. "1.5.12").
 *
 * @return {number} -1 if a < b; 0 if a = b; 1 if a > b.
 *
 * @example
 * Version.compare("0.5.1", "0.5.2");   // -1
 * Version.compare("0.5.2", "0.5.1");   //  1
 * Version.compare("0.5.2", "0.5");     //  1
 * Version.compare("0.5.2", "0.5.2.0"); //  0
 */
function compare(a: string, b: string) {
    assert_isValidVersionNumber(a);
    assert_isValidVersionNumber(b);
    return compareRecursively(a, b);
}

/**
 * Checks if a string is a version number.
 * @param {string} s The string to check.
 *
 * @return {boolean} Whether {@code s} is a string consisting of period-separated integers.
 */
function isVersionNumber(s: any): boolean {
    return isString(s) && REGEX_VERSION_NUMBER_ONLY.test(s);
}

/**
 * Checks if a string is a version string.
 * @param {string} s The string to check.
 *
 * @return {boolean} Whether {@code s} is a version number prefixed with a "v".
 */
function isVersionString(s: any): boolean {
    return isString(s) && REGEX_VERSION_STRING_ONLY.test(s);
}
