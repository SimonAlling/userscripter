import * as log from "./log";
import * as operations from "./operations";
import * as stylesheets from "./stylesheets";

export function run(userscript: {
    id: string,
    name: string,
    initialAction: () => void,
    stylesheets: stylesheets.Stylesheets,
    operationsPlan: operations.Plan,
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
        stylesheets.insert(userscript.stylesheets);
        operations.run(userscript.operationsPlan);
    }
}

function attribute(id: string): string {
    return "data-" + id + "-has-run";
}
