import sass from "sass";

import { getGlobalFrom, withDartSassEncodedParameters } from "../src/build/internal/sass";
import { DEFAULT_BUILD_CONFIG } from "../src/build/internal/webpack";

import * as CONFIG from "./config-example";

const defaultSassVariableGetter = DEFAULT_BUILD_CONFIG({ rootDir: "", id: "", now: new Date() }).sassVariableGetter;

describe("sass global variables getter", () => {
  it("can call getGlobal inside scss context with default sassVariableGetter", () => {
    const getGlobal = getGlobalFrom({ CONFIG });
    const scssTemplate = `div { min-height: #{getGlobal("CONFIG.EXAMPLE_HEIGHT")} }`;
    const encodedFunctionName = withDartSassEncodedParameters(defaultSassVariableGetter, getGlobal);
    expect(encodedFunctionName).toBe(`${defaultSassVariableGetter}($x0)`);
    const sassRenderConfig: sass.Options = {
      data: scssTemplate,
      outputStyle: "compressed",
      functions: {
        [encodedFunctionName]: getGlobal
      }
    };
    const result = sass.renderSync(sassRenderConfig);
    expect(result.css.toString()).toBe(`div{min-height:200px}`);
  });

  it("can customize getGlobal to another function name", () => {
    const getGlobal = getGlobalFrom({ CONFIG });
    const customSassVariableGetter = "getFoo";
    const scssTemplate = `div { min-height: #{getFoo("CONFIG.EXAMPLE_HEIGHT")} }`;
    const encodedFunctionName = withDartSassEncodedParameters(customSassVariableGetter, getGlobal);
    expect(encodedFunctionName).toBe(`${customSassVariableGetter}($x0)`);
    const sassRenderConfig: sass.Options = {
      data: scssTemplate,
      outputStyle: "compressed",
      functions: {
        [encodedFunctionName]: getGlobal
      }
    };
    const result = sass.renderSync(sassRenderConfig);
    expect(result.css.toString()).toBe(`div{min-height:200px}`);
  });

  it("getGlobal should throw an error if the variable doesn't exist", () => {
    const getGlobal = getGlobalFrom({ CONFIG });
    const scssTemplate = `div { min-height: #{getGlobal("CONFIG.NON_EXISTENT")} }`;
    const sassRenderConfig: sass.Options = {
      data: scssTemplate,
      outputStyle: "compressed",
      functions: {
        [withDartSassEncodedParameters(defaultSassVariableGetter, getGlobal)]: getGlobal
      }
    };
    expect(() => sass.renderSync(sassRenderConfig)).toThrowError(`Unknown global: 'CONFIG.NON_EXISTENT' (failed on 'NON_EXISTENT')`);
  });

  it("sass should throw error if invalid argument type is passed to getGlobal", () => {
    const getGlobal = getGlobalFrom({ CONFIG });
    const scssTemplate = `div { min-height: #{getGlobal(42)} }`;
    const sassRenderConfig: sass.Options = {
      data: scssTemplate,
      outputStyle: "compressed",
      functions: {
        [withDartSassEncodedParameters(defaultSassVariableGetter, getGlobal)]: getGlobal
      }
    };
    expect(() => sass.renderSync(sassRenderConfig)).toThrowError(`Error: Expected a string as argument, but saw: 42`);
  });
});
