# @swim/vis

[![package](https://img.shields.io/npm/v/@swim/vis.svg)](https://www.npmjs.com/package/@swim/vis)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](https://docs.swimos.org/js/latest/modules/_swim_vis.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

**@swim/vis** implements procedurally animated, interactive diagrams,
including gauges, pie charts, and line, area, and bubble charts.  These fully
encapsulated widgets can be embedded into any web application framework, or
directly into any web page.  **@swim/vis** is a part of the broader
[**@swim/toolkit**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/@swim/toolkit) framework.

## Framework

The **@swim/vis** umbrella package depends on, and re-exports,
the following component libraries:

- [**@swim/gauge**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-vis-js/@swim/gauge)
  ([npm](https://www.npmjs.com/package/@swim/gauge),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_gauge.html)) –
  multi-dial, fully animatable, canvas rendered gauge widget.
- [**@swim/pie**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-vis-js/@swim/pie)
  ([npm](https://www.npmjs.com/package/@swim/pie),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_pie.html)) –
  multi-slice, fully animatable, canvas rendered pie chart widget.
- [**@swim/chart**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-vis-js/@swim/chart)
  ([npm](https://www.npmjs.com/package/@swim/chart),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_chart.html)) –
  multi-plot, fully animatable, canvas rendered chart widget, suppporting line,
  area, and bubble graphs, with customizeable axes, and kinematic multitouch
  scale gestures for panning and zooming with momentum.

**@swim/vis** builds on the [**@swim/core**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/core)
and [**@swim/ui**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-vis-js/@swim/ui)
frameworks; it has no additional required dependencies.

## Installation

### npm

For an npm-managed project, `npm install @swim/vis` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/vis/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/vis/lib/main`.  And a pre-built UMD script, which
bundles all **@swim/vis** component libraries, can be found in
`node_modules/@swim/vis/dist/main/swim-vis.js`.

### Browser

Browser applications can load `swim-vis.js`, along with its `swim-core.js`
and `swim-ui.js` dependencies, from the SwimOS CDN.

```html
<!-- Development -->
<script src="https://cdn.swimos.org/js/latest/swim-core.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-ui.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-vis.js"></script>

<!-- Production -->
<script src="https://cdn.swimos.org/js/latest/swim-core.min.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-ui.min.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-vis.min.js"></script>
```

Alternatively, the `swim-toolkit.js` script may be loaded, along with its
`swim-system.js` dependency, from the SwimOS CDN.  The `swim-toolkit.js`
script bundles **@swim/vis** together with all other
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

**@swim/vis** can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.  All component libraries are re-exported by
the umbrella `@swim/vis` module.

```typescript
import * as swim from "@swim/vis";
```

### CommonJS

**@swim/vis** can also be used with CommonJS-compatible module systems.
All component libraries are re-exported by the umbrella `@swim/vis` module.

```javascript
var swim = require("@swim/vis");
```

### Browser

When loaded by a web browser, the `swim-vis.js` script adds all component
library exports to the global `swim` namespace.  The `swim-vis.js` script
requires that `swim-core.js` and `swim-ui.js` have already been loaded.

The `swim-toolkit.js` script also adds all **@swim/vis** component library
exports to the global `swim` namespace, making it a drop-in replacement
for `swim-ui.js` and `swim-vis.js` when additional **@swim/toolkit**
frameworks are needed.
