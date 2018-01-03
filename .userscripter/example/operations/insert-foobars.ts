// <<<<<<< EXAMPLE
import * as SITE from "globals-site";
import * as CONFIG from "globals-config";
import { log, logInfo, logWarning, logError } from "userscripter/logging";

export default

() => {
    for (let i = 1; i <= 5; i++) {
        const div = document.createElement("div");
        div.classList.add(CONFIG.CLASS_FOOBAR);
        div.textContent = `div.${CONFIG.CLASS_FOOBAR} number ${i}`;
        document.body.appendChild(div);
    }
}
// =======
// >>>>>>> CLEAN
