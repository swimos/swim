# @swim/macro

[![package](https://img.shields.io/npm/v/@swim/macro.svg)](https://www.npmjs.com/package/@swim/macro)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](https://docs.swimos.org/js/latest/modules/_swim_macro.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

**@swim/macro** implements a Recon-base macro engine.  **@swim/macro** is part
of the [**@swim/core**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/core) framework.

## Installation

### npm

For an npm-managed project, `npm install @swim/macro` to
make it a dependency.  TypeScript sources will be installed into
`node_modules/@swim/macro/main`.  Transpiled JavaScript and TypeScript
definition files install into `node_modules/@swim/macro/lib/main`.
And a pre-built UMD script can be found in
`node_modules/@swim/macro/dist/main/swim-macro.js`.

### Browser

Browser applications can load `swim-macro.js`, along with its `swim-core.js`
dependency, directly from the SwimOS CDN.

```html
<!-- Development -->
<script src="https://cdn.swimos.org/js/latest/swim-core.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-macro.js"></script>

<!-- Production -->
<script src="https://cdn.swimos.org/js/latest/swim-core.min.js"></script>
<script src="https://cdn.swimos.org/js/latest/swim-macro.min.js"></script>
```

## Usage

### ES6/TypeScript

**@swim/macro** can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.

```typescript
import * as macro from "@swim/macro";
```

### CommonJS/Node.js

**@swim/macro** can also be used as a CommonJS module in Node.js applications.

```javascript
var macro = require("@swim/macro");
```

### Browser

When loaded by a web browser, the `swim-macro.js` script adds all
**@swim/macro** library exports to the global `swim` namespace.
