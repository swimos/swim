# Swim Toolkit TypeScript Implementation

[![package](https://img.shields.io/npm/v/@swim/toolkit.svg)](https://www.npmjs.com/package/@swim/toolkit)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](https://docs.swimos.org/js/latest)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

The **Swim Toolkit** TypeScript implementation provides a set of frameworks for
building pervasively real-time user interface applications.  **Swim Toolkit**
incorporates the [**Swim UI**](swim-ui-js) real-time user interface toolkit,
the [**Swim UX**](swim-ux-js) real-time application framework, the [**Swim
Visualizations**](swim-vis-js) framework, the [**Swim Maps**](swim-maps-js)
framework, and the [**Swim Web**](swim-web-js) real-time web application
framework.

## Umbrella Framework

The **Swim Toolkit** umbrella framework builds on the
[**Swim Core**](https://github.com/swimos/swim/tree/master/swim-system-js/@swim/core)
framework, and provides the following top-level libraries:

- [**@swim/toolkit**](@swim/toolkit) –
  umbrella package that depends on, and re-exports, all **Swim Toolkit**
  child frameworks and libraries.

### [**Swim UI** Framework](swim-ui-js)

The **Swim UI** framework implements a user interface toolkit for pervasively
real-time applications.  A unified view hierarchy, with builtin procedural
styling and animation, makes it easy for **Swim UI** components to uniformly
style, animate, and render mixed HTML, SVG, Canvas, and WebGL components.
**Swim UI** consists of the following component libraries:

- [**@swim/ui**](swim-ui-js/@swim/ui) –
  umbrella package that depends on, and re-exports, all **Swim UI** libraries.
- [**@swim/angle**](swim-ui-js/@swim/angle) –
  dimensional angle types with unit-aware algebraic operators, conversions,
  and parsers.
- [**@swim/length**](swim-ui-js/@swim/length) –
  DOM-relative length types with unit-aware algebraic operators, conversions,
  and parsers.
- [**@swim/color**](swim-ui-js/@swim/color) –
  RGB and HSL color types with color-space-aware operators, conversions,
  and parsers.
- [**@swim/font**](swim-ui-js/@swim/font) –
  CSS font property types and parsers.
- [**@swim/shadow**](swim-ui-js/@swim/shadow) –
  CSS box shadow types and parsers.
- [**@swim/transform**](swim-ui-js/@swim/transform) –
  CSS and SVG compatible transform types with unit-aware algebraic operators
  and parsers.
- [**@swim/scale**](swim-ui-js/@swim/scale) –
  scale types that map numeric and temporal input domains to interpolated
  output ranges, with support for continuous domain clamping, domain solving,
  range unscaling, and interpolation between scales.
- [**@swim/transition**](swim-ui-js/@swim/transition) –
  transition types that specify duration, ease, interpolator, and lifecycle
  callback parameters for tween animations.
- [**@swim/animate**](swim-ui-js/@swim/animate) –
  property-managing animator types that efficiently tween values between
  discrete state changes.
- [**@swim/style**](swim-ui-js/@swim/style) –
  CSS style types and universal style value parser.
- [**@swim/render**](swim-ui-js/@swim/render) –
  renderable graphic types for SVG/Canvas-compatible path drawing contexts,
  and Canvas-compatible rendering contexts.
- [**@swim/constraint**](swim-ui-js/@swim/constraint) –
  incremental solver for systems of linear layout constraints.
- [**@swim/view**](swim-ui-js/@swim/view) –
  unified HTML, SVG, and Canvas view hierarchy, with integrated controller
  architecture, animated procedural styling, and constraint-based layouts.
- [**@swim/shape**](swim-ui-js/@swim/shape) –
  canvas shape views, with animated geometry and style properties.
- [**@swim/typeset**](swim-ui-js/@swim/typeset) –
  canvas typesetting views, with animated text, layout, font, and style properties.
- [**@swim/gesture**](swim-ui-js/@swim/gesture) –
  multitouch gesture recognizers, with kinematic surface modeling.

### [**Swim UX** Framework](swim-ux-js)

The **Swim UX** framework implements a user interface framework for advanced
real-time applications.  **Swim UX** provides popovers, drawers, menus,
toolbars, controls, and other interactive application views and controllers.
**Swim UX** consists of the following component libraries:

- [**@swim/ux**](swim-ux-js/@swim/ux) –
  umbrella package that depends on, and re-exports, all **Swim UX** libraries.
- [**@swim/theme**](swim-ux-js/@swim/theme) –
  semantic looks and feels for mood-aware UX components.
- [**@swim/app**](swim-ux-js/@swim/app) –
  application model for coordinating window-level components, such as popovers
  and drawers.
- [**@swim/controls**](swim-ux-js/@swim/controls) –
  buttons, switches, sliders, and other user interface controls.
- [**@swim/navigation**](swim-ux-js/@swim/navigation) –
  menus, tree views, nav bars, tab bars, and other user interface navigation
  components.

### [**Swim Visualizations** Framework](swim-vis-js)

The **Swim Visualizations** framework implements seamlessly animated diagram
widgets, including gauges, pie charts, and line, area, and bubble charts.
**Swim Visualizations** consists of the following component libraries:

- [**@swim/vis**](swim-vis-js/@swim/vis) –
  umbrella package that depends on, and re-exports, all **Swim Visualizations** libraries.
- [**@swim/gauge**](swim-vis-js/@swim/gauge) –
  multi-dial, fully animatable, canvas rendered gauge widget.
- [**@swim/pie**](swim-vis-js/@swim/pie) –
  multi-slice, fully animatable, canvas rendered pie chart widget.
- [**@swim/chart**](swim-vis-js/@swim/chart) –
  multi-plot, fully animatable, canvas rendered chart widget, suppporting line,
  area, and bubble graphs, with customizeable axes, and kinematic multitouch
  scale gestures for panning and zooming with momentum.

### [**Swim Maps** Framework](swim-maps-js)

The **Swim Maps** framework implements real-time geospatial map overlays,
with support for Mapbox, Google, and Esri maps.  **Swim Maps** consists of
the following component libraries:

- [**@swim/maps**](swim-maps-js/@swim/maps) –
  umbrella package that depends on, and re-exports, all **Swim Maps** libraries.
- [**@swim/map**](swim-maps-js/@swim/map) –
  canvas views for efficiently rendering geospatially located map overlays,
  including fully animatable views for lines, circles, and polygons.
- [**@swim/mapbox**](swim-maps-js/@swim/mapbox) –
  support for overlaying **@swim/map** views on Mapbox maps.
- [**@swim/googlemap**](swim-maps-js/@swim/googlemap) –
  support for overlaying **@swim/map** views on Google maps.
- [**@swim/esrimap**](swim-maps-js/@swim/esrimap) –
  support for overlaying **@swim/map** views on ArcGIS maps.

### [**Swim Web** Framework](swim-web-js)

The **Swim Web** framework implements a thin web application framework built
on the **Swim UI** toolkit.  **Swim Web** consists of the following component
libraries:

- [**@swim/web**](swim-web-js/@swim/web) –
  umbrella package that depends on, and re-exports, all **Swim Web** libraries.
- [**@swim/website**](swim-web-js/@swim/website) –
  minimalist components that implement common dynamic website behaviors.
- [**@swim/webapp**](swim-web-js/@swim/webapp) –
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

Browser applications can load `swim-toolkit.js`, along with its `swim-system.js`
dependency, from the SwimOS CDN.  The `swim-toolkit.js` bundle supersedes
`swim-ui.js`, `swim-vis.js`, `swim-maps.js`, and `swim-web.js`—those scripts
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
ES6-compatible environments.  All child frameworks are re-exported by
the umbrella `@swim/toolkit` module.

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

When loaded by a web browser, the `swim-tookit.js` script adds all child
framework exports to the global `swim` namespace.  The `swim-toolkit.js` script
requires that either `swim-core.js` or `swim-system.js` has already been loaded.

## Development

### Setup

Install build dependencies:

```sh
swim-toolkit-js $ npm install
```

### Compiling sources

Use the `compile` build script command to compile, bundle, and minify
TypeScript sources into JavaScript universal module definitions, output
to the `dist` subdirectory of each project.  To compile all targets,
of all projects, run:

```sh
swim-toolkit-js $ bin/build.js compile
```

To compile a subset of projects and targets, include a `--projects` (`-p`)
option, with a comma-separated list of `$project:($target)?` specifiers.
For example, to build the `main` target of the `ui` project, and all
targets of the `vis` project, run:

```sh
swim-toolkit-js $ bin/build.js compile -p ui:main,vis
```

### Running tests

Use the `test` build script command to compile and run unit tests.
For example, to compile and test the `ui` project, run:

```sh
swim-toolkit-js $ bin/build.js test -p ui
```

### Continuous development builds

Use the `watch` build script command to automatically rebuild projects when
dependent source files change.  For example, to continuously recompile the
`main` target of the `maps` project when any source file in the project–or in
one of the project's transitive local dependencies–changes, run:

```sh
swim-toolkit-js $ bin/build.js watch -p maps:main
```

Pass the `--devel` (`-d`) option to expedite recompilation by skipping the
minification step.  Add the `--test` (`-t`) option to automatically run unit
tests after each successful compilation.  For example, to continuosly compile
and test the `ui` project, bypassing minification, and skipping generation of
the main script, run:

```sh
swim-toolkit-js $ bin/build.js watch -p ui:test -d -t
```

### Building documentation

```sh
swim-toolkit-js $ bin/build.js doc -p toolkit
```
