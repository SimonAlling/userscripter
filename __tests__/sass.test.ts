import { getGlobalFrom } from "../src/build/internal/sass";

import * as CONFIG from "./config-example";

it("can expose data to SASS", () => {
  const getGlobal = getGlobalFrom({ CONFIG });
  const height = getGlobal({ getValue: () => "CONFIG.EXAMPLE_HEIGHT" });
  const fontSize = getGlobal({ getValue: () => "CONFIG.EXAMPLE_FONT_SIZE" });
  expect(height).toMatchInlineSnapshot(`SassNumber {}`);
  expect(fontSize).toMatchInlineSnapshot(`SassNumber {}`);
});
