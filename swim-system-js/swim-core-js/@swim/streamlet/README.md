# @swim/streamlet

[![package](https://img.shields.io/npm/v/@swim/structure.svg)](https://www.npmjs.com/package/@swim/streamlet)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](http://docs.swim.ai/js/latest/modules/_swim_streamlet.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://developer.swim.ai"><img src="https://cdn.swim.ai/images/marlin-blue.svg" align="left"></a>

`@swim/streamlet` provides a stateful, streaming component model.  Streamlets
are stateful application components that continuously consume input state from
streaming inlets, and continuously produce output state on streaming outlets.
`@swim/streamlet` is written in TypeScript, but can be used from either
TypeScript or JavaScript.  `@swim/streamlet` is part of the
[`@swim/core`](https://www.npmjs.com/package/@swim/core) framework.

## Overview

`@swim/streamlet` defines a model for continuous stateful computations that
consume many streaming input states, and produce many streaming output states.
The streamlet model facilitates dynamic binding of streaming application
components to their inputs and outputs, and provides a precise, rate decoupled,
backpressure regulated, re-evaluation model for reconciling the state of
streamlet components after their transitively dependent input states change.

Streamlets are general purpose programming constructs; they are _not_
restricted to modelling pure, data parallel functions.  Unlinke Spark RDDs,
or Flink Datasets, Streamlets can encapsulate arbitrary streaming business
logic.  And unlike [Reactive Streams](http://www.reactive-streams.org), which
are purely demand driven, Streamlets model both supply and demand signals,
enabling significantly optimized subgraph re-evaluation when sets of input
states change concurrently.

### Inlets, Outlets, and Streamlets

The streamlet programming model introduces three key concepts: inlets, outlets,
and streamlets.

- **`Inlet`** – a consumer of state changes.
- **`Outlet`** – a producer of state changes.
- **`Streamlet`** – a stateful component with zero or more named input outlets,
  and zero or more named output inlets.

Additional derivative `Inlet` and `Outlet` types provide specialized interfaces
for structured input and output states.

- **`MapInlet`** – a consumer of keyed state changes, i.e. updates to a
  key-value map.
- **`MapOutlet`** – a producer of keyed state changes, i.e. updates to a
  key-value map.

### Combinators

Outlets, being sources of state, define functional combinators, such as `map`,
`filter`, and `reduce`, that produce new, transformed outlets.  The Streamlet
model enables ultra efficient recomputation of combinators.  The `reduce`
combinator, for example, memoizes partial reduction products in a b-tree,
enabling log-time updates to its reduced state when any given input key changes.

## Installation

### npm

For an npm-managed project, `npm install @swim/streamlet` to
make it a dependency.  TypeScript sources will be installed into
`node_modules/@swim/streamlet/main`.  Transpiled JavaScript and TypeScript
definition files install into `node_modules/@swim/streamlet/lib/main`.
And a pre-built UMD script can be found in
`node_modules/@swim/streamlet/dist/main/swim-streamlet.js`.

### Browser

Browser applications can load `swim-core.js`, which comes bundled with the
`@swim/streamlet` library, directly from the Swim CDN.

```html
<script src="https://cdn.swim.ai/js/latest/swim-core.js"></script>
```

Alternatively, the standalone `swim-system.js` script may be loaded
from the Swim CDN, which bundles `@swim/streamlet` along with all other
[`@swim/system`](https://www.npmjs.com/package/@swim/system) libraries.

```html
<script src="https://cdn.swim.ai/js/latest/swim-system.js"></script>
```

## Usage

### ES6/TypeScript

`@swim/streamlet` can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.

```typescript
import * as streamlet from "@swim/streamlet";
```

### CommonJS/Node.js

`@swim/streamlet` can also be used as a CommonJS module in Node.js applications.

```javascript
var streamlet = require("@swim/streamlet");
```

### Browser

When loaded by a web browser, the `swim-core.js` script adds all
`@swim/streamlet` library exports to the global `swim` namespace.

The `swim-system.js` script also adds all `@swim/streamlet` library exports
to the global `swim` namespace, making it a drop-in replacement for
`swim-core.js` when additional `@swim/system` libraries are needed.
