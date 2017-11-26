import Logger from "lib/logger";
import * as CONFIG from "globals-config";

const prefixedLogger = Logger(`[${CONFIG.USERSCRIPT_NAME}]`);
export const log = prefixedLogger.log;
export const logInfo = prefixedLogger.logInfo;
export const logWarning = prefixedLogger.logWarning;
export const logError = prefixedLogger.logError;
