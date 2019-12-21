import * as log from "./log";
import { OperationsPlan, runOperations } from "./operations";
import { Stylesheets, insertStylesheets } from "./stylesheets";

export function main(userscript: {
    id: string,
    name: string,
    initialAction: () => void,
    stylesheets: Stylesheets,
    operationsPlan: OperationsPlan,
}): void {
    log.setPrefix(`[${userscript.name}]`);
    // Make sure the userscript does not run more than once (e.g. if it's installed
    // twice or if the browser uses a cached page when navigating back and forward):
    const attr = attribute(userscript.id);
    if (document.documentElement.hasAttribute(attr)) {
        log.warning(`It looks as though ${userscript.name} has already run (because the attribute "${attr}" was found on <head>). Stopping.`);
    } else {
        document.documentElement.setAttribute(attr, "");
        userscript.initialAction();
        insertStylesheets(userscript.stylesheets);
        runOperations(userscript.operationsPlan);
    }
}

function attribute(id: string): string {
    return "data-" + id + "-has-run";
}
