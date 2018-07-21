export const HELP = "help";
export const LOG_LEVEL = "log-level";
export const PRODUCTION = "production";

export interface CommandLineOption {
    name: string
    type: StringConstructor | BooleanConstructor | NumberConstructor
    alias?: string
    defaultOption?: boolean
}

export const COMMAND_LINE_OPTIONS: CommandLineOption[] = [
    { name: HELP, type: Boolean, alias: "h" },
    { name: LOG_LEVEL, type: String, alias: "l" },
    { name: PRODUCTION, type: Boolean, alias: "p", defaultOption: false },
];
