# @swim/ui

[![package](https://img.shields.io/npm/v/@swim/ui.svg)](https://www.npmjs.com/package/@swim/ui)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](http://docs.swim.ai/js/latest/modules/_swim_ui.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://developer.swim.ai"><img src="https://cdn.swim.ai/images/marlin-blue.svg" align="left"></a>

`@swim/ui` implements a massively real-time user interface toolkit.  Procedural
styling, and a unified view hierarchy, make it easy to consistently animate—and
efficiently render—mixed HTML, SVG, and Canvas components, enabling uniform
tweening of everything from HTML attributes, to CSS styles, SVG and Canvas
drawings, and custom parameters.  `@swim/ui` is a part of the
[`@swim/system`](https://www.npmjs.com/package/@swim/system) framework.

## Libraries

The `@swim/ui` umbrella package depends on, and re-exports, the following
component libraries:

- **`@swim/angle`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/%40swim/angle),
  [npm](https://www.npmjs.com/package/@swim/angle),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_angle.html)) –
  dimensional angle types with unit-aware algebraic operators, conversions,
  and parsers.
- **`@swim/length`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/%40swim/length),
  [npm](https://www.npmjs.com/package/@swim/length),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_length.html)) –
  DOM-relative length types with unit-aware algebraic operators, conversions,
  and parsers.
- **`@swim/color`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/%40swim/color),
  [npm](https://www.npmjs.com/package/@swim/color),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_color.html)) –
  RGB and HSL color types with color-space-aware operators, conversions,
  and parsers.
- **`@swim/font`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/%40swim/font),
  [npm](https://www.npmjs.com/package/@swim/font),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_font.html)) –
  CSS font property types and parsers.
- **`@swim/transform`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/%40swim/transform),
  [npm](https://www.npmjs.com/package/@swim/transform),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_transform.html)) –
  CSS and SVG compatible transform types with unit-aware algebraic operators
  and parsers.
- **`@swim/interpolate`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/%40swim/interpolate),
  [npm](https://www.npmjs.com/package/@swim/interpolate),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_interpolate.html)) –
  interpolator types for blending between values, such as numbers, dates,
  angles, lengths, colors, transforms, shapes, arrays, structures, and
  other interpolators.
- **`@swim/scale`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/%40swim/scale),
  [npm](https://www.npmjs.com/package/@swim/scale),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_scale.html)) –
  scale types that map numeric and temporal input domains to interpolated
  output ranges, with support for continuous domain clamping, domain solving,
  range unscaling, and interpolation between scales.
- **`@swim/transition`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/%40swim/transition),
  [npm](https://www.npmjs.com/package/@swim/transition),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_transition.html)) –
  transition types that specify duration, ease, interpolator, and lifecycle
  callback parameters for tween animations.
- **`@swim/animate`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/%40swim/animate),
  [npm](https://www.npmjs.com/package/@swim/animate),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_animate.html)) –
  property-managing animator types that efficiently tween values between
  discrete state changes.
- **`@swim/dom`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/%40swim/dom),
  [npm](https://www.npmjs.com/package/@swim/dom),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_dom.html)) –
  CustomEvent and ResizeObserver polyfills.
- **`@swim/style`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/%40swim/style),
  [npm](https://www.npmjs.com/package/@swim/style),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_style.html)) –
  CSS style types and universal style value parser.
- **`@swim/render`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/%40swim/render),
  [npm](https://www.npmjs.com/package/@swim/render),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_render.html)) –
  renderable graphic types for SVG and Canvas compatible path drawing contexts,
  and Canvas compatible rendering contexts.
- **`@swim/constraint`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/%40swim/constraint),
  [npm](https://www.npmjs.com/package/@swim/constraint),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_constraint.html)) –
  incremental solver for systems of linear layout constraints.
- **`@swim/view`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/%40swim/view),
  [npm](https://www.npmjs.com/package/@swim/view),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_view.html)) –
  unified HTML, SVG, and Canvas view hierarchy, with integrated controller
  architecture, animated procedural styling, and constraint-based layouts.
- **`@swim/shape`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/%40swim/shape),
  [npm](https://www.npmjs.com/package/@swim/shape),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_shape.html)) –
  canvas shape views, with animated geometry and style properties.
- **`@swim/typeset`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/%40swim/typeset),
  [npm](https://www.npmjs.com/package/@swim/typeset),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_typeset.html)) –
  canvas typesetting views, with animated text, layout, font, and style properties.
- **`@swim/gesture`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/%40swim/gesture),
  [npm](https://www.npmjs.com/package/@swim/gesture),
  [typedoc](http://docs.swim.ai/js/latest/modules/_swim_gesture.html)) –
  multitouch gesture recognizers, with kinematic surface modeling.

`@swim/ui` builds on the [`@swim/core`](https://www.npmjs.com/package/@swim/core)
framework; it has no additional dependencies.

## Installation

### npm

For an npm-managed project, `npm install @swim/ui` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/ui/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/ui/lib/main`.  And a pre-built UMD script, which
bundles all `@swim/ui` component libraries, can be found in
`node_modules/@swim/ui/dist/main/swim-ui.js`.

### Browser

Browser applications can load `swim-ui.js`, along with its `swim-core.js`
dependency, from the Swim CDN.

```html
<script src="https://cdn.swim.ai/js/latest/swim-core.js"></script>
<script src="https://cdn.swim.ai/js/latest/swim-ui.js"></script>
```

Alternatively, the standalone `swim-system.js` script may be loaded
from the Swim CDN, which bundles `@swim/ui` along with all other
[`@swim/system`](https://www.npmjs.com/package/@swim/system) frameworks.

```html
<script src="https://cdn.swim.ai/js/latest/swim-system.js"></script>
```

## Usage

### ES6/TypeScript

`@swim/ui` can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.  All component libraries are re-exported,
in their entirety, from the top-level `@swim/ui` namespace.

```typescript
import * as swim from "@swim/ui";
```

### CommonJS

`@swim/ui` can also be used with CommonJS-compatible module systems.
All component libraries are re-exported, in their entirety, from the
top-level `@swim/ui` namespace.

```javascript
var swim = require("@swim/ui");
```

### Browser

When loaded by a web browser, the `swim-ui.js` script adds all component
library exports to the global `swim` namespace.  The `swim-ui.js` script
requires that `swim-core.js` has already been loaded.

The `swim-system.js` script also adds all `@swim/ui` component library
exports to the global `swim` namespace, making it a drop-in replacement
for `swim-ui.js` when additional `@swim/system` frameworks are needed.
