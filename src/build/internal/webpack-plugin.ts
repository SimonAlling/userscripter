import { compose } from "@typed/compose";
import * as Metadata from "userscript-metadata";
import * as webpack from "webpack";
import { RawSource } from "webpack-sources";

import { BuildConfig, ENVIRONMENT_VARIABLES, EnvVarError, envVarName } from "./configuration";
import * as Msg from "./messages";
import { BuildConfigError } from "./validation";

export class UserscripterWebpackPlugin {
    constructor(private readonly x: {
        buildConfigErrors: ReadonlyArray<BuildConfigError<any>>
        envVarErrors: readonly EnvVarError[]
        envVars: ReadonlyArray<readonly [string, string | undefined]>
        metadataAssetName: string
        metadataValidationResult: Metadata.ValidationResult<Metadata.Metadata>
        overriddenBuildConfig: BuildConfig
        verbose: boolean
    }) {}

    public apply(compiler: webpack.Compiler) {
        const {
            buildConfigErrors,
            envVarErrors,
            envVars,
            metadataAssetName,
            metadataValidationResult,
            overriddenBuildConfig,
            verbose,
        } = this.x;
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
                        ([ name, value ]) => "  " + name + ": " + (value === undefined ? "(not specified)" : value)
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
