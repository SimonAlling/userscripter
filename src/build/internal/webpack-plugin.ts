import { compose } from "@typed/compose";
import * as Metadata from "userscript-metadata";
import * as webpack from "webpack";
import { RawSource } from "webpack-sources";

import { EnvVarError } from "./configuration";
import * as Msg from "./messages";
import { BuildConfigError } from "./validation";

export class UserscripterWebpackPlugin {
    constructor(private readonly x: {
        buildConfigErrors: ReadonlyArray<BuildConfigError<any>>
        envVarErrors: readonly EnvVarError[]
        metadataAssetName: string
        metadataValidationResult: Metadata.ValidationResult<Metadata.Metadata>
    }) {}

    public apply(compiler: webpack.Compiler) {
        const {
            buildConfigErrors,
            envVarErrors,
            metadataAssetName,
            metadataValidationResult,
        } = this.x;
        compiler.hooks.afterEmit.tap(
            UserscripterWebpackPlugin.name,
            compilation => {
                const logger = compilation.getLogger(UserscripterWebpackPlugin.name);
                compilation.errors.push(...envVarErrors.map(compose(Error, Msg.envVarError)));
                compilation.errors.push(...buildConfigErrors.map(compose(Error, Msg.buildConfigError)));
                if (Metadata.isLeft(metadataValidationResult)) {
                    compilation.errors.push(...metadataValidationResult.Left.map(compose(Error, Msg.metadataError)));
                } else {
                    compilation.warnings.push(...metadataValidationResult.Right.warnings.map(Msg.metadataWarning));
                }
                // Log metadata:
                const metadataAsset: unknown = compilation.assets[metadataAssetName];
                if (metadataAsset instanceof RawSource) {
                    logger.info(metadataAsset.source());
                } else {
                    compilation.warnings.push(Msg.compilationAssetNotFound(metadataAssetName));
                }
            },
        );
    }
}
