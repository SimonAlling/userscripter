// This declaration file contains only what's required for Userscripter.

declare module "node-sass-utils" {
    import Sass from "sass";
    export default function(sass: typeof Sass): {
        SassDimension: typeof SassDimension
        castToSass: (dug: any) => Sass.types.SassType
    }
}

declare class SassDimension {
    constructor(n: number, unit: string);
}
