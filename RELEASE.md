# Release workflow

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

     > [!WARNING]
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
