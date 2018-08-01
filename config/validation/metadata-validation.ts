import { DEFAULT_ITEMS, DEFAULT_WARNINGS } from "userscript-metadata";

export const ITEMS = {
    ...DEFAULT_ITEMS,
    version: DEFAULT_ITEMS.version.butRequired(),
    run_at: DEFAULT_ITEMS.run_at.butRequired(),
};

export const WARNINGS = DEFAULT_WARNINGS;

export const UNDERSCORES_AS_HYPHENS = true;
