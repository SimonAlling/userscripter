import * as IO from "./.userscripter/build/io";
import { LOG_LEVEL, toLogLevel, logFunctionsToRemove } from "./.userscripter/build/log-levels";
import * as Utils from "./.userscripter/build/utils";
import * as CONFIG from "./src/globals-config";
import * as SITE from "./src/globals-site";
const webpack = require("webpack");
const path = require("path");
const MinifyPlugin = require("babel-minify-webpack-plugin");
const WebpackStrip = require('webpack-strip');
const SassUtils = require("node-sass-utils")(require("node-sass"));

const EXTENSIONS = ["ts", "tsx", "js", "jsx", "scss"];
const EXTENSIONS_TS = ["ts", "tsx"];
const REGEX_SOURCE_CODE = new RegExp("\\.(" + EXTENSIONS.join("|") + ")$");
const REGEX_SOURCE_CODE_TS = new RegExp("\\.(" + EXTENSIONS_TS.join("|") + ")$");

function onlyTruthy<T>(array: T[]): T[] {
    return array.filter(Boolean);
}

// Function declaration notation does not work because SassUtils is undefined then.
const toSassDimension = (s: string): any => {
    const cssUnits = ["rem","em","vh","vw","vmin","vmax","ex","%","px","cm","mm","in","pt","pc","ch"];
    const parts = s.match(/^([\.0-9]+)([a-zA-Z]+)$/);
    if (parts === null) {
        return s;
    }
    const number = parts[1], unit = parts[2];
    if (cssUnits.includes(unit)) {
        return new SassUtils.SassDimension(parseInt(number, 10), unit);
    }
    return s;
}

const toSassDimension_recursively = (x: any): any => {
    if (typeof x === "string") {
        return toSassDimension(x);
    } else if (typeof x === "object") {
        const result: any = {};
        Object.keys(x).forEach(key => {
            result[key] = toSassDimension_recursively(x[key]);
        });
        return result;
    } else {
        return x;
    }
}

const SASS_VARS = toSassDimension_recursively({
    CONFIG,
    SITE,
});

module.exports = (env: object, argv: { [k: string]: string }) => {
    const logLevel = toLogLevel(argv["log-level"]);
    const PRODUCTION = argv.mode === "production";

    return {
        entry: {
            "userscript": IO.FILE_MAIN,
        },
        output: {
            path: path.resolve(__dirname, "."),
            filename: IO.FILE_WEBPACK_OUTPUT,
        },
        module: {
            rules: [
                {
                    test: /\.scss$/,
                    loaders: [
                        {
                            loader: "to-string-loader",
                        },
                        {
                            loader: "css-loader",
                            options: {
                                sass: true,
                                sourceMap: false,
                                modules: true,
                                camelCase: true,
                                namedExport: true,
                                localIdentName: "[local]",
                            },
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                functions: {
                                    getGlobal: (keyString: any) => {
                                        function fail(input: any) {
                                            throw new TypeError(`Expected a string, but saw ${input}`);
                                        }
                                        if (keyString.getValue === undefined) { fail("nothing"); }
                                        const value = keyString.getValue();
                                        if (typeof value !== "string") { fail(value); }
                                        function dig(obj: any, keys: string[]): any {
                                            if (keys.length === 0) {
                                                return obj;
                                            } else {
                                                const deeper = obj[keys[0]];
                                                if (deeper === undefined) {
                                                    throw new Error(`Unknown global: '${value}' (failed on '${keys[0]}')`);
                                                }
                                                return dig(deeper, keys.slice(1))
                                            }
                                        }
                                        return SassUtils.castToSass(dig(SASS_VARS, value.split(".")));
                                    },
                                },
                            },
                        },
                    ],
                },
                {
                    // Loaders chained from the bottom up:
                    loaders: [
                        {
                            loader: 'awesome-typescript-loader',
                            options: {
                                allowJs: true,
                            },
                        },
                    ],
                    // Only include source directory and libraries:
                    include: onlyTruthy([
                        path.resolve(__dirname, IO.DIR_SOURCE),
                        path.resolve(__dirname, IO.DIR_LIBRARY),
                        path.resolve(__dirname, IO.DIR_CONFIG),
                        path.resolve(__dirname, IO.DIR_BUILD),
                        PRODUCTION && path.resolve(__dirname, "node_modules"), // may take a long time; useful only for production builds
                    ]),
                    // Only run source code files through the loaders:
                    test: REGEX_SOURCE_CODE_TS,
                },
                // Preprocessing:
                {
                    loaders: onlyTruthy([
                        // Strip logging:
                        (logLevel !== LOG_LEVEL.ALL) && {
                            loader: WebpackStrip.loader(...logFunctionsToRemove(logLevel)),
                        },
                    ]),
                    include: [
                        path.resolve(__dirname, IO.DIR_SOURCE),
                        path.resolve(__dirname, IO.DIR_LIBRARY),
                    ],
                    test: REGEX_SOURCE_CODE_TS,
                },
            ],
        },
        node: {
            fs: "empty", // so that fs is found
        },
        resolve: {
            modules: ["node_modules", path.resolve(__dirname, IO.DIR_SOURCE), path.resolve(__dirname, IO.DIR_LIBRARY)],
            alias: {
                src: path.resolve(__dirname, IO.DIR_SOURCE),
                lib: path.resolve(__dirname, IO.DIR_LIBRARY),
            },
            extensions: EXTENSIONS.map(e => "."+e).concat(["*"]),
        },
        plugins: onlyTruthy([
            PRODUCTION && new MinifyPlugin(),
        ]),
    };

};
