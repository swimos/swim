# @swim/ux

[![package](https://img.shields.io/npm/v/@swim/ux.svg)](https://www.npmjs.com/package/@swim/ux)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](http://docs.swim.ai/js/latest/modules/_swim_ux.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://developer.swim.ai"><img src="https://cdn.swim.ai/images/marlin-blue.svg" align="left"></a>

`@swim/ux` implements seamlessly animated user interface widgets, including
gauges, pie charts, line, area, and bubble charts, and geospatial map overlays.
These fully encapsulated widgets can be embedded into any web application
framework, or directly into any web page.  `@swim/ux` is a part of the broader
[`@swim/system`](https://www.npmjs.com/package/@swim/system) framework.

## Libraries

The `@swim/ux` umbrella package depends on, and re-exports, the following
component libraries:

- **`@swim/gauge`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/%40swim/gauge),
  [npm](https://www.npmjs.com/package/@swim/gauge),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_gauge.html)) –
  multi-dial, fully animatable, canvas rendered gauge widget.
- **`@swim/pie`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/%40swim/pie),
  [npm](https://www.npmjs.com/package/@swim/pie),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_pie.html)) –
  multi-slice, fully animatable, canvas rendered pie chart widget.
- **`@swim/chart`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/%40swim/chart),
  [npm](https://www.npmjs.com/package/@swim/chart),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_chart.html)) –
  multi-plot, fully animatable, canvas rendered chart widget, suppporting line,
  area, and bubble graphs, with customizeable axes, and kinematic multitouch
  scale gestures for panning and zooming with momentum.
- **`@swim/map`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/%40swim/map),
  [npm](https://www.npmjs.com/package/@swim/map),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_map.html)) –
  canvas views for efficiently rendering geospatially located map overlays,
  including fully animatable views for lines, circles, and polygons.
- **`@swim/mapbox`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/%40swim/mapbox),
  [npm](https://www.npmjs.com/package/@swim/mapbox),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_mapbox.html)) –
  support for overlaying `@swim/map` views on Mapbox maps.

`@swim/ux` builds on the [`@swim/core`](https://www.npmjs.com/package/@swim/core)
and [`@swim/ui`](https://www.npmjs.com/package/@swim/ui) frameworks; it has no
additional required dependencies.

## Installation

### npm

For an npm-managed project, `npm install @swim/ux` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/ux/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/ux/lib/main`.  And a pre-built UMD script, which
bundles all `@swim/ux` component libraries, can be found in
`node_modules/@swim/ux/dist/main/swim-ux.js`.

### Browser

Web applications can load `swim-ux.js`, along with its `swim-core.js` and
`swim-ui.js` dependencies, from the Swim CDN.

```html
<script src="https://cdn.swim.ai/js/latest/swim-core.js"></script>
<script src="https://cdn.swim.ai/js/latest/swim-ui.js"></script>
<script src="https://cdn.swim.ai/js/latest/swim-ux.js"></script>
```

Alternatively, the standalone `swim-system.js` script may be loaded
from the Swim CDN, which bundles `@swim/ux` along with all other
[`@swim/system`](https://www.npmjs.com/package/@swim/system) frameworks.

```html
<script src="https://cdn.swim.ai/js/latest/swim-system.js"></script>
```

## Usage

### ES6/TypeScript

`@swim/ux` can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.  All component libraries are re-exported,
in their entirety, from the top-level `@swim/ux` namespace.

```typescript
import * as swim from "@swim/ux";
```

### CommonJS

`@swim/ux` can also be used with CommonJS-compatible module systems.
All component libraries are re-exported, in their entirety, from the
top-level `@swim/ux` namespace.

```javascript
var swim = require("@swim/ux");
```

### Browser

When loaded by a web browser, the `swim-ux.js` script adds all component
library exports to the global `swim` namespace.  The `swim-ux.js` script
requires that `swim-core.js` and `swim-ui.js` have already been loaded.

The `swim-system.js` script also adds all `@swim/ux` component library
exports to the global `swim` namespace, making it a drop-in replacement
for `swim-ux.js` when additional `@swim/system` frameworks are needed.
