import * as path from "path";

import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import * as Metadata from "userscript-metadata";
import * as webpack from "webpack";

import {
    BuildConfig,
    distFileName,
    envVars,
    overrideBuildConfig,
    WebpackConfigParameters,
} from "./configuration";
import {Mode} from "./mode";
import {getGlobalFrom, withDartSassEncodedParameters} from "./sass";
import {concat} from "./utilities";
import {buildConfigErrors} from "./validation";
import {UserscripterWebpackPlugin} from "./webpack-plugin";

const EXTENSIONS = {
    TS: ["ts", "tsx"],
    JS: ["mjs", "js", "jsx"], // Order is important: mjs must come before js to enable tree-shaking for dual-mode ESM/CJS packages.
    SASS: ["scss"],
    SVG: ["svg"],
} as const;

export const DEFAULT_BUILD_CONFIG: (x: {
    rootDir: string
    id: string
    now: Date
}) => BuildConfig = x => ({
    appendDateToVersion: {
        development: true,
        nightly: true,
        production: false,
    },
    id: x.id,
    hostedAt: null,
    mainFile: "main.ts",
    mode: Mode.development,
    nightly: false,
    now: x.now,
    outDir: "dist",
    rootDir: x.rootDir,
    sassVariableGetter: "getGlobal",
    sassVariables: {},
    sourceDir: "src",
    verbose: false,
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
    const overridden = overrideBuildConfig(x.buildConfig, x.env);
    const {
        appendDateToVersion,
        id,
        mainFile,
        mode,
        nightly,
        now,
        outDir,
        rootDir,
        sassVariableGetter,
        sassVariables,
        sourceDir,
        verbose,
    } = overridden.buildConfig;
    const getGlobal = getGlobalFrom(sassVariables);

    function finalName(name: string): string {
        return name + (nightly ? " Nightly" : "");
    }

    function finalVersion(version: string): string {
        switch (true) {
            case nightly && appendDateToVersion.nightly:
            case mode === Mode.development && appendDateToVersion.development:
            case mode === Mode.production && appendDateToVersion.production:
                return version + "." + dateAsSemver(now);
            default:
                return version;
        }
    }

    const finalMetadata = (() => {
        const unfinishedMetadata = x.metadata(overridden.buildConfig);
        return {
            ...unfinishedMetadata,
            name: finalName(unfinishedMetadata["name"] as string),
            version: finalVersion(unfinishedMetadata["version"] as string),
        };
    })();
    const finalManifest = x.manifest === undefined ? undefined : (() => {
        const unfinishedManifest = x.manifest(overridden.buildConfig);
        return {
            ...unfinishedManifest,
            name: finalName(unfinishedManifest.name),
            version: finalVersion(unfinishedManifest.version),
        };
    })();
    const finalMetadataStringified = Metadata.stringify(finalMetadata);
    return {
        mode: mode,
        entry: {
            userscript: resolveIn(sourceDir)(mainFile),
        },
        output: {
            path: resolveIn(rootDir)(outDir),
            filename: distFileName(id, "user"),
        },
        devtool: mode === Mode.production ? "hidden-source-map" : "inline-cheap-source-map",
        stats: {
            depth: false,
            hash: false,
            modules: false,
            entrypoints: false,
            colors: true,
            logging: verbose ? "verbose" : "info",
        },
        module: {
            rules: [
                {
                    test: filenameExtensionRegex(EXTENSIONS.SVG),
                    use: [
                        {
                            loader: require.resolve("raw-loader"),
                        },
                    ],
                },
                {
                    test: filenameExtensionRegex(EXTENSIONS.SASS),
                    use: [
                        // Loaders must be require.resolved here so that Webpack is guaranteed to find them.
                        {
                            loader: require.resolve("to-string-loader"),
                        },
                        {
                            loader: require.resolve("css-loader"),
                            options: {
                                url: true,
                                import: true,
                                sourceMap: false,
                                modules: {
                                    auto: undefined,
                                    mode: "local",
                                    exportOnlyLocals: false,
                                    exportGlobals: false,
                                    exportLocalsConvention: "asIs",
                                    localIdentName: "[local]",
                                    localIdentContext: undefined,
                                    // getLocalIdent: Documented default is undefined, but that doesn't work (in css-loader v3.6.0).
                                    localIdentRegExp: undefined, // Documented default is undefined, but actual default seems to be null based on source code, but null is not allowed (in css-loader v3.6.0).
                                },
                                importLoaders: 0,
                                esModule: false,
                            },
                        },
                        {
                            loader: require.resolve("sass-loader"),
                            options: {
                                sassOptions: {
                                    functions: {[withDartSassEncodedParameters(sassVariableGetter, getGlobal)]: getGlobal},
                                },
                            },
                        },
                    ],
                },
                {
                    test: filenameExtensionRegex(EXTENSIONS.TS),
                    include: resolveIn(rootDir)(sourceDir),
                    use: [
                        {
                            loader: require.resolve("ts-loader"),
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
            new UserscripterWebpackPlugin({
                buildConfigErrors: buildConfigErrors(overridden.buildConfig),
                envVarErrors: overridden.errors,
                envVars: envVars(x.env),
                metadataStringified: finalMetadataStringified,
                metadataValidationResult: Metadata.validateWith(x.metadataSchema)(finalMetadata),
                manifest: finalManifest,
                overriddenBuildConfig: overridden.buildConfig,
                verbose: verbose,
            }),
            // If we insert metadata with BannerPlugin, it is removed when building in production mode.
        ],
        optimization: {
            minimize: mode === Mode.production,
        },
    };
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
