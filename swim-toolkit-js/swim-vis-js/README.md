# Swim Visualizations Framework

[![package](https://img.shields.io/npm/v/@swim/vis.svg)](https://www.npmjs.com/package/@swim/vis)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](https://docs.swimos.org/js/latest/modules/_swim_vis.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

The **Swim Visualizations** framework implements seamlessly animated diagram widgets,
including gauges, pie charts, and line, area, and bubble charts.  These fully
encapsulated widgets can be embedded into any web application framework, or
directly into any web page.  **Swim Visualizations** is a part of the broader
[**Swim Toolkit**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/@swim/toolkit) framework.

## Framework

The **Swim Visualizations** framework consists of the following component libraries:

- [**@swim/vis**](@swim/vis) –
  umbrella package that depends on, and re-exports, all **Swim Visualizations** libraries.
- [**@swim/gauge**](@swim/gauge) –
  multi-dial, fully animated, Canvas rendered gauge widget.
- [**@swim/pie**](@swim/pie) –
  multi-slice, fully animatable, canvas rendered pie chart widget.
- [**@swim/chart**](@swim/chart) –
  multi-plot, fully animatable, canvas rendered chart widget, suppporting line,
  area, and bubble graphs, with customizeable axes, and kinematic multitouch
  scale gestures for panning and zooming with momentum.

**Swim Visualizations** builds on the [**Swim Core**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js)
and [**Swim UI**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ui-js)
frameworks; it has no additional required dependencies.

## Installation

### npm

For an npm-managed project, `npm install @swim/vis` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/vis/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/vis/lib/main`.  And a pre-built UMD script, which
bundles all **@swim/vis** component libraries, can be found in
`node_modules/@swim/vis/dist/main/swim-vis.js`.

### Browser

Browser applications can load `swim-vis.js`, along with its `swim-core.js`
and `swim-ui.js` dependencies, from the SwimOS CDN.

```html
<!-- Development -->
<script src="https://cdn.swimos.org/js/latest/swim-core.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-ui.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-vis.js"></script>

<!-- Production -->
<script src="https://cdn.swimos.org/js/latest/swim-core.min.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-ui.min.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-vis.min.js"></script>
```

Alternatively, the `swim-toolkit.js` script may be loaded, along with its
`swim-system.js` dependency, from the SwimOS CDN.  The `swim-toolkit.js`
script bundles **@swim/vis** together with all other
[**@swim/toolkit**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/@swim/toolkit)
frameworks.

```html
<!-- Development -->
<script src="https://cdn.swimos.org/js/latest/swim-system.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-toolkit.js"></script>

<!-- Production -->
<script src="https://cdn.swimos.org/js/latest/swim-system.min.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-toolkit.min.js"></script>
```

## Usage

### ES6/TypeScript

**@swim/vis** can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.  All component libraries are re-exported by
the umbrella `@swim/vis` module.

```typescript
import * as swim from "@swim/vis";
```

### CommonJS

**@swim/vis** can also be used with CommonJS-compatible module systems.
All component libraries are re-exported by the umbrella `@swim/vis` namespace.

```javascript
var swim = require("@swim/vis");
```

### Browser

When loaded by a web browser, the `swim-vis.js` script adds all component
library exports to the global `swim` namespace.  The `swim-vis.js` script
requires that `swim-core.js` and `swim-ui.js` have already been loaded.

The `swim-toolkit.js` script also adds all **@swim/vis** component library
exports to the global `swim` namespace, making it a drop-in replacement
for `swim-ui.js` and `swim-vis.js` when additional **@swim/toolkit**
frameworks are needed.

## Development

**Note:**
`swim-vis-js` can be built against the currently checked out `swim-core-js`
and `swim-ui-js` sources by compiling it from the parent `swim-toolkit-js` directory.

### Setup

Install build dependencies:

```sh
swim-vis-js $ npm install
```

### Build script

Use the `bin/build.js` script to build the **Swim Visualizations** framework.
The build script supports `compile`, `test`, `doc`, and `watch` commands,
described below. All build script commands take an optional `--projects` (`-p`)
option to restrict the build to a comma-separated list of projects.

Each project supports multiple output targets; typical targets for a project
include `main`, to build the main sources, and `test`, to build the test
sources.  A specific target can be built for a project by appending a colon
(`:`) and the target name to the project name.  For example, to build just the
`main` sources of the `util` project, pass `-p util:main` to the build script.

Most build commands take a `--devel` (`-d`) option to expedite development
builds by skipping the minification step.

Run `bin/build.js help` to see a complete list of build commands.  Run
`bin/build.js <command> --help` to see a list of options supported by a
particular build command.

### Compiling sources

Use the `compile` build script command to compile, bundle, and minify
TypeScript sources into JavaScript universal module definitions, output
to the `dist` subdirectory of each project.  To compile all targets,
of all projects, run:

```sh
swim-vis-js $ bin/build.js compile
```

To compile a subset of projects and targets, include a `--projects` (`-p`)
option, with a comma-separated list of `$project:($target)?` specifiers.
For example, to build the `main` target of the `pie` project, and all
targets of the `vis` project, run:

```sh
swim-vis-js $ bin/build.js compile -p pie:main,vis
```

### Running tests

Use the `test` build script command to compile and run unit tests.
For example, to compile and test the `chart` project, run:

```sh
swim-vis-js $ bin/build.js test -p chart
```

### Continuous development builds

Use the `watch` build script command to automatically rebuild projects when
dependent source files change.  For example, to continuously recompile the
`main` target of the `gauge` project when any source file in the project–or
in one of the project's transitive local dependencies–changes, run:

```sh
swim-vis-js $ bin/build.js watch -p gauge:main
```

Pass the `--devel` (`-d`) option to expedite recompilation by skipping the
minification step.  Add the `--test` (`-t`) option to automatically run unit
tests after each successful compilation.  For example, to continuosly compile
and test the `chart` project, bypassing minification, and skipping generation
of the main script, run:

```sh
swim-vis-js $ bin/build.js watch -p chart:test -d -t
```
