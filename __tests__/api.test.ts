import * as fs from "fs";
import * as path from "path";

import * as environment from "../src/lib/environment";
import * as errors from "../src/lib/errors";
import * as operations from "../src/lib/operations";
import * as stylesheets from "../src/lib/stylesheets";
import * as index from "../src/lib";

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
