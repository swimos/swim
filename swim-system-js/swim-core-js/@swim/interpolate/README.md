# @swim/interpolate

[![package](https://img.shields.io/npm/v/@swim/interpolate.svg)](https://www.npmjs.com/package/@swim/interpolate)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](https://docs.swimos.org/js/latest/modules/_swim_interpolate.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

**@swim/interpolate** implements extensible interpolators for smoothly blending
between values.  **@swim/interpolate** is part of the
[**@swim/core**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/core) framework.

## Installation

### npm

For an npm-managed project, `npm install @swim/interpolate` to
make it a dependency.  TypeScript sources will be installed into
`node_modules/@swim/interpolate/main`.  Transpiled JavaScript and TypeScript
definition files install into `node_modules/@swim/interpolate/lib/main`.
And a pre-built UMD script can be found in
`node_modules/@swim/interpolate/dist/main/swim-interpolate.js`.

### Browser

Browser applications can load `swim-core.js`, which comes bundled with the
**@swim/interpolate** library, directly from the SwimOS CDN.

```html
<!-- Development -->
<script src="https://cdn.swimos.org/js/latest/swim-core.js"></script>

<!-- Production -->
<script src="https://cdn.swimos.org/js/latest/swim-core.min.js"></script>
```

Alternatively, the standalone `swim-system.js` script may be loaded
from the SwimOS CDN, which bundles **@swim/interpolate** together with all other
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

**@swim/interpolate** can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.

```typescript
import * as interpolate from "@swim/interpolate";
```

### CommonJS/Node.js

**@swim/interpolate** can also be used as a CommonJS module in Node.js
applications.

```javascript
var interpolate = require("@swim/interpolate");
```

### Browser

When loaded by a web browser, the `swim-core.js` script adds all
**@swim/interpolate** library exports to the global `swim` namespace.

The `swim-system.js` script also adds all **@swim/interpolate** library exports
to the global `swim` namespace, making it a drop-in replacement for
`swim-core.js` when additional **@swim/system** libraries are needed.
