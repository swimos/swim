# @swim/mesh

[![package](https://img.shields.io/npm/v/@swim/mesh.svg)](https://www.npmjs.com/package/@swim/mesh)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](https://docs.swimos.org/js/latest/modules/_swim_mesh.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

**@swim/mesh** implements a multiplexed streaming WARP client that runs in both
Node.js and web browsers. **@swim/mesh** can be used in concert with the
[**@swim/ui**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/@swim/ui)
and [**@swim/ux**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ux-js/@swim/ux)
user interface toolkits to build massively real-time streaming applications.
**@swim/mesh** is part of the broader
[**@swim/system**](https://github.com/swimos/swim/tree/master/swim-system-js/@swim/system) framework.

## Framework

The **@swim/mesh** umbrella package depends on, and re-exports, the following
component libraries:

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

**@swim/mesh** builds on the [**@swim/core**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/core)
framework; it has no additional dependencies when run in a web browser,
and depends only on a WebSocket implementation when run in Node.js.

## Installation

### npm

For an npm-managed project, `npm install @swim/mesh` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/mesh/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/mesh/lib/main`.  And a pre-built UMD script, which
bundles all **@swim/mesh** component libraries, can be found in
`node_modules/@swim/mesh/dist/main/swim-mesh.js`.

### Browser

Browser applications can load `swim-mesh.js`, along with its `swim-core.js`
dependency, from the Swim CDN.

```html
<script src="https://cdn.swimos.org/js/latest/swim-core.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-mesh.js"></script>
```

Alternatively, the standalone `swim-system.js` script may be loaded
from the Swim CDN, which bundles **@swim/mesh** together with all other
[**@swim/system**](https://github.com/swimos/swim/tree/master/swim-system-js/@swim/system)
frameworks.

```html
<script src="https://cdn.swimos.org/js/latest/swim-system.js"></script>
```

## Usage

### ES6/TypeScript

**@swim/mesh** can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.  All component libraries are re-exported by
the umbrella `@swim/mesh` module.

```typescript
import * as swim from "@swim/mesh";
```

### CommonJS/Node.js

**@swim/mesh** can also be used as a CommonJS module in Node.js applications.
All component libraries are re-exported by the umbrella `@swim/mesh` module.

```javascript
var swim = require("@swim/mesh");
```

### Browser

When loaded by a web browser, the `swim-mesh.js` script adds all component
library exports to the global `swim` namespace.  The `swim-mesh.js` script
requires that `swim-core.js` has already been loaded.

The `swim-system.js` script also adds all **@swim/mesh** component library
exports to the global `swim` namespace, making it a drop-in replacement
for `swim-mesh.js` when additional **@swim/system** frameworks are needed.
