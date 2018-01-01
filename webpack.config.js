const webpack = require("webpack");
const path = require("path");
const DIR_BUILD = "./.userscripter/build/";
const IO = require(DIR_BUILD + "io.js");

const EXTENSIONS = ["ts", "js"];

module.exports = {
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
                            useBabel: true,
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
                    // Populate global userscript config constants:
                    {
                        loader: 'userscripter-loader',
                    },
                ],
                // Only include source directory and libraries:
                include: [
                    path.resolve(__dirname, IO.DIR_SOURCE),
                    path.resolve(__dirname, IO.DIR_LIBRARY),
                ],
                // Only run .js and .ts files through the loaders:
                test: new RegExp("\\.(" + EXTENSIONS.join("|") + ")$"),
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
    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin(),
    ],
};
