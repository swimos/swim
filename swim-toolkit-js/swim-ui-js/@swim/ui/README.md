# @swim/ui

[![package](https://img.shields.io/npm/v/@swim/ui.svg)](https://www.npmjs.com/package/@swim/ui)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](https://docs.swimos.org/js/latest/modules/_swim_ui.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

**@swim/ui** implements a user interface toolkit for pervasively real-time
applications.  A unified view hierarchy, with builtin procedural styling and
animation, makes it easy for **@swim/ui** components to uniformly style, animate,
and render mixed HTML, SVG, Canvas, and WebGL components.  **@swim/ui** is a
part of the [**@swim/toolkit**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/@swim/toolkit) framework.

## Framework

The **@swim/ui** umbrella package depends on, and re-exports, the following
component libraries:

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

**@swim/ui** builds on the [**@swim/core**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/core)
framework; it has no additional dependencies.

## Installation

### npm

For an npm-managed project, `npm install @swim/ui` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/ui/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/ui/lib/main`.  And a pre-built UMD script, which
bundles all **@swim/ui** component libraries, can be found in
`node_modules/@swim/ui/dist/main/swim-ui.js`.

### Browser

Browser applications can load `swim-ui.js`, along with its `swim-core.js`
dependency, from the SwimOS CDN.

```html
<!-- Development -->
<script src="https://cdn.swimos.org/js/latest/swim-core.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-ui.js"></script>

<!-- Production -->
<script src="https://cdn.swimos.org/js/latest/swim-core.min.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-ui.min.js"></script>
```

Alternatively, the `swim-toolkit.js` script may be loaded, along with its
`swim-system.js` dependency, from the SwimOS CDN.  The `swim-toolkit.js`
script bundles **@swim/ui** together with all other
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

**@swim/ui** can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.  All component libraries are re-exported by
the umbrella `@swim/ui` module.

```typescript
import * as swim from "@swim/ui";
```

### CommonJS

**@swim/ui** can also be used with CommonJS-compatible module systems.
All component libraries are re-exported by the umbrella `@swim/ui` module.

```javascript
var swim = require("@swim/ui");
```

### Browser

When loaded by a web browser, the `swim-ui.js` script adds all component
library exports to the global `swim` namespace.  The `swim-ui.js` script
requires that `swim-core.js` has already been loaded.

The `swim-toolkit.js` script also adds all **@swim/ui** component library
exports to the global `swim` namespace, making it a drop-in replacement
for `swim-ui.js` when additional **@swim/toolkit** frameworks are needed.
