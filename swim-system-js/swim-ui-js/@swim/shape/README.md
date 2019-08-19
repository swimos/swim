# @swim/shape

[![package](https://img.shields.io/npm/v/@swim/shape.svg)](https://www.npmjs.com/package/@swim/shape)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](https://docs.swimos.org/js/latest/modules/_swim_shape.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

**@swim/shape** implements canvas shape views, with animated geometry and style
properties.  **@swim/shape** is part of the
[**@swim/ui**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/@swim/ui)
framework.

## Installation

### npm

For an npm-managed project, `npm install @swim/shape` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/shape/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/shape/lib/main`.  And a pre-built UMD script can
be found in `node_modules/@swim/shape/dist/main/swim-shape.js`.

### Browser

Browser applications can load `swim-ui.js`—which bundles the **@swim/shape**
library—along with its `swim-core.js` dependency, directly from the Swim CDN.

```html
<script src="https://cdn.swimos.org/js/latest/swim-core.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-ui.js"></script>
```

Alternatively, the standalone `swim-system.js` script may be loaded
from the Swim CDN, which bundles **@swim/shape** together with all other
[**@swim/system**](https://github.com/swimos/swim/tree/master/swim-system-js/@swim/system)
libraries.

```html
<script src="https://cdn.swimos.org/js/latest/swim-system.js"></script>
```

## Usage

### ES6/TypeScript

**@swim/shape** can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.

```typescript
import * as shape from "@swim/shape";
```

### CommonJS/Node.js

**@swim/shape** can also be used as a CommonJS module in Node.js applications.

```javascript
var shape = require("@swim/shape");
```

### Browser

When loaded by a web browser, the `swim-ui.js` script adds all
**@swim/shape** library exports to the global `swim` namespace.  The
`swim-ui.js` script requires that `swim-core.js` has already been loaded.

The `swim-system.js` script also adds all **@swim/shape** library exports
to the global `swim` namespace, making it a drop-in replacement for
'swim-core.js' and `swim-ui.js` when additional **@swim/system**
libraries are needed.
