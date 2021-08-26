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
Use the `bin/build.js` script to execute build commands:

```sh
bin/build.js help # prints build script usage instructions
bin/build.js projects # lists available project targets
```

#### Compiling sources

Use the `compile` build command to compile, bundle, and minify TypeScript
sources into JavaScript UMD files.

To compile all targets, of all projects, run:

```sh
bin/build.js compile
```

To compile a subset of projects and targets, include a `--projects` (`-p`)
option with a comma-separated list of `$project:($target)?` specifiers.
For example, to build the `main` target of the `core` project. run:

```sh
bin/build.js compile -p core:main
```

#### Running tests

Use the `test` build command to compile and run unit tests.
For example, to compile and test just the `core` project, run:

```sh
bin/build.js test -p core
```

#### Continuous development builds

Use the `watch` build command to automatically rebuild projects when
dependent source files change.  For example, to continuously watch and
recompile the `main` target of the `host` project, run:

```sh
bin/build.js watch -p host:main
```

Pass the `--devel` (`-d`) option to expedite recompilation by skipping the
minification step.  Add the `--test` (`-t`) option to automatically run unit
tests after each successful compilation.  For example, to continuosly compile
and test the `structure` project, bypassing minification, and skipping
generation of the main script, run:

```sh
bin/build.js watch -p structure:test -d -t
```

#### Generating documentation

Use the `doc` build command to generate API docs:

```sh
bin/build.js doc -p runtime
```

## Contributing

Take a look at the [Contributing Guide][contributing] to learn about our
submission process, coding standards, and more.

[api-docs]: https://docs.swimos.org/js/4.x/modules/_swim_runtime.html
[contributing]: CONTRIBUTING.md
