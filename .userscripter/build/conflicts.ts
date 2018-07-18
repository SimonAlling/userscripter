const PREFIX_COMMENT = /\/{2}/.source;
const MARKER_START   = "<<<<<<<";
const MARKER_MIDDLE  = "=======";
const MARKER_END     = ">>>>>>>";
const ANY_TAG = /[^\n]+/.source;

/**
 * Creates a regex that matches a conflict with the specified tags.
 *
 * @param {string} firstTag What to match for the first tag (e.g "HEAD").
 * @param {string} secondTag What to match for the second tag (e.g "my-branch").
 * @param {string} flags Flags for the regular expression (e.g. "g").
 *
 * @return {RegExp} The constructed regex object.
 */
function regex(firstTag: string, secondTag: string, flags?: string): RegExp {
    return new RegExp(
          PREFIX_COMMENT+" "+MARKER_START+" "            // start marker
        + "(" + firstTag  + ")" + /\n/.source            // first tag
        + /([\w\W]*?)/.source                            // first content
        + PREFIX_COMMENT+" "+MARKER_MIDDLE + /\n/.source // middle marker
        + /([\w\W]*?)/.source                            // second content
        + PREFIX_COMMENT+" "+MARKER_END+" "              // end marker
        + "(" + secondTag + ")" + /\n/.source            // second tag
        , (flags || "")
    );
}

interface ConflictPart {
    tag: string
    content: string
}

interface Conflict {
    first: ConflictPart
    second: ConflictPart
}

/**
 * Finds all conflicts in a text where at least one of the options has a certain tag.
 *
 * @param {string} tagToKeep The tag to look for (e.g. "HEAD").
 * @param {string} text The text to search in.
 *
 * @return {RegExp} A list of objects, each with the properties {@code first} and {@code second}, both of which with the string properties {@code tag} and {@code content}.
 */
function conflicts(tagToKeep: string, text: string): Conflict[] {
    const REGEX_FIRST = regex(tagToKeep, ANY_TAG, "g");
    const REGEX_SECOND = regex(ANY_TAG, tagToKeep, "g");
    const match = text.match(new RegExp(REGEX_FIRST.source + "|" + REGEX_SECOND.source, "g"));
    return match === null ? [] : match.map(substring => ({
        first: {
            tag: substring.replace(REGEX_FIRST, "$1"),
            content: substring.replace(REGEX_FIRST, "$2"),
        },
        second: {
            tag: substring.replace(REGEX_SECOND, "$4"),
            content: substring.replace(REGEX_SECOND, "$3"),
        },
    }));
}

/**
 * Creates a function that resolves conflicts in a text.
 *
 * @param {string} tagToKeep The option to keep in conflicts (e.g. "HEAD").
 *
 * @return {Function} A function from string to string that returns its argument with matching conflicts solved (keeping the option specified by {@code tagToKeep}).
 */
export function conflictResolver(tagToKeep: string): (content: string) => string {
    return function(content: string): string {
        return conflicts(tagToKeep, content).reduce((text, conflict) => {
            if (conflict.first.tag === tagToKeep) {
                // The first conflict marker matches what we want to keep.
                return text.replace(regex(conflict.first.tag, ANY_TAG), conflict.first.content);
            }
            if (conflict.second.tag === tagToKeep) {
                // The second conflict marker matches.
                return text.replace(regex(ANY_TAG, conflict.second.tag), conflict.second.content);
            }
            // None of the conflict markers matched.
            return text;
        }, content);
    };
}
