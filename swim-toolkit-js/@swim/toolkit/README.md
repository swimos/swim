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
real-time visualizations framework, the
[**@swim/maps**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-maps-js)
real-time maps framework, the
[**@swim/mvc**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-mvc-js)
real-time component framework, and the
[**@swim/web**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-web-js)
real-time web application framework.

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

The **Swim UI** framework implements a user interface toolkit for pervasively
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
- [**@swim/angle**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ui-js/@swim/angle)
  ([npm](https://www.npmjs.com/package/@swim/angle),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_angle.html)) –
  dimensional angle types with unit-aware algebraic operators, conversions,
  and parsers.
- [**@swim/length**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ui-js/@swim/length)
  ([npm](https://www.npmjs.com/package/@swim/length),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_length.html)) –
  DOM-relative length types with unit-aware algebraic operators, conversions,
  and parsers.
- [**@swim/color**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ui-js/@swim/color)
  ([npm](https://www.npmjs.com/package/@swim/color),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_color.html)) –
  RGB and HSL color types with color-space-aware operators, conversions,
  and parsers.
- [**@swim/font**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ui-js/@swim/font)
  ([npm](https://www.npmjs.com/package/@swim/font),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_font.html)) –
  CSS font property types and parsers.
- [**@swim/shadow**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ui-js/@swim/shadow)
  ([npm](https://www.npmjs.com/package/@swim/shadow),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_shadow.html)) –
  CSS box shadow types and parsers.
- [**@swim/gradient**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ui-js/@swim/gradient)
  ([npm](https://www.npmjs.com/package/@swim/gradient),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_gradient.html)) –
  CSS gradient types and parsers.
- [**@swim/transform**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ui-js/@swim/transform)
  ([npm](https://www.npmjs.com/package/@swim/transform),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_transform.html)) –
  CSS and SVG compatible transform types with unit-aware algebraic operators
  and parsers.
- [**@swim/scale**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ui-js/@swim/scale)
  ([npm](https://www.npmjs.com/package/@swim/scale),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_scale.html)) –
  scale types that map numeric and temporal input domains to interpolated
  output ranges, with support for continuous domain clamping, domain solving,
  range unscaling, and interpolation between scales.
- [**@swim/transition**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ui-js/@swim/transition)
  ([npm](https://www.npmjs.com/package/@swim/transition),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_transition.html)) –
  transition types that specify duration, ease, interpolator, and lifecycle
  callback parameters for tween animations.
- [**@swim/style**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ui-js/@swim/style)
  ([npm](https://www.npmjs.com/package/@swim/style),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_style.html)) –
  CSS style types and universal style value parser.
- [**@swim/animate**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ui-js/@swim/animate)
  ([npm](https://www.npmjs.com/package/@swim/animate),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_animate.html)) –
  property-managing animator types that efficiently tween values between
  discrete state changes.
- [**@swim/render**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ui-js/@swim/render)
  ([npm](https://www.npmjs.com/package/@swim/render),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_render.html)) –
  renderable graphic types for SVG and Canvas compatible path drawing contexts,
  and Canvas compatible rendering contexts.
- [**@swim/constraint**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ui-js/@swim/constraint)
  ([npm](https://www.npmjs.com/package/@swim/constraint),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_constraint.html)) –
  incremental solver for systems of linear layout constraints.
- [**@swim/view**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ui-js/@swim/view)
  ([npm](https://www.npmjs.com/package/@swim/view),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_view.html)) –
  unified HTML, SVG, and Canvas view hierarchy, with integrated controller
  architecture, animated procedural styling, and constraint-based layouts.
- [**@swim/shape**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ui-js/@swim/shape)
  ([npm](https://www.npmjs.com/package/@swim/shape),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_shape.html)) –
  canvas shape views, with animated geometry and style properties.
- [**@swim/typeset**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ui-js/@swim/typeset)
  ([npm](https://www.npmjs.com/package/@swim/typeset),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_typeset.html)) –
  canvas typesetting views, with animated text, layout, font, and style properties.
- [**@swim/gesture**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ui-js/@swim/gesture)
  ([npm](https://www.npmjs.com/package/@swim/gesture),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_gesture.html)) –
  multitouch gesture recognizers, with kinematic surface modeling.

### [**Swim UX Framework**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ux-js)

The **Swim UX** framework implements a user interface framework for advanced
real-time applications.  **Swim UX** provides popovers, drawers, menus,
toolbars, controls, and other interactive application views and controllers.
**Swim UX** consists of the following component libraries:

- [**@swim/ux**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ux-js/@swim/ux)
  ([npm](https://www.npmjs.com/package/@swim/ux),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_ux.html)) –
  thin web application framework built on the **@swim/ui** toolkit.
- [**@swim/theme**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ux-js/@swim/theme)
  ([npm](https://www.npmjs.com/package/@swim/theme),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_theme.html)) –
  semantic looks and feels for mood-aware UX components.
- [**@swim/button**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ux-js/@swim/button)
  ([npm](https://www.npmjs.com/package/@swim/button),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_button.html)) –
  procedurally styled multitouch buttons.
- [**@swim/modal**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ux-js/@swim/modal)
  ([npm](https://www.npmjs.com/package/@swim/modal),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_modal.html)) –
  auto-placed, source-tracking popover views.
- [**@swim/drawer**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ux-js/@swim/drawer)
  ([npm](https://www.npmjs.com/package/@swim/drawer),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_drawer.html)) –
  responsive, minifiable drawer views.
- [**@swim/token**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ux-js/@swim/token)
  ([npm](https://www.npmjs.com/package/@swim/token),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_token.html)) –
  compact, editable pin and chip token views.
- [**@swim/menu**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ux-js/@swim/menu)
  ([npm](https://www.npmjs.com/package/@swim/menu),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_menu.html)) –
  context-sensitive menu lists and menu items.
- [**@swim/tree**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ux-js/@swim/tree)
  ([npm](https://www.npmjs.com/package/@swim/tree),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_tree.html)) –
  disclosable tree views with tabular columns.

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
  canvas views for efficiently rendering geospatially located map overlays,
  including fully animatable views for lines, circles, and polygons.
- [**@swim/mapbox**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-maps-js/@swim/mapbox)
  ([npm](https://www.npmjs.com/package/@swim/mapbox),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_mapbox.html)) –
  support for overlaying **@swim/map** views on Mapbox maps.
- [**@swim/googlemap**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-maps-js/@swim/googlemap)
  ([npm](https://www.npmjs.com/package/@swim/googlemap),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_googlemap.html)) –
  support for overlaying **@swim/map** views on Google maps.
- [**@swim/esrimap**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-maps-js/@swim/esrimap)
  ([npm](https://www.npmjs.com/package/@swim/esrimap),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_esrimap.html)) –
  support for overlaying **@swim/map** views on ArcGIS maps.

### [**Swim MVC** Framework](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-mvc-js)

The **Swim MVC** framework implements a model-view-controller framework built
on the **Swim UI** toolkit.  **Swim MVC** consists of the following component
libraries:

- [**@swim/mvc**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-mvc-js/@swim/mvc)
  ([npm](https://www.npmjs.com/package/@swim/mvc),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_mvc.html)) –
  model-view-controller framework built on the **@swim/ui** toolkit.
- [**@swim/model**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-mvc-js/@swim/model)
  ([npm](https://www.npmjs.com/package/@swim/model),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_model.html)) –
  lifecycle-managed model hierarchy supporting dynamic scoping and service injection.
- [**@swim/component**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-mvc-js/@swim/component)
  ([npm](https://www.npmjs.com/package/@swim/component),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_component.html)) –
  componentized controller layer with application lifecycle and service management.

### [**Swim Web** Framework](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-web-js)

The **Swim Web** framework implements a thin web application framework built
on the **Swim UI** toolkit.  **Swim Web** consists of the following component
libraries:

- [**@swim/web**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-web-js/@swim/web)
  ([npm](https://www.npmjs.com/package/@swim/web),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_web.html)) –
  thin web application framework built on the **@swim/ui** toolkit.
- [**@swim/website**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-web-js/@swim/website)
  ([npm](https://www.npmjs.com/package/@swim/website),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_website.html)) –
  minimalist components that implement common dynamic website behaviors.
- [**@swim/webapp**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-web-js/@swim/webapp)
  ([npm](https://www.npmjs.com/package/@swim/webapp),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_webapp.html)) –
  lightweight web application loader that dynamically instantiates views and
  controllers declared by `swim-` HTML attributes.

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
`swim-ui.js`, `swim-ux.js`, `swim-vis.js`, `swim-maps.js`, and
`swim-web.js`—those scripts need not be loaded when using `swim-toolkit.js`.

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
