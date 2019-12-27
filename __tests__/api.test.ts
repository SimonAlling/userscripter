import * as fs from "fs";
import * as path from "path";

import * as Environment from "../src/lib/environment";
import * as Errors from "../src/lib/errors";
import * as Operations from "../src/lib/operations";
import * as Stylesheets from "../src/lib/stylesheets";
import * as index from "../src/lib";

it("exposes the intended API", () => {
  const a: Environment.Condition = Environment.ALWAYS;
  void a;
  expect(Environment.DOMCONTENTLOADED).toBeDefined();
  expect(Environment.LOAD).toBeDefined();

  expect(Errors.explanation).toBeDefined();
  expect(Errors.failureDescriber).toBeDefined();

  expect(Operations.Reason.DEPENDENCIES).toBeDefined();
  expect(Operations.Reason.INTERNAL).toBeDefined();
  expect(Operations.operation).toBeDefined();
  expect(Operations.runOperations).toBeDefined();

  expect(Stylesheets).toBeDefined();
  expect(Stylesheets.insertStylesheets).toBeDefined();
  expect(Stylesheets.enableStylesheet).toBeDefined();
  expect(Stylesheets.disableStylesheet).toBeDefined();
});

it("exposes everything in lib in index.ts", done => {
  fs.readdir(path.resolve(__dirname, "..", "src", "lib"), (err, filenames) => {
    expect(err).toBeNull();
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
    done();
  });
});
