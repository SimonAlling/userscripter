import * as Metadata from "userscript-metadata";
import Manifest from "webextension-manifest";
import * as webpack from "webpack";
import {RawSource} from "webpack-sources";

import {
    BuildConfig,
    distFileName,
    ENVIRONMENT_VARIABLES,
    EnvVarError,
    envVarName,
} from "./configuration";
import * as Msg from "./messages";
import {BuildConfigError} from "./validation";

const MANIFEST_FILE = "manifest.json";
const MANIFEST_INDENTATION = 2;

export class UserscripterWebpackPlugin implements webpack.WebpackPluginInstance {
    constructor(private readonly x: {
        buildConfigErrors: ReadonlyArray<BuildConfigError<any>>
        envVarErrors: readonly EnvVarError[]
        envVars: ReadonlyArray<readonly [string, string | undefined]>
        manifest: Manifest | undefined
        metadataStringified: string
        metadataValidationResult: Metadata.ValidationResult<Metadata.Metadata>
        overriddenBuildConfig: BuildConfig
        verbose: boolean
    }) {
    }

    public apply(compiler: webpack.Compiler) {
        const {
            buildConfigErrors,
            envVarErrors,
            envVars,
            metadataStringified,
            metadataValidationResult,
            manifest,
            overriddenBuildConfig,
            verbose,
        } = this.x;
        const metadataAssetName = distFileName(overriddenBuildConfig.id, "meta");
        const userscriptAssetName = distFileName(overriddenBuildConfig.id, "user");
        compiler.hooks.compilation.tap(
            UserscripterWebpackPlugin.name,
            (compilation) => {
                compilation.hooks.afterProcessAssets.tap(
                    UserscripterWebpackPlugin.name, (assets) => {
                        const logger = compilation.getLogger(UserscripterWebpackPlugin.name);

                        // Create metadata file:
                        compilation.emitAsset(metadataAssetName, new RawSource(metadataStringified));

                        // Prepend metadata to compiled userscript (must be done after minification so metadata isn't removed in production mode):
                        const compiledUserscript = assets[userscriptAssetName];
                        if (compiledUserscript !== undefined) { // `instanceof RawSource` and `instanceof Source` don't work.
                            compilation.updateAsset(userscriptAssetName, new RawSource(
                                metadataStringified + "\n" + compiledUserscript.source()));
                        } else {
                            compilation.errors.push(Error(Msg.compilationAssetNotFound(userscriptAssetName)));
                        }

                        // Create manifest file if requested:
                        if (manifest !== undefined) {
                            compilation.emitAsset(MANIFEST_FILE, new RawSource(
                                JSON.stringify(manifest, null, MANIFEST_INDENTATION),
                            ));
                        }

                        // Log metadata:
                        const metadataAsset = compilation.assets[metadataAssetName];
                        if (metadataAsset) {
                            logger.info(metadataAsset.source());
                        }
                    });
            },
        );
        compiler.hooks.afterEmit.tap(
            UserscripterWebpackPlugin.name,
            compilation => {
                const logger = compilation.getLogger(UserscripterWebpackPlugin.name);

                function logWithHeading(heading: string, subject: any) {
                    logger.log(" ");
                    logger.log(heading);
                    logger.log(subject);
                }

                compilation.errors.push(...envVarErrors.map(e => Error(Msg.envVarError(e))));
                compilation.errors.push(...buildConfigErrors.map(e => Error(Msg.buildConfigError(e))));
                if (Metadata.isLeft(metadataValidationResult)) {
                    compilation.errors.push(...metadataValidationResult.Left.map(e => Error(Msg.metadataError(e))));
                } else {
                    compilation.warnings.push(...metadataValidationResult.Right.warnings.map(warning => Error(Msg.metadataWarning(warning))));
                }
                if (verbose) {
                    const envVarLines = envVars.map(
                        ([name, value]) => "  " + name + ": " + (value === undefined ? "(not specified)" : value),
                    );
                    logWithHeading(
                        "Environment variables:",
                        envVarLines.join("\n"),
                    );
                    logWithHeading(
                        "Effective build config (after considering environment variables):",
                        overriddenBuildConfig,
                    );
                    logger.log(" "); // The empty string is not logged at all.
                } else {
                    const hasUserscripterErrors = (
                        [envVarErrors, buildConfigErrors].some(_ => _.length > 0)
                        || Metadata.isLeft(metadataValidationResult)
                    );
                    if (hasUserscripterErrors) {
                        const fullEnvVarName = envVarName(ENVIRONMENT_VARIABLES.VERBOSE.nameWithoutPrefix);
                        logger.info(`Hint: Use ${fullEnvVarName}=true to display more information.`);
                    }
                }
                if (!compilation.getStats().hasErrors()) {
                    const metadataAsset = compilation.assets[metadataAssetName];
                    if (!metadataAsset) {
                        compilation.warnings.push(Error(Msg.compilationAssetNotFound(metadataAssetName)));
                    }
                }
            },
        );
    }
}
