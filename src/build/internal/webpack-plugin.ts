import { compose } from "@typed/compose";
import * as Metadata from "userscript-metadata";
import Manifest from "webextension-manifest";
import * as webpack from "webpack";
import { RawSource, Source } from "webpack-sources";

import {
    BuildConfig,
    ENVIRONMENT_VARIABLES,
    EnvVarError,
    distFileName,
    envVarName,
} from "./configuration";
import * as Msg from "./messages";
import { BuildConfigError } from "./validation";

const MANIFEST_FILE = "manifest.json";
const MANIFEST_INDENTATION = 2;

export class UserscripterWebpackPlugin {
    constructor(private readonly x: {
        buildConfigErrors: ReadonlyArray<BuildConfigError<any>>
        envVarErrors: readonly EnvVarError[]
        envVars: ReadonlyArray<readonly [string, string | undefined]>
        manifest?: Manifest
        metadataStringified: string
        metadataValidationResult: Metadata.ValidationResult<Metadata.Metadata>
        overriddenBuildConfig: BuildConfig
        verbose: boolean
    }) {}

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
        compiler.hooks.afterCompile.tap(
            UserscripterWebpackPlugin.name,
            compilation => {
                // Create metadata file:
                compilation.assets[metadataAssetName] = new RawSource(metadataStringified);
                // Prepend metadata to compiled userscript (must be done after minification so metadata isn't removed in production mode):
                const compiledUserscript = compilation.assets[userscriptAssetName] as Source | undefined;
                if (compiledUserscript !== undefined) { // `instanceof RawSource` and `instanceof Source` don't work.
                    compilation.assets[userscriptAssetName] = new RawSource(
                        metadataStringified + "\n" + compiledUserscript.source(),
                    );
                } else {
                    compilation.errors.push(Msg.compilationAssetNotFound(userscriptAssetName));
                }
                // Create manifest file if requested:
                if (manifest !== undefined) {
                    compilation.assets[MANIFEST_FILE] = new RawSource(
                        JSON.stringify(manifest, null, MANIFEST_INDENTATION),
                    );
                }
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
                compilation.errors.push(...envVarErrors.map(compose(Error, Msg.envVarError)));
                compilation.errors.push(...buildConfigErrors.map(compose(Error, Msg.buildConfigError)));
                if (Metadata.isLeft(metadataValidationResult)) {
                    compilation.errors.push(...metadataValidationResult.Left.map(compose(Error, Msg.metadataError)));
                } else {
                    compilation.warnings.push(...metadataValidationResult.Right.warnings.map(Msg.metadataWarning));
                }
                if (verbose) {
                    const envVarLines = envVars.map(
                        ([ name, value ]) => "  " + name + ": " + (value === undefined ? "(not specified)" : value),
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
                        [ envVarErrors, buildConfigErrors ].some(_ => _.length > 0)
                        || Metadata.isLeft(metadataValidationResult)
                    );
                    if (hasUserscripterErrors) {
                        const fullEnvVarName = envVarName(ENVIRONMENT_VARIABLES.VERBOSE.nameWithoutPrefix);
                        logger.info(`Hint: Use ${fullEnvVarName}=true to display more information.`);
                    }
                }
                // Log metadata:
                if (!compilation.getStats().hasErrors()) {
                    const metadataAsset: unknown = compilation.assets[metadataAssetName];
                    if (metadataAsset instanceof RawSource) {
                        logger.info(metadataAsset.source());
                    } else {
                        compilation.warnings.push(Msg.compilationAssetNotFound(metadataAssetName));
                    }
                }
            },
        );
    }
}
