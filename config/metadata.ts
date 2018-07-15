import get from "./get";

export default `
// ==UserScript==
// @name         ${get("name")}
// @version      ${get("version")}
// @description  ${get("description")}
// @author       ${get("author")}
// @match        *://${get("hostname")}/*
// @match        *://www.${get("hostname")}/*
// @namespace    ${get("namespace")}
// @run-at       ${get("run-at")}
// ==/UserScript==
`;
