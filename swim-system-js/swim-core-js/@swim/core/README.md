# @swim/core

[![package](https://img.shields.io/npm/v/@swim/core.svg)](https://www.npmjs.com/package/@swim/core)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](http://docs.swim.ai/js/latest)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://developer.swim.ai"><img src="https://cdn.swim.ai/images/marlin-blue.svg" align="left"></a>

The `@swim/core` framework provides a lightweight, portable, dependency-free,
strongly typed baseline on which to build higher level libraries. `@swim/core`
forms the foundation on which the [`@swim/mesh`](https://www.npmjs.com/package/@swim/mesh)
multiplexed streaming WARP framework, and the [`@swim/ui`](https://www.npmjs.com/package/@swim/ui)
and [`@swim/ux`](https://www.npmjs.com/package/@swim/ux) real-time user
interface toolkits, are built.

## Libraries

The `@swim/core` umbrella package depends on, and re-exports, the following
component libraries:

- **`@swim/util`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/%40swim/util),
  [npm](https://www.npmjs.com/package/@swim/util),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_util.html)) –
  ordering, equality, and hashing; type conversions; iterators; builders; maps;
  caches; and assertions.
- **`@swim/codec`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/%40swim/codec),
  [npm](https://www.npmjs.com/package/@swim/codec),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_codec.html)) –
  incremental I/O; functional parsers and writers; display, debug, and
  diagnostic formatters; and Unicode and binary codecs.
- **`@swim/collections`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/%40swim/collections),
  [npm](https://www.npmjs.com/package/@swim/collections),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_collections.html)) –
  B-trees and S-trees (sequence trees).
- **`@swim/structure`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/%40swim/structure),
  [npm](https://www.npmjs.com/package/@swim/structure),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_structure.html)) –
  generic structured data model, with support for selectors, expressions,
  and lambda functions.  Used as a common abstract syntax tree for Recon,
  JSON, XML, and other data languages.
- **`@swim/streamlet`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/%40swim/streamlet),
  [npm](https://www.npmjs.com/package/@swim/streamlet),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_streamlet.html)) –
  stateful, streaming component model.
- **`@swim/dataflow`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/%40swim/dataflow),
  [npm](https://www.npmjs.com/package/@swim/dataflow),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_dataflow.html)) –
  compiler from `@swim/structure` expressions to live-updated data models.
- **`@swim/recon`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/%40swim/recon),
  [npm](https://www.npmjs.com/package/@swim/recon),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_recon.html)) –
  codec for parsing/writing Recon strings to/from `@swim/structure` data models.
- **`@swim/math`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/%40swim/math),
  [npm](https://www.npmjs.com/package/@swim/math),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_math.html)) –
  mathematical and geometric structures and operators.
- **`@swim/time`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/%40swim/time),
  [npm](https://www.npmjs.com/package/@swim/time),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_time.html)) –
  date-time, time zone, and time inteval data types, parsers, and formatters.
- **`@swim/uri`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/%40swim/uri),
  [npm](https://www.npmjs.com/package/@swim/uri),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_uri.html)) –
  codec for parsing/writing URI strings to/from structured URI data types.

`@swim/core` has no external dependencies.

## Installation

### npm

For an npm-managed project, `npm install @swim/core` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/core/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/core/lib/main`.  And a pre-built UMD script, which
bundles all `@swim/core` component libraries, can be found in
`node_modules/@swim/core/dist/main/swim-core.js`.

### Browser

Web applications can load `swim-core.js` directly from the Swim CDN.

```html
<script src="https://cdn.swim.ai/js/latest/swim-core.js"></script>
```

## Usage

### ES6/TypeScript

`@swim/core` can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.  All component libraries are re-exported,
in their entirety, from the top-level `@swim/core` namespace.

```typescript
import * as swim from "@swim/core";
```

### CommonJS/Node.js

`@swim/core` can also be used as a CommonJS in Node.js applications.
All component libraries are re-exported, in their entirety, from the
top-level `@swim/core` namespace.

```javascript
var swim = require("@swim/core");
```

### Browser

When loaded by a web browser, the `swim-core.js` script adds all component
library exports to the global `swim` namespace.
