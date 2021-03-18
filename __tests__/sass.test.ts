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
