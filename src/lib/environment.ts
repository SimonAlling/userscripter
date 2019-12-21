export type Condition = (w: Window) => boolean;

export const ALWAYS = () => true;
export const NEVER = () => false;

export const DOMCONTENTLOADED = (state: DocumentReadyState) => state !== "loading";
export const LOAD = (state: DocumentReadyState) => state === "complete";

export function isDesired(x: { condition: Condition }): boolean {
    return x.condition(window);
}
