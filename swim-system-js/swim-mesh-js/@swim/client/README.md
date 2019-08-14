# @swim/client

[![package](https://img.shields.io/npm/v/@swim/client.svg)](https://www.npmjs.com/package/@swim/client)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](http://docs.swim.ai/js/latest/modules/_swim_client.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://developer.swim.ai"><img src="https://cdn.swim.ai/images/marlin-blue.svg" align="left"></a>

WARP multiplexed streaming API client.  `@swim/client` is part of the
[`@swim/mesh`](https://www.npmjs.com/package/@swim/mesh) framework.<br><br><br><br>

## Overview

TODO

## Installation

### npm

For an npm-managed project, `npm install @swim/client` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/client/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/client/lib/main`.  And a pre-built UMD script can
be found in `node_modules/@swim/client/dist/main/swim-client.js`.

### Browser

Browser applications can load `swim-mesh.js`—which bundles the `@swim/client`
library—along with its `swim-core.js` dependency, directly from the Swim CDN.

```html
<script src="https://cdn.swim.ai/js/latest/swim-core.js"></script>
<script src="https://cdn.swim.ai/js/latest/swim-mesh.js"></script>
```

Alternatively, the standalone `swim-system.js` script may be loaded
from the Swim CDN, which bundles `@swim/client` along with all other
[`@swim/system`](https://www.npmjs.com/package/@swim/system) libraries.

```html
<script src="https://cdn.swim.ai/js/latest/swim-system.js"></script>
```

## Usage

### ES6/TypeScript

`@swim/client` can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.

```typescript
import * as client from "@swim/client";
```

### CommonJS/Node.js

`@swim/client` can also be used as a CommonJS module in Node.js applications.

```javascript
var swim = require("@swim/client");
```

### Browser

When loaded by a web browser, the `swim-core.js` script adds all
`@swim/client` library exports to the global `swim` namespace.  The
`swim-mesh.js` script requires that `swim-core.js` has already been loaded.

The `swim-system.js` script also adds all `@swim/client` library exports
to the global `swim` namespace, making it a drop-in replacement for
'swim-core.js' and `swim-mesh.js` when additional `@swim/system`
libraries are needed.
