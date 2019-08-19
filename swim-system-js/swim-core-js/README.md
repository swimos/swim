# Swim Core TypeScript Framework

[![package](https://img.shields.io/npm/v/@swim/core.svg)](https://www.npmjs.com/package/@swim/core)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](https://docs.swimos.org/js/latest/modules/_swim_core.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

The **Swim Core** framework provides a lightweight, portable, dependency-free,
and strongly typed baseline on which to build higher level libraries.
**Swim Core** forms the foundation on which the
[**Swim Mesh**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-mesh-js)
multiplexed streaming WARP framework, and the
[**Swim UI**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js)
and [**Swim UX**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ux-js)
real-time user interface toolkits, are built.  **Swim Core** is part of the broader
[**Swim System**](https://github.com/swimos/swim/tree/master/swim-system-js) framework.

## Framework

The **Swim Core** framework consists of the following component libraries:

- [**@swim/core**](@swim/core) –
  umbrella package that depends on, and re-exports, all Swim Core libraries.
- [**@swim/util**](@swim/util) –
  ordering, equality, and hashing; type conversions; iterators; builders;
  maps; caches; and assertions.
- [**@swim/codec**](@swim/codec) –
  incremental I/O; functional parsers and writers; display, debug, and
  diagnostic formatters; and Unicode and binary codecs.
- [**@swim/args**](@swim/args) –
  composable command line argument parser.
- [**@swim/unit**](@swim/unit) –
  specializable unit testing framework.
- [**@swim/collections**](@swim/collections) –
  immutable, structure sharing collections, including B-trees and S-trees
  (sequence trees).
- [**@swim/structure**](@swim/structure) –
  generic structured data model, with support for selectors, expressions,
  and lambda functions.  Used as a common abstract syntax tree for Recon,
  JSON, XML, and other data languages.
- [**@swim/streamlet**](@swim/streamlet) –
  stateful, streaming component model for application componets that
  continuously consume input state from streaming inlets, and continuously
  produce output state on streaming outlets.
- [**@swim/dataflow**](@swim/dataflow) –
  compiler from **@swim/structure** expressions to live-updated data models.
- [**@swim/recon**](@swim/recon) –
  object notation with attributes, like if JSON and XML had a baby.
- [**@swim/math**](@swim/math) –
  mathematical and geometric structures and operators.
- [**@swim/time**](@swim/time) –
  date-time, time zone, and time interval data types,
  with `strptime`/`strftime`-style parsers and formatters.
- [**@swim/uri**](@swim/uri) –
  rich object model for working with Uniform Resource Identifiers and URI
  subcomponents, including an efficient and safe codec for parsing and
  writing compliant URI strings.

**Swim Core** has no external dependencies.

## Installation

### npm

For an npm-managed project, `npm install @swim/core` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/core/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/core/lib/main`.  And a pre-built UMD script, which
bundles all **@swim/core** component libraries, can be found in
`node_modules/@swim/core/dist/main/swim-core.js`.

### Browser

Browser applications can load `swim-core.js` directly from the swimOS CDN.

```html
<!-- Development -->
<script src="https://cdn.swimos.org/js/latest/swim-core.js"></script>

<!-- Production -->
<script src="https://cdn.swimos.org/js/latest/swim-core.min.js"></script>
```

Alternatively, the standalone `swim-system.js` script may be loaded
from the swimOS CDN, which bundles **@swim/core** together with all other
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

**@swim/core** can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.  All component libraries are re-exported by
the umbrella `@swim/core` module.

```typescript
import * as swim from "@swim/core";
```

### CommonJS/Node.js

**@swim/cor** can also be used as a CommonJS module in Node.js applications.
All component libraries are re-exported by the umbrella `@swim/core` module.

```javascript
var swim = require("@swim/core");
```

### Browser

When loaded by a web browser, the `swim-core.js` script adds all component
library exports to the global `swim` namespace.

The `swim-system.js` script also adds all **@swim/core** component library
exports to the global `swim` namespace, making it a drop-in replacement
for `swim-core.js` when additional **@swim/system** frameworks are needed.

## Development

### Setup

Install build dependencies:

```sh
swim-core-js $ npm install
```

### Build script

Use the `bin/build.js` script to build the Swim Core framework.  The build
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
swim-core-js $ bin/build.js compile
```

To compile a subset of projects and targets, include a `--projects` (`-p`)
option, with a comma-separated list of `$project:($target)?` specifiers.
For example, to build the `main` target of the `codec` project, and all
targets of the `recon` project, run:

```sh
swim-core-js $ bin/build.js compile -p codec:main,recon
```

### Running tests

Use the `test` build script command to compile and run unit tests.
For example, to compile and test the `uri` project, run:

```sh
swim-core-js $ bin/build.js test -p uri
```

### Continuous development builds

Use the `watch` build script command to automatically rebuild projects when
dependent source files change.  For example, to continuously recompile the
`main` target of the `recon` project when any source file in the project–or
in one of the project's transitive local dependencies–changes, run:

```sh
swim-core-js $ bin/build.js watch -p recon:main
```

Pass the `--devel` (`-d`) option to expedite recompilation by skipping the
minification step.  Add the `--test` (`-t`) option to automatically run unit
tests after each successful compilation.  For example, to continuosly compile
and test the `recon` project, bypassing minification, and skipping generation
of the main script, run:

```sh
swim-core-js $ bin/build.js watch -p recon:test -d -t
```
