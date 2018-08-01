import { Metadata, ValidationError, Kind, Warning, isRight, validateAndStringifyWith } from "userscript-metadata";
import * as Utils from "./utils";
import * as Msg from "./messages";
import { ITEMS, WARNINGS, UNDERSCORES_AS_HYPHENS } from "../../config/validation/metadata-validation";

export class MetadataException extends Error {
    private static PREFIX: string = "Invalid metadata.\n\n";
    constructor(public readonly errors: ReadonlyArray<ValidationError>) {
        super(
            MetadataException.PREFIX
            + Utils.formattedList(errors.map(Msg.metadataError))
            + (
                errors.some(e => e.kind !== Kind.INVALID_KEY) // Key rules cannot be customized.
                ? "\n" + Msg.metadataValidationHint
                : ""
            )
        );
    }
}

export function process(metadata: Metadata): {
    stringified: string
    warnings: ReadonlyArray<Warning>
} {
    const result = validateAndStringifyWith({
        items: ITEMS,
        warnings: WARNINGS,
        underscoresAsHyphens: UNDERSCORES_AS_HYPHENS,
    })(metadata);
    if (isRight(result)) {
        return result.Right;
    } else {
        throw new MetadataException(result.Left);
    }
}
