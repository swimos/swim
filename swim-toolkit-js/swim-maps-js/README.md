# Swim Maps Framework

[![package](https://img.shields.io/npm/v/@swim/maps.svg)](https://www.npmjs.com/package/@swim/maps)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](https://docs.swimos.org/js/latest/modules/_swim_maps.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

The **Swim Maps** framework implements real-time geospatial map overlays,
with support for Mapbox, Google, and Esri maps.  These fully encapsulated
widgets can be embedded into any web application framework, or directly into
any web page.  **Swim Maps** is a part of the broader
[**Swim Toolkit**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/@swim/toolkit) framework.

## Framework

The **Swim Maps** framework consists of the following component libraries:

- [**@swim/maps**](@swim/maps) –
  umbrella package that depends on, and re-exports, all **Swim Maps** libraries.
- [**@swim/map**](@swim/map) –
  canvas views for efficiently rendering geospatially located map overlays,
  including fully animatable views for lines, circles, and polygons.
- [**@swim/mapbox**](@swim/mapbox) –
  support for overlaying **@swim/map** views on Mapbox maps.
- [**@swim/googlemap**](@swim/googlemap) –
  support for overlaying **@swim/map** views on Google maps.
- [**@swim/esrimap**](@swim/esrimap) –
  support for overlaying **@swim/map** views on ArcGIS maps.

**Swim Maps** builds on the [**Swim Core**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js)
and [**Swim UI**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ui-js)
frameworks; it has no additional required dependencies.

## Installation

### npm

For an npm-managed project, `npm install @swim/maps` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/maps/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/maps/lib/main`.  And a pre-built UMD script, which
bundles all **@swim/maps** component libraries, can be found in
`node_modules/@swim/maps/dist/main/swim-maps.js`.

### Browser

Browser applications can load `swim-maps.js`, along with its `swim-core.js`
and `swim-ui.js` dependencies, from the SwimOS CDN.

```html
<!-- Development -->
<script src="https://cdn.swimos.org/js/latest/swim-core.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-ui.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-maps.js"></script>

<!-- Production -->
<script src="https://cdn.swimos.org/js/latest/swim-core.min.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-ui.min.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-maps.min.js"></script>
```

Alternatively, the `swim-toolkit.js` script may be loaded, along with its
`swim-system.js` dependency, from the SwimOS CDN.  The `swim-toolkit.js`
script bundles **@swim/maps** together with all other
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

**@swim/maps** can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.  All component libraries are re-exported by
the umbrella `@swim/maps` module.

```typescript
import * as swim from "@swim/maps";
```

### CommonJS

**@swim/maps** can also be used with CommonJS-compatible module systems.
All component libraries are re-exported by the umbrella `@swim/maps` namespace.

```javascript
var swim = require("@swim/maps");
```

### Browser

When loaded by a web browser, the `swim-maps.js` script adds all component
library exports to the global `swim` namespace.  The `swim-maps.js` script
requires that `swim-core.js` and `swim-ui.js` have already been loaded.

The `swim-toolkit.js` script also adds all **@swim/maps** component library
exports to the global `swim` namespace, making it a drop-in replacement
for `swim-ui.js` and `swim-maps.js` when additional **@swim/toolkit**
frameworks are needed.

## Development

**Note:**
`swim-maps-js` can be built against the currently checked out `swim-core-js` and
`swim-ui-js` sources by compiling it from the parent `swim-toolkit-js` directory.

### Setup

Install build dependencies:

```sh
swim-maps-js $ npm install
```

### Build script

Use the `bin/build.js` script to build the **Swim Maps** framework.  The build
script supports `compile`, `test`, `doc`, and `watch` commands, described below.
All build script commands take an optional `--projects` (`-p`) option to
restrict the build to a comma-separated list of projects.

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
swim-maps-js $ bin/build.js compile
```

To compile a subset of projects and targets, include a `--projects` (`-p`)
option, with a comma-separated list of `$project:($target)?` specifiers.
For example, to build the `main` target of the `mapbox` project, and all
targets of the `maps` project, run:

```sh
swim-maps-js $ bin/build.js compile -p mapbox:main,maps
```

### Running tests

Use the `test` build script command to compile and run unit tests.
For example, to compile and test the `map` project, run:

```sh
swim-maps-js $ bin/build.js test -p map
```

### Continuous development builds

Use the `watch` build script command to automatically rebuild projects when
dependent source files change.  For example, to continuously recompile the
`main` target of the `mapbox` project when any source file in the project–or
in one of the project's transitive local dependencies–changes, run:

```sh
swim-maps-js $ bin/build.js watch -p mapbox:main
```

Pass the `--devel` (`-d`) option to expedite recompilation by skipping the
minification step.  Add the `--test` (`-t`) option to automatically run unit
tests after each successful compilation.  For example, to continuosly compile
and test the `map` project, bypassing minification, and skipping generation
of the main script, run:

```sh
swim-maps-js $ bin/build.js watch -p googlemap:test -d -t
```
