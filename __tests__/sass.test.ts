import sass from "sass";

import { getGlobalFrom, withDartSassEncodedParameters } from "../src/build-time/internal/sass";
import { DEFAULT_BUILD_CONFIG } from "../src/build-time/internal/webpack";

import * as CONFIG from "./config-example";

const actualDefaultVariableGetter = DEFAULT_BUILD_CONFIG({ rootDir: "", id: "", now: new Date() }).sassVariableGetter;
const expectedDefaultVariableGetter = "getGlobal";

describe("SASS variable getter", () => {
  it("can be called using the expected default name", () => {
    const getGlobal = getGlobalFrom({ CONFIG });
    const scssTemplate = `div { min-height: #{${expectedDefaultVariableGetter}("CONFIG.EXAMPLE_HEIGHT")} }`;
    const encodedFunctionName = withDartSassEncodedParameters(actualDefaultVariableGetter, getGlobal);
    expect(encodedFunctionName).toBe(`${actualDefaultVariableGetter}($x0)`);
    const sassRenderConfig: sass.Options = {
      data: scssTemplate,
      outputStyle: "compressed",
      functions: {
        [encodedFunctionName]: getGlobal,
      },
    };
    const result = sass.renderSync(sassRenderConfig);
    expect(result.css.toString()).toBe(`div{min-height:200px}`);
  });

  it("can be called using the actual default name", () => {
    const getGlobal = getGlobalFrom({ CONFIG });
    const scssTemplate = `div { min-height: #{${actualDefaultVariableGetter}("CONFIG.EXAMPLE_HEIGHT")} }`;
    const encodedFunctionName = withDartSassEncodedParameters(actualDefaultVariableGetter, getGlobal);
    const sassRenderConfig: sass.Options = {
      data: scssTemplate,
      outputStyle: "compressed",
      functions: {
        [encodedFunctionName]: getGlobal,
      },
    };
    const result = sass.renderSync(sassRenderConfig);
    expect(result.css.toString()).toBe(`div{min-height:200px}`);
  });

  it("can be called using a custom name", () => {
    const getGlobal = getGlobalFrom({ CONFIG });
    const variableGetter = "getFoo";
    const scssTemplate = `div { min-height: #{${variableGetter}("CONFIG.EXAMPLE_HEIGHT")} }`;
    const encodedFunctionName = withDartSassEncodedParameters(variableGetter, getGlobal);
    const sassRenderConfig: sass.Options = {
      data: scssTemplate,
      outputStyle: "compressed",
      functions: {
        [encodedFunctionName]: getGlobal,
      },
    };
    const result = sass.renderSync(sassRenderConfig);
    expect(result.css.toString()).toBe(`div{min-height:200px}`);
  });

  it("throws an error if the variable doesn't exist", () => {
    const getGlobal = getGlobalFrom({ CONFIG });
    const variableGetter = expectedDefaultVariableGetter;
    const scssTemplate = `div { min-height: #{${variableGetter}("CONFIG.NON_EXISTENT")} }`;
    const sassRenderConfig: sass.Options = {
      data: scssTemplate,
      outputStyle: "compressed",
      functions: {
        [withDartSassEncodedParameters(variableGetter, getGlobal)]: getGlobal,
      },
    };
    expect(() => sass.renderSync(sassRenderConfig)).toThrowError(`Unknown global: 'CONFIG.NON_EXISTENT' (failed on 'NON_EXISTENT')`);
  });

  it("throws an error if passed a non-string argument", () => {
    const getGlobal = getGlobalFrom({ CONFIG });
    const variableGetter = expectedDefaultVariableGetter;
    const scssTemplate = `div { min-height: #{${variableGetter}(42)} }`;
    const sassRenderConfig: sass.Options = {
      data: scssTemplate,
      outputStyle: "compressed",
      functions: {
        [withDartSassEncodedParameters(variableGetter, getGlobal)]: getGlobal,
      },
    };
    expect(() => sass.renderSync(sassRenderConfig)).toThrowError(`Error: Expected a string as argument, but saw: 42`);
  });
});
