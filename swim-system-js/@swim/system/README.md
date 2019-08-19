# @swim/system

[![package](https://img.shields.io/npm/v/@swim/system.svg)](https://www.npmjs.com/package/@swim/system)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](https://docs.swimos.org/js/latest)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

The **@swim/system** umbrella framework provides a standalone set of frameworks
for building massively real-time streaming WARP clients and web user interface
applications.  **@swim/system** encompasses the
[**@swim/core**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js)
foundation framework, the
[**@swim/mesh**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-mesh-js)
multiplexed streaming WARP framework, the
[**@swim/ui**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js)
and [**@swim/ux**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ux-js)
real-time user interface toolkits, and the
[**@swim/web**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-web-js)
real-time web application framework.

## **Umbrella Framework**

The **Swim System** umbrella framework has no external dependencies when run
in a web browser, and depends only on a WebSocket implementation when run in
Node.js.  **Swim System** provides the following top-level libraries:

- [**@swim/system**](https://github.com/swimos/swim/tree/js-readmes/swim-system-js/@swim/system)
  ([npm](https://www.npmjs.com/package/@swim/system),
  [doc](https://docs.swimos.org/js/latest)) –
  umbrella package that depends on, and re-exports, all **Swim System**
  child frameworks and libraries.

### [**Swim Core Framework**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js)

The **Swim Core** framework provides a lightweight, portable, dependency-free,
and strongly typed baseline on which to build higher level libraries.
**Swim Core** consists of the following component libraries:

- [**@swim/core**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/core)
  ([npm](https://www.npmjs.com/package/@swim/core),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_core.html)) –
  lightweight, portable, dependency-free foundation framework.
- [**@swim/util**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/util)
  ([npm](https://www.npmjs.com/package/@swim/util),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_util.html)) –
  ordering, equality, and hashing; type conversions; iterators; builders;
  maps; caches; and assertions.
- [**@swim/codec**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/codec)
  ([npm](https://www.npmjs.com/package/@swim/codec),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_codec.html)) –
  incremental I/O; functional parsers and writers; display, debug, and
  diagnostic formatters; and Unicode and binary codecs.
- [**@swim/collections**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/collections)
  ([npm](https://www.npmjs.com/package/@swim/collections),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_collections.html)) –
  immutable, structure sharing collections, including B-trees and S-trees
  (sequence trees).
- [**@swim/structure**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/structure)
  ([npm](https://www.npmjs.com/package/@swim/structure),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_structure.html)) –
  generic structured data model, with support for selectors, expressions,
  and lambda functions.  Used as a common abstract syntax tree for Recon,
  JSON, XML, and other data languages.
- [**@swim/streamlet**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/streamlet)
  ([npm](https://www.npmjs.com/package/@swim/streamlet),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_streamlet.html)) –
  stateful, streaming component model for application componets that
  continuously consume input state from streaming inlets, and continuously
  produce output state on streaming outlets.
- [**@swim/dataflow**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/dataflow)
  ([npm](https://www.npmjs.com/package/@swim/dataflow),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_dataflow.html)) –
  compiler from **@swim/structure** expressions to live-updated data models.
- [**@swim/recon**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/recon)
  ([npm](https://www.npmjs.com/package/@swim/recon),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_recon.html)) –
  object notation with attributes, like if JSON and XML had a baby.
- [**@swim/math**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/math)
  ([npm](https://www.npmjs.com/package/@swim/math),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_math.html)) –
  mathematical and geometric structures and operators.
- [**@swim/time**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/time)
  ([npm](https://www.npmjs.com/package/@swim/time),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_time.html)) –
  date-time, time zone, and time interval data types,
  with `strptime`/`strftime`-style parsers and formatters.
- [**@swim/uri**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/uri)
  ([npm](https://www.npmjs.com/package/@swim/uri),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_uri.html)) –
  rich object model for working with Uniform Resource Identifiers and URI
  subcomponents, including an efficient and safe codec for parsing and
  writing compliant URI strings.

### [**Swim Mesh Framework**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-mesh-js)

The **Swim Mesh** framework implements a multiplexed streaming WARP client that
runs in both Node.js and web browsers.  **Swim Mesh** consists of the following
component libraries:

- [**@swim/mesh**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-mesh-js/@swim/mesh)
  ([npm](https://www.npmjs.com/package/@swim/mesh),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_mesh.html)) –
  multiplexed streaming WARP framework that runs in Node.js and web browsers.
- [**@swim/warp**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-mesh-js/@swim/warp)
  ([npm](https://www.npmjs.com/package/@swim/warp),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_warp.html)) –
  WebSocket protocol for dynamically multiplexing large numbers of bidirectional
  links to streaming APIs, called lanes, of URI-addressed distributed objects,
  called nodes, that run stateful distributed processes, called Web Agents.
- [**@swim/client**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-mesh-js/@swim/client)
  ([npm](https://www.npmjs.com/package/@swim/client),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_client.html)) –
  streaming API client for linking to lanes of stateful Web Agents using the
  WARP protocol, enabling massively real-time applications that continuously
  synchronize all shared states with ping latency.

### [**Swim UI Framework**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js)

The **Swim UI** framework implements a massively real-time user interface
toolkit, with a unified view hierarchy for HTML, SVG, and Canvas components,
animated procedural styling, and constraint-based layouts.  **Swim UI**
consists of the following component libraries:

- [**@swim/ui**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/@swim/ui)
  ([npm](https://www.npmjs.com/package/@swim/ui),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_ui.html)) –
  massively real-time user interface toolkit, with a unified view hierarchy
  for HTML, SVG, and Canvas components, animated procedural styling, and
  constraint-based layouts.
- [**@swim/angle**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/@swim/angle)
  ([npm](https://www.npmjs.com/package/@swim/angle),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_angle.html)) –
  dimensional angle types with unit-aware algebraic operators, conversions,
  and parsers.
- [**@swim/length**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/@swim/length)
  ([npm](https://www.npmjs.com/package/@swim/length),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_length.html)) –
  DOM-relative length types with unit-aware algebraic operators, conversions,
  and parsers.
- [**@swim/color**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/@swim/color)
  ([npm](https://www.npmjs.com/package/@swim/color),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_color.html)) –
  RGB and HSL color types with color-space-aware operators, conversions,
  and parsers.
- [**@swim/font**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/@swim/font)
  ([npm](https://www.npmjs.com/package/@swim/font),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_font.html)) –
  CSS font property types and parsers.
- [**@swim/transform**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/@swim/transform)
  ([npm](https://www.npmjs.com/package/@swim/transform),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_transform.html)) –
  CSS and SVG compatible transform types with unit-aware algebraic operators
  and parsers.
- [**@swim/interpolate**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/@swim/interpolate)
  ([npm](https://www.npmjs.com/package/@swim/interpolate),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_interpolate.html)) –
  interpolator types for blending between values, such as numbers, dates,
  angles, lengths, colors, transforms, shapes, arrays, structures, and
  other interpolators.
- [**@swim/scale**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/@swim/scale)
  ([npm](https://www.npmjs.com/package/@swim/scale),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_scale.html)) –
  scale types that map numeric and temporal input domains to interpolated
  output ranges, with support for continuous domain clamping, domain solving,
  range unscaling, and interpolation between scales.
- [**@swim/transition**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/@swim/transition)
  ([npm](https://www.npmjs.com/package/@swim/transition),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_transition.html)) –
  transition types that specify duration, ease, interpolator, and lifecycle
  callback parameters for tween animations.
- [**@swim/animate**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/@swim/animate)
  ([npm](https://www.npmjs.com/package/@swim/animate),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_animate.html)) –
  property-managing animator types that efficiently tween values between
  discrete state changes.
- [**@swim/dom**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/@swim/dom)
  ([npm](https://www.npmjs.com/package/@swim/dom),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_dom.html)) –
  CustomEvent and ResizeObserver polyfills.
- [**@swim/style**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/@swim/style)
  ([npm](https://www.npmjs.com/package/@swim/style),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_style.html)) –
  CSS style types and universal style value parser.
- [**@swim/render**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/@swim/render)
  ([npm](https://www.npmjs.com/package/@swim/render),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_render.html)) –
  renderable graphic types for SVG and Canvas compatible path drawing contexts,
  and Canvas compatible rendering contexts.
- [**@swim/constraint**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/@swim/constraint)
  ([npm](https://www.npmjs.com/package/@swim/constraint),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_constraint.html)) –
  incremental solver for systems of linear layout constraints.
- [**@swim/view**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/@swim/view)
  ([npm](https://www.npmjs.com/package/@swim/view),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_view.html)) –
  unified HTML, SVG, and Canvas view hierarchy, with integrated controller
  architecture, animated procedural styling, and constraint-based layouts.
- [**@swim/shape**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/@swim/shape)
  ([npm](https://www.npmjs.com/package/@swim/shape),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_shape.html)) –
  canvas shape views, with animated geometry and style properties.
- [**@swim/typeset**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/@swim/typeset)
  ([npm](https://www.npmjs.com/package/@swim/typeset),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_typeset.html)) –
  canvas typesetting views, with animated text, layout, font, and style properties.
- [**@swim/gesture**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/@swim/gesture)
  ([npm](https://www.npmjs.com/package/@swim/gesture),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_gesture.html)) –
  multitouch gesture recognizers, with kinematic surface modeling.

### [**Swim UX Framework**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ux-js)

The **Swim UX** framework implements seamlessly animated user interface widgets,
including gauges, pie charts, line, area, and bubble charts, and geospatial map
overlays.  **Swim UX** consists of the following component libraries:

- [**@swim/ux**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ux-js/@swim/ux)
  ([npm](https://www.npmjs.com/package/@swim/ux),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_ux.html)) –
  seamlessly animated user interface widgets, including gauges, pie charts,
  line, area, and bubble charts, and geospatial map overlays.
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

### [**Swim Web Framework**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-web-js)

The **Swim Web** framework implements a thin web application framework built
on the **Swim UI** toolkit.  **Swim Web** consists of the following component
libraries:

- [**@swim/web**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-web-js/@swim/web)
  ([npm](https://www.npmjs.com/package/@swim/web),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_web.html)) –
  thin web application framework built on the **@swim/ui** toolkit.
- [**@swim/site**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-web-js/@swim/site)
  ([npm](https://www.npmjs.com/package/@swim/site),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_site.html)) –
  minimalist components that implement common dynamic website behaviors.
- [**@swim/app**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-web-js/@swim/app)
  ([npm](https://www.npmjs.com/package/@swim/app),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_app.html)) –
  lightweight application loader that dynamically instantiates views and
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
ES6-compatible environments.  All child framework libraries are re-exported
by the umbrella `@swim/system` module.

```typescript
import * as swim from "@swim/system";
```

### CommonJS/Node.js

**@swim/system** can also be used as a CommonJS module in Node.js applications.
All child framework libraries are re-exported by the umbrella `@swim/system`
module.

```javascript
var swim = require("@swim/system");
```

### Browser

When loaded by a web browser, the `swim-system.js` script adds all child
framework exports to the global `swim` namespace.
