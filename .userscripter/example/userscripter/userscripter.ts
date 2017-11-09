import { log, logInfo, logWarning, logError } from "./logging";
import { hasAlreadyRun } from "./misc";
import { startOperations, stopOperations } from "./operation-handling";

export default {
	hasAlreadyRun,

	log,
	logInfo,
	logWarning,
	logError,

	startOperations,
	stopOperations,
};
