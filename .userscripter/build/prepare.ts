import * as FileSystem from "./file-system";
import { logError, logErrorLine } from "./logging";
import { DirectoryException, FileException } from "./file-system";
import * as IO from "./io";
import * as Messages from "./messages";

const DIRS = [
    IO.DIR_SOURCE,
    IO.DIR_CONFIG,
];

const FILES = [
    IO.FILE_METADATA,
    IO.FILE_CONFIG,
    IO.FILE_WEBPACK_CONFIG,
    IO.FILE_TS_CONFIG,
    IO.FILE_TS_CONFIG_TS_NODE,
    IO.FILE_GLOBALS_CONFIG,
    IO.FILE_GLOBALS_SITE,
];

try {
    DIRS.forEach(d => {
        if (!FileSystem.directoryExists(d)) {
            throw new DirectoryException(d);
        }
    });
    FILES.forEach(FileSystem.readFile);
} catch (err) {
    if (err instanceof DirectoryException) {
        logError(Messages.directoryNotFound(err.message));
        if (IO.format(err.message) === IO.format(IO.DIR_SOURCE)) {
            logErrorLine(Messages.tryInit);
        }
    }
    else if (err instanceof FileException) {
        logError(Messages.fileSystemError(err));
    }
    else if (err instanceof Error) {
        logError(err.message);
    }
    else {
        logError(err);
    }
    process.exit(1);
}
