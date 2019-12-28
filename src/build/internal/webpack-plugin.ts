import { compose } from "@typed/compose";
import * as Metadata from "userscript-metadata";
import * as webpack from "webpack";
import { RawSource } from "webpack-sources";

import { WebpackConfigParameters, distFileName, overrideBuildConfig } from "./configuration";
import * as Msg from "./messages";
import { buildConfigErrors } from "./validation";

export class UserscripterWebpackPlugin {
    constructor(private readonly w: WebpackConfigParameters) {}

    public apply(compiler: webpack.Compiler) {
        const w = this.w;
        compiler.hooks.afterCompile.tap(
            UserscripterWebpackPlugin.name,
            compilation => {
                const logger = compilation.getLogger(UserscripterWebpackPlugin.name);
                // Validate environment variables:
                const overridden = overrideBuildConfig(w.buildConfig, w.env);
                compilation.errors.push(...overridden.errors.map(compose(Error, Msg.envVarError)));
                // Validate build config:
                const configErrors = buildConfigErrors(overridden.buildConfig);
                compilation.errors.push(...configErrors.map(compose(Error, Msg.buildConfigError)));
                // Validate metadata:
                const metadataValidationResult = Metadata.validateWith(w.metadataSchema)(w.metadata(w.buildConfig));
                if (Metadata.isLeft(metadataValidationResult)) {
                    compilation.errors.push(...metadataValidationResult.Left.map(compose(Error, Msg.metadataError)));
                } else {
                    compilation.warnings.push(...metadataValidationResult.Right.warnings.map(Msg.metadataWarning));
                }
                // Log metadata:
                const metadataAsset = distFileName(w.buildConfig.id, "meta");
                logger.info((compilation.assets[metadataAsset] as RawSource).source());
            },
        );
    }
}
