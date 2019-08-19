# @swim/web

[![package](https://img.shields.io/npm/v/@swim/web.svg)](https://www.npmjs.com/package/@swim/web)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](https://docs.swimos.org/js/latest/modules/_swim_web.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

**@swim/web** implements a thin web application framework built on the
**@swim/ui** toolkit.  **@swim/web** makes it easy to embed
[**@swim/ui**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/@swim/ui)
views and [**@swim/ux**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ux-js/@swim/ux)
widgets in any web page by simply adding special `swim-` attributes to ordinary
HTML elements.  **@swim/web** is a part of the broader
[**@swim/system**](https://github.com/swimos/swim/tree/master/swim-system-js/@swim/system) framework.

## Framework

The **@swim/web** umbrella package depends on, and re-exports, the following
component libraries:

- [**@swim/site**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-web-js/@swim/site)
  ([npm](https://www.npmjs.com/package/@swim/site),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_site.html)) –
  inimalist components that implement common dynamic website behaviors.
- [**@swim/app**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-web-js/@swim/app)
  ([npm](https://www.npmjs.com/package/@swim/app),
  [doc](https://docs.swimos.org/js/latest/modules/_swim_app.html)) –
  lightweight application loader that dynamically instantiates views and
  controllers declared by `swim-` HTML attributes.

**@swim/web** builds on the [**@swim/core**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/core)
and [**@swim/ui**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js/@swim/ui)
frameworks; it has no additional dependencies.

## Installation

### npm

For an npm-managed project, `npm install @swim/web` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/web/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/web/lib/main`.  And a pre-built UMD script, which
bundles all **@swim/web** component libraries, can be found in
`node_modules/@swim/web/dist/main/swim-web.js`.

### Browser

Browser applications can load `swim-web.js`, along with its `swim-core.js`
and `swim-ui.js` dependencies, from the swimOS CDN.

```html
<!-- Development -->
<script src="https://cdn.swimos.org/js/latest/swim-core.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-ui.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-web.js"></script>

<!-- Production -->
<script src="https://cdn.swimos.org/js/latest/swim-core.min.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-ui.min.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-web.min.js"></script>
```

Alternatively, the standalone `swim-system.js` script may be loaded
from the swimOS CDN, which bundles **@swim/web** together with all other
[**@swim/system**](https://github.com/swimos/swim/tree/master/swim-system-js/@swim/system)
frameworks.

```html
<!-- Development -->
<script src="https://cdn.swimos.org/js/latest/swim-system.js"></script>

<!-- Production -->
<script src="https://cdn.swimos.org/js/latest/swim-system.min.js"></script>
```

## Usage

### ES6/TypeScript

**@swim/web** can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.  All component libraries are re-exported by
the umbrella `@swim/web` module.

```typescript
import * as swim from "@swim/web";
```

### CommonJS

**@swim/web** can also be used with CommonJS-compatible module systems.
All component libraries are re-exported by the umbrella `@swim/web` module.

```javascript
var swim = require("@swim/web");
```

### Browser

When loaded by a web browser, the `swim-web.js` script adds all component
library exports to the global `swim` namespace.  The `swim-web.js` script
requires that `swim-core.js` and `swim-ui.js` have already been loaded.

The `swim-system.js` script also adds all **@swim/web** component library
exports to the global `swim` namespace, making it a drop-in replacement
for `swim-web.js` when additional **@swim/system** frameworks are needed.
