# @swim/component

[![package](https://img.shields.io/npm/v/@swim/component.svg)](https://www.npmjs.com/package/@swim/component)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](https://docs.swimos.org/js/latest/modules/_swim_component.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

**@swim/component** provides componentized controller layer with application
lifecycle and service management.  **@swim/component** is part of the
[**@swim/mvc**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-mvc-js/@swim/mvc) framework.

## Installation

### npm

For an npm-managed project, `npm install @swim/component` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/component/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/component/lib/main`.  And a pre-built UMD script can
be found in `node_modules/@swim/component/dist/main/swim-component.js`.

### Browser

Browser applications can load `swim-mvc.js`—which bundles the **@swim/component**
library—along with its `swim-core.js` and `swim-ui.js` dependencies, directly
from the SwimOS CDN.

```html
<!-- Development -->
<script src="https://cdn.swimos.org/js/latest/swim-core.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-ui.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-mvc.js"></script>

<!-- Production -->
<script src="https://cdn.swimos.org/js/latest/swim-core.min.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-ui.min.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-mvc.min.js"></script>
```

Alternatively, the standalone `swim-system.js` script may be loaded
from the SwimOS CDN, which bundles **@swim/component** together with all other
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

**@swim/component** can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.

```typescript
import * as component from "@swim/component";
```

### CommonJS/Node.js

**@swim/component** can also be used as a CommonJS module in Node.js applications.

```javascript
var component = require("@swim/component");
```

### Browser

When loaded by a mvc browser, the `swim-mvc.js` script adds all
**@swim/component** library exports to the global `swim` namespace.
The `swim-mvc.js` script requires that `swim-core.js` and `swim-ui.js`
have already been loaded.

The `swim-system.js` script also adds all **@swim/component** library exports
to the global `swim` namespace, making it a drop-in replacement for
'swim-core.js', `swim-ui.js`, and `swim-mvc.js` when additional
**@swim/system** libraries are needed.
