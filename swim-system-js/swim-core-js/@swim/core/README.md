# @swim/core

[![package](https://img.shields.io/npm/v/@swim/core.svg)](https://www.npmjs.com/package/@swim/core)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](https://docs.swimos.org/js/latest/modules/_swim_core.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

The **@swim/core** framework provides a lightweight, portable, dependency-free,
and strongly typed baseline on which to build higher level libraries.
**@swim/core** forms the foundation on which the
[**@swim/mesh**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-mesh-js/@swim/mesh)
multiplexed streaming WARP framework, and the
[**@swim/ui**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/@swim/ui)
and [**@swim/ux**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ux-js/@swim/ux)
real-time user interface toolkits, are built.  **@swim/core** is a part of the broader
[**@swim/system**](https://github.com/swimos/swim/tree/master/swim-system-js/@swim/system) framework.

## Framework

The **@swim/core** umbrella package depends on, and re-exports, the following
component libraries:

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
- [**@swim/collections**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/collections)
  ([npm](https://www.npmjs.com/package/@swim/collections),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_collections.html)) –
  immutable, structure sharing collections, including B-trees and S-trees
  (sequence trees).
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
- [**@swim/math**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/math)
  ([npm](https://www.npmjs.com/package/@swim/math),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_math.html)) –
  mathematical and geometric structures and operators.
- [**@swim/time**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/time)
  ([npm](https://www.npmjs.com/package/@swim/time),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_time.html)) –
  date-time, time zone, and time interval data types,
  with `strptime`/`strftime`-style parsers and formatters.
- [**@swim/uri**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/uri)
  ([npm](https://www.npmjs.com/package/@swim/uri),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_uri.html)) –
  rich object model for working with Uniform Resource Identifiers and URI
  subcomponents, including an efficient and safe codec for parsing and
  writing compliant URI strings.

**@swim/core** has no external dependencies.

## Installation

### npm

For an npm-managed project, `npm install @swim/core` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/core/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/core/lib/main`.  And a pre-built UMD script, which
bundles all **@swim/core** component libraries, can be found in
`node_modules/@swim/core/dist/main/swim-core.js`.

### Browser

Browser applications can load `swim-core.js` directly from the Swim CDN.

```html
<script src="https://cdn.swimos.org/js/latest/swim-core.js"></script>
```

Alternatively, the standalone `swim-system.js` script may be loaded
from the Swim CDN, which bundles **@swim/core** together with all other
[**@swim/system**](https://github.com/swimos/swim/tree/master/swim-system-js/@swim/system)
frameworks.

```html
<script src="https://cdn.swimos.org/js/latest/swim-system.js"></script>
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

**@swim/core** can also be used as a CommonJS module in Node.js applications.
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
