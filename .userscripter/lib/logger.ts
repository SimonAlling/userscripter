/**
 * Console logging tool.
 * @module logger
 */

const PREFIX_DEFAULT: string = "[Logger]";

export default function(prefix: string = PREFIX_DEFAULT) {
    return {
        log: function(str: string): void {
            console.log(prefix, str);
        },

        logInfo: function(str: string): void {
            console.info(prefix, str);
        },

        logWarning: function(str: string): void {
            console.warn(prefix, str);
        },

        logError: function(str: string): void {
            console.error(prefix, str);
        },
    };
}
