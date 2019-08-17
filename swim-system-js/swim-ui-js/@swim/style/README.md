# @swim/style

[![package](https://img.shields.io/npm/v/@swim/style.svg)](https://www.npmjs.com/package/@swim/style)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](http://docs.swim.ai/js/latest/modules/_swim_style.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://developer.swim.ai"><img src="https://cdn.swim.ai/images/marlin-blue.svg" align="left"></a>

**@swim/style** provides CSS style types, and implements a universal style
value parser.  **@swim/style** is part of the
[**@swim/ui**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/@swim/ui)
framework.

## Installation

### npm

For an npm-managed project, `npm install @swim/style` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/style/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/style/lib/main`.  And a pre-built UMD script can
be found in `node_modules/@swim/style/dist/main/swim-style.js`.

### Browser

Browser applications can load `swim-ui.js`—which bundles the **@swim/style**
library—along with its `swim-core.js` dependency, directly from the Swim CDN.

```html
<script src="https://cdn.swim.ai/js/latest/swim-core.js"></script>
<script src="https://cdn.swim.ai/js/latest/swim-ui.js"></script>
```

Alternatively, the standalone `swim-system.js` script may be loaded
from the Swim CDN, which bundles **@swim/style** together with all other
[**@swim/system**](https://github.com/swimos/swim/tree/master/swim-system-js/@swim/system)
libraries.

```html
<script src="https://cdn.swim.ai/js/latest/swim-system.js"></script>
```

## Usage

### ES6/TypeScript

**@swim/style** can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.

```typescript
import * as style from "@swim/style";
```

### CommonJS/Node.js

**@swim/style** can also be used as a CommonJS module in Node.js applications.

```javascript
var style = require("@swim/style");
```

### Browser

When loaded by a web browser, the `swim-ui.js` script adds all
**@swim/style** library exports to the global `swim` namespace.  The
`swim-ui.js` script requires that `swim-core.js` has already been loaded.

The `swim-system.js` script also adds all **@swim/style** library exports
to the global `swim` namespace, making it a drop-in replacement for
'swim-core.js' and `swim-ui.js` when additional **@swim/system**
libraries are needed.
