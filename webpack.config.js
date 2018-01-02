const webpack = require("webpack");
const path = require("path");
const DIR_BUILD = "./.userscripter/build/";
const IO = require(DIR_BUILD + "io.js");
const Userscripter = require(DIR_BUILD + "userscripter");
const MinifyPlugin = require("babel-minify-webpack-plugin");
const WebpackStrip = require('webpack-strip');

const EXTENSIONS = ["ts", "js"];
const REGEX_SOURCE_CODE = new RegExp("\\.(" + EXTENSIONS.join("|") + ")$");
const LOG_LEVELS = Userscripter.LOG_LEVELS;
const LOG_LEVELS_ALL = LOG_LEVELS.ALL;

function onlyTruthy(array) {
    return array.filter(Boolean);
}

module.exports = (env = {}) => {

    const logLevel = LOG_LEVELS[env.logLevel] || LOG_LEVELS_ALL;
    const PRODUCTION = Boolean(env.production);

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
                    // Loaders chained from the bottom up:
                    loaders: [
                        // TypeScript with Babel:
                        {
                            loader: 'awesome-typescript-loader',
                            options: {
                                useBabel: PRODUCTION,
                                useCache: true,
                                allowJs: true,
                                babelOptions: {
                                    presets: [
                                        ["env", {
                                            modules: false, // don't touch ES6 module syntax
                                            targets: {
                                                browsers: ["last 3 versions"]
                                            },
                                        }]
                                    ],
                                },
                            }
                        },
                    ],
                    // Only include source directory and libraries:
                    include: onlyTruthy([
                        path.resolve(__dirname, IO.DIR_SOURCE),
                        path.resolve(__dirname, IO.DIR_LIBRARY),
                        PRODUCTION && path.resolve(__dirname, "node_modules"), // may take a long time; useful only for production builds
                    ]),
                    // Only run source code files through the loaders:
                    test: REGEX_SOURCE_CODE,
                },
                // Preprocessing:
                {
                    loaders: onlyTruthy([
                        // Strip logging:
                        (logLevel !== LOG_LEVELS_ALL) && {
                            loader: WebpackStrip.loader(...Userscripter.logFunctionsToRemove(logLevel)),
                        },
                        // Populate global userscript config constants:
                        {
                            loader: "userscripter-loader",
                        },
                    ]),
                    include: [
                        path.resolve(__dirname, IO.DIR_SOURCE),
                        path.resolve(__dirname, IO.DIR_LIBRARY),
                    ],
                    test: REGEX_SOURCE_CODE,
                },
            ],
        },
        resolve: {
            modules: ["node_modules", path.resolve(__dirname, IO.DIR_SOURCE), path.resolve(__dirname, IO.DIR_LIBRARY)],
            alias: {
                src: path.resolve(__dirname, IO.DIR_SOURCE),
                lib: path.resolve(__dirname, IO.DIR_LIBRARY),
            },
            extensions: EXTENSIONS.map(ext => "."+ext),
        },
        resolveLoader: {
            alias: {
                "userscripter-loader": path.join(__dirname, DIR_BUILD + "userscripter-loader.js"),
            },
        },
        plugins: onlyTruthy([
            PRODUCTION && new webpack.optimize.ModuleConcatenationPlugin(),
            PRODUCTION && new MinifyPlugin(),
        ]),
    };

};
