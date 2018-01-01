# Userscripter

A template/framework for quickly creating complex [userscripts](https://wiki.greasespot.net/User_script). Features include:

* Global constants (userscript name, version etc)
* Safe DOM operations
* TypeScript support
* Automatic Git repo setup


## Table of contents

  1. [Getting started](#getting-started)
     1. [Prerequisites](#prerequisites)
     1. [Download Userscripter](#download-userscripter)
     1. [Install dependencies](#install-dependencies)
     1. [Initialize](#initialize)
     1. [Build](#build)
     1. [Install the userscript](#install-the-userscript)
     1. [Verify your installation](#verify-your-installation)
  1. [Code](#code)
     1. [Configuration](#configuration)
     1. [Metadata](#metadata)
     1. [Script](#script)
  1. [How to create a userscript](#how-to-create-a-userscript)
     1. [Inserting CSS](#inserting-css)
     1. [Performing operations](#performing-operations)
     1. [Global constants](#global-constants)
     1. [Included libraries](#included-libraries)
  1. [Validation](#validation)
     1. [Configuration validation](#configuration-validation)
     1. [Metadata validation](#metadata-validation)



## Getting started

### Prerequisites

* **[Node.js](https://nodejs.org) with npm is required.**
* **If you are using Windows**, you need to install and use [Git Bash](https://git-scm.com/downloads), [Linux Subsystem](https://msdn.microsoft.com/en-us/commandline/wsl/install-win10) or similar to be able to build.


### Download Userscripter

    git clone https://github.com/SimonAlling/userscripter

or download as ZIP.


### Install dependencies

In the root directory of this repo (i.e. `userscripter`), run

    npm install

and wait for it to finish.


### Initialize

To initialize an example userscript:

    ./init example

This creates an example code base in the `src/` directory in this repo.


### Build

To build the userscript:

    ./build

The resulting userscript is saved as `id.user.js`, where `id` is the slug described under [_Configuration_](#configuration) below. If you have not changed anything, this file will be named `example-userscript.user.js`.


### Install the userscript

After building a userscript, you'll want to install it in your browser.

Userscripts are usually installed through a browser extension, for example **Greasemonkey** ([Firefox](greasemonkey-firefox)) or **Tampermonkey** ([Chrome](tampermonkey-chrome), [Firefox](tampermonkey-firefox)). Please refer to the documentation for your browser/extension.

* [Greasemonkey Manual:Installing Scripts](https://wiki.greasespot.net/Greasemonkey_Manual:Installing_Scripts)
* [How to install new scripts to Tampermonkey](http://tampermonkey.net/faq.php#Q102)


### Verify your installation

Build the userscript, install it in your browser and go to [example.com](http://example.com). If you did not modify anything, you should see a green background and a heading telling you that the userscript is working:

![Example.com with Example Userscript][example-userscript-working]



## Code

Changes to any of the files described below are applied when building the userscript (`./build`).


### Configuration

Open `config.json` and edit its content to fit your needs:

* `id` – a slug for use in filenames, URLs etc
* `name` – your userscript's name
* `version` – userscript version (without any prefix)
* `description` – a description of your userscript
* `author` – your name
* `hostname` – the hostname of the website on which the userscript should run
* `sitename` – the name of the host site (or e.g. `"the host site"`)
* `namespace` – your own website
* `run-at` – [when the script should run](https://wiki.greasespot.net/Metadata_Block#.40run-at)

In the source code, *all* occurrences of `%USERSCRIPT_CONFIG_*%`, where `*` is any of the properties described above (`id`, `name` etc), are automatically replaced by the build script. Example:

`config.json`:

```json
{
    "id": "example-userscript"
}
```

Source code:

```typescript
const ID     = "%USERSCRIPT_CONFIG_id%"; // Typical usage.
const ID_BAD =  %USERSCRIPT_CONFIG_id% ; // No quotation marks here.
```

Generated code:

```typescript
const ID     = "example-userscript"; // What we wanted.
const ID_BAD =  example-userscript ; // Error or undesired behavior!
```


### Metadata

The userscript metadata sits in `config/metadata.txt`. Feel free to edit its contents at any time.

The `@match`, `@include` and `@exclude` directives are a bit special since their functionality extends beyond what `config.json` provides and since their syntax is not entirely obvious. More information can be found in [the Google Chrome developer documentation](match-patterns). In most cases, setting `hostname` properly in `config.json` will do.


### Script

The actual userscript code resides in `.ts` files so that TypeScript can be used. Vanilla JavaScript works as well.

The following files in `src/` make up the core of the userscript:

* **`main.ts`** contains the following important functions:
    * **`beforeLoad()`**\
    Code that should be run before the DOM is loaded, such as inserting CSS.
    * **`afterLoad()`**\
    Code that requires that the DOM be accessible. Called when the `DOMContentLoaded` event is fired.

* **`userscript-css.ts`**\
All CSS modules used by the userscript.

* **`userscript-operations.ts`**\
All operations performed by the userscript.

* **`globals-site.ts`**\
Constants that must be kept coherent with the host site, such as CSS selectors, regexes, pathnames, etc.

* **`globals-config.ts`**\
Constants that can be freely configured by the userscript author, such as text content.

(The distinction between `globals-site.ts` and `globals-config.ts` is purely conventional.)



## How to create a userscript

These files and folders in `src/` are the most relevant ones for a userscript creator:

* `css/`
* `operations/`
* `globals-config.ts`
* `globals-site.ts`
* `userscript-css.ts`
* `userscript-operations.ts`

A userscript typically consists primarily of **CSS to be inserted** and **operations to be performed**.


### Inserting CSS

`userscript-css.ts` defines the CSS that should be inserted by the userscript. It contains a list where each item looks like this example snippet:

```typescript
{
    condition: ALWAYS,
    css: "body { color: red; }",
},
```

`condition` is a `boolean` which can be used to control when the particular CSS module should be inserted. `ALWAYS` means that the module is always inserted.

You can put CSS modules in the `css/` folder and import them into `userscript-css.ts`. [The example code base](#initialize) shows an example of this.


### Performing operations

Operations are basically everything that involves modifying the host page (except inserting CSS), e.g. changing the content of elements.

`userscript-operations.ts` defines the operations that the userscript should try to perform. It contains a list of items like this one:

```typescript
{
    description: "change heading content",
    condition: ALWAYS,
    selectors: [ "body h1", ".author" ],
    action: (heading, author) => {
        if (heading.textContent !== null) {
            heading.textContent = heading.textContent.toUpperCase() + " by " + author.textContent;
        }
    },
},
```

The structure of this snippet is as follows:

* `description` is just a description of what the operation is supposed to do. It makes it easier to detect if the operation fails, e.g. because the site has changed its content.
* `condition` is exactly like described under _Inserting CSS_ above.
* `selectors` is a list of CSS selectors identifying the elements used by the operation.
* `action` is what should be done. It is a function whose arguments should correspond to `selectors`. Userscripter handles the lookup of elements in the host page and calls this function as soon as they are available.

Here, `heading` is the first element matching `body h1`, and `author` is the first element matching `.author`. If the elements are not found at all, the operation fails and an error message is logged to the console.

Userscripter makes sure that the TypeScript typechecker understands that `heading` and `author` actually are non-`null` `Element`s. But it cannot know that the `textContent` property is not `null`, so it will not allow `toUpperCase()` on it. This is the reason behind the seemingly redundant `if (heading.textContent !== null) { ... }` check.

To announce the result of an operation from within the action, return `SUCCESS` or `FAILURE` (alias for `true` and `false`, respectively). Not returning anything (or explicitly returning `undefined`) is equivalent to returning `SUCCESS`.

Just like CSS modules, actions can be placed in their own files, typically in `operations/`, and imported from there (as demonstrated in [the example code](#initialize)).


### Global constants

Userscripter is designed to scale, and to help the userscript creator cope with the problem of host sites breaking userscripts every now and then by changing their content.

Therefore, it is generally recommended to use the files `globals-site.ts` and `globals-config.ts` for strings and other configuration data, instead of hardcoding them ad-hoc. The former approach makes for a much more maintainable userscript.

As described [above](#script), `globals-site.ts` is intended for data that must be kept coherent with the host site, such as CSS selectors and regexes, while configuration parameters chosen by the userscript creator should reside in `globals-config.ts`.

For example, instead of `[ "body h1", ".author" ]` above, one should typically write `[ SITE.SELECTOR_HEADING, SITE.SELECTOR_AUTHOR ]` and define those constants in `globals-site.ts` like so:

```typescript
export const SELECTOR_HEADING = "body h1";
export const SELECTOR_AUTHOR = ".author";
```


### Included libraries

Userscripter includes some useful libraries that you can import and use:

* [`ts-type-guards`](https://www.npmjs.com/package/ts-type-guards)
* [`lib/html`](.userscripter/lib/html.ts)
* [`lib/versioning`](.userscripter/lib/versioning.ts)
* [`lib/utilities`](.userscripter/lib/utilities.ts)
* [`userscripter/logging`](.userscripter/example/userscripter/logging.ts)

Example:

```typescript
import { isElement } from "lib/html";
import { isString } from "ts-type-guards";

// ...

if (isElement(elem) && isString(elem.textContent)) {
    // ...
}
```



## Validation

The build script is intended to protect against typos and facilitate well-written userscripts. Therefore, it checks the config and metadata and refuses to build if something is wrong.


### Configuration validation

Some properties are required in the config file (`config/config.json`), and some are optional. The union of these sets is referred to as _recognized_ properties.

If one or more required properties are missing in the config file, the build script will refuse to build. Unrecognized properties will just yield a warning.

It is possible to tweak the required and optional properties by editing these files, respectively:

    .userscripter/validation/config-required.json
    .userscripter/validation/config-optional.json


### Metadata validation

The _generated_ metadata (after population of config constants) must match the userscript specification in terms of syntax.

Some properties are also required in the same sense as the required config properties above, i.e. if you know what you're doing, you can tweak them as you see fit by editing this file:

    .userscripter/validation/metadata-required.json



[greasemonkey-firefox]: https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/
[tampermonkey-chrome]: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
[tampermonkey-firefox]: https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/
[example-userscript-working]: ./.userscripter/doc/images/example-userscript-working.png "Example.com with Example Userscript"
[match-patterns]: https://developer.chrome.com/extensions/match_patterns
