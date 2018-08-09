import { insertCSS, appendCSS } from "./html";

const MODULE_SEPARATOR = "\n\n";

export interface StylesheetModule {
    condition: boolean;
    css: string;
}

function compose(modules: StylesheetModule[]): string {
    return modules.map(m => m.css).join(MODULE_SEPARATOR);
}

export function insert(modules: StylesheetModule[], id?: string): void {
    insertCSS(compose(modules.filter(m => m.condition)), id);
}

export function append(modules: StylesheetModule[], id: string): void {
    appendCSS(compose(modules.filter(m => m.condition)), id);
}
