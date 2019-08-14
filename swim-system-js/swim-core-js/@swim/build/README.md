# @swim/build

[![package](https://img.shields.io/npm/v/@swim/build.svg)](https://www.npmjs.com/package/@swim/build)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](http://docs.swim.ai/js/latest/modules/_swim_build.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://developer.swim.ai"><img src="https://cdn.swim.ai/images/marlin-blue.svg" align="left"></a>

Swim build tool.<br><br><br><br>

## Overview

TODO

## Installation

### npm

For an npm-managed project, `npm install @swim/build` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/build/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/build/lib/main`.  And a pre-built UMD script can
be found in `node_modules/@swim/build/dist/main/swim-build.js`.

## Usage

### ES6/TypeScript

`@swim/build` can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.

```typescript
import * as build from "@swim/build";
```

### CommonJS/Node.js

`@swim/build` can also be used as a CommonJS module in Node.js applications.

```javascript
var build = require("@swim/build");
```
