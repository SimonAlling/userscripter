import * as Environment from "../src/lib/environment";
import * as Errors from "../src/lib/errors";
import * as Operations from "../src/lib/operations";
import * as Stylesheets from "../src/lib/stylesheets";

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
