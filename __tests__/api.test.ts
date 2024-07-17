import * as packageJson from "../package.json";
import * as environment from "../src/lib/environment";
import * as errors from "../src/lib/errors";
import * as operations from "../src/lib/operations";
import * as stylesheets from "../src/lib/stylesheets";

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

it("exposes everything in lib", () => {
  expect(packageJson.exports["./lib/*"]).toEqual("./lib/*.js");
  expect(packageJson.typesVersions["*"]["lib/*"]).toEqual([ "./lib/*.d.ts" ]);
});
