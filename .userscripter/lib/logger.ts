/**
 * Console logging tool.
 * @module logger
 */

const PREFIX_DEFAULT: string = "[Logger]";

export default function(prefix: string = PREFIX_DEFAULT) {
    return {
        log(str: string): void {
            console.log(prefix, str);
        },

        logInfo(str: string): void {
            console.info(prefix, str);
        },

        logWarning(str: string): void {
            console.warn(prefix, str);
        },

        logError(str: string): void {
            console.error(prefix, str);
        },
    };
}
