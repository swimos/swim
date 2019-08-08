# @swim/mesh

[![package](https://img.shields.io/npm/v/@swim/mesh.svg)](https://www.npmjs.com/package/@swim/mesh)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](http://docs.swim.ai/js/latest)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://developer.swim.ai"><img src="https://cdn.swim.ai/images/marlin-blue.svg" align="left"></a>

`@swim/mesh` implements a multiplexed streaming WARP client that runs in both
Node.js and web browsers. `@swim/mesh` can be used in concert with the
[`@swim/ui`](https://www.npmjs.com/package/@swim/ui) and
[`@swim/ux`](https://www.npmjs.com/package/@swim/ux) user interface
toolkits to build massively real-time streaming applications. `@swim/mesh`
is written in TypeScript, but is designed to be used from either TypeScript
or JavaScript.

## Libraries

The `@swim/mesh` umbrella package depends on, and re-exports, the following
component libraries:

- **`@swim/warp`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-mesh-js/%40swim/warp),
  [npm](https://www.npmjs.com/package/@swim/warp),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_warp.html)) –
  implementation of the WARP multiplexed streaming wire protocol.
- **`@swim/client`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-mesh-js/%40swim/client),
  [npm](https://www.npmjs.com/package/@swim/client),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_client.html)) –
  WARP multiplexed streaming API client.

`@swim/mesh` has no additional dependencies when run in a web browser,
and depends only on a WebSocket implementation when run in Node.js.

## Installation

### npm

For an npm-managed project, `npm install @swim/mesh` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/mesh/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/mesh/lib/main`.  And a pre-built UMD script, which
bundles all `@swim/mesh` component libraries, can be found in
`node_modules/@swim/mesh/dist/main/swim-mesh.js`.

### Browser

Web applications can load `swim-mesh.js` directly from the Swim CDN.

```html
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
