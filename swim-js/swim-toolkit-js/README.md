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
For example, to build the `main` target of the `ui` project. run:

```sh
bin/build.js compile -p ui:main
```

#### Running tests

Use the `test` build command to compile and run unit tests.
For example, to compile and test just the `ui` project, run:

```sh
bin/build.js test -p ui
```

#### Continuous development builds

Use the `watch` build command to automatically rebuild projects when
dependent source files change.  For example, to continuously watch and
recompile the `main` target of the `ux` project, run:

```sh
bin/build.js watch -p ux:main
```

Pass the `--devel` (`-d`) option to expedite recompilation by skipping the
minification step.  Add the `--test` (`-t`) option to automatically run unit
tests after each successful compilation.  For example, to continuosly compile
and test the `theme` project, bypassing minification, and skipping
generation of the main script, run:

```sh
bin/build.js watch -p theme:test -d -t
```

#### Generating documentation

Use the `doc` build command to generate API docs:

```sh
bin/build.js doc -p toolkit
```

## Contributing

Take a look at the [Contributing Guide][contributing] to learn about our
submission process, coding standards, and more.

[api-docs]: https://docs.swimos.org/js/4.x/modules/_swim_toolkit.html
[contributing]: CONTRIBUTING.md