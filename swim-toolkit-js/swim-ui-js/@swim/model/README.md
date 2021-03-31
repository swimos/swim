# @swim/model

[![package](https://img.shields.io/npm/v/@swim/model.svg)](https://www.npmjs.com/package/@swim/model)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](https://docs.swimos.org/js/latest/modules/_swim_model.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

**@swim/model** implements a lifecycle-managed model hierarchy supporting
dynamic scoping and service injection.  **@swim/model** is part of the
[**@swim/ui**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ui-js/@swim/ui) framework.

## Installation

### npm

For an npm-managed project, `npm install @swim/model` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/model/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/model/lib/main`.  And a pre-built UMD script can
be found in `node_modules/@swim/model/dist/main/swim-model.js`.

### Browser

Browser applications can load `swim-ui.js`—which bundles the **@swim/model**
library—along with its `swim-core.js` and `swim-mesh.js` dependencies, directly
from the SwimOS CDN.

```html
<!-- Development -->
<script src="https://cdn.swimos.org/js/latest/swim-core.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-mesh.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-ui.js"></script>

<!-- Production -->
<script src="https://cdn.swimos.org/js/latest/swim-core.min.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-mesh.min.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-ui.min.js"></script>
```

Alternatively, the `swim-toolkit.js` script may be loaded, along with its
`swim-system.js` dependency, from the SwimOS CDN.  The `swim-toolkit.js`
script bundles **@swim/model** together with all other
[**@swim/toolkit**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/@swim/toolkit)
frameworks.

```html
<!-- Development -->
<script src="https://cdn.swimos.org/js/latest/swim-system.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-toolkit.js"></script>

<!-- Production -->
<script src="https://cdn.swimos.org/js/latest/swim-system.min.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-toolkit.min.js"></script>
```

## Usage

### ES6/TypeScript

**@swim/model** can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.

```typescript
import * as model from "@swim/model";
```

### CommonJS/Node.js

**@swim/model** can also be used as a CommonJS module in Node.js applications.

```javascript
var model = require("@swim/model");
```

### Browser

When loaded by a web browser, the `swim-ui.js` script adds all
**@swim/model** library exports to the global `swim` namespace.
The `swim-ui.js` script requires that `swim-core.js` and `swim-mesh.js`
have already been loaded.

The `swim-toolkit.js` script also adds all **@swim/model** library
exports to the global `swim` namespace, making it a drop-in replacement for
`swim-ui.js` and `swim-model.js` when additional **@swim/toolkit** frameworks
are needed.
