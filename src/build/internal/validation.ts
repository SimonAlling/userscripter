import { BuildConfig, BuildConfigAndListOf, HOSTED_AT_EXAMPLE } from "./configuration";
import { urlParser } from "./parsing";

export type BuildConfigError<K extends keyof BuildConfig> = Readonly<{
    name: K,
    expected: string,
    found: BuildConfig[K],
}>;

export type BuildConfigValidators = Readonly<{
    [k in keyof BuildConfig]: PredicateWithDescription<BuildConfig[k]>
}>;

type PredicateWithDescription<T> = Readonly<{
    predicate: (x: T) => boolean
    description: string
}>;

function requirement<K extends keyof BuildConfig>(x: {
    description: string,
    key: K,
    value: BuildConfig[K],
    predicate: (value: BuildConfig[K]) => boolean,
}) {
    return { ...x, valid: x.predicate(x.value) };
}

function isValidId(x: string): boolean {
    return /^[a-z][a-z0-9\-]*$/.test(x);
}

export function buildConfigErrors(
    buildConfig: BuildConfig,
): ReadonlyArray<BuildConfigError<any>> {
    const REQUIREMENTS = [
        requirement({
            description: `a valid URL (e.g. "${HOSTED_AT_EXAMPLE}") or null`,
            key: "hostedAt",
            value: buildConfig.hostedAt,
            predicate: x => x === null || urlParser(x).kind === "valid",
        }),
        requirement({
            description: `a string containing only lowercase letters (a–z), digits and hyphens (e.g. "example-userscript"), starting with a letter`,
            key: "id",
            value: buildConfig.id,
            predicate: isValidId,
        }),
    ] as const;
    return REQUIREMENTS.filter(x => !x.valid).map(x => ({ name: x.key, expected: x.description, found: x.value }));
}
