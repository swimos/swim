# [![Swim](https://docs.swimos.org/readme/breach-marlin-blue-wide.svg)](https://www.swimos.org) Swim Frontend Stack Contributing Guide

The Swim frontend stack comprises multiple layers of frameworks,
each implementing a different layer of the frontend stack.

### Development environment

To develop locally, clone this repository and install its build dependencies:

```sh
npm install
```

Next bootstrap the `swim-build` tool used to compile the 30+ libraries that
comprise the Swim frontend stack.

```sh
npm run bootstrap
```

Run the build tool with `npx swim-build`:

```sh
npx swim-build help # prints swim-build usage instructions
npx swim-build pkgs # lists buildable packages
```

### Compiling sources

The `swim-build` command compiles, lints, api-extracts, and bundles
TypeScript sources. To compile all packages, run:

```sh
npx swim-build
```

To compile a subset of packages, specify a `--pkgs` (`-p`) option followed
by a comma-separated list of package names. For example, to compile the `ui`
framework and its dependencies, run:

```sh
npx swim-build -p ui
```

### Running tests

Pass the `--test` (`-t`) option to `swim-build` to run unit tests after
compiling each package. For example, to compile and test the `core` package
and its dependencies, run:

```sh
npx swim-build -p ui -t
```

The `test` sub-command reruns unit tests without rebuilding the package.
For example, to test the `client` package, run:

```sh
npx swim-build test -p client
```

### Continuous development builds

The `watch` sub-command automatically rebuilds packages when dependent files
change. For example, to continuously build the `ux` package, run:

```sh
npx swim-build watch -p ux
```
