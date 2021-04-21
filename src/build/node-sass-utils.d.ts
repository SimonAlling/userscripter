// This declaration file contains only what's required for Userscripter.

declare module "node-sass-utils" {
    import sass from "sass";
    export default function(sassInstance: typeof sass): {
        SassDimension: typeof SassDimension
        castToSass: (dug: any) => sass.types.SassType
    }
}

declare class SassDimension {
    constructor(n: number, unit: string);
}
