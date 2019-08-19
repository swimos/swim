# @swim/math

[![package](https://img.shields.io/npm/v/@swim/math.svg)](https://www.npmjs.com/package/@swim/math)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](https://docs.swimos.org/js/latest/modules/_swim_math.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

**@swim/math** implements common mathematical and geometric structures and
operators.  **@swim/math** implements vectors, points, lines, and shapes, with
standard algebraic and computational geometry operators, including containment
and intersection testing.  **@swim/math** is part of the
[**@swim/core**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/core)
framework.

## Overview

**@swim/math** defines standard types for linear and affine algebraic
structures and operators, as well as generic geometric shape interfaces.

### Shapes

The `Shape` interface provides a base type for geometric shapes that can be
containment and intersection tested.  The `Shape.fromAny` factory method
coerces plain JavaScript objects, of type `AnyShape`, to polymorphic `Shape`
instances.

```typescript
Shape.fromAny({x: 2, y: 3});
// PointR2.of(2, 3)

Shape.fromAny({x0: 0, y0: 1, x1: 1, y1: 0});
// SegmentR2.of(0, 1, 1, 0)

Shape.fromAny({xMin: 0, yMin: 0, xMax: 1, yMax: 1});
// BoxR2.of(0, 0, 1, 1)

Shape.fromAny({cx: 0, cy: 0, r: 1});
// CircleR2.of(0, 0, 1)
```

### 2D Real Space

The `R2Shape` base class extends `Shape` with 2D-specific operations.
`PointR2`, `SegmentR2`, `BoxR2`, and `CircleR2` make up the standard `R2Shape`
implementations.  `VectorR2` represents a vector in 2D real space.

```typescript
PointR2.of(2, 3).plus(VectorR2.of(1, -1));
// PointR2.of(3, 2)

PointR2.of(3, 2).minus(PointR2.of(2, 3));
// VectorR2.of(1, -1)

CircleR2.of(3, 3, 2).intersects(egmentR2.of(0, 0, 4, 4));
// true

CircleR2.of(3, 3, 2).contains(SegmentR2.of(0, 0, 4, 4));
// false

CircleR2.of(3, 3, 2).contains(SegmentR2.of(3, 3, 4, 4));
// true
```

`R2Function` represents a linear map, and `R2Operator` corresponds to an
invertible linear operator.

## Installation

### npm

For an npm-managed project, `npm install @swim/math` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/math/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/math/lib/main`.  And a pre-built UMD script can
be found in `node_modules/@swim/math/dist/main/swim-math.js`.

### Browser

Browser applications can load `swim-core.js`, which comes bundled with the
**@swim/math** library, directly from the swimOS CDN.

```html
<!-- Development -->
<script src="https://cdn.swimos.org/js/latest/swim-core.js"></script>

<!-- Production -->
<script src="https://cdn.swimos.org/js/latest/swim-core.min.js"></script>
```

Alternatively, the standalone `swim-system.js` script may be loaded
from the swimOS CDN, which bundles **@swim/math** together with all other
[**@swim/system**](https://github.com/swimos/swim/tree/master/swim-system-js/@swim/system)
libraries.

```html
<!-- Development -->
<script src="https://cdn.swimos.org/js/latest/swim-system.js"></script>

<!-- Production -->
<script src="https://cdn.swimos.org/js/latest/swim-system.min.js"></script>
```

## Usage

### ES6/TypeScript

**@swim/math** can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.

```typescript
import * as math from "@swim/math";
```

### CommonJS/Node.js

**@swim/math** can also be used as a CommonJS module in Node.js applications.

```javascript
var math = require("@swim/math");
```

### Browser

When loaded by a web browser, the `swim-core.js` script adds all
**@swim/math** library exports to the global `swim` namespace.

The `swim-system.js` script also adds all **@swim/math** library exports
to the global `swim` namespace, making it a drop-in replacement for
`swim-core.js` when additional **@swim/system** libraries are needed.
