import { ALWAYS } from "userscripter/run-time/environment";
import { Stylesheets, stylesheet } from "userscripter/run-time/stylesheets";

const STYLESHEETS = {
    main: stylesheet({
        condition: ALWAYS,
        css: `
            html body {
                background-color: rgb(144, 238, 144) !important;
                color: green !important;
            }
        `,
    }),
} as const;

// This trick uncovers type errors in STYLESHEETS while retaining the static knowledge of its properties (so we can still write e.g. STYLESHEETS.foo):
const _: Stylesheets = STYLESHEETS; void _;

export default STYLESHEETS;
