import * as CONFIG from "./config-example";
import { getGlobalFrom } from "../src/build/internal/sass";
import sass from 'sass'

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
    'deep': {
      'nested': {
        CONFIG
      }
    }
  }
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
    .toThrowError(`Unknown global: 'CONFIG.NON_EXISTENT' (failed on 'NON_EXISTENT')`)
});