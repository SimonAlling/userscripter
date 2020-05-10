# Userscripter

Create [userscripts](https://wiki.greasespot.net/User_script) in a breeze!

* Safe, declarative DOM operations and stylesheets
* Straightforward preference management
* TypeScript constants in SASS code
* Build as native browser extension (optional)
* Metadata validation
* Static typing


## Getting started

### Prerequisites

* **[Node.js](https://nodejs.org) with npm is required.**
* **If you are using Windows**, you may need to install and use [Git Bash](https://git-scm.com/downloads), [Linux Subsystem](https://msdn.microsoft.com/en-us/commandline/wsl/install-win10) or similar to be able to build.

### Create a new userscript

You can use Userscripter to bootstrap a new userscript:

```bash
npm install --global userscripter
cd path/to/my-new-userscript
userscripter init
```

If everything went well, an `src` directory should have been created, along with some other files like `package.json` and `webpack.config.ts`.
You should now be able to build the userscript:

```bash
npm install
npm run build
```

The compiled userscript should be saved as `dist/bootstrapped-userscript.user.js`.

### Install the userscript

Userscripts are usually installed through a browser extension, for example **Violentmonkey** ([Firefox][violentmonkey-firefox], [Chrome][violentmonkey-chrome]).
Please refer to the documentation for your browser/extension:

* [_Install a local script - Violentmonkey_](https://violentmonkey.github.io/posts/how-to-edit-scripts-with-your-favorite-editor/#install-a-local-script)
* [_Greasemonkey Manual:Installing Scripts_](https://wiki.greasespot.net/Greasemonkey_Manual:Installing_Scripts)
* [_How to install new scripts to Tampermonkey_](http://tampermonkey.net/faq.php#Q102)

### Check that the userscript works

Go to [`http://example.com`](http://example.com).
If you haven't modified anything, you should see a green background.
You should also see the message `[Bootstrapped Userscript] Bootstrapped Userscript 0.1.0` in the developer console.


## How to write a userscript

A userscript typically consists primarily of **DOM operations** and **stylesheets**.
It can also have user-facing **preferences**. These repositories demonstrate how Userscripter is intended to be used:

  * [Example Userscript][example-userscript] is a basic userscript featuring [operations][example-userscript-operations], [stylesheets][example-userscript-stylesheets], [preferences][example-userscript-preferences] and a [preferences menu][example-userscript-preferences-menu].
  * [Better SweClockers][better-sweclockers] is a large, full-fledged, real-world userscript.


## Build options

The `buildConfig` property of the object passed to `createWebpackConfig` controls how the userscript is built (see e.g. [`webpack.config.ts` in the example repo][example-userscript-webpack-config]).

You can override certain options on the command line using environment variables:

```bash
USERSCRIPTER_MODE=production USERSCRIPTER_VERBOSE=true npm run build
```

(With `USERSCRIPTER_VERBOSE=true`, all available environment variables are listed.)

You can also customize the object returned from `createWebpackConfig` in `webpack.config.ts`:

```typescript
import { createWebpackConfig } from 'userscripter/build';

const webpackConfig = createWebpackConfig({
    // ...
});

export default {
    ...webpackConfig,
    resolve: {
        ...webpackConfig.resolve,
        alias: {
            ...webpackConfig.resolve?.alias,
            "react": "preact/compat", // Adding an alias here.
        },
    },
    // Other properties (e.g. 'stats') could be added/overridden here.
};
```

(Customizations in `webpack.config.ts` will take precedence over environment variables, because the latter only affect the return value of `createWebpackConfig`.)

## Native browser extension

You can easily create a [native browser extension][webextension] from your userscript by including an object representation of [`manifest.json`][manifest-json] in the object passed to `createWebpackConfig` ([example][example-userscript-webpack-config]).
If you do, `manifest.json` will be created alongside the compiled `.user.js` file.
You can then use [`web-ext`][web-ext] to build the native extension:

```bash
npm install -g web-ext
cd dist
web-ext build
```


[violentmonkey-firefox]: https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/
[violentmonkey-chrome]: https://chrome.google.com/webstore/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag
[better-sweclockers]: https://github.com/SimonAlling/better-sweclockers
[example-userscript]: https://github.com/SimonAlling/example-userscript
[example-userscript-operations]: https://github.com/SimonAlling/example-userscript/blob/master/src/operations.ts
[example-userscript-stylesheets]: https://github.com/SimonAlling/example-userscript/blob/master/src/stylesheets.ts
[example-userscript-preferences]: https://github.com/SimonAlling/example-userscript/blob/master/src/preferences.ts
[example-userscript-preferences-menu]: https://github.com/SimonAlling/example-userscript/blob/master/src/preferences-menu.tsx
[example-userscript-webpack-config]: https://github.com/SimonAlling/example-userscript/blob/master/webpack.config.ts
[webextension]: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions
[manifest-json]: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json
[web-ext]: https://www.npmjs.com/package/web-ext
