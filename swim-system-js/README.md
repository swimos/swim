# Swim System TypeScript Implementation

[![package](https://img.shields.io/npm/v/@swim/system.svg)](https://www.npmjs.com/package/@swim/system)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](https://docs.swimos.org/js/latest)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

The **Swim System** TypeScript implementation provides a standalone set of
frameworks for building massively real-time streaming WARP clients and web user
interface applications.  **Swim System** encompasses the [**Swim Core**](swim-core-js)
foundation framework, the [**Swim Mesh**](swim-mesh-js) multiplexed streaming
WARP framework, the [**Swim UI**](swim-ui-js) and [**Swim UX**](swim-ux-js)
real-time user interface toolkits, and the [**Swim Web**](swim-web-js)
real-time web application framework.

## Umbrella Framework

The **Swim System** umbrella framework has no external dependencies when run
in a web browser, and depends only on a WebSocket implementation when run in
Node.js.  **Swim System** provides the following top-level libraries:

- [**@swim/system**](@swim/system) –
  umbrella package that depends on, and re-exports, all **Swim System**
  child frameworks and libraries.

### [**Swim Core** Framework](swim-core-js)

The **Swim Core** framework provides a lightweight, portable, dependency-free,
and strongly typed baseline on which to build higher level libraries.
**Swim Core** consists of the following component libraries:

- [**@swim/core**](swim-core-js/@swim/core) –
  umbrella package that depends on, and re-exports, all **Swim Core** libraries.
- [**@swim/util**](swim-core-js/@swim/util) –
  ordering, equality, and hashing; type conversions; iterators; builders;
  maps; caches; and assertions.
- [**@swim/codec**](swim-core-js/@swim/codec) –
  incremental I/O; functional parsers and writers; display, debug, and
  diagnostic formatters; and Unicode and binary codecs.
- [**@swim/args**](swim-core-js/@swim/args) –
  composable command line argument parser.
- [**@swim/unit**](swim-core-js/@swim/unit) –
  specializable unit testing framework.
- [**@swim/collections**](swim-core-js/@swim/collections) –
  immutable, structure sharing collections, including B-trees and S-trees
  (sequence trees).
- [**@swim/structure**](swim-core-js/@swim/structure) –
  generic structured data model, with support for selectors, expressions,
  and lambda functions.  Used as a common abstract syntax tree for Recon,
  JSON, XML, and other data languages.
- [**@swim/streamlet**](swim-core-js/@swim/streamlet) –
  stateful, streaming component model for application componets that
  continuously consume input state from streaming inlets, and continuously
  produce output state on streaming outlets.
- [**@swim/dataflow**](swim-core-js/@swim/dataflow) –
  compiler from **@swim/structure** expressions to live-updated data models.
- [**@swim/recon**](swim-core-js/@swim/recon) –
  object notation with attributes, like if JSON and XML had a baby.
- [**@swim/math**](swim-core-js/@swim/math) –
  mathematical and geometric structures and operators.
- [**@swim/time**](swim-core-js/@swim/time) –
  date-time, time zone, and time interval data types,
  with `strptime`/`strftime`-style parsers and formatters.
- [**@swim/uri**](swim-core-js/@swim/uri) –
  rich object model for working with Uniform Resource Identifiers and URI
  subcomponents, including an efficient and safe codec for parsing and
  writing compliant URI strings.

### [**Swim Mesh** Framework](swim-mesh-js)

The **Swim Mesh** framework implements a multiplexed streaming WARP client that
runs in both Node.js and web browsers.  **Swim Mesh** consists of the following
component libraries:

- [**@swim/mesh**](swim-mesh-js/@swim/mesh) –
  umbrella package that depends on, and re-exports, all **Swim Mesh** libraries.
- [**@swim/warp**](swim-mesh-js/@swim/warp) –
  WebSocket protocol for dynamically multiplexing large numbers of
  bidirectional links to streaming API endpoints, called lanes, of
  URI-addressed distributed objects, called nodes, that run stateful
  distributed processes, called Web Agents.
- [**@swim/client**](swim-mesh-js/@swim/client) –
  streaming API client for linking to lanes of stateful Web Agents using the
  WARP protocol, enabling massively real-time applications that continuously
  synchronize all shared states with ping latency.
- [**@swim/cli**](swim-mesh-js/@swim/cli) –
  command line client for linking to Web Agent lanes over the WARP protocol.

### [**Swim UI** Framework](swim-ui-js)

The **Swim UI** framework implements a massively real-time user interface
toolkit, with a unified view hierarchy for HTML, SVG, and Canvas components,
animated procedural styling, and constraint-based layouts.  **Swim UI**
consists of the following component libraries:

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
- [**@swim/transform**](swim-ui-js/@swim/transform) –
  CSS and SVG compatible transform types with unit-aware algebraic operators
  and parsers.
- [**@swim/interpolate**](swim-ui-js/@swim/interpolate) –
  interpolator types for blending between values, including numbers, dates,
  angles, lengths, colors, transforms, shapes, arrays, structures, and
  other interpolators.
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
- [**@swim/dom**](swim-ui-js/@swim/dom) –
  CustomEvent and ResizeObserver polyfills.
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

The **Swim UX** framework implements seamlessly animated user interface widgets,
including gauges, pie charts, line, area, and bubble charts, and geospatial map
overlays.  **Swim UX** consists of the following component libraries:

- [**@swim/ux**](swim-ux-js/@swim/ux) –
  umbrella package that depends on, and re-exports, all **Swim UX** libraries.
- [**@swim/gauge**](swim-ux-js/@swim/gauge) –
  multi-dial, fully animatable, canvas rendered gauge widget.
- [**@swim/pie**](swim-ux-js/@swim/pie) –
  multi-slice, fully animatable, canvas rendered pie chart widget.
- [**@swim/chart**](swim-ux-js/@swim/chart) –
  multi-plot, fully animatable, canvas rendered chart widget, suppporting line,
  area, and bubble graphs, with customizeable axes, and kinematic multitouch
  scale gestures for panning and zooming with momentum.
- [**@swim/map**](swim-ux-js/@swim/map) –
  canvas views for efficiently rendering geospatially located map overlays,
  including fully animatable views for lines, circles, and polygons.
- [**@swim/mapbox**](swim-ux-js/@swim/mapbox) –
  support for overlaying **@swim/map** views on Mapbox maps.
- [**@swim/googlemap**](swim-ux-js/@swim/googlemap) –
  support for overlaying **@swim/map** views on Google maps.
- [**@swim/esrimap**](swim-ux-js/@swim/esrimap) –
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

For an npm-managed project, `npm install @swim/system` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/system/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/system/lib/main`.  And a pre-built UMD script, which
bundles all **@swim/system** child frameworks, can be found in
`node_modules/@swim/system/dist/main/swim-system.js`.

### Browser

Browser applications can load `swim-system.js` directly from the swimOS CDN.
The `swim-system.js` bundle is self-contained; it supersedes `swim-core.js`,
`swim-mesh.js`, `swim-ui.js`, `swim-ux.js`, and `swim-web.js`—those scripts
need not be loaded when using `swim-system.js`.

```html
<!-- Development -->
<script src="https://cdn.swimos.org/js/latest/swim-system.js"></script>

<!-- Production -->
<script src="https://cdn.swimos.org/js/latest/swim-system.min.js"></script>
```

## Usage

### ES6/TypeScript

**@swim/system** can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.  All child frameworks are re-exported by
the umbrella `@swim/system` module.

```typescript
import * as swim from "@swim/system";
```

### CommonJS/Node.js

**@swim/system** can also be used as a CommonJS module in Node.js applications.
All child frameworks are re-exported by the umbrella `@swim/system` module.

```javascript
var swim = require("@swim/system");
```

### Browser

When loaded by a web browser, the `swim-system.js` script adds all child
framework exports to the global `swim` namespace.

## Development

### Setup

Install build dependencies:

```sh
swim-system-js $ npm install
```

### Compiling sources

Use the `compile` build script command to compile, bundle, and minify
TypeScript sources into JavaScript universal module definitions, output
to the `dist` subdirectory of each project.  To compile all targets,
of all projects, run:

```sh
swim-system-js $ bin/build.js compile
```

To compile a subset of projects and targets, include a `--projects` (`-p`)
option, with a comma-separated list of `$project:($target)?` specifiers.
For example, to build the `main` target of the `core` project, and all
targets of the `ui` project, run:

```sh
swim-system-js $ bin/build.js compile -p core:main,ui
```

### Running tests

Use the `test` build script command to compile and run unit tests.
For example, to compile and test the `ui` project, run:

```sh
swim-system-js $ bin/build.js test -p ui
```

### Continuous development builds

Use the `watch` build script command to automatically rebuild projects when
dependent source files change.  For example, to continuously recompile the
`main` target of the `ux` project when any source file in the project–or in
one of the project's transitive local dependencies–changes, run:

```sh
swim-system-js $ bin/build.js watch -p ux:main
```

Pass the `--devel` (`-d`) option to expedite recompilation by skipping the
minification step.  Add the `--test` (`-t`) option to automatically run unit
tests after each successful compilation.  For example, to continuosly compile
and test the `ui` project, bypassing minification, and skipping generation of
the main script, run:

```sh
swim-system-js $ bin/build.js watch -p ui:test -d -t
```

### Building documentation

```sh
swim-system-js $ bin/build.js doc -p system
```
