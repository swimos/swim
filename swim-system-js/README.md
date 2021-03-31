# Swim System TypeScript Implementation

[![package](https://img.shields.io/npm/v/@swim/system.svg)](https://www.npmjs.com/package/@swim/system)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](https://docs.swimos.org/js/latest)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

The **Swim System** TypeScript implementation provides a standalone set of
frameworks for building massively real-time streaming client applications.
**Swim System** incorporates the [**Swim Core**](swim-core-js) foundation
framework, and the [**Swim Mesh**](swim-mesh-js) multiplexed streaming
WARP client framework.

## Umbrella Framework

The **Swim System** umbrella framework has no external dependencies when run
in a web browser, and depends only on a WebSocket implementation when run in
Node.js.  **Swim System** provides the following top-level libraries:

- [**@swim/system**](@swim/system) –
  umbrella package that depends on, and re-exports, all **Swim System**
  child frameworks and libraries.

### [**Swim Core** Framework](swim-core-js)

The **Swim Core** framework provides a lightweight, portable, dependency-free,
and strongly typed baseline on which to build higher level libraries.
**Swim Core** consists of the following component libraries:

- [**@swim/core**](swim-core-js/@swim/core) –
  umbrella package that depends on, and re-exports, all **Swim Core** libraries.
- [**@swim/util**](swim-core-js/@swim/util) –
  ordering, equality, and hashing; type conversions; iterators; builders;
  maps; caches; and assertions.
- [**@swim/codec**](swim-core-js/@swim/codec) –
  incremental I/O; functional parsers and writers; display, debug, and
  diagnostic formatters; and Unicode and binary codecs.
- [**@swim/args**](swim-core-js/@swim/args) –
  composable command line argument parser.
- [**@swim/unit**](swim-core-js/@swim/unit) –
  specializable unit testing framework.
- [**@swim/mapping**](swim-core-js/@swim/mapping) –
  functional maps, interpolators, and scales.
- [**@swim/collections**](swim-core-js/@swim/collections) –
  immutable, structure sharing collections, including B-trees and S-trees
  (sequence trees).
- [**@swim/constraint**](swim-core-js/@swim/constraint) –
  incremental solver for systems of linear constraint equations.
- [**@swim/structure**](swim-core-js/@swim/structure) –
  generic structured data model, with support for selectors, expressions,
  and lambda functions.  Used as a common abstract syntax tree for Recon,
  JSON, XML, and other data languages.
- [**@swim/streamlet**](swim-core-js/@swim/streamlet) –
  stateful, streaming component model for application componets that
  continuously consume input state from streaming inlets, and continuously
  produce output state on streaming outlets.
- [**@swim/dataflow**](swim-core-js/@swim/dataflow) –
  compiler from **@swim/structure** expressions to live-updated data models.
- [**@swim/recon**](swim-core-js/@swim/recon) –
  object notation with attributes, like if JSON and XML had a baby.
- [**@swim/uri**](swim-core-js/@swim/uri) –
  rich object model for working with Uniform Resource Identifiers and URI
  subcomponents, including an efficient and safe codec for parsing and
  writing compliant URI strings.
- [**@swim/math**](swim-core-js/@swim/math) –
  mathematical and geometric structures and operators.
- [**@swim/geo**](swim-core-js/@swim/geo) –
  geospatial coordinate, projection, and geometry types.
- [**@swim/time**](swim-core-js/@swim/time) –
  date-time, time zone, and time interval data types,
  with `strptime`/`strftime`-style parsers and formatters.

### [**Swim Mesh** Framework](swim-mesh-js)

The **Swim Mesh** framework implements a multiplexed streaming WARP client that
runs in both Node.js and web browsers.  **Swim Mesh** consists of the following
component libraries:

- [**@swim/mesh**](swim-mesh-js/@swim/mesh) –
  umbrella package that depends on, and re-exports, all **Swim Mesh** libraries.
- [**@swim/warp**](swim-mesh-js/@swim/warp) –
  WebSocket protocol for dynamically multiplexing large numbers of
  bidirectional links to streaming API endpoints, called lanes, of
  URI-addressed distributed objects, called nodes, that run stateful
  distributed processes, called Web Agents.
- [**@swim/client**](swim-mesh-js/@swim/client) –
  streaming API client for linking to lanes of stateful Web Agents using the
  WARP protocol, enabling massively real-time applications that continuously
  synchronize all shared states with ping latency.
- [**@swim/cli**](swim-mesh-js/@swim/cli) –
  command line client for linking to Web Agent lanes over the WARP protocol.

## Installation

### npm

For an npm-managed project, `npm install @swim/system` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/system/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/system/lib/main`.  And a pre-built UMD script, which
bundles all **@swim/system** child frameworks, can be found in
`node_modules/@swim/system/dist/main/swim-system.js`.

### Browser

Browser applications can load `swim-system.js` directly from the SwimOS CDN.
The `swim-system.js` bundle is self-contained; it supersedes `swim-core.js`,
and `swim-mesh.js`—those scripts need not be loaded when using `swim-system.js`.

```html
<!-- Development -->
<script src="https://cdn.swimos.org/js/latest/swim-system.js"></script>

<!-- Production -->
<script src="https://cdn.swimos.org/js/latest/swim-system.min.js"></script>
```

## Usage

### ES6/TypeScript

**@swim/system** can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.  All child frameworks are re-exported by
the umbrella `@swim/system` module.

```typescript
import * as swim from "@swim/system";
```

### CommonJS/Node.js

**@swim/system** can also be used as a CommonJS module in Node.js applications.
All child frameworks are re-exported by the umbrella `@swim/system` module.

```javascript
var swim = require("@swim/system");
```

### Browser

When loaded by a web browser, the `swim-system.js` script adds all child
framework exports to the global `swim` namespace.

## Development

### Setup

Install build dependencies:

```sh
swim-system-js $ npm install
```

### Compiling sources

Use the `compile` build script command to compile, bundle, and minify
TypeScript sources into JavaScript universal module definitions, output
to the `dist` subdirectory of each project.  To compile all targets,
of all projects, run:

```sh
swim-system-js $ bin/build.js compile
```

To compile a subset of projects and targets, include a `--projects` (`-p`)
option, with a comma-separated list of `$project:($target)?` specifiers.
For example, to build the `main` target of the `core` project, and all
targets of the `core` project, run:

```sh
swim-system-js $ bin/build.js compile -p core:main,core
```

### Running tests

Use the `test` build script command to compile and run unit tests.
For example, to compile and test the `core` project, run:

```sh
swim-system-js $ bin/build.js test -p core
```

### Continuous development builds

Use the `watch` build script command to automatically rebuild projects when
dependent source files change.  For example, to continuously recompile the
`main` target of the `mesh` project when any source file in the project–or in
one of the project's transitive local dependencies–changes, run:

```sh
swim-system-js $ bin/build.js watch -p mesh:main
```

Pass the `--devel` (`-d`) option to expedite recompilation by skipping the
minification step.  Add the `--test` (`-t`) option to automatically run unit
tests after each successful compilation.  For example, to continuosly compile
and test the `mesh` project, bypassing minification, and skipping generation of
the main script, run:

```sh
swim-system-js $ bin/build.js watch -p mesh:test -d -t
```

### Building documentation

```sh
swim-system-js $ bin/build.js doc -p system
```
