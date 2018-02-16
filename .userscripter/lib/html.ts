/**
 * Useful HTML/DOM helper functions and methods.
 * @module html
 */

import { is, isString } from "ts-type-guards";


/**
 * Asserts that something is an {@code HTMLElement}.
 * @param {} x
 *
 * @throws {TypeError} The argument must be an {@code HTMLElement}.
 */
function assert_isHTMLElement(node: any): void {
    if (!isHTMLElement(node)) {
        throw new TypeError(`${JSON.stringify(node)} is not an HTML element.`);
    }
}

/**
 * Asserts that something is a {@code string}.
 * @param {} x
 *
 * @throws {TypeError} The argument must be a {@code string}.
 */
function assert_isString(s: any): void {
    if (!isString(s)) {
        throw new TypeError(`${JSON.stringify(s)} is not a string.`);
    }
}

/**
 * Creates a function that checks if an element has a certain ID.
 * @param {string} id The ID to check for.
 *
 * @return {Function} A function which takes an {@code HTMLElement} and checks if it has ID {@code id}.
 */
export function hasID(id: string): (element: HTMLElement) => boolean {
    /**
     * Checks if an element has a certain ID.
     * @param {HTMLElement} element The element to check.
     *
     * @throws {TypeError} If {@code element} is not an {@code HTMLElement}.
     *
     * @return {boolean} Whether {@code element} has the ID in question.
     */
    return element => (assert_isHTMLElement(element), element.id === id);
}

/**
 * An alias for {@code document.getElementById()}.
 * @param {string} id
 *
 * @return {?HTMLElement} The element with ID {@code id}, or {@code null} if no such element exists.
 */
export function byID(id: string): HTMLElement | null {
    return document.getElementById(id);
}

/**
 * Checks if something is an {@code HTMLElement}.
 * @param {} x
 *
 * @return {boolean} Whether {@code x} is an {@code HTMLElement}.
 */
export const isHTMLElement = is(HTMLElement);

/**
 * Creates a function that checks if something is an existing {@code HTMLElement}.
 * @param {string} selector The selector to look for.
 *
 * @return {Function} A function that checks whether {@code selector} matches an existing {@code HTMLElement}.
 */
export function existenceChecker(selector: string): () => boolean {
    return () => isHTMLElement(document.querySelector(selector));
}

/**
 * Removes an element from the DOM tree. Intended for use in {@code map}, {@code forEach}, etc.
 * @param {HTMLElement} element The element to remove.
 *
 * @throws {TypeError} The argument must be an {@code HTMLElement}.
 */
export function remove(element: HTMLElement): void {
    assert_isHTMLElement(element);
    element.remove();
}

/**
 * Flushes an element, i.e. removes everything inside it while keeping its attributes etc.
 * @param {HTMLElement} element The element to flush.
 *
 * @throws {TypeError} The argument must be an {@code HTMLElement}.
 */
export function flush(element: HTMLElement): void {
    assert_isHTMLElement(element);
    element.innerHTML = "";
}

/**
 * Inserts CSS with an optional ID.
 * @param {string} css The CSS to insert.
 * @param {string} [id] Optional ID of the inserted {@code <style>} element.
 *
 * @throws {TypeError} The first argument must be a string. The second argument, if passed, must be a string.
 * @throws {Error} If there already is an element with the specified ID.
 */
export function insertCSS(css: string, id?: string): void {
    assert_isString(css);
    const styleElement = document.createElement("style");
    styleElement.textContent = css;
    if (typeof id !== "undefined") {
        assert_isString(id);
        if (isHTMLElement(byID(id))) {
            throw new Error(`Cannot insert CSS with ID ${JSON.stringify(id)} because there is already an element with that ID.`);
        }
        styleElement.id = id;
    }
    document.head.appendChild(styleElement);
}

/**
 * Appends CSS to an existing {@code <style>} element.
 * @param {string} css The CSS to append.
 * @param {string} [id] ID of the {@code <style>} element to append to.
 *
 * @throws {TypeError} Both arguments must be strings.
 * @throws {Error} If there is no existing {@code <style>} element with the specified ID.
 */
export function appendCSS(css: string, id: string): void {
    assert_isString(css);
    assert_isString(id);
    const styleElement = byID(id);
    if (isHTMLElement(styleElement)) {
        if (styleElement instanceof HTMLStyleElement) {
            styleElement.textContent += css;
        } else {
            throw new Error(`Cannot append CSS to element with ID ${JSON.stringify(id)} because it is not a <style> element, but a <${styleElement.tagName}>.`);
        }
    } else {
        throw new Error(`Cannot append CSS to element with ID ${JSON.stringify(id)} because no such element exists.`);
    }
}
