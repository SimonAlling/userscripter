import sass from "sass";

import { getGlobalFrom } from "../src/build/internal/sass";
import { defaultSassVariableGetter } from "../src/build/internal/webpack";

import * as CONFIG from "./config-example";

describe("sass in programmatic context", () => {
  it("can expose data to SASS", () => {
    const getGlobal = getGlobalFrom({ CONFIG });
    const height = getGlobal(new sass.types.String("CONFIG.EXAMPLE_HEIGHT"));
    const fontSize = getGlobal(new sass.types.String("CONFIG.EXAMPLE_FONT_SIZE"));
    expect(height).toMatchInlineSnapshot(`
  SassNumber {
    "dartValue": SingleUnitSassNumber0 {
      "_single_unit$_unit": "px",
      "asSlash": null,
      "value": 200,
    },
  }
  `);
    expect(fontSize).toMatchInlineSnapshot(`
  SassNumber {
    "dartValue": SingleUnitSassNumber0 {
      "_single_unit$_unit": "em",
      "asSlash": null,
      "value": 2,
    },
  }
  `);
  });

  it("can expose deep nested data to SASS", () => {
    const deepNestedConfig = {
      deep: {
        nested: {
          CONFIG
        }
      }
    };
    const getGlobal = getGlobalFrom(deepNestedConfig);
    const height = getGlobal(new sass.types.String("deep.nested.CONFIG.EXAMPLE_HEIGHT"));
    expect(height).toMatchInlineSnapshot(`
  SassNumber {
    "dartValue": SingleUnitSassNumber0 {
      "_single_unit$_unit": "px",
      "asSlash": null,
      "value": 200,
    },
  }
  `);
  });

  it("should throw an error when trying to get undefined variable", () => {
    const getGlobal = getGlobalFrom({ CONFIG });
    expect(() => getGlobal(new sass.types.String("CONFIG.NON_EXISTENT")))
      .toThrowError(`Unknown global: 'CONFIG.NON_EXISTENT' (failed on 'NON_EXISTENT')`);
  });
});

describe("sass in scss context", () => {
  it("can call getGlobal inside scss context with default sassVariableGetter", () => {
    const getGlobal = getGlobalFrom({ CONFIG });
    const scssTemplate = `div { min-height: #{getGlobal("CONFIG.EXAMPLE_HEIGHT")} }`;
    const sassRenderConfig: sass.Options = {
      data: scssTemplate,
      outputStyle: "compressed",
      functions: {
        [defaultSassVariableGetter]: getGlobal
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
        [defaultSassVariableGetter]: getGlobal
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
        [defaultSassVariableGetter]: getGlobal
      }
    };
    expect(() => sass.renderSync(sassRenderConfig)).toThrowError(`Error: Expected a string as argument, but saw: 42`);
  });
});