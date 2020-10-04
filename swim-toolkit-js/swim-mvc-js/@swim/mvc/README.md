# @swim/mvc

[![package](https://img.shields.io/npm/v/@swim/mvc.svg)](https://www.npmjs.com/package/@swim/mvc)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](https://docs.swimos.org/js/latest/modules/_swim_mvc.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

**@swim/mvc** implements a user interface framework for advanced real-time
applications.  **@swim/mvc** provides popovers, drawers, menus, toolbars,
controls, and other interactive application views and controllers.
**@swim/mvc** is a part of the broader
[**@swim/toolkit**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/@swim/toolkit) framework.

## Framework

The **@swim/mvc** umbrella package depends on, and re-exports, the following
component libraries:

- [**@swim/model**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-mvc-js/@swim/model)
  ([npm](https://www.npmjs.com/package/@swim/model),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_model.html)) –
  lifecycle-managed model hierarchy supporting dynamic scoping and service injection.
- [**@swim/component**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-mvc-js/@swim/component)
  ([npm](https://www.npmjs.com/package/@swim/component),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_component.html)) –
  componentized controller layer with application lifecycle and service management.

**@swim/mvc** builds on the [**@swim/core**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/core)
and [**@swim/ui**](https://github.com/swimos/swim/tree/master/swim-toolkit-js/swim-mvc-js/@swim/ui)
frameworks; it has no additional required dependencies.

## Installation

### npm

For an npm-managed project, `npm install @swim/mvc` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/mvc/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/mvc/lib/main`.  And a pre-built UMD script, which
bundles all **@swim/mvc** component libraries, can be found in
`node_modules/@swim/mvc/dist/main/swim-mvc.js`.

### Browser

Browser applications can load `swim-mvc.js`, along with its `swim-core.js`
and `swim-ui.js` dependencies, from the SwimOS CDN.

```html
<!-- Development -->
<script src="https://cdn.swimos.org/js/latest/swim-core.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-ui.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-mvc.js"></script>

<!-- Production -->
<script src="https://cdn.swimos.org/js/latest/swim-core.min.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-ui.min.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-mvc.min.js"></script>
```

Alternatively, the `swim-toolkit.js` script may be loaded, along with its
`swim-system.js` dependency, from the SwimOS CDN.  The `swim-toolkit.js`
script bundles **@swim/mvc** together with all other
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

**@swim/mvc** can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.  All component libraries are re-exported by
the umbrella `@swim/mvc` module.

```typescript
import * as swim from "@swim/mvc";
```

### CommonJS

**@swim/mvc** can also be used with CommonJS-compatible module systems.
All component libraries are re-exported by the umbrella `@swim/mvc` module.

```javascript
var swim = require("@swim/mvc");
```

### Browser

When loaded by a web browser, the `swim-mvc.js` script adds all component
library exports to the global `swim` namespace.  The `swim-mvc.js` script
requires that `swim-core.js` and `swim-ui.js` have already been loaded.

The `swim-toolkit.js` script also adds all **@swim/mvc** component library
exports to the global `swim` namespace, making it a drop-in replacement
for `swim-ui.js` and `swim-mvc.js` when additional **@swim/toolkit**
frameworks are needed.
