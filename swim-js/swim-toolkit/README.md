# <a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/breach-marlin-blue-wide.svg"></a> Swim TypeScript Toolkit

The Swim frontend toolkit provides application frameworks for building
real-time user interfaces.

- **Unified View Hierarchy:** First-class graphics views make canvases behave
  like the DOM, including full multitouch event synthesis.
- **Procedural Animation and Styling:** Built-in rendering engine can style
  and animate what CSS can't control.
- **Constraint-Based Layouts:** Integrated linear constraint solver can
  unfiromly layout HTML, SVG, and Canvas graphics views.
- **Streaming MVC:** Precisely observable models and components facilitate
  efficient rendering of views in response to continuous server updates.

In addition to the real-time UI engine, the toolkit also provides libraries
of UX components and data visualizations optimized for streaming applications.

## Documentation

- [API Docs][api-docs]

## Usage

#### npm

```sh
npm install @swim/toolkit
```

#### browser

```html
<!-- Development -->
<script src="https://cdn.swimos.org/js/4.x/swim-runtime.js"></script>
<script src="https://cdn.swimos.org/js/4.x/swim-toolkit.js"></script>

<!-- Production -->
<script src="https://cdn.swimos.org/js/4.x/swim-runtime.min.js"></script>
<script src="https://cdn.swimos.org/js/4.x/swim-toolkit.min.js"></script>
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
by a comma-separated list of package names. For example, to build the `ui`
package, run:

```sh
npx swim-build -p ui
```

#### Running tests

The `test` subcommand reruns unit tests. For example, to compile and test
the `ui` package and its dependencies, run:

```sh
npx swim-build test -p ui -r
```

#### Continuous development builds

The `watch` subcommand automatically rebuilds packages when dependent files
change. For example, to continuously build the `ux` package, run:

```sh
npx swim-build watch -p ux
```

#### Generating documentation

The `doc` subcommand generates API documentation:

```sh
npx swim-build doc -p toolkit
```

## Contributing

Take a look at the [Contributing Guide][contributing] to learn about our
submission process, coding standards, and more.

[api-docs]: https://docs.swimos.org/js/4.x/modules/_swim_toolkit.html
[contributing]: CONTRIBUTING.md