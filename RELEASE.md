# Release workflow

## Release a new version of the npm package

  1. Get up to date:

     ```bash
     cd $(git rev-parse --show-toplevel) && git checkout master && git pull && git clean -xdf && git restore .
     ```

  1. Pick a SemVer release level based on the changes since the last release (typically `major`, `minor` or `patch`):

     ```bash
     RELEASE_LEVEL=some_release_level
     ```

  1. Make, commit and push the source code changes:

     ```bash
     THE_VERSION=$(npm version --no-git-tag-version "${RELEASE_LEVEL:?}")
     git switch --create "${THE_VERSION:?}"
     git add package*.json
     git commit -m "chore: ${THE_VERSION:?}"
     git push -u origin "${THE_VERSION:?}"
     ```

  1. Create a PR based on the newly pushed branch.

     > ⚠️ **Warning** <!-- Change to [!WARNING] when possible (see #142). -->
     >
     > The PR description should include a brief summary of the user-facing changes included in the release.
     >
     > For major releases, a migration guide should also be included.

  1. Review and merge the PR.

  1. Get up to date:

     ```bash
     git checkout master && git pull
     ```

  1. Make sure you're on the newly created commit, whose subject should be something like `chore: v1.2.3 (#42)`. Otherwise, find it and move to it with `git checkout`.

  1. Tag the newly created commit and push the tag:

     ```bash
     git tag "${THE_VERSION:?}" && git push origin "refs/tags/${THE_VERSION:?}"
     ```

  1. Build from a clean slate and publish the package:

     ```bash
     git clean -xdf && npm publish # `npm publish` should automatically build first (see `prepublishOnly` script).
     ```

## Update the bootstrapped userscript

These steps aren't strictly necessary, but it typically makes sense for the bootstrapped userscript to use the latest version of the package.

> [!IMPORTANT]
> This can only be done if a new version of the package was successfully published in the previous section.

  1. Install the newly published version in the bootstrapped userscript:

     ```bash
     cd "$(git rev-parse --show-toplevel)/bootstrap"
     git clean -xdf .
     THE_BOOTSTRAP_BRANCH="bootstrap-${THE_VERSION:?}"
     git switch --create "${THE_BOOTSTRAP_BRANCH:?}"
     npm ci
     npm install -E "userscripter@${THE_VERSION:?}"
     git add package*.json
     npm run build
     ```

  1. Modify the bootstrapped userscript if necessary, then stage the changes:

     ```bash
     git add -p
     ```

  1. Commit and push:

     ```bash
     git commit -m "chore: Use ${THE_VERSION:?} in bootstrapped userscript"
     git push -u origin "${THE_BOOTSTRAP_BRANCH:?}"
     ```

  1. Create a PR based on the newly pushed branch.

  1. Review and merge the PR.
