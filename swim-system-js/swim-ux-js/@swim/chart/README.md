# @swim/chart

[![package](https://img.shields.io/npm/v/@swim/chart.svg)](https://www.npmjs.com/package/@swim/chart)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](https://docs.swimos.org/js/latest/modules/_swim_chart.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

**@swim/chart** provides multi-plot, fully animatable, canvas rendered chart
widgets, suppporting line, area, and bubble graphs, with customizeable axes,
and kinematic multitouch scale gestures for panning and zooming with momentum.
Check out the [bubble chart](https://www.swimos.org/demo/chart/bubble.html),
[area chart](https://www.swimos.org/demo/chart/area.html),
[line chart](https://www.swimos.org/demo/chart/line.html), and
[chart axes](https://www.swimos.org/demo/chart/axes.html) demos to see
multi-touch charts in action.  **@swim/chart** is part of the
[**@swim/ux**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ux-js/@swim/ux) framework.

## Installation

### npm

For an npm-managed project, `npm install @swim/chart` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/chart/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/chart/lib/main`.  And a pre-built UMD script can
be found in `node_modules/@swim/chart/dist/main/swim-chart.js`.

### Browser

Browser applications can load `swim-ux.js`—which bundles the **@swim/chart**
library—along with its `swim-core.js` and `swim-ui.js` dependencies, directly
from the swimOS CDN.

```html
<!-- Development -->
<script src="https://cdn.swimos.org/js/latest/swim-core.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-ui.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-ux.js"></script>

<!-- Production -->
<script src="https://cdn.swimos.org/js/latest/swim-core.min.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-ui.min.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-ux.min.js"></script>
```

Alternatively, the standalone `swim-system.js` script may be loaded
from the swimOS CDN, which bundles **@swim/chart** together with all other
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

**@swim/chart** can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.

```typescript
import * as chart from "@swim/chart";
```

### CommonJS/Node.js

**@swim/chart** can also be used as a CommonJS module in Node.js applications.

```javascript
var chart = require("@swim/chart");
```

### Browser

When loaded by a web browser, the `swim-ux.js` script adds all
**@swim/chart** library exports to the global `swim` namespace.
The `swim-ux.js` script requires that `swim-core.js` and `swim-ui.js`
have already been loaded.

The `swim-system.js` script also adds all **@swim/chart** library exports
to the global `swim` namespace, making it a drop-in replacement for
'swim-core.js', `swim-ui.js`, and `swim-ux.js` when additional
**@swim/system** libraries are needed.
