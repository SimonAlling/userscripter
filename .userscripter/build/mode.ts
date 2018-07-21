import { EnumFromStringError, assertUnreachable } from "./utils";

export enum Mode {
    PRODUCTION = "production",
    DEVELOPMENT = "development",
}

export class ModeFromStringError extends EnumFromStringError {}

export function fromString(s: string): Mode {
    switch (s) {
        case Mode.PRODUCTION: return Mode.PRODUCTION;
        case Mode.DEVELOPMENT: return Mode.DEVELOPMENT;
        default: throw new ModeFromStringError(s);
    }
}
