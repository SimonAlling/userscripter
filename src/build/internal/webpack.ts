import * as path from "path";
import { everythingInPackage } from "restrict-imports-loader";
import TerserPlugin from "terser-webpack-plugin";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import * as Metadata from "userscript-metadata";
import * as webpack from "webpack";
import WebpackUserscriptPlugin from "webpack-userscript";

import {
    BuildConfig,
    WebpackConfigParameters,
    distFileName,
    overrideBuildConfig,
} from "./configuration";
import { Mode } from "./mode";
import { getGlobalFrom } from "./sass";
import { concat } from "./utilities";
import { UserscripterWebpackPlugin } from "./webpack-plugin";

const USERSCRIPTER_BUILD = "userscripter/build";

const EXTENSIONS = {
    TS: ["ts", "tsx"],
    JS: ["mjs", "js", "jsx"], // Order is important: mjs must come before js to enable tree-shaking for dual-mode ESM/CJS packages.
    SASS: ["scss"],
    SVG: ["svg"],
} as const;

const WEBPACK_STATS_TO_STRING_OPTIONS = {
    depth: false,
    hash: false,
    modules: false,
    entrypoints: false,
    colors: true,
} as const;

export const DEFAULT_BUILD_CONFIG: (x: {
    rootDir: string,
    id: string,
    now: Date
}) => BuildConfig = x => ({
    allowJs: false,
    id: x.id,
    hostedAt: null,
    mainFile: "main.ts",
    mode: Mode.development,
    nightly: false,
    now: x.now,
    outDir: "dist",
    rootDir: x.rootDir,
    sassVariables: {},
    sourceDir: "src",
});

export const DEFAULT_METADATA_SCHEMA: Metadata.ValidateOptions = {
    items: {
        ...Metadata.DEFAULT_ITEMS,
        version: Metadata.DEFAULT_ITEMS.version.butRequired(), // Validated against a subset of SemVer by default.
        run_at: Metadata.DEFAULT_ITEMS.run_at.butRequired(),
    },
    warnings: Metadata.DEFAULT_WARNINGS,
    underscoresAsHyphens: true,
} as const;

export function createWebpackConfig(x: WebpackConfigParameters): webpack.Configuration {
    const buildConfig = (
        // We intentionally ignore any errors here; they will be handled by our Webpack plugin.
        overrideBuildConfig(x.buildConfig, x.env).buildConfig
    );
    const {
        allowJs,
        id,
        mainFile,
        mode,
        nightly,
        now,
        outDir,
        rootDir,
        sassVariables,
        sourceDir,
    } = buildConfig;
    const metadata = x.metadata(buildConfig);
    // tslint:disable:object-literal-sort-keys
    return {
        mode: mode,
        entry: {
            userscript: resolveIn(sourceDir)(mainFile),
        },
        output: {
            path: resolveIn(rootDir)(outDir),
            filename: distFileName(id, "user"),
        },
        stats: WEBPACK_STATS_TO_STRING_OPTIONS,
        module: {
            rules: [
                {
                    test: filenameExtensionRegex(EXTENSIONS.SVG),
                    loaders: [
                        {
                            loader: require.resolve("raw-loader"),
                        },
                    ],
                },
                {
                    test: filenameExtensionRegex(EXTENSIONS.SASS),
                    loaders: [
                        // Loaders must be require.resolved here so that Webpack is guaranteed to find them.
                        {
                            loader: require.resolve("to-string-loader"),
                        },
                        {
                            loader: require.resolve("css-loader"),
                            options: {
                                sourceMap: false,
                                modules: {
                                    localIdentName: "[local]",
                                },
                            },
                        },
                        {
                            loader: require.resolve("sass-loader"),
                            options: {
                                sassOptions: {
                                    functions: { getGlobal: getGlobalFrom(sassVariables) },
                                },
                            },
                        },
                    ],
                },
                {
                    test: filenameExtensionRegex(EXTENSIONS.TS),
                    include: resolveIn(rootDir)(sourceDir),
                    loaders: [
                        {
                            loader: require.resolve("awesome-typescript-loader"),
                            options: { allowJs, useCache: true },
                        },
                        {
                            loader: require.resolve("restrict-imports-loader"),
                            options: {
                                severity: "error",
                                detailedErrorMessages: true,
                                rules: [
                                    {
                                        restricted: everythingInPackage(USERSCRIPTER_BUILD),
                                        severity: "fatal", // necessary to protect the user from being drowned in unintelligible errors
                                        info: `"${USERSCRIPTER_BUILD}" and its submodules cannot be imported in the source directory ('${sourceDir}'). Please remove these imports:`,
                                    },
                                ],
                            },
                        },
                    ],
                },
            ],
        },
        resolve: {
            plugins: [
                new TsconfigPathsPlugin(),
            ],
            extensions: concat(Object.values(EXTENSIONS)).map(e => "." + e),
        },
        plugins: [
            new UserscripterWebpackPlugin(x),
            new WebpackUserscriptPlugin({
                metajs: true,
                headers: {
                    ...metadata,
                    version: (
                        nightly || mode === Mode.development
                        ? metadata.version + "." + dateAsSemver(now)
                        : metadata.version
                    ),
                },
            }),
        ],
        optimization: {
            minimize: mode === Mode.production,
            minimizer: [
                new TerserPlugin({
                    parallel: true,
                }),
            ],
        },
    };
    // tslint:enable:object-literal-sort-keys
}

const resolveIn = (root: string) => (subdir: string) => path.resolve(root, subdir);

function filenameExtensionRegex(extensions: ReadonlyArray<string>): RegExp {
    return new RegExp("\\.(" + extensions.join("|") + ")$");
}

function dateAsSemver(d: Date): string {
    return [
        d.getFullYear(),
        d.getMonth() + 1, // 0-indexed
        d.getDate(),
        d.getHours(),
        d.getMinutes(),
    ].join(".");
}
