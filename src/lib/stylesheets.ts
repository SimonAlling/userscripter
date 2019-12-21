import { Condition } from "./environment";

// CSS media queries:
const MATCH_ALL = "all";
const MATCH_NONE = "not all";

type BaseStylesheet = Readonly<{
    css: string
    condition: Condition
}>;

type StylesheetWithoutId = BaseStylesheet & Readonly<{
    id?: undefined
}>;

type StylesheetWithId = BaseStylesheet & Readonly<{
    id: string // necessary if and only if the stylesheet should be togglable
}>;

type Stylesheet = StylesheetWithId | StylesheetWithoutId;

// Forces type errors at stylesheet declaration site, close to the userscript author:
export function stylesheet(spec: StylesheetWithId): StylesheetWithId;
export function stylesheet(spec: StylesheetWithoutId): StylesheetWithoutId;
export function stylesheet(spec: Stylesheet): Stylesheet {
    return spec;
}

export type Stylesheets = Readonly<{ [_: string]: Stylesheet }>;

export function insertStylesheets(stylesheets: Stylesheets): void {
    const fragment = document.createDocumentFragment();
    Object.entries(stylesheets).forEach(([ _, sheet ]) => {
        const style = document.createElement("style");
        if (sheet.id !== undefined) style.id = sheet.id;
        style.textContent = sheet.css;
        style.media = sheet.condition(window) ? MATCH_ALL : MATCH_NONE;
        fragment.appendChild(style);
    });
    document.documentElement.appendChild(fragment);
}

const setMediaQuery = (m: string) => (s: StylesheetWithId) => {
    const element = document.getElementById(s.id);
    if (element !== null) {
        element.setAttribute("media", m);
    }
};

export const enableStylesheet = setMediaQuery(MATCH_ALL);
export const disableStylesheet = setMediaQuery(MATCH_NONE);
