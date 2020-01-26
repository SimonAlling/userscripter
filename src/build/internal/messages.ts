import { compose } from "@typed/compose";
import { unlines } from "lines-unlines";
import { isString } from "ts-type-guards";
import { Kind, ValidationError, Warning, tag } from "userscript-metadata";

import { BuildConfig, EnvVarError } from "./configuration";
import { BuildConfigError } from "./validation";

export const failed = `Build failed. Userscript file could not be assembled.`;

const webpackifyMessage = (context: string) => (s: string) => context + "\n" + s;

const webpackifyMessage_environment = webpackifyMessage("environment");

const webpackifyMessage_metadata = webpackifyMessage("metadata");

const webpackifyMessage_buildConfig = webpackifyMessage("build configuration");

const webpackifyMessage_userscripter = webpackifyMessage("Userscripter");

export const envVarError = (e: EnvVarError) => (
    webpackifyMessage_environment(invalidValue(
        `environment variable ${e.fullName}`,
        isString(e.expected) ? e.expected : oneOf(e.expected),
        quote(e.found),
    ))
);

export const buildConfigError = (e: BuildConfigError<keyof BuildConfig>) => (
    webpackifyMessage_buildConfig(invalidValue(
        `parameter ${e.name}`,
        e.expected,
        e.found === null ? "null" : JSON.stringify(e.found),
    ))
);

const invalidValue = (what: string, expected: string, found: string) => unlines([
    `Invalid value for ${what}.`,
    `    • Expected:  ${expected}`,
    `    • Found:     ${found}`,
]);

export const oneOf = (xs: readonly string[]) => {
    // Length of xs must be at least 1.
    const quoted = xs.map(quote);
    const allButLast = (
        quoted.length > 1
        ? quoted.slice(0, quoted.length - 1).join(", ") + " or "
        : ""
    );
    return allButLast + quoted[quoted.length - 1];
};

export const metadataWarning = compose(
    webpackifyMessage_metadata,
    (warning: Warning) => unlines([
        warning.summary,
        "",
        warning.description,
    ]),
);

export const metadataError = compose(
    webpackifyMessage_metadata,
    (error: ValidationError) => {
        switch (error.kind) {
            case Kind.INVALID_KEY: return `Invalid key: "${error.entry.key}". ${error.reason}`;
            case Kind.INVALID_VALUE: return `Invalid ${tag(error.entry.key)} value: ${JSON.stringify(error.entry.value)}. ${error.reason}`;
            case Kind.MULTIPLE_UNIQUE: return `Multiple ${tag(error.item.key)} values. Only one value is allowed.`;
            case Kind.REQUIRED_MISSING: return `A ${tag(error.item.key)} entry is required, but none was found.`;
            case Kind.UNRECOGNIZED_KEY: return `Unrecognized key: "${error.entry.key}".`;
        }
    },
);

export const quote = (s: string) => `"${s}"`;

export const compilationAssetNotFound = (assetName: string) => (
    webpackifyMessage_userscripter(`Compilation asset ${quote(assetName)} expected but not found.`)
);
