import { operations } from "../src/lib";
import {
  ALWAYS,
  DOMCONTENTLOADED,
} from "../src/lib/environment";
import { failureDescriber } from "../src/lib/errors";
import {
  ActionResult,
  Operation,
  OperationAndFailure,
  operation,
} from "../src/lib/operations";
import { Err, Ok } from "../src/lib/results";

const mockConsole = {
  log: (message: string) => void message,
  error: (message: string) => void message,
};

const consoleLog = jest.spyOn(mockConsole, "log");
const consoleError = jest.spyOn(mockConsole, "error");
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
  failures.forEach(f => mockConsole.error(failureDescriber(CONTEXT)(f)));
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
  return Ok(null);
}

function logBlablablaProperty(e: { body: HTMLBodyElement }): ActionResult {
  const value = e.body.dataset[BLABLABLA];
  if (value !== undefined) {
    mockConsole.log(value);
    return Ok(null);
  } else {
    return Err(`Property '${BLABLABLA}' not found.`);
  }
}

const OPERATIONS: ReadonlyArray<Operation<any>> = [
  operation({
    description: "do nothing",
    condition: ALWAYS,
    action: () => Ok(null),
  }),
  operation({
    description: "change title",
    condition: ALWAYS,
    dependencies: {},
    action: () => {
      document.title = "Test";
      return Ok(null);
    },
  }),
  operation({
    description: "change heading",
    condition: ALWAYS,
    dependencies: { heading: { selector: "h1", elementType: HTMLHeadingElement } },
    action: e => {
      e.heading.textContent = "Test";
      return Ok(null);
    },
  }),
  operation({
    description: "remove footer",
    condition: ALWAYS,
    dependencies: { footer: { selector: "footer", elementType: HTMLElement } },
    action: removeFooter,
  }),
];

const OPERATIONS_BLABLABLA = [
  operation({
    description: `log ${BLABLABLA}`,
    condition: ALWAYS,
    dependencies: { body: { selector: "body", elementType: HTMLBodyElement } },
    action: logBlablablaProperty,
  }),
];

it("console TODO test", () => {
  mockConsole.log("HEJ");
  expect(consoleLog).toHaveBeenCalledWith("HEJ");
});

it("can run operations", () => {
  document.documentElement.innerHTML = HTML_EXAMPLE;
  operations.run({
    ...PLAN,
    operations: OPERATIONS,
  });
  expect(document.title).toMatchInlineSnapshot(`"Test"`);
});

it("can handle a missing dependency", async () => {
  document.documentElement.innerHTML = HTML_EXAMPLE;
  operations.run({
    interval: 0,
    tryUntil: ALWAYS,
    extraTries: 0,
    operations: [
      operation({
        description: `an operation that cannot find one of its dependencies`,
        condition: ALWAYS,
        dependencies: {
          body: { selector: "body", elementType: HTMLBodyElement },
          nonExistentElement: { selector: "somethingNonExistent", elementType: HTMLImageElement },
        },
        action: e => {
          void e.body;
          void e.nonExistentElement.src;
          return Ok(null);
        },
      }),
    ],
    handleFailures: failures => {
      console.warn("HANDLDINILDNL")
      throw failures.length;
    },
  });
  await Promise.resolve();
  expect(consoleLog).toHaveBeenCalled();
  expect(consoleError).toHaveBeenCalled();
  expect(consoleError).toHaveBeenCalledWith(`HALLOJ DU`);
});

it("can log " + BLABLABLA, () => {
  document.documentElement.innerHTML = HTML_WITH_BLABLABLA;
  operations.run({
    ...PLAN,
    operations: OPERATIONS_BLABLABLA,
  });
  expect(consoleLog).toHaveBeenCalledWith(BLA);
  expect(consoleError).not.toHaveBeenCalled();
});

it("can handle an internal failure", () => {
  document.documentElement.innerHTML = HTML_WITHOUT_BLABLABLA;
  operations.run({
    ...PLAN,
    operations: OPERATIONS_BLABLABLA,
  });
  expect(consoleLog).not.toHaveBeenCalled();
  expect(consoleError).toHaveBeenCalled();
});
