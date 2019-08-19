# @swim/ux

[![package](https://img.shields.io/npm/v/@swim/ux.svg)](https://www.npmjs.com/package/@swim/ux)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](https://docs.swimos.org/js/latest/modules/_swim_ux.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

**@swim/ux** implements seamlessly animated user interface widgets, including
gauges, pie charts, line, area, and bubble charts, and geospatial map overlays.
These fully encapsulated widgets can be embedded into any web application
framework, or directly into any web page.  **@swim/ux** is a part of the broader
[**@swim/system**](https://github.com/swimos/swim/tree/master/swim-system-js/@swim/system)
framework.

## Framework

The **@swim/ux** umbrella package depends on, and re-exports, the following
component libraries:

- [**@swim/gauge**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ux-js/@swim/gauge)
  ([npm](https://www.npmjs.com/package/@swim/gauge),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_gauge.html)) –
  multi-dial, fully animatable, canvas rendered gauge widget.
- [**@swim/pie**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ux-js/@swim/pie)
  ([npm](https://www.npmjs.com/package/@swim/pie),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_pie.html)) –
  multi-slice, fully animatable, canvas rendered pie chart widget.
- [**@swim/chart**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ux-js/@swim/chart)
  ([npm](https://www.npmjs.com/package/@swim/chart),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_chart.html)) –
  multi-plot, fully animatable, canvas rendered chart widget, suppporting line,
  area, and bubble graphs, with customizeable axes, and kinematic multitouch
  scale gestures for panning and zooming with momentum.
- [**@swim/map**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ux-js/@swim/map)
  ([npm](https://www.npmjs.com/package/@swim/map),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_map.html)) –
  canvas views for efficiently rendering geospatially located map overlays,
  including fully animatable views for lines, circles, and polygons.
- [**@swim/mapbox**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ux-js/@swim/mapbox)
  ([npm](https://www.npmjs.com/package/@swim/mapbox),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_mapbox.html)) –
  support for overlaying **@swim/map** views on Mapbox maps.

**@swim/ux** builds on the [**@swim/core**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/core)
and [**@swim/ui**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ux-js/@swim/ui)
frameworks; it has no additional required dependencies.

## Installation

### npm

For an npm-managed project, `npm install @swim/ux` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/ux/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/ux/lib/main`.  And a pre-built UMD script, which
bundles all **@swim/ux** component libraries, can be found in
`node_modules/@swim/ux/dist/main/swim-ux.js`.

### Browser

Browser applications can load `swim-ux.js`, along with its `swim-core.js`
and `swim-ui.js` dependencies, from the swimOS CDN.

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
from the swimOS CDN, which bundles **@swim/ux** together with all other
[**@swim/system**](https://github.com/swimos/swim/tree/master/swim-system-js/@swim/system)
frameworks.

```html
<!-- Development -->
<script src="https://cdn.swimos.org/js/latest/swim-system.js"></script>

<!-- Production -->
<script src="https://cdn.swimos.org/js/latest/swim-system.min.js"></script>
```

## Usage

### ES6/TypeScript

**@swim/ux** can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.  All component libraries are re-exported by
the umbrella `@swim/ux` module.

```typescript
import * as swim from "@swim/ux";
```

### CommonJS

**@swim/ux** can also be used with CommonJS-compatible module systems.
All component libraries are re-exported by the umbrella `@swim/ux` module.

```javascript
var swim = require("@swim/ux");
```

### Browser

When loaded by a web browser, the `swim-ux.js` script adds all component
library exports to the global `swim` namespace.  The `swim-ux.js` script
requires that `swim-core.js` and `swim-ui.js` have already been loaded.

The `swim-system.js` script also adds all **@swim/ux** component library
exports to the global `swim` namespace, making it a drop-in replacement
for `swim-ux.js` when additional **@swim/system** frameworks are needed.
