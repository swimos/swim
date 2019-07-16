# @swim/collections

[![package](https://img.shields.io/npm/v/@swim/collections.svg)](https://www.npmjs.com/package/@swim/collections)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](http://docs.swim.ai/js/latest/modules/_swim_collections.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://developer.swim.ai"><img src="https://cdn.swim.ai/images/marlin-blue.svg" align="left"></a>

`@swim/collections` implements data structures for key-value maps and
sequential lists, including B-tree and S-tree (implicitly indexed B-tree)
implementations. `@swim/collections` is written in TypeScript, but can be used
from either TypeScript or JavaScript. `@swim/collections` is included as part
of the [`@swim/core`](https://www.npmjs.com/package/@swim/core) framework.

## Overview

### B-trees

The `BTree` class implements the `OrderedMap` interface from `@swim/util`,
and compares keys using `Objects.compare`, also from `@swim/util`.  `BTree`
is internally immutable, enabling lightweight snapshotting via `BTree.clone`,
and non-destructive mutation via `BTree.updated`, and `BTree.removed`.

`BTree` also implements the `ReducedMap` interface from `@swim/util`,
providing storage of sub-tree reductions in b-tree nodes to support log
time recomputation of whole tree reductions after incremental updates.

### S-trees

The `STree` class implements a sequential list data type that's backed by an
implicitly indexed b-tree.  Like `BTree`, `STree` supports lightweight
snapshotting via `STree.clone`.

`STree` associated a unique ID with each list item, which can be used to
reconcile concurrent, conflicting updates to the same logical list.

## Installation

### npm

For an npm-managed project, `npm install @swim/collections` to make it a
dependency.  TypeScript sources will be installed into
`node_modules/@swim/collections/main`.  Transpiled JavaScript and TypeScript
definition files install into `node_modules/@swim/collections/lib/main`.
And a pre-built UMD script can be found in
`node_modules/@swim/collections/dist/main/swim-collections.js`.

### Browser

Web applications can load `swim-core.js`, which comes bundled with the
`@swim/collections` library, directly from the Swim CDN.

```html
<script src="https://cdn.swim.ai/js/latest/swim-core.js"></script>
```

## Usage

### ES6/TypeScript

`@swim/collections` can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.

```typescript
import * as collections from "@swim/collections";
```

### CommonJS/Node.js

`@swim/collections` can also be used as a CommonJS in Node.js applications.

```javascript
var collections = require("@swim/collections");
```

### Browser

When loaded by a web browser, the `swim-core.js` script adds the
`@swim/collections` library exports to the global `swim` namespace.
