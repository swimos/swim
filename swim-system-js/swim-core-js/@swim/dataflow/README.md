# @swim/dataflow

[![package](https://img.shields.io/npm/v/@swim/structure.svg)](https://www.npmjs.com/package/@swim/dataflow)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](https://docs.swimos.org/js/latest/modules/_swim_dataflow.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

**@swim/dataflow** implements a compiler from
[**@swim/structure**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/structure)
selectors, operators, and functions, to continuously updated data structures
driven by [**@swim/streamlet**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/streamlet)
dataflow graphs.  **@swim/dataflow** turns dynamic data structures into living
documents.  **@swim/dataflow** is written in TypeScript, but can be used from
either TypeScript or JavaScript.  **@swim/dataflow** is part of the
[**@swim/core**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/core) framework.

## Overview

A live updated data structure is represented as a `RecordScope`, which extends
`Record` from **@swim/structure**.  An ordinary `Record` can be recursively
compiled into a `RecordScope` by invoking the `RecordScope.from` factory method.
A compiled `RecordScope` has all of its nested expressions replaced by their
evaluated state.  But unlike evaluating a `Record` with an `Interpreter`, if a
member of a `RecordScope` changes, all expressions that transitively depend on
that member get flagged for recomputation, which occurs the next time
`reconcileInput` gets invoked on the `RecordScope`.

The `Dataflow.compile` method can also be used to compile an arbitrary
**@swim/structure** expression into an `Outlet` that updates whenever
the state of any of its transitively dependend expressions changes.

## Installation

### npm

For an npm-managed project, `npm install @swim/dataflow` to
make it a dependency. TypeScript sources will be installed into
`node_modules/@swim/dataflow/main`. Transpiled JavaScript and TypeScript
definition files install into `node_modules/@swim/dataflow/lib/main`.
And a pre-built UMD script can be found in
`node_modules/@swim/dataflow/dist/main/swim-dataflow.js`.

### Browser

Browser applications can load `swim-core.js`, which comes bundled with the
**@swim/dataflow** library, directly from the Swim CDN.

```html
<script src="https://cdn.swimos.org/js/latest/swim-core.js"></script>
```

Alternatively, the standalone `swim-system.js` script may be loaded
from the Swim CDN, which bundles **@swim/dataflow** together with all other
[**@swim/system**](https://github.com/swimos/swim/tree/master/swim-system-js/@swim/system)
libraries.

```html
<script src="https://cdn.swimos.org/js/latest/swim-system.js"></script>
```

## Usage

### ES6/TypeScript

**@swim/dataflow** can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.

```typescript
import * as dataflow from "@swim/dataflow";
```

### CommonJS/Node.js

**@swim/dataflow** can also be used as a CommonJS module in Node.js applications.

```javascript
var dataflow = require("@swim/dataflow");
```

### Browser

When loaded by a web browser, the `swim-core.js` script adds all
**@swim/dataflow** library exports to the global `swim` namespace.

The `swim-system.js` script also adds all **@swim/dataflow** library exports
to the global `swim` namespace, making it a drop-in replacement for
`swim-core.js` when additional **@swim/system** libraries are needed.
