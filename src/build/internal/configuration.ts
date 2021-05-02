import * as Metadata from "userscript-metadata";
import Manifest from "webextension-manifest";

import { Mode, isMode } from "./mode";
import {
    ParseResult,
    Parser,
    booleanParser,
    enumParser,
    urlParser,
} from "./parsing";

const ENV_VAR_PREFIX = "USERSCRIPTER_";

export const HOSTED_AT_EXAMPLE = "https://example.com/userscripts";

export type BuildConfig = Readonly<{
    allowJs: boolean
    appendDateToVersion: {
        development: boolean
        nightly: boolean
        production: boolean
    }
    id: string
    hostedAt: string | null
    mainFile: string
    mode: Mode
    nightly: boolean
    now: Date
    outDir: string
    rootDir: string
    sassVariableGetter: string
    sassVariables: Record<string, unknown>
    sourceDir: string
    verbose: boolean
}>;

export type WebpackConfigParameters = Readonly<{
    buildConfig: BuildConfig
    manifest?: (buildConfig: BuildConfig) => Manifest
    metadata: (buildConfig: BuildConfig) => Metadata.Metadata
    metadataSchema: Metadata.ValidateOptions
    env: NodeJS.ProcessEnv
}>;

type FromEnv<T> = ParseResult<T> | Readonly<{
    kind: "undefined"
}>;

type EnvVarNameWithoutPrefix = keyof typeof ENVIRONMENT_VARIABLES;

type EnvVarSpec<K extends keyof BuildConfig, N extends EnvVarNameWithoutPrefix, V> = Readonly<{
    nameWithoutPrefix: N
    parser: Parser<V>
    overrides: K
    mustBe: string | readonly string[] // plaintext description (e.g. "a positive integer") or list of allowed values
}>;

export type EnvVarError = Readonly<{
    fullName: string
    expected: string | readonly string[]
    found: string
}>;

export function envVarName(nameWithoutPrefix: EnvVarNameWithoutPrefix): string {
    return ENV_VAR_PREFIX + nameWithoutPrefix;
}

export const ENVIRONMENT_VARIABLES = {
    // `name` should NOT include "USERSCRIPTER_" prefix.
    // `overrides` must be in `keyof BuildConfig`.
    MODE: {
        nameWithoutPrefix: "MODE",
        parser: enumParser(isMode),
        overrides: "mode",
        mustBe: Object.values(Mode),
    },
    NIGHTLY: {
        nameWithoutPrefix: "NIGHTLY",
        parser: booleanParser,
        overrides: "nightly",
        mustBe: ["true", "false"],
    },
    HOSTED_AT: {
        nameWithoutPrefix: "HOSTED_AT",
        parser: urlParser,
        overrides: "hostedAt",
        mustBe: `a valid URL (e.g. "${HOSTED_AT_EXAMPLE}")`,
    },
    VERBOSE: {
        nameWithoutPrefix: "VERBOSE",
        parser: booleanParser,
        overrides: "verbose",
        mustBe: ["true", "false"],
    },
} as const;

{
    // A hack to make it easier to find type errors in ENVIRONMENT_VARIABLES.
    // It cannot have an explicit type itself since we want it to be `const`.
    const typecheckedEnvVars: { [N in EnvVarNameWithoutPrefix]: EnvVarSpec<keyof BuildConfig, N, unknown> } = ENVIRONMENT_VARIABLES;
    void typecheckedEnvVars; // eslint-disable-line no-unused-expressions
}

export type BuildConfigAndListOf<E> = Readonly<{
    buildConfig: BuildConfig
    errors: readonly E[]
}>;

type DistFileType = "user" | "meta";

export function distFileName(id: string, type: DistFileType): string {
    return [ id, type, "js" ].join(".");
}

export function metadataUrl(hostedAt: string, id: string, type: DistFileType): string {
    return hostedAt.replace(/\/?$/, "/") + distFileName(id, type);
}

export function envVars(env: NodeJS.ProcessEnv): ReadonlyArray<readonly [ string, string | undefined ]> {
    return Object.values(ENVIRONMENT_VARIABLES).map(e => {
        const name = envVarName(e.nameWithoutPrefix);
        return [ name, env[name] ] as const;
    });
}

export function overrideBuildConfig(
    buildConfig: BuildConfig,
    env: NodeJS.ProcessEnv,
): BuildConfigAndListOf<EnvVarError> {
    return Object.values(ENVIRONMENT_VARIABLES).reduce(
        (acc: BuildConfigAndListOf<EnvVarError>, envVar: EnvVarSpec<keyof BuildConfig, EnvVarNameWithoutPrefix, unknown>) => {
            const envVarNameWithPrefix = envVarName(envVar.nameWithoutPrefix);
            const parsed = fromEnv(envVar, env[envVarNameWithPrefix]);
            switch (parsed.kind) {
                case "undefined":
                    return acc;
                case "valid":
                    return {
                        ...acc,
                        buildConfig: {
                            ...acc.buildConfig,
                            [envVar.overrides]: parsed.value,
                        },
                    };
                case "invalid":
                    return {
                        ...acc,
                        errors: acc.errors.concat({
                            fullName: envVarNameWithPrefix,
                            expected: envVar.mustBe,
                            found: parsed.input,
                        }),
                    };
            }
        },
        { buildConfig, errors: [] },
    );
}

function fromEnv<R extends keyof BuildConfig, N extends EnvVarNameWithoutPrefix, V>(
    envVarSpec: EnvVarSpec<R, N, V>,
    v: string | undefined,
): FromEnv<V> {
    return (
        v === undefined
        ? { kind: "undefined" }
        : (
            envVarSpec.parser(v)
        )
    );
}
