// This declaration file contains only what's required for Userscripter.

declare module "webpack-userscript" {
    import { Compiler } from "webpack";
    export default class WebpackUserscript {
        constructor(options: any);
        apply: (compiler: Compiler) => void;
    }
}
