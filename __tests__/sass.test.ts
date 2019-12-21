import * as CONFIG from "./config-example";
import { getGlobalFrom } from "../src/build/internal/sass";

it("can expose data to SASS", () => {
  const getGlobal = getGlobalFrom({ CONFIG });
  const height = getGlobal({ getValue: () => "CONFIG.EXAMPLE_HEIGHT" });
  const fontSize = getGlobal({ getValue: () => "CONFIG.EXAMPLE_FONT_SIZE" });
  expect(height).toMatchInlineSnapshot(`SassNumber {}`);
  expect(fontSize).toMatchInlineSnapshot(`SassNumber {}`);
});
