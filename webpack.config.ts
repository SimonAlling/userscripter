import * as IO from "./.userscripter/build/io";
import { LogLevel, functionsToRemove } from "./.userscripter/build/log-levels";
import { Mode } from "./.userscripter/build/mode";
import * as CONFIG from "./src/globals-config";
import * as SITE from "./src/globals-site";
import * as webpack from "webpack";
import * as path from "path";
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const WebpackStrip = require("webpack-strip");
const SassUtils = require("node-sass-utils")(require("node-sass"));

// Order is important: mjs must come before js to enable tree-shaking for dual-mode ESM/CJS packages.
const EXTENSIONS = ["ts", "tsx", "mjs", "js", "jsx", "scss"];
const EXTENSIONS_TS = ["ts", "tsx"];
const REGEX_SOURCE_CODE_TS = new RegExp("\\.(" + EXTENSIONS_TS.join("|") + ")$");

const LOG_FUNCTIONS_BY_LEVEL = [
    { level: LogLevel.ALL,     functions: [ "log"       , "console.log"   ] },
    { level: LogLevel.INFO,    functions: [ "logInfo"   , "console.info"  ] },
    { level: LogLevel.WARNING, functions: [ "logWarning", "console.warn"  ] },
    { level: LogLevel.ERROR,   functions: [ "logError"  , "console.error" ] },
];

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

export default (env: object, argv: {
    mode: Mode,
    logLevel: LogLevel,
    id: string,
    metadata: string,
}): webpack.Configuration => {
    const PRODUCTION = argv.mode === Mode.PRODUCTION;
    const logLevel = argv.logLevel;

    return {
        mode: PRODUCTION ? Mode.PRODUCTION : Mode.DEVELOPMENT,
        entry: {
            "userscript": IO.FILE_MAIN,
        },
        output: {
            path: path.resolve(__dirname, "."),
            filename: IO.outputFile_userscript(argv.id),
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
                    loaders: [
                        {
                            loader: 'awesome-typescript-loader',
                            options: {
                                allowJs: true,
                            },
                        },
                    ],
                    include: [
                        path.resolve(__dirname, IO.DIR_SOURCE),
                        path.resolve(__dirname, IO.DIR_LIBRARY),
                        path.resolve(__dirname, IO.DIR_CONFIG),
                        path.resolve(__dirname, IO.DIR_BUILD),
                    ].concat(PRODUCTION ? [
                        path.resolve(__dirname, "node_modules"), // may take a long time; useful only for production builds
                    ] : []),
                    test: REGEX_SOURCE_CODE_TS,
                },
                // Preprocessing:
                {
                    loaders: logLevel !== LogLevel.ALL ? [
                        // Strip logging:
                        {
                            loader: WebpackStrip.loader(...functionsToRemove(logLevel, LOG_FUNCTIONS_BY_LEVEL)),
                        },
                    ] : [],
                    include: [
                        path.resolve(__dirname, IO.DIR_SOURCE),
                        path.resolve(__dirname, IO.DIR_LIBRARY),
                    ],
                    test: REGEX_SOURCE_CODE_TS,
                },
            ],
        },
        resolve: {
            modules: ["node_modules", path.resolve(__dirname, IO.DIR_SOURCE), path.resolve(__dirname, IO.DIR_LIBRARY)],
            alias: {
                src: path.resolve(__dirname, IO.DIR_SOURCE),
                lib: path.resolve(__dirname, IO.DIR_LIBRARY),
            },
            extensions: EXTENSIONS.map(e => "."+e).concat(["*"]),
        },
        optimization: {
            minimizer: [
                new UglifyJsPlugin({
                    uglifyOptions: {
                        output: {
                            beautify: false,
                            preamble: argv.metadata,
                        },
                    },
                }),
            ],
        },
        plugins: [
            new webpack.BannerPlugin({
                banner: argv.metadata,
                raw: true,
                entryOnly: true,
            }),
        ],
    };
};
