# Swim Mesh Framework

[![package](https://img.shields.io/npm/v/@swim/mesh.svg)](https://www.npmjs.com/package/@swim/mesh)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](http://docs.swim.ai/js/latest)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://developer.swim.ai"><img src="https://cdn.swim.ai/images/marlin-blue.svg" align="left"></a>

The Swim mesh framework implements a multiplexed streaming WARP client that
runs in both Node.js and web browsers.  Swim Mesh can be used in concert with
the [`@swim/ui`](https://www.npmjs.com/package/@swim/ui) and
[`@swim/ux`](https://www.npmjs.com/package/@swim/ux) user interface toolkits to
build massively real-time streaming applications. Swim Mesh is included as part
of the [Swim System framework](https://www.npmjs.com/package/@swim/system).

## Libraries

The Swim mesh framework consists of the following component libraries:

- [**`@swim/mesh`**](@swim/mesh) –
  umbrella package that depends on, and re-exports, all Swim Mesh libraries.
- [**`@swim/warp`**](@swim/warp) –
  implementation of the WARP multiplexed streaming wire protocol.
- [**`@swim/client`**](@swim/client) –
  WARP multiplexed streaming API client.
- [**`@swim/cli`**](@swim/cli) –
  WARP command line client.

Swim Mesh builds on the [Swim Core framework](https://www.npmjs.com/package/@swim/core);
it has no additional dependencies when run in a web browser, and depends only
on a WebSocket implementation when run in Node.js.

## Installation

### npm

For an npm-managed project, `npm install @swim/mesh` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/mesh/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/mesh/lib/main`.  And a pre-built UMD script, which
bundles all `@swim/mesh` component libraries, can be found in
`node_modules/@swim/mesh/dist/main/swim-mesh.js`.

### Browser

Web applications can load `swim-mesh.js`, along with its `swim-core.js`
dependency, from the Swim CDN.

```html
<script src="https://cdn.swim.ai/js/latest/swim-core.js"></script>
<script src="https://cdn.swim.ai/js/latest/swim-mesh.js"></script>
```

## Usage

### ES6/TypeScript

`@swim/mesh` can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.  All component libraries are re-exported,
in their entirety, from the top-level `@swim/mesh` namespace.

```typescript
import * as swim from "@swim/mesh";
```

### CommonJS/Node.js

`@swim/mesh` can also be used as a CommonJS in Node.js applications.
All component libraries are re-exported, in their entirety, from the
top-level `@swim/mesh` namespace.

```javascript
var swim = require("@swim/mesh");
```

### Browser

When loaded by a web browser, the `swim-mesh.js` script adds all component
library exports to the global `swim` namespace.

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

Use the `bin/build.js` script to build the Swim mesh framework.
The build script supports `compile`, `test`, `doc`, and `watch` commands,
described below.  All build script commands take an optional `--projects`
(`-p`) option to restrict the build to a comma-separated list of projects.

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
