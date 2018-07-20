import * as Utils from "./utils";
import * as IO from "./io";
import USERSCRIPT_CONFIG from "../../config/userscript";

Utils.writeFileContent(
    IO.outputFileName(USERSCRIPT_CONFIG.id),
    IO.USERSCRIPT_CONTENT_BUILD_FAILED,
);
