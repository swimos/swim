# Swim Toolkit TypeScript Implementation

[![package](https://img.shields.io/npm/v/@swim/toolkit.svg)](https://www.npmjs.com/package/@swim/toolkit)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](https://docs.swimos.org/js/latest)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

The **Swim Toolkit** TypeScript implementation provides a set of frameworks for
building pervasively real-time user interface applications.  **Swim Toolkit**
incorporates the [**Swim UI**](swim-ui-js) real-time user interface toolkit,
the [**Swim UX**](swim-ux-js) real-time application framework,
the [**Swim Visualizations**](swim-vis-js) real-time visualizations framework,
and the [**Swim Maps**](swim-maps-js) real-time maps framework.

## Umbrella Framework

The **Swim Toolkit** umbrella framework builds on the
[**Swim Core**](https://github.com/swimos/swim/tree/master/swim-system-js/@swim/core)
framework, and provides the following top-level libraries:

- [**@swim/toolkit**](@swim/toolkit) –
  umbrella package that depends on, and re-exports, all **Swim Toolkit**
  child frameworks and libraries.

### [**Swim UI** Framework](swim-ui-js)

The **Swim UI** framework implements a user interface framework for pervasively
real-time applications.  A unified view hierarchy, with builtin procedural
styling and animation, makes it easy for **Swim UI** components to uniformly
style, animate, and render mixed HTML, SVG, Canvas, and WebGL components.
**Swim UI** consists of the following component libraries:

- [**@swim/ui**](swim-ui-js/@swim/ui) –
  umbrella package that depends on, and re-exports, all **Swim UI** libraries.
- [**@swim/model**](swim-ui-js/@swim/model) –
  lifecycle-managed model hierarchy supporting dynamic scoping and service injection.
- [**@swim/style**](swim-ui-js/@swim/style) –
  Font, color, gradient, shadow and related types and parsers.
- [**@swim/theme**](swim-ui-js/@swim/theme) –
  semantic looks and feels for mood-aware UX components.
- [**@swim/view**](swim-ui-js/@swim/view) –
  unified HTML, SVG, and Canvas view hierarchy, with integrated controller
  architecture, animated procedural styling, and constraint-based layouts.
- [**@swim/dom**](swim-ui-js/@swim/dom) –
  HTML and SVG views, with procedural attribute and style animators.
- [**@swim/graphics**](swim-ui-js/@swim/graphics) –
  canvas graphics views, with procedurally animated shapes, and procedurally
  styled typesetters.
- [**@swim/component**](swim-ui-js/@swim/component) –
  componentized controller layer with application lifecycle and service management.

### [**Swim UX** Framework](swim-ux-js)

The **Swim UX** framework implements a user interface toolkit for advanced
real-time applications.  **Swim UX** provides popovers, drawers, menus,
toolbars, controls, and other interactive application views and controllers.
**Swim UX** consists of the following component libraries:

- [**@swim/ux**](swim-ux-js/@swim/ux) –
  umbrella package that depends on, and re-exports, all **Swim UX** libraries.
- [**@swim/button**](swim-ux-js/@swim/button) –
  button-like user interface controls.
- [**@swim/token**](swim-ux-js/@swim/token) –
  attribute, action, and user input token views.
- [**@swim/grid**](swim-ux-js/@swim/grid) –
  tables, trees, lists, and other tabular views.
- [**@swim/window**](swim-ux-js/@swim/window) –
  popovers, drawers, and other view surfaces.
- [**@swim/deck**](swim-ux-js/@swim/deck) –
  card stack navigation views.

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
  graphics views for efficiently rendering animated geospatial map overlays.
- [**@swim/mapbox**](swim-maps-js/@swim/mapbox) –
  **@swim/map** overlays for Mapbox maps.
- [**@swim/leaflet**](swim-maps-js/@swim/leaflet) –
  **@swim/map** overlays for Leaflet maps.
- [**@swim/googlemap**](swim-maps-js/@swim/googlemap) –
  **@swim/map** overlays for Google maps.
- [**@swim/esrimap**](swim-maps-js/@swim/esrimap) –
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

When loaded by a web browser, the `swim-toolkit.js` script adds all child
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
