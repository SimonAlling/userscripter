// <<<<<<< EXAMPLE
import * as SITE from "globals-site";
import * as CONFIG from "globals-config";
import { log, logInfo, logWarning, logError } from "userscripter/logging";
import { Preferences } from "userscripter/preference-handling";
import P from "preferences";

function foobar(i: number): HTMLElement {
    const div = document.createElement("div");
    div.classList.add(CONFIG.CLASS_FOOBAR);
    div.textContent = `div.${CONFIG.CLASS_FOOBAR} number ${i}`;
    return div;
}

export default (e: { mainDiv: HTMLElement }) => {
    const n = Preferences.get(P.foobars._.number);
    const h2 = document.createElement("h2");
    const prefix = document.createTextNode(`Below are ${n} foobars. `);
    const link = document.createElement("a");
    link.textContent = "Moar!";
    link.href = "javascript:void(0)";
    link.addEventListener("click", () => {
        Preferences.set(P.foobars._.number, n + 1);
        location.reload();
    });
    h2.appendChild(prefix);
    h2.appendChild(link);
    e.mainDiv.appendChild(h2);

    for (let i = 1; i <= n; i++) {
        document.body.appendChild(foobar(i));
    }
}
// =======
// >>>>>>> CLEAN
