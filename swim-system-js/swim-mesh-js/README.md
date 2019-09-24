# Swim Mesh TypeScript Framework

[![package](https://img.shields.io/npm/v/@swim/mesh.svg)](https://www.npmjs.com/package/@swim/mesh)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](https://docs.swimos.org/js/latest/modules/_swim_mesh.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

The **Swim Mesh** framework implements a multiplexed streaming WARP client that
runs in both Node.js and web browsers.  **Swim Mesh** can be used in concert
with the [**Swim UI**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js)
and [**Swim UX**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ux-js)
user interface toolkits to build massively real-time streaming applications.
**Swim Mesh** is part of the broader
[**Swim System**](https://github.com/swimos/swim/tree/master/swim-system-js/@swim/system) framework.

## Framework

The **Swim Mesh** framework consists of the following component libraries:

- [**@swim/mesh**](@swim/mesh) –
  umbrella package that depends on, and re-exports, all Swim Mesh libraries.
- [**@swim/warp**](@swim/warp) –
  WebSocket protocol for dynamically multiplexing large numbers of
  bidirectional links to streaming API endpoints, called lanes, of
  URI-addressed distributed objects, called nodes, that run stateful
  distributed processes, called Web Agents.
- [**@swim/client**](@swim/client) –
  streaming API client for linking to lanes of stateful Web Agents using the
  WARP protocol, enabling massively real-time applications that continuously
  synchronize all shared states with ping latency.
- [**@swim/cli**](@swim/cli) –
  command line client for linking to Web Agent lanes over the WARP protocol.

**Swim Mesh** builds on the [**Swim Core**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js)
framework; it has no additional dependencies when run in a web browser, and
depends only on a WebSocket implementation when run in Node.js.

## Installation

### npm

For an npm-managed project, `npm install @swim/mesh` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/mesh/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/mesh/lib/main`.  And a pre-built UMD script, which
bundles all **@swim/mesh** component libraries, can be found in
`node_modules/@swim/mesh/dist/main/swim-mesh.js`.

### Browser

Browser applications can load `swim-mesh.js`, along with its `swim-core.js`
dependency, from the swimOS CDN.

```html
<!-- Development -->
<script src="https://cdn.swimos.org/js/latest/swim-core.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-mesh.js"></script>

<!-- Production -->
<script src="https://cdn.swimos.org/js/latest/swim-core.min.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-mesh.min.js"></script>
```

Alternatively, the standalone `swim-system.js` script may be loaded
from the swimOS CDN, which bundles **@swim/mesh** together with all other
[**@swim/system**](https://github.com/swimos/swim/tree/master/swim-system-js/@swim/system)
frameworks.

```html
<!-- Development -->
<script src="https://cdn.swimos.org/js/latest/swim-system.js"></script>

<!-- Production -->
<script src="https://cdn.swimos.org/js/latest/swim-system.min.js"></script>
```

## Usage

### ES6/TypeScript

**@swim/mesh** can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.  All component libraries are re-exported by
the umbrella `@swim/mesh` module.

```typescript
import * as swim from "@swim/mesh";
```

### CommonJS/Node.js

**@swim/mesh** can also be used as a CommonJS module in Node.js applications.
All component libraries are re-exported by the umbrella `@swim/mesh` module.

```javascript
var swim = require("@swim/mesh");
```

### Browser

When loaded by a web browser, the `swim-mesh.js` script adds all component
library exports to the global `swim` namespace.  The `swim-mesh.js` script
requires that `swim-core.js` has already been loaded.

The `swim-system.js` script also adds all **@swim/mesh** component library
exports to the global `swim` namespace, making it a drop-in replacement
for `swim-mesh.js` when additional **@swim/system** frameworks are needed.

## Development

**Note:**
`swim-mesh-js` can be built against the currently checked out `swim-core-js`
sources by compiling it from the parent `swim-system-js` directory.

### Setup

Install build dependencies:

```sh
swim-mesh-js $ npm install
```

### Build script

Use the `bin/build.js` script to build the Swim Mesh framework.  The build
script supports `compile`, `test`, `doc`, and `watch` commands, described
below.  All build script commands take an optional `--projects` (`-p`) option
to restrict the build to a comma-separated list of projects.

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
swim-mesh-js $ bin/build.js compile
```

To compile a subset of projects and targets, include a `--projects` (`-p`)
option, with a comma-separated list of `$project:($target)?` specifiers.
For example, to build the `main` target of the `client` project, and all
targets of the `cli` project, run:

```sh
swim-mesh-js $ bin/build.js compile -p client:main,cli
```

### Running tests

Use the `test` build script command to compile and run unit tests.
For example, to compile and test the `warp` project, run:

```sh
swim-mesh-js $ bin/build.js test -p warp
```

### Continuous development builds

Use the `watch` build script command to automatically rebuild projects when
dependent source files change.  For example, to continuously recompile the
`main` target of the `cli` project when any source file in the project–or
in one of the project's transitive local dependencies–changes, run:

```sh
swim-mesh-js $ bin/build.js watch -p cli:main
```

Pass the `--devel` (`-d`) option to expedite recompilation by skipping the
minification step.  Add the `--test` (`-t`) option to automatically run unit
tests after each successful compilation.  For example, to continuosly compile
and test the `client` project, bypassing minification, and skipping generation
of the main script, run:

```sh
swim-mesh-js $ bin/build.js watch -p client:test -d -t
```
