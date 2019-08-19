# @swim/app

[![package](https://img.shields.io/npm/v/@swim/app.svg)](https://www.npmjs.com/package/@swim/app)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](https://docs.swimos.org/js/latest/modules/_swim_app.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

**@swim/app** implements a lightweight application loader that dynamically
instantiates views and controllers declared by `swim-` HTML attributes.
**@swim/app** is part of the
[**@swim/web**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-web-js/@swim/web) framework.

## Installation

### npm

For an npm-managed project, `npm install @swim/app` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/app/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/app/lib/main`.  And a pre-built UMD script can
be found in `node_modules/@swim/app/dist/main/swim-app.js`.

### Browser

Browser applications can load `swim-web.js`—which bundles the **@swim/app**
library—along with its `swim-core.js` and `swim-ui.js` dependencies, directly
from the Swim CDN.

```html
<script src="https://cdn.swimos.org/js/latest/swim-core.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-ui.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-web.js"></script>
```

Alternatively, the standalone `swim-system.js` script may be loaded
from the Swim CDN, which bundles **@swim/app** together with all other
[**@swim/system**](https://github.com/swimos/swim/tree/master/swim-system-js/@swim/system)
libraries.

```html
<script src="https://cdn.swimos.org/js/latest/swim-system.js"></script>
```

## Usage

### ES6/TypeScript

**@swim/app** can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.

```typescript
import * as app from "@swim/app";
```

### CommonJS/Node.js

**@swim/app** can also be used as a CommonJS module in Node.js applications.

```javascript
var app = require("@swim/app");
```

### Browser

When loaded by a web browser, the `swim-web.js` script adds all
**@swim/app** library exports to the global `swim` namespace.
The `swim-web.js` script requires that `swim-core.js` and `swim-ui.js`
have already been loaded.

The `swim-system.js` script also adds all **@swim/app** library exports
to the global `swim` namespace, making it a drop-in replacement for
'swim-core.js', `swim-ui.js`, and `swim-web.js` when additional
**@swim/system** libraries are needed.
