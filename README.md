# Userscripter

A template/framework for quickly creating complex [userscripts](https://wiki.greasespot.net/User_script). Features include:

* Global constants (userscript name, version etc)
* TypeScript support
* DOM operation management
* Stylesheet management


## Getting started

### Prerequisites

* **[Node.js](https://nodejs.org) with npm is required.**
* **If you are using Windows**, you may need to install and use [Git Bash](https://git-scm.com/downloads), [Linux Subsystem](https://msdn.microsoft.com/en-us/commandline/wsl/install-win10) or similar to be able to build.


### Download

Use `git clone` or download as ZIP.


### Install dependencies

In the root directory of this repo (i.e. `userscripter`), run

    npm install

and wait for it to finish.


### Initialize

To initialize an example userscript:

    ./init

This copies an example code base into the `src/` directory in this repo.


### Build

To build the userscript:

    ./build

To build with JavaScript optimization and minimization:

    ./build --production

The resulting userscript is saved as `id.user.js`, where `id` is the slug described under [_Configuration_](#configuration) below. If you have not changed anything, this file will be named `example-userscript.user.js`.


### Userscript installation

After building a userscript, you'll want to install it in the browser.

Userscripts are usually installed through a browser extension, for example [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) (Firefox) or [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) (Chrome). Please refer to the documentation for your browser/extension.

* [Greasemonkey Manual:Installing Scripts](https://wiki.greasespot.net/Greasemonkey_Manual:Installing_Scripts)
* [How to install new scripts to Tampermonkey](http://tampermonkey.net/faq.php#Q102)


### Verify your installation

Build the userscript (as described under [_Build_](#build) above), install it in your browser and go to [example.com](http://example.com). If you did not modify anything, you should see a green background and a heading telling you that the userscript is working.



## Code

Changes to any of the files described below are applied when building the userscript (`./build`).


### Configuration

Open `config.json` and edit its content to fit your needs:

* `id`: a slug for use in filenames, URLs etc
* `name`: your userscript's name
* `version`: userscript version as a string
* `description`: a description of your userscript
* `author`: your name
* `hostname`: the website on which the userscript should run
* `sitename`: the name of the website on which the userscript should run (if applicable)
* `namespace`: your own website
* `run-at`: [when the script should run](https://wiki.greasespot.net/Metadata_Block#.40run-at)

Only string values are allowed.

In the files described below, *all* occurrences of `%USERSCRIPT_CONFIG_*%`, where `*` is any of the properties described above (`id`, `name` etc), are automatically replaced by the build script. Example:

`config.json`:

    {
        "id": "example-userscript"
    }

JavaScript file:

    const ID     = "%USERSCRIPT_CONFIG_id%";
    const ID_BAD =  %USERSCRIPT_CONFIG_id%; // No quotation marks here.

Generated code:

    const ID     = "example-userscript"; // What we wanted.
    const ID_BAD =  example-userscript ; // ReferenceError or undesired behavior!



### Metadata

The userscript metadata sits in `config/metadata.txt`. Feel free to edit its contents at any time.

The `@match` and `@include` directives are a bit special since their functionalities extend beyond what `config.json` provides and since their syntax is not entirely obvious. More information can be found in [the Google Chrome developer documentation](https://developer.chrome.com/extensions/match_patterns). In most cases, setting `hostname` properly in `config.json` will do.


### Script

The actual userscript code resides in `.ts` files so that TypeScript can be used. Vanilla JavaScript works as well.

The following files in `src/` make up the core of the userscript:

* **`main.ts`**
Contains the following important functions:
    * **`beforeLoad()`**
    Code that can and should be run before the DOM is loaded, such as inserting CSS.
    * **`afterLoad()`**
    Code that requires that the DOM be accessible. Called when the `DOMContentLoaded` event is fired.

* **`userscript-css.ts`**
All CSS modules used by the userscript.

* **`userscript-operations.ts`**
All operations performed by the userscript.

* **`globals-site.ts`**
Constants that must be kept coherent with the host site, such as CSS selectors, regexes, pathnames, etc.

* **`globals-config.ts`**
Constants that can be freely configured by the userscript author, such as text content.

(The distinction between `globals-site.ts` and `globals-config.ts` is purely conventional.)



## Validation

The build script is intended to protect against typos and facilitate well-written userscripts. Therefore, it checks the config and metadata and refuses to build if something is wrong.


### Config

Some properties are required in the config file (`config/config.json`), and some are optional. The union of these sets is referred to as _recognized_ properties.

If one or more required properties are missing in the config file, the build script will refuse to build. Unrecognized properties will just yield a warning.

It is possible to tweak the required and optional properties by editing these files, respectively:

    .userscripter/validation/config-required.json
    .userscripter/validation/config-optional.json


### Metadata

The _generated_ metadata (after population of config constants) must match the userscript specification in terms of syntax.

Some properties are also required in the same sense as the required config properties above, i.e. if you know what you're doing, you can tweak them as you see fit by editing this file:

    .userscripter/validation/metadata-required.json
