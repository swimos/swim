# @swim/scale

[![package](https://img.shields.io/npm/v/@swim/scale.svg)](https://www.npmjs.com/package/@swim/scale)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](http://docs.swim.ai/js/latest/modules/_swim_scale.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://developer.swim.ai"><img src="https://cdn.swim.ai/images/marlin-blue.svg" align="left"></a>

**@swim/scale** implements scale types that map numeric and temporal input
domains to interpolated output ranges, with support for continuous domain
clamping, domain solving, range unscaling, and interpolation between scales.
**@swim/scale** is part of the [**@swim/ui**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/@swim/ui)
framework.

## Installation

### npm

For an npm-managed project, `npm install @swim/scale` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/scale/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/scale/lib/main`.  And a pre-built UMD script can
be found in `node_modules/@swim/scale/dist/main/swim-scale.js`.

### Browser

Browser applications can load `swim-ui.js`—which bundles the **@swim/scale**
library—along with its `swim-core.js` dependency, directly from the Swim CDN.

```html
<script src="https://cdn.swim.ai/js/latest/swim-core.js"></script>
<script src="https://cdn.swim.ai/js/latest/swim-ui.js"></script>
```

Alternatively, the standalone `swim-system.js` script may be loaded
from the Swim CDN, which bundles **@swim/scale** together with all other
[**@swim/system**](https://github.com/swimos/swim/tree/master/swim-system-js/@swim/system)
libraries.

```html
<script src="https://cdn.swim.ai/js/latest/swim-system.js"></script>
```

## Usage

### ES6/TypeScript

**@swim/scale** can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.

```typescript
import * as scale from "@swim/scale";
```

### CommonJS/Node.js

**@swim/scale** can also be used as a CommonJS module in Node.js applications.

```javascript
var scale = require("@swim/scale");
```

### Browser

When loaded by a web browser, the `swim-ui.js` script adds all
**@swim/scale** library exports to the global `swim` namespace.  The
`swim-ui.js` script requires that `swim-core.js` has already been loaded.

The `swim-system.js` script also adds all **@swim/scale** library exports
to the global `swim` namespace, making it a drop-in replacement for
'swim-core.js' and `swim-ui.js` when additional **@swim/system**
libraries are needed.
