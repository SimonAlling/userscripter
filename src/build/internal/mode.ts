import { isString } from "ts-type-guards";

export const Mode = {
    production: "production",
    development: "development",
} as const;

export type Mode = keyof typeof Mode;

export function isMode(x: unknown): x is Mode {
    return isString(x) && (Object.values(Mode) as string[]).includes(x);
}
