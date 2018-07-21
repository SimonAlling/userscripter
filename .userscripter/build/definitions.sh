#!/usr/bin/env bash

readonly ERROR_PREFIX=$'---- ERROR -----------------------------------------------------\n\n'
readonly INDENTATION="    "
readonly NODE="Node.js"
readonly NPM="npm"
readonly URL_NODE="https://nodejs.org"
readonly DIR_NODE_MODULES="node_modules"
readonly DIR_BUILD=".userscripter/build"
readonly DIR_SRC="src"
readonly MSG_TRY_THIS=$'You can try this to fix this problem:\n'
readonly CONFIRMATION_ANSWER="Please answer 'y' or 'n'."
readonly CMD_INSTALL="npm install"
readonly CMD_REBUILD="npm rebuild"
readonly CMD_DELETE_NODE_MODULES="rm -rf node_modules"
readonly FILE_TS_CONFIG_TS_NODE="$DIR_BUILD/tsconfig.webpack.json"
readonly CMD_TS_NODE="$DIR_NODE_MODULES/.bin/cross-env TS_NODE_PROJECT=\"$FILE_TS_CONFIG_TS_NODE\" $DIR_NODE_MODULES/.bin/ts-node"
