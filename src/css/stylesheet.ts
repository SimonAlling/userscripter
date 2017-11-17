import * as SITE from "globals-site";
import * as CONFIG from "globals-config";

/*
******** README ********

This is the main stylesheet for the userscript.

This file is not supposed to contain any logic like conditions for certain CSS snippets; such code should reside in `stylesheet-modules.ts`.
*/

export default

`
html body {
    background-color: rgb(144, 238, 144);
    color: green;
}

${SITE.SELECTOR_HEADING}::before, ${SITE.SELECTOR_HEADING}::after {
    content: " ${CONFIG.HEADING_PREFIX_AND_SUFFIX} ";
}
`
