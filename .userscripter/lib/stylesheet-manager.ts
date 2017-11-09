import { compose } from "./utilities";
import { insertCSS, appendCSS } from "./html";

const MODULE_SEPARATOR = "\n\n";

export interface StylesheetModule {
    condition: boolean;
    css: string;
}

export const StylesheetManager = (() => {
    function compose(modules: StylesheetModule[]): string {
        return modules.map(m => m.css).join(MODULE_SEPARATOR);
    }

    function insert(modules: StylesheetModule[], id?: string): void {
        insertCSS(compose(modules), id);
    }

    function append(modules: StylesheetModule[], id: string): void {
        appendCSS(compose(modules), id);
    }

    return {
        insert,
        append,
    };
})();
