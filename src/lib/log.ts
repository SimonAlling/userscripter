type LoggerMethodName = "log" | "info" | "warn" | "error";

export type Logger = {
    readonly [K in LoggerMethodName]: (...xs: any[]) => void
};

let prefix = "";
let logger: Logger = console;

export function setPrefix(p: string): void {
    prefix = p;
}

export function setLogger(l: Logger): void {
    logger = l;
}

export function log(str: string): void {
    logger.log(prefix, str);
}

export function info(str: string): void {
    logger.info(prefix, str);
}

export function warning(str: string): void {
    logger.warn(prefix, str);
}

export function error(str: string): void {
    logger.error(prefix, str);
}
