/*
This type is chosen so that side-effects can be deferred from the time of declaring operations to when they are executed.
A prime example is if a condition should be based on the content of document.head:
In some scenarios, e.g. a WebExtension running in Google Chrome, document.head is null when the operations are declared.
*/
export type Condition = (w: Window) => boolean;

export const ALWAYS = () => true;
export const NEVER = () => false;

export const DOMCONTENTLOADED = (state: DocumentReadyState) => state !== "loading";
export const LOAD = (state: DocumentReadyState) => state === "complete";
