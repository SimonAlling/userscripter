import * as fs from "fs";
import * as path from "path";

import * as index from "../src/run-time";
import * as environment from "../src/run-time/environment";
import * as errors from "../src/run-time/errors";
import * as operations from "../src/run-time/operations";
import * as stylesheets from "../src/run-time/stylesheets";

it("exposes the intended API", () => {
  const a: environment.Condition = environment.ALWAYS;
  void a;
  expect(environment.DOMCONTENTLOADED).toBeDefined();
  expect(environment.LOAD).toBeDefined();

  expect(errors.explanation).toBeDefined();
  expect(errors.failureDescriber).toBeDefined();

  expect(operations.Reason.DEPENDENCIES).toBeDefined();
  expect(operations.Reason.INTERNAL).toBeDefined();
  expect(operations.operation).toBeDefined();
  expect(operations.run).toBeDefined();

  expect(stylesheets).toBeDefined();
  expect(stylesheets.insert).toBeDefined();
  expect(stylesheets.enable).toBeDefined();
  expect(stylesheets.disable).toBeDefined();
});

it("exposes everything in run-time in index.ts", async () => {
  const filenames = await fs.promises.readdir(path.resolve(__dirname, "..", "src", "run-time"));
  expect(filenames).toEqual([
    "environment.ts",
    "errors.ts",
    "index.ts",
    "log.ts",
    "operations.ts",
    "preferences.ts",
    "stylesheets.ts",
    "userscripter.ts",
  ]);
  const modulesThatAreExported = Object.keys(index);
  const modulesThatShouldBeExported = filenames.map(n => n.replace(/\.ts$/, "")).filter(n => n !== "index");
  expect(modulesThatAreExported).toEqual(modulesThatShouldBeExported);
});
