# <a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/breach-marlin-blue-wide.svg"></a> Swim TypeScript Runtime

The Swim frontend runtime provides foundation frameworks for building massively
real-time streaming applications. The runtime provides applications with:

- **Modern Foundation:** Dependency-free, 100% TypeScript foundation framework
  for Node.js and browser apps.
- **Shared States:** Multiplexed streaming API client for continuously
  synchronizing real-time shared states with backend Web Agents.

## Documentation

- [API Docs][api-docs]

## Usage

#### npm

```sh
npm install @swim/runtime
```

#### browser

```html
<!-- Development -->
<script src="https://cdn.swimos.org/js/4.x/swim-runtime.js"></script>

<!-- Production -->
<script src="https://cdn.swimos.org/js/4.x/swim-runtime.min.js"></script>
```

## Development

#### Build environment

Install build dependencies:

```sh
npm install
```

#### Build script

The Swim TypeScript stack is compiled using a custom build script.
Before building the stack, first bootstrap the build script.

```sh
npm run bootstrap
```

Use `npx swim-build` to execute build commands:

```sh
npx swim-build help # prints build script usage instructions
npx swim-build pkgs # lists buildable packages
```

#### Compiling sources

The default `swim-build` command will compile, lint, api-extract, and bundle
TypeScript sources. To compile all libraries, of all packages, run:

```sh
npx swim-build
```

To compile a subset of packages, include a `--pkgs` (`-p`) option followed
by a comma-separated list of package names. For example, to build the `core`
package, run:

```sh
npx swim-build -p core
```

#### Running tests

The `test` subcommand reruns unit tests. For example, to compile and test
the `core` package and its dependencies, run:

```sh
npx swim-build test -p core -r
```

#### Continuous development builds

The `watch` subcommand automatically rebuilds packages when dependent files
change. For example, to continuously build the `host` package, run:

```sh
npx swim-build watch -p host
```

#### Generating documentation

The `doc` subcommand generates API documentation:

```sh
npx swim-build doc -p runtime
```

## Contributing

Take a look at the [Contributing Guide][contributing] to learn about our
submission process, coding standards, and more.

[api-docs]: https://docs.swimos.org/js/4.x/modules/_swim_runtime.html
[contributing]: CONTRIBUTING.md
