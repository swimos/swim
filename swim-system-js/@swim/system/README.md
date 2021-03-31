# @swim/system

[![package](https://img.shields.io/npm/v/@swim/system.svg)](https://www.npmjs.com/package/@swim/system)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](https://docs.swimos.org/js/latest)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

The **@swim/system** umbrella framework provides a standalone set of frameworks
for building massively real-time streaming WARP client applications.
**@swim/system** incorporates the
[**@swim/core**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js)
foundation framework, and the
[**@swim/mesh**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-mesh-js)
multiplexed streaming WARP client framework.

## Umbrella Framework

The **Swim System** umbrella framework has no external dependencies when run
in a web browser, and depends only on a WebSocket implementation when run in
Node.js.  **Swim System** provides the following top-level libraries:

- [**@swim/system**](https://github.com/swimos/swim/tree/master/swim-system-js/@swim/system)
  ([npm](https://www.npmjs.com/package/@swim/system),
  [doc](https://docs.swimos.org/js/latest)) –
  umbrella package that depends on, and re-exports, all **Swim System**
  child frameworks and libraries.

### [**Swim Core Framework**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js)

The **Swim Core** framework provides a lightweight, portable, dependency-free,
and strongly typed baseline on which to build higher level libraries.
**Swim Core** consists of the following component libraries:

- [**@swim/core**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/core)
  ([npm](https://www.npmjs.com/package/@swim/core),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_core.html)) –
  lightweight, portable, dependency-free foundation framework.
- [**@swim/util**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/util)
  ([npm](https://www.npmjs.com/package/@swim/util),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_util.html)) –
  ordering, equality, and hashing; type conversions; iterators; builders;
  maps; caches; and assertions.
- [**@swim/codec**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/codec)
  ([npm](https://www.npmjs.com/package/@swim/codec),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_codec.html)) –
  incremental I/O; functional parsers and writers; display, debug, and
  diagnostic formatters; and Unicode and binary codecs.
- [**@swim/mapping**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/mapping)
  ([npm](https://www.npmjs.com/package/@swim/mapping),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_mapping.html)) –
  functional maps, interpolators, and scales.
- [**@swim/collections**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/collections)
  ([npm](https://www.npmjs.com/package/@swim/collections),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_collections.html)) –
  immutable, structure sharing collections, including B-trees and S-trees
  (sequence trees).
- [**@swim/constraint**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/constraint)
  ([npm](https://www.npmjs.com/package/@swim/constraint),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_constraint.html)) –
  incremental solver for systems of linear constraint equations.
- [**@swim/structure**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/structure)
  ([npm](https://www.npmjs.com/package/@swim/structure),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_structure.html)) –
  generic structured data model, with support for selectors, expressions,
  and lambda functions.  Used as a common abstract syntax tree for Recon,
  JSON, XML, and other data languages.
- [**@swim/streamlet**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/streamlet)
  ([npm](https://www.npmjs.com/package/@swim/streamlet),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_streamlet.html)) –
  stateful, streaming component model for application componets that
  continuously consume input state from streaming inlets, and continuously
  produce output state on streaming outlets.
- [**@swim/dataflow**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/dataflow)
  ([npm](https://www.npmjs.com/package/@swim/dataflow),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_dataflow.html)) –
  compiler from **@swim/structure** expressions to live-updated data models.
- [**@swim/recon**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/recon)
  ([npm](https://www.npmjs.com/package/@swim/recon),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_recon.html)) –
  object notation with attributes, like if JSON and XML had a baby.
- [**@swim/uri**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/uri)
  ([npm](https://www.npmjs.com/package/@swim/uri),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_uri.html)) –
  rich object model for working with Uniform Resource Identifiers and URI
  subcomponents, including an efficient and safe codec for parsing and
  writing compliant URI strings.
- [**@swim/math**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/math)
  ([npm](https://www.npmjs.com/package/@swim/math),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_math.html)) –
  mathematical and geometric structures and operators.
- [**@swim/geo**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/geo)
  ([npm](https://www.npmjs.com/package/@swim/geo),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_geo.html)) –
  geospatial coordinate, projection, and geometry types.
- [**@swim/time**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/time)
  ([npm](https://www.npmjs.com/package/@swim/time),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_time.html)) –
  date-time, time zone, and time interval data types,
  with `strptime`/`strftime`-style parsers and formatters.

### [**Swim Mesh Framework**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-mesh-js)

The **Swim Mesh** framework implements a multiplexed streaming WARP client that
runs in both Node.js and web browsers.  **Swim Mesh** consists of the following
component libraries:

- [**@swim/mesh**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-mesh-js/@swim/mesh)
  ([npm](https://www.npmjs.com/package/@swim/mesh),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_mesh.html)) –
  multiplexed streaming WARP framework that runs in Node.js and web browsers.
- [**@swim/warp**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-mesh-js/@swim/warp)
  ([npm](https://www.npmjs.com/package/@swim/warp),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_warp.html)) –
  WebSocket protocol for dynamically multiplexing large numbers of bidirectional
  links to streaming APIs, called lanes, of URI-addressed distributed objects,
  called nodes, that run stateful distributed processes, called Web Agents.
- [**@swim/client**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-mesh-js/@swim/client)
  ([npm](https://www.npmjs.com/package/@swim/client),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_client.html)) –
  streaming API client for linking to lanes of stateful Web Agents using the
  WARP protocol, enabling massively real-time applications that continuously
  synchronize all shared states with ping latency.

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
ES6-compatible environments.  All child framework libraries are re-exported
by the umbrella `@swim/system` module.

```typescript
import * as swim from "@swim/system";
```

### CommonJS/Node.js

**@swim/system** can also be used as a CommonJS module in Node.js applications.
All child framework libraries are re-exported by the umbrella `@swim/system`
module.

```javascript
var swim = require("@swim/system");
```

### Browser

When loaded by a web browser, the `swim-system.js` script adds all child
framework exports to the global `swim` namespace.
