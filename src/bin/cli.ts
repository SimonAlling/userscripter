#!/usr/bin/env node

/* eslint-disable no-console */

import * as path from "path";

import * as fsx from "fs-extra";
import * as yargs from "yargs";

const BOOTSTRAP_ROOT = path.resolve(__dirname, "..", "bootstrap");

// eslint-disable-next-line no-unused-expressions
yargs
.help()
.strict()
.demandCommand()
.showHelpOnFail(true)
.command(
    "init",
    "Create a new userscript",
    {},
    init,
)
.argv;

function init(_: yargs.Arguments) {
    const rootDir = process.cwd();
    fsx.readdir(rootDir, (err, files) => {
        if (err !== null) {
            throw err;
        }
        if (relevant(files).length > 0) {
            console.error("Directory not empty. Stopping.");
            process.exit(1);
        }
        fsx.copy(BOOTSTRAP_ROOT, rootDir);
    });
}

function relevant(files: readonly string[]): readonly string[] {
    return files.filter(f => !f.startsWith("."));
}
