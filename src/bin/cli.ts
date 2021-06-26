#!/usr/bin/env node

// tslint:disable:no-console

import * as path from "path";

import * as fsx from "fs-extra";
import * as yargs from "yargs";

const BOOTSTRAP_ROOT = path.resolve(__dirname, "..", "bootstrap");

// tslint:disable-next-line:no-unused-expression
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
    fsx.readdir(rootDir, async (err, files) => {
        if (err !== null) {
            throw err;
        }
        if (relevant(files).length > 0) {
            console.error("Directory not empty. Stopping.");
            return;
        }
        await fsx.copy(BOOTSTRAP_ROOT, rootDir);
        await fsx.rename(
            // When installing a package from a tarball (e.g. from the npm registry), npm renames any .gitignore to .npmignore (or skips it altogether if there is already an .npmignore).
            // 👉 https://github.com/SimonAlling/userscripter/issues/24
            path.resolve(rootDir, "gitignore"),
            path.resolve(rootDir, ".gitignore"),
        );
    });
}

function relevant(files: readonly string[]): readonly string[] {
    return files.filter(f => !f.startsWith("."));
}
