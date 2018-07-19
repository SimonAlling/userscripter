const stripComments = require('strip-comments');
const extractComments = require('extract-comments');
import * as Utils from "./utils";
import * as IO from "./io";
import METADATA_REQUIRED_PROPERTIES from "../../config/validation/metadata-required";

const PREFIX_METADATA_TAG = "@";
const REGEX_METADATA_TAG_VALUE_INCLUDING_WHITESPACE = /\s+[^(\/\/)\s]+/; // any positive amount of whitespace, then any positive number of something that is not (whitespace or "//")
const METADATA_USERSCRIPT_START_TAG = "==UserScript==";
const METADATA_USERSCRIPT_END_TAG = "==/UserScript==";
const REGEX_METADATA_USERSCRIPT_START_TAG = new RegExp(METADATA_USERSCRIPT_START_TAG);
const REGEX_METADATA_USERSCRIPT_END_TAG = new RegExp(METADATA_USERSCRIPT_END_TAG);

const FORMATTED_LIST_METADATA_FILE = Utils.formattedList([IO.format(IO.FILE_METADATA)]);

const PROPERTY_MATCH = "match";
const PROPERTY_INCLUDE = "include";
const TAG_MATCH = PREFIX_METADATA_TAG + PROPERTY_MATCH;
const TAG_INCLUDE = PREFIX_METADATA_TAG + PROPERTY_INCLUDE;

// MESSAGES:

const MSG_COMMENT_CHECK_PROBLEMATIC_LINES = (lines: string[]) => lines.length === 0 ? "" : (`

I think ${lines.length > 1 ? "these lines" : "this line"} could be causing the problem:

` + Utils.formattedList(lines));


const MSG_COMMENT_CHECK_FAILED = `Not only comments.

This file may only contain JavaScript comments and whitespace:

${FORMATTED_LIST_METADATA_FILE}

But there is something else in it as well.`;


const MSG_END_TAG_BEFORE_START_TAG = `End tag before start tag.

The ${METADATA_USERSCRIPT_START_TAG} start tag must precede the ${METADATA_USERSCRIPT_END_TAG} end tag in this file:

${FORMATTED_LIST_METADATA_FILE}

But I found no end tag after the start tag, only before it.`;


const MSG_NO_START_TAG = `Missing start tag.

I could not find the required ${METADATA_USERSCRIPT_START_TAG} start tag in this file:

${FORMATTED_LIST_METADATA_FILE}`;


const MSG_NO_END_TAG = `Missing end tag.

I could not find the required ${METADATA_USERSCRIPT_END_TAG} end tag in this file:

${FORMATTED_LIST_METADATA_FILE}`;


const MSG_NO_INCLUDE_OR_MATCH = `No ${TAG_MATCH} or ${TAG_INCLUDE} directive.

${TAG_MATCH} and/or ${TAG_INCLUDE} directives are used to indicate on which URLs the userscript should run. If you don't provide any of those, the userscript may run on ALL or NO URLs, depending on the userscript client.`;


const MSG_MATCH_INSTEAD_OF_INCLUDE = (lines: string[]) => `${TAG_INCLUDE} directive used.

The ${TAG_INCLUDE} directive is generally not recommended, since its asterisk (*) has a less safe meaning than in the ${TAG_MATCH} directive.

There is one case where ${TAG_INCLUDE} is preferable, though: It supports regular expressions, while ${TAG_MATCH} only supports match patterns as defined here:

${Utils.formattedList(["https://developer.chrome.com/extensions/match_patterns"])}

Consider using ${TAG_MATCH} instead for these rules:

${Utils.formattedList(lines)}`;


const MSG_MISSING_OR_INVALID_TAGS = (properties: string[], generatedMetadata: string) => {
    const plural = properties.length > 1;
    return `Missing required propert${plural ? "ies" : "y"}.

Some metadata properties are so important that I require that they be present in this file:

${FORMATTED_LIST_METADATA_FILE}

It seems that ${plural ? "these properties are" : "this property is"} missing or maybe malformatted:

${Utils.formattedList(properties.map(metadataTag))}

This was the generated metadata:

${Utils.formattedList(Utils.lines(generatedMetadata))}

If you want to tweak which properties should be required, you can do so by editing this file:

${Utils.formattedList([IO.format(IO.FILE_METADATA_REQUIRED_TAGS)])}`;
};



export class MetadataException extends Error {
    private static PREFIX: string = "Invalid metadata:";
    constructor(message: string) {
        super();
        this.message = MetadataException.PREFIX + " " + message;
    }
}

function contentBetweenMetadataUserscriptTags(metadata: string): string {
    const contentOfComments = extractComments(metadata).reduce((acc: string, current: { value: string }) => acc + current.value, "");
    return contentOfComments
        .replace(new RegExp("^.*?" + REGEX_METADATA_USERSCRIPT_START_TAG.source), "") // NB: lazy star since any occurrence of ==UserScript== after the first one should just be ignored as a comment
        .replace(new RegExp(REGEX_METADATA_USERSCRIPT_END_TAG.source + ".*$"), "");
}

function metadataTag(property: string): string {
    return PREFIX_METADATA_TAG + property;
}

function metadataHasTagWithValue(property: string, metadata: string): boolean {
    // Assumes that start and end tags are present.
    const metadataContent = contentBetweenMetadataUserscriptTags(metadata);
    return new RegExp(metadataTag(property) + REGEX_METADATA_TAG_VALUE_INCLUDING_WHITESPACE.source).test(metadataContent);
}

// Check that ...
export function validate(metadata: string): string {
    // ... only comments:
    try {
        // This try ... catch clause is necessary to handle errors thrown by the strip-comments package.
        if (/\S/.test(stripComments(metadata))) {
            throw null;
        }
    } catch (err) {
        const problematicLines = Utils.lines(metadata).filter((line: string) => {
            try {
                return /\S/.test(stripComments(line));
            } catch (e) {
                return true;
            }
        });
        throw new MetadataException(MSG_COMMENT_CHECK_FAILED + MSG_COMMENT_CHECK_PROBLEMATIC_LINES(problematicLines));
    }
    // ... start tag is present:
    if (!REGEX_METADATA_USERSCRIPT_START_TAG.test(metadata)) {
        throw new MetadataException(MSG_NO_START_TAG);
    }
    // ... end tag is present:
    if (!REGEX_METADATA_USERSCRIPT_END_TAG.test(metadata)) {
        throw new MetadataException(MSG_NO_END_TAG);
    }
    // ... start tag is before end tag:
    if (metadata.lastIndexOf(METADATA_USERSCRIPT_END_TAG) < metadata.indexOf(METADATA_USERSCRIPT_START_TAG)) {
        throw new MetadataException(MSG_END_TAG_BEFORE_START_TAG);
    }
    // ... all required properties are present:
    const missingRequiredProperties = METADATA_REQUIRED_PROPERTIES.filter((p: string) => !metadataHasTagWithValue(p, metadata));
    if (missingRequiredProperties.length > 0) {
        throw new MetadataException(MSG_MISSING_OR_INVALID_TAGS(missingRequiredProperties, metadata));
    }
    return metadata;
}
