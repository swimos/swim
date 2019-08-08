# @swim/system

[![package](https://img.shields.io/npm/v/@swim/system.svg)](https://www.npmjs.com/package/@swim/system)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](http://docs.swim.ai/js/latest)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://developer.swim.ai"><img src="https://cdn.swim.ai/images/marlin-blue.svg" align="left"></a>

The `@swim/system` umbrella framework encompasses the [`@swim/core`](https://www.npmjs.com/package/@swim/core)
foundation framework, the [`@swim/mesh`](https://www.npmjs.com/package/@swim/mesh)
multiplexed streaming WARP framework, the [`@swim/ui`](https://www.npmjs.com/package/@swim/ui)
and [`@swim/ux`](https://www.npmjs.com/package/@swim/ux) real-time user
interface toolkits, and the [`@swim/web`](https://www.npmjs.com/package/@swim/web)
real-time web application framework.  `@swim/system` is written in TypeScript,
but is designed to be used from either TypeScript or JavaScript.

## Frameworks

The `@swim/system` umbrella package depends on, and re-exports, the following
child frameworks:

- **`@swim/core`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js),
  [npm](https://www.npmjs.com/package/@swim/core)) –
  lightweight, portable, dependency-free foundation framework.
- **`@swim/mesh`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-mesh-js),
  [npm](https://www.npmjs.com/package/@swim/mesh)) –
  multiplexed streaming WARP framework.
- **`@swim/ui`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ui-js),
  [npm](https://www.npmjs.com/package/@swim/ui)) –
  real-time user interface toolkit.
- **`@swim/ux`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-ux-js),
  [npm](https://www.npmjs.com/package/@swim/ux)) –
  real-time user interface widgets.
- **`@swim/web`**
  ([github](https://github.com/swimos/swim/tree/master/swim-system-js/swim-web-js),
  [npm](https://www.npmjs.com/package/@swim/web)) –
  real-time web application framework.

Swim System has no external dependencies when run in a web browser,
and depends only on a WebSocket implementation when run in Node.js.

## Installation

### npm

For an npm-managed project, `npm install @swim/system` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/system/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/system/lib/main`.  And a pre-built UMD script, which
bundles all `@swim/system` child frameworks, can be found in
`node_modules/@swim/system/dist/main/swim-system.js`.

### Browser

Web applications can load `swim-system.js` directly from the Swim CDN.

```html
<script src="https://cdn.swim.ai/js/latest/swim-system.js"></script>
```

## Usage

### ES6/TypeScript

`@swim/system` can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.  All child frameworks are re-exported,
in their entirety, from the top-level `@swim/system` namespace.

```typescript
import * as swim from "@swim/system";
```

### CommonJS/Node.js

`@swim/system` can also be used as a CommonJS in Node.js applications.
All child frameworks are re-exported, in their entirety, from the
top-level `@swim/system` namespace.

```javascript
var swim = require("@swim/system");
```

### Browser

When loaded by a web browser, the `swim-system.js` script adds all child
framework exports to the global `swim` namespace.
