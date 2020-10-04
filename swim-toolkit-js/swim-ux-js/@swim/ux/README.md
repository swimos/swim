# @swim/ux

[![package](https://img.shields.io/npm/v/@swim/ux.svg)](https://www.npmjs.com/package/@swim/ux)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](https://docs.swimos.org/js/latest/modules/_swim_ux.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

**@swim/ux** implements a user interface framework for advanced real-time
applications.  **@swim/ux** provides popovers, drawers, menus, toolbars,
controls, and other interactive application views and controllers.
**@swim/ux** is a part of the broader
[**@swim/toolkit**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/@swim/toolkit) framework.

## Framework

The **@swim/ux** umbrella package depends on, and re-exports, the following
component libraries:

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

**@swim/ux** builds on the [**@swim/core**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/core)
and [**@swim/ui**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-ux-js/@swim/ui)
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
and `swim-ui.js` dependencies, from the SwimOS CDN.

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

Alternatively, the `swim-toolkit.js` script may be loaded, along with its
`swim-system.js` dependency, from the SwimOS CDN.  The `swim-toolkit.js`
script bundles **@swim/ux** together with all other
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

The `swim-toolkit.js` script also adds all **@swim/ux** component library
exports to the global `swim` namespace, making it a drop-in replacement
for `swim-ui.js` and `swim-ux.js` when additional **@swim/toolkit**
frameworks are needed.
