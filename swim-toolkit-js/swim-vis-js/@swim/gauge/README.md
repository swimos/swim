# @swim/gauge

[![package](https://img.shields.io/npm/v/@swim/gauge.svg)](https://www.npmjs.com/package/@swim/gauge)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](https://docs.swimos.org/js/latest/modules/_swim_gauge.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

**@swim/gauge** implements a multi-dial, fully animatable, canvas rendered
gauge widget.  **@swim/gauge** views have numerous easy to animate properties.
Check out the [interactive **@swim/gauge** demo](https://www.swimos.org/demo/gauge)
to see it in action.  **@swim/gauge** is part of the
[**@swim/vis**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-vis-js/@swim/vis) framework.

## Installation

### npm

For an npm-managed project, `npm install @swim/gauge` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/gauge/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/gauge/lib/main`.  And a pre-built UMD script can
be found in `node_modules/@swim/gauge/dist/main/swim-gauge.js`.

### Browser

Browser applications can load `swim-vis.js`—which bundles the **@swim/gauge**
library—along with its `swim-core.js`, `swim-mesh.js`, and `swim-ui.js`
dependencies, directly from the SwimOS CDN.

```html
<!-- Development -->
<script src="https://cdn.swimos.org/js/latest/swim-core.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-mesh.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-ui.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-vis.js"></script>

<!-- Production -->
<script src="https://cdn.swimos.org/js/latest/swim-core.min.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-mesh.min.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-ui.min.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-vis.min.js"></script>
```

Alternatively, the `swim-toolkit.js` script may be loaded, along with its
`swim-system.js` dependency, from the SwimOS CDN.  The `swim-toolkit.js`
script bundles **@swim/gauge** together with all other
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

**@swim/gauge** can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.

```typescript
import * as gauge from "@swim/gauge";
```

### CommonJS/Node.js

**@swim/gauge** can also be used as a CommonJS module in Node.js applications.

```javascript
var gauge = require("@swim/gauge");
```

### Browser

When loaded by a web browser, the `swim-gauge.js` script adds all
**@swim/gauge** library exports to the global `swim` namespace.
The `swim-gauge.js` script requires that `swim-core.js`, and `swim-mesh.js`,
and `swim-ui.js` have already been loaded.

The `swim-toolkit.js` script also adds all **@swim/gauge** library exports to
the global `swim` namespace, making it a drop-in replacement for `swim-ui.js`
and `swim-gauge.js` when additional **@swim/toolkit** frameworks are needed.
