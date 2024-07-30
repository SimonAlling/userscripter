import * as packageJson from "../package.json";
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

it("exposes everything in run-time/", () => {
  expect(packageJson.exports["./run-time/*"]).toEqual({ import: "./run-time/*.mjs", require: "./run-time/*.js" });
  expect(packageJson.typesVersions["*"]["run-time/*"]).toEqual([ "./run-time/*.d.ts" ]);
});
