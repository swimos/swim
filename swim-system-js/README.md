# Swim System Framework

[![package](https://img.shields.io/npm/v/@swim/system.svg)](https://www.npmjs.com/package/@swim/system)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](http://docs.swim.ai/js/latest)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://developer.swim.ai"><img src="https://cdn.swim.ai/images/marlin-blue.svg" align="left"></a>

The Swim System umbrella framework encompasses the [`@swim/core`](https://www.npmjs.com/package/@swim/core)
foundation framework, the [`@swim/mesh`](https://www.npmjs.com/package/@swim/mesh)
multiplexed streaming WARP framework, the [`@swim/ui`](https://www.npmjs.com/package/@swim/ui)
and [`@swim/ux`](https://www.npmjs.com/package/@swim/ux) real-time user
interface toolkits, and the [`@swim/web`](https://www.npmjs.com/package/@swim/web)
real-time web application framework.  Swim System enables massively real-time
streaming applications that work with any WARP fabric.

## Child Frameworks

The Swim system umbrella framework consists of the following child frameworks:

- [**`@swim/system`**](@swim/system) –
  umbrella framework that depends on, and re-exports, the Swim system child
  frameworks.
- [**`@swim/core`**](swim-core-js) –
  lightweight, portable, dependency-free foundation framework.
- [**`@swim/mesh`**](swim-mesh-js) –
  multiplexed streaming WARP framework that runs in both Node.js and web
  browsers.
- [**`@swim/ui`**](swim-ui-js) –
  massively real-time user interface toolkit, with a unified view hierarchy
  for HTML, SVG, and Canvas components, animated procedural styling, and
  constraint-based layouts.
- [**`@swim/ux`**](swim-ux-js) –
  seamlessly animated user interface widgets, including gauges, pie charts,
  line, area, and bubble charts, and geospatial map overlays.
- [**`@swim/web`**](swim-web-js) –
  thin web application framework built on the `@swim/ui` toolkit.

Swim System has no external dependencies when run in a web browser,
and depends only on a WebSocket implementation when run in Node.js.

## Installation

### npm

For an npm-managed project, `npm install @swim/system` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/system/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/system/lib/main`.  And a pre-built UMD script, which
bundles all `@swim/system` child frameworks, can be found in
`node_modules/@swim/system/dist/main/swim-system.js`.

### Browser

Web applications can load `swim-system.js` directly from the Swim CDN.
The `swim-system.js` bundle is self-contained; it supersedes `swim-core.js`,
`swim-mesh.js`, `swim-ui.js`, `swim-ux.js`, and `swim-web.js`—those scripts
need not be loaded when using `swim-system.js`.

```html
<script src="https://cdn.swim.ai/js/latest/swim-system.js"></script>
```

## Usage

### ES6/TypeScript

`@swim/system` can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.  All child frameworks are re-exported,
in their entirety, from the top-level `@swim/system` namespace.

```typescript
import * as swim from "@swim/system";
```

### CommonJS/Node.js

`@swim/system` can also be used as a CommonJS in Node.js applications.
All child frameworks are re-exported, in their entirety, from the
top-level `@swim/system` namespace.

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
targets of the `ui` project, run:

```sh
swim-system-js $ bin/build.js compile -p core:main,ui
```

### Running tests

Use the `test` build script command to compile and run unit tests.
For example, to compile and test the `ui` project, run:

```sh
swim-system-js $ bin/build.js test -p ui
```

### Continuous development builds

Use the `watch` build script command to automatically rebuild projects when
dependent source files change.  For example, to continuously recompile the
`main` target of the `ux` project when any source file in the project–or in
one of the project's transitive local dependencies–changes, run:

```sh
swim-system-js $ bin/build.js watch -p ux:main
```

Pass the `--devel` (`-d`) option to expedite recompilation by skipping the
minification step.  Add the `--test` (`-t`) option to automatically run unit
tests after each successful compilation.  For example, to continuosly compile
and test the `ui` project, bypassing minification, and skipping generation of
the main script, run:

```sh
swim-system-js $ bin/build.js watch -p ui:test -d -t
```

### Building documentation

```sh
swim-system-js $ bin/build.js doc -p system
```
