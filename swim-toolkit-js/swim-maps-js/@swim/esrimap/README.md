# @swim/esrimap

[![package](https://img.shields.io/npm/v/@swim/esrimap.svg)](https://www.npmjs.com/package/@swim/esrimap)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](https://docs.swimos.org/js/latest/modules/_swim_esrimap.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

**@swim/esrimap** adds support for overlaying **@swim/map** views on ArcGIS maps.
Check out the [traffic map](https://www.swimos.org/demo/map/traffic.html) and
[transit map](https://www.swimos.org/demo/map/transit.html) demos to see
massively real-time maps in action.  **@swim/esrimap** is part of the
[**@swim/maps**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-maps-js/@swim/maps) framework.

## Installation

### npm

For an npm-managed project, `npm install @swim/esrimap` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/esrimap/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/esrimap/lib/main`.  And a pre-built UMD script can
be found in `node_modules/@swim/esrimap/dist/main/swim-esrimap.js`.

### Browser

Browser applications can load `swim-maps.js`—which bundles the **@swim/esrimap**
library—along with its `swim-core.js` and `swim-ui.js` dependencies, directly
from the SwimOS CDN.

```html
<!-- Development -->
<script src="https://cdn.swimos.org/js/latest/swim-core.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-ui.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-maps.js"></script>

<!-- Production -->
<script src="https://cdn.swimos.org/js/latest/swim-core.min.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-ui.min.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-maps.min.js"></script>
```

Alternatively, the standalone `swim-system.js` script may be loaded
from the SwimOS CDN, which bundles **@swim/esrimap** together with all other
[**@swim/system**](https://github.com/swimos/swim/tree/master/swim-system-js/@swim/system)
libraries.

```html
<!-- Development -->
<script src="https://cdn.swimos.org/js/latest/swim-system.js"></script>

<!-- Production -->
<script src="https://cdn.swimos.org/js/latest/swim-system.min.js"></script>
```

## Usage

### ES6/TypeScript

**@swim/esrimap** can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.

```typescript
import * as esrimap from "@swim/esrimap";
```

### CommonJS/Node.js

**@swim/esrimap** can also be used as a CommonJS module in Node.js applications.

```javascript
var esrimap = require("@swim/esrimap");
```

### Browser

When loaded by a web browser, the `swim-esrimap.js` script adds all
**@swim/esrimap** library exports to the global `swim` namespace.
The `swim-esrimap.js` script requires that `swim-core.js` and `swim-ui.js`
have already been loaded.

The `swim-toolkit.js` script also adds all **@swim/esrimap** library
exports to the global `swim` namespace, making it a drop-in replacement for
`swim-ui.js` and `swim-esrimap.js` when additional **@swim/toolkit** frameworks
are needed.
