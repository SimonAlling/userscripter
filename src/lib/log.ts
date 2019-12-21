// tslint:disable:no-console

let prefix: string = "";

export function setPrefix(p: string): void {
    prefix = p;
}

export function log(str: string): void {
    console.log(prefix, str);
}

export function info(str: string): void {
    console.info(prefix, str);
}

export function warning(str: string): void {
    console.warn(prefix, str);
}

export function error(str: string): void {
    console.error(prefix, str);
}
