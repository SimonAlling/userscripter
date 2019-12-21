import { compose } from "@typed/compose";

import {
  ALWAYS,
  DOMCONTENTLOADED,
  LOAD,
} from "../src/lib/environment";
import { failureDescriber } from "../src/lib/errors";
import {
  Operation,
  OperationAndFailure,
  operation,
  runOperations,
} from "../src/lib/operations";

const consoleLog = jest.spyOn(console, "log");
const consoleError = jest.spyOn(console, "error");
beforeEach(() => {
  consoleLog.mockReset();
  consoleError.mockReset();
});

const CONTEXT = {
  siteName: "Example Site",
  extensionName: "Example Extension",
  location: document.location,
};

const PLAN = {
  interval: 100,
  tryUntil: DOMCONTENTLOADED,
  extraTries: 3,
  handleFailures,
};

function handleFailures(failures: ReadonlyArray<OperationAndFailure<any>>) {
  failures.forEach(compose(console.error, failureDescriber(CONTEXT)));
}

const HTML_EXAMPLE = `
<title>Original Title</title>
<h1>Original Heading</h1>
<footer>Original Footer</footer>
`;

const BLABLABLA = "blablabla";
const BLA = "bla";

const HTML_WITH_BLABLABLA = `
<title>Hello</title>
<body data-${BLABLABLA}="${BLA}"></body>
`;

const HTML_WITHOUT_BLABLABLA = `
<title>Hello</title>
<body></body>
`;

function removeFooter(e: { footer: HTMLElement }) {
  e.footer.remove();
}

function logBlablablaProperty(e: { body: HTMLElement }) {
  const value = e.body.dataset[BLABLABLA];
  if (value !== undefined) {
    console.log(value);
  } else {
    return `Property '${BLABLABLA}' not found.`;
  }
}

const OPERATIONS: ReadonlyArray<Operation<any>> = [
  operation({
    description: "do nothing",
    condition: ALWAYS,
    action: () => {},
  }),
  operation({
    description: "change title",
    condition: ALWAYS,
    dependencies: {},
    action: () => document.title = "Test",
  }),
  operation({
    description: "change heading",
    condition: ALWAYS,
    dependencies: { heading: "h1" },
    action: e => e.heading.textContent = "Test",
  }),
  operation({
    description: "remove footer",
    condition: ALWAYS,
    dependencies: { footer: "footer" },
    action: removeFooter,
  }),
];

const OPERATIONS_BLABLABLA = [
  operation({
    description: `log ${BLABLABLA}`,
    condition: ALWAYS,
    dependencies: { body: "body" },
    action: logBlablablaProperty,
  }),
];

it("can run operations", () => {
  document.documentElement.innerHTML = HTML_EXAMPLE;
  runOperations({
    ...PLAN,
    operations: OPERATIONS,
  });
  expect(document.title).toMatchInlineSnapshot(`"Test"`);
});

it("can log "+BLABLABLA, () => {
  document.documentElement.innerHTML = HTML_WITH_BLABLABLA;
  runOperations({
    ...PLAN,
    operations: OPERATIONS_BLABLABLA,
  });
  expect(consoleLog).toHaveBeenCalledWith(BLA);
  expect(consoleError).not.toHaveBeenCalled();
});

it("can handle an internal failure", () => {
  document.documentElement.innerHTML = HTML_WITHOUT_BLABLABLA;
  runOperations({
    ...PLAN,
    operations: OPERATIONS_BLABLABLA,
  });
  expect(consoleLog).not.toHaveBeenCalled();
  expect(consoleError).toHaveBeenCalled();
});
