import * as Utils from "./utils";
import * as IO from "./io";
import METADATA_REQUIRED_PROPERTIES from "../../config/validation/metadata-required";

const PREFIX_COMMENT = "// ";
const PREFIX_METADATA_TAG = "@";
const REGEX_METADATA_TAG_VALUE_INCLUDING_WHITESPACE = /\s+([^(\/\/)\s]+)/; // any positive amount of whitespace, then any positive number of something that is not (whitespace or "//")
const METADATA_USERSCRIPT_START_TAG = "==UserScript==";
const METADATA_USERSCRIPT_END_TAG = "==/UserScript==";
const REGEX_METADATA_USERSCRIPT_END_TAG = new RegExp(METADATA_USERSCRIPT_END_TAG);

const FORMATTED_LIST_METADATA_FILE = Utils.formattedList([IO.format(IO.FILE_METADATA)]);

const PROPERTY_MATCH = "match";
const PROPERTY_INCLUDE = "include";
const PROPERTY_RUN_AT = "run-at";
const VALID_RUN_AT_VALUES = [ "start", "end", "idle" ].map(x => "document-"+x);
const TAG_MATCH = PREFIX_METADATA_TAG + PROPERTY_MATCH;
const TAG_INCLUDE = PREFIX_METADATA_TAG + PROPERTY_INCLUDE;

// MESSAGES:

const MSG_END_TAG = `End tag present.

I insert the ${METADATA_USERSCRIPT_END_TAG} end tag automatically, so you should not include it in this file:

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


const MSG_UNRECOGNIZED_RUN_AT_VALUE = (value: string, generatedMetadata: string) => `Unrecognized ${PREFIX_METADATA_TAG+PROPERTY_RUN_AT} value.

I expected one of these values:

${Utils.formattedList(VALID_RUN_AT_VALUES)}

But I saw this:

${Utils.formattedList([value])}

This was the generated metadata:

${Utils.formattedList(Utils.lines(generatedMetadata))}`;



export class MetadataException extends Error {
    private static PREFIX: string = "Invalid metadata:";
    constructor(message: string) {
        super();
        this.message = MetadataException.PREFIX + " " + message;
    }
}

function metadataTag(property: string): string {
    return PREFIX_METADATA_TAG + property;
}

function metadataHasTagWithValue(property: string, metadata: string): boolean {
    return getValue(property, metadata) !== null;
}

function getValue(property: string, metadata: string): string | null {
    const match = metadata.match(new RegExp(metadataTag(property) + REGEX_METADATA_TAG_VALUE_INCLUDING_WHITESPACE.source));
    return match === null ? null : match[1];
}

function wrap(metadata: string): string {
    return Utils.unlines(Utils.lines([
        METADATA_USERSCRIPT_START_TAG,
        metadata,
        METADATA_USERSCRIPT_END_TAG,
    ].join("\n")).map(line => PREFIX_COMMENT+line));
}

export function process(metadata: string): string {
    return wrap(validate(metadata.trim()));
}

// Check that ...
export function validate(metadata: string): string {
    // ... end tag is not present:
    if (REGEX_METADATA_USERSCRIPT_END_TAG.test(metadata)) {
        throw new MetadataException(MSG_END_TAG);
    }
    // ... all required properties are present:
    const missingRequiredProperties = METADATA_REQUIRED_PROPERTIES.filter((p: string) => !metadataHasTagWithValue(p, metadata));
    if (missingRequiredProperties.length > 0) {
        throw new MetadataException(MSG_MISSING_OR_INVALID_TAGS(missingRequiredProperties, wrap(metadata)));
    }
    // ... run-at has a valid value:
    const runAt = getValue(PROPERTY_RUN_AT, metadata);
    if (runAt !== null && !VALID_RUN_AT_VALUES.includes(runAt)) {
        throw new MetadataException(MSG_UNRECOGNIZED_RUN_AT_VALUE(runAt, wrap(metadata)));
    }
    return metadata;
}
