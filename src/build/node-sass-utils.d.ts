// This declaration file contains only what's required for Userscripter.

declare module "node-sass-utils" {
    import NodeSass from "node-sass";
    export default function(node_sass: typeof NodeSass): {
        SassDimension: typeof SassDimension
        castToSass: (dug: any) => any
    }
}

declare class SassDimension {
    constructor(n: number, unit: string);
}
