import { compose } from "@typed/compose";
import { environment, errors, log, userscripter } from "userscripter";

import * as CONFIG from "~src/config";
import OPERATIONS from "~src/operations";
import * as SITE from "~src/site";
import STYLESHEETS from "~src/stylesheets";
import U from "~src/userscript";

const describeFailure = errors.failureDescriber({
    siteName: SITE.NAME,
    extensionName: U.name,
    location: document.location,
});

userscripter.run({
    id: U.id,
    name: U.name,
    initialAction: () => log.log(`${U.name} ${U.version}`),
    stylesheets: STYLESHEETS,
    operationsPlan: {
        operations: OPERATIONS,
        interval: CONFIG.OPERATIONS_INTERVAL,
        tryUntil: environment.DOMCONTENTLOADED,
        extraTries: CONFIG.OPERATIONS_EXTRA_TRIES,
        handleFailures: failures => failures.forEach(compose(log.error, describeFailure)),
    },
});
