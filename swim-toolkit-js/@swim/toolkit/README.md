# @swim/toolkit

[![package](https://img.shields.io/npm/v/@swim/toolkit.svg)](https://www.npmjs.com/package/@swim/toolkit)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](https://docs.swimos.org/js/latest)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

The **@swim/toolkit** umbrella framework provides a set of frameworks for
building pervasively real-time user interface applications.
**@swim/toolkit** incorporates the
[**@swim/ui**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ui-js)
real-time user interface toolkit, the
[**@swim/ux**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ux-js)
real-time application framework, the
[**@swim/vis**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-vis-js)
real-time visualizations framework, and the
[**@swim/maps**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-maps-js)
real-time maps framework.

## Umbrella Framework

The **Swim Toolkit** umbrella framework builds on the
[**Swim Core**](https://github.com/swimos/swim/tree/master/swim-system-js/@swim/core)
framework, and provides the following top-level libraries:

- [**@swim/toolkit**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/@swim/toolkit)
  ([npm](https://www.npmjs.com/package/@swim/toolkit),
  [doc](https://docs.swimos.org/js/latest)) –
  umbrella package that depends on, and re-exports, all **Swim Toolkit**
  child frameworks and libraries.

### [**Swim UI** Framework](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ui-js)

The **Swim UI** framework implements a user interface framework for pervasively
real-time applications.  A unified view hierarchy, with builtin procedural
styling and animation, makes it easy for **Swim UI** components to uniformly
style, animate, and render mixed HTML, SVG, Canvas, and WebGL components.
**Swim UI** consists of the following component libraries:

- [**@swim/ui**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ui-js/@swim/ui)
  ([npm](https://www.npmjs.com/package/@swim/ui),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_ui.html)) –
  pervasively real-time user interface toolkit, with a unified view hierarchy
  for HTML, SVG, and Canvas components, animated procedural styling, and
  constraint-based layouts.
- [**@swim/model**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ui-js/@swim/model)
  ([npm](https://www.npmjs.com/package/@swim/model),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_model.html)) –
  lifecycle-managed model hierarchy supporting dynamic scoping and service injection.
- [**@swim/style**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ui-js/@swim/style)
  ([npm](https://www.npmjs.com/package/@swim/style),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_style.html)) –
  Font, color, gradient, shadow and related types and parsers.
- [**@swim/theme**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ui-js/@swim/theme)
  ([npm](https://www.npmjs.com/package/@swim/theme),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_theme.html)) –
  semantic looks and feels for mood-aware UX components.
- [**@swim/view**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ui-js/@swim/view)
  ([npm](https://www.npmjs.com/package/@swim/view),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_view.html)) –
  unified HTML, SVG, and Canvas view hierarchy, with integrated controller
  architecture, animated procedural styling, and constraint-based layouts.
- [**@swim/dom**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ui-js/@swim/dom)
  ([npm](https://www.npmjs.com/package/@swim/dom),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_dom.html)) –
  HTML and SVG views, with procedural attribute and style animators.
- [**@swim/graphics**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ui-js/@swim/graphics)
  ([npm](https://www.npmjs.com/package/@swim/graphics),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_graphics.html)) –
  canvas graphics views, with procedurally animated shapes, and procedurally
  styled typesetters.
- [**@swim/component**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ui-js/@swim/component)
  ([npm](https://www.npmjs.com/package/@swim/component),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_component.html)) –
  componentized controller layer with application lifecycle and service management.

### [**Swim UX Framework**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ux-js)

The **Swim UX** framework implements a user interface toolkit for advanced
real-time applications.  **Swim UX** provides popovers, drawers, menus,
toolbars, controls, and other interactive application views and controllers.
**Swim UX** consists of the following component libraries:

- [**@swim/ux**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ux-js/@swim/ux)
  ([npm](https://www.npmjs.com/package/@swim/ux),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_ux.html)) –
  user interface toolkit for advanced real-time applications.
- [**@swim/button**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ux-js/@swim/button)
  ([npm](https://www.npmjs.com/package/@swim/button),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_button.html)) –
  button-like user interface controls.
- [**@swim/token**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ux-js/@swim/token)
  ([npm](https://www.npmjs.com/package/@swim/token),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_token.html)) –
  attribute, action, and user input token views.
- [**@swim/grid**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ux-js/@swim/grid)
  ([npm](https://www.npmjs.com/package/@swim/grid),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_grid.html)) –
  tables, trees, lists, and other tabular views.
- [**@swim/window**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ux-js/@swim/window)
  ([npm](https://www.npmjs.com/package/@swim/window),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_window.html)) –
  popovers, drawers, and other view surfaces.
- [**@swim/deck**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ux-js/@swim/deck)
  ([npm](https://www.npmjs.com/package/@swim/deck),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_deck.html)) –
  card stack navigation views.

### [**Swim Visualizations** Framework](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-vis-js)

The **Swim Visualizations** framework implements seamlessly animated diagram
widgets, including gauges, pie charts, and line, area, and bubble charts.
**Swim Visualizations** consists of the following component libraries:

- [**@swim/vis**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-vis-js/@swim/vis)
  ([npm](https://www.npmjs.com/package/@swim/vis),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_vis.html)) –
  procedurally animated, interactive diagrams, including gauges, pie charts,
  and line, area, and bubble charts.
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

### [**Swim Maps** Framework](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-maps-js)

The **Swim Maps** framework implements real-time geospatial map overlays,
with support for Mapbox, Google, and Esri maps.  **Swim Maps** consists of
the following component libraries:

- [**@swim/maps**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-maps-js/@swim/maps)
  ([npm](https://www.npmjs.com/package/@swim/maps),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_maps.html)) –
  real-time geospatial map overlays, with support for Mapbox, Google, and Esri maps.
- [**@swim/map**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-maps-js/@swim/map)
  ([npm](https://www.npmjs.com/package/@swim/map),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_map.html)) –
  graphics views for efficiently rendering animated geospatial map overlays.
- [**@swim/mapbox**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-maps-js/@swim/mapbox)
  ([npm](https://www.npmjs.com/package/@swim/mapbox),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_mapbox.html)) –
  **@swim/map** overlays for Mapbox maps.
- [**@swim/leaflet**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-maps-js/@swim/leaflet)
  ([npm](https://www.npmjs.com/package/@swim/leaflet),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_leaflet.html)) –
  **@swim/map** overlays for Leaflet maps.
- [**@swim/googlemap**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-maps-js/@swim/googlemap)
  ([npm](https://www.npmjs.com/package/@swim/googlemap),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_googlemap.html)) –
  **@swim/map** overlays for Google maps.
- [**@swim/esrimap**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-maps-js/@swim/esrimap)
  ([npm](https://www.npmjs.com/package/@swim/esrimap),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_esrimap.html)) –
  **@swim/map** overlays for ArcGIS maps.

## Installation

### npm

For an npm-managed project, `npm install @swim/toolkit` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/toolkit/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/toolkit/lib/main`.  And a pre-built UMD script, which
bundles all **@swim/toolkit** child frameworks, can be found in
`node_modules/@swim/toolkit/dist/main/swim-toolkit.js`.

### Browser

### Browser

Browser applications can load `swim-toolkit.js`, along with its `swim-system.js`
dependency, from the SwimOS CDN.  The `swim-toolkit.js` bundle supersedes
`swim-ui.js`, `swim-ux.js`, `swim-vis.js`, and `swim-maps.js`—those scripts
need not be loaded when using `swim-toolkit.js`.

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

**@swim/toolkit** can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.  All child framework libraries are re-exported
by the umbrella `@swim/toolkit` module.

```typescript
import * as swim from "@swim/toolkit";
```

### CommonJS/Node.js

**@swim/toolkit** can also be used with CommonJS-compatible module systems.
All component libraries are re-exported by the umbrella `@swim/toolkit` module.

```javascript
var swim = require("@swim/toolkit");
```

### Browser

When loaded by a web browser, the `swim-toolkit.js` script adds all child
framework exports to the global `swim` namespace.  The `swim-toolkit.js` script
requires that either `swim-core.js` or `swim-system.js` has already been loaded.
