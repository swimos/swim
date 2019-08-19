# @swim/codec

[![package](https://img.shields.io/npm/v/@swim/codec.svg)](https://www.npmjs.com/package/@swim/codec)
[![documentation](https://img.shields.io/badge/doc-TypeDoc-blue.svg)](https://docs.swimos.org/js/latest/modules/_swim_codec.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

**@swim/codec** is an incremental I/O library, providing: functional parsers
and writers; display, debug, and diagnostic formatters; and Unicode and binary
codecs.  **@swim/codec** is written in TypeScript, but can be used from either
TypeScript or JavaScript.  **@swim/codec** is part of the
[**@swim/core**](https://github.com/swimos/swim/tree/master/swim-system-js/swim-core-js/@swim/core) framework.

## Overview

### Inputs and Outputs

An `Input` reader abstracts over a non-blocking token input stream, with single
token lookahead.  An `Output` writer abstracts over a non-blocking token output
stream.

### Parsers and Writers

A `Parser` incrementally reads from a sequence of `Input` chunks to produce a
parsed result.  A `Writer` incrementally writes to a sequence of `Output`
chunks.

### Binary codecs

The `Binary` factory has methods to create `Input` readers that read bytes out
of byte buffers, and methods to create `Output` writers that write bytes into
byte buffers.

### Text codecs

The `Unicode` factory has methods to create `Input` readers that read Unicode
code points out of strings, and methods to create `Output` writers that write
Unicode code points into strings.

The `Utf8` factory has methods to create `Input` readers that decode Unicode
code points out of UTF-8 encoded byte buffers, and methods to create `Output`
writers that encode Unicode code points into UTF-8 encoded byte buffers.

### Binary-Text codecs

The `Base10` factory has methods to create `Parser`s that incrementally parse
decimal formatted integers, and methods to create `Writer`s that incrementally
write decimal formatted integers.

The `Base16` factory has methods to create `Parser`s that incrementally decode
hexadecimal encoded text input into byte buffers, and methods to create
`Writer`s that incrementally encode byte buffers to hexadecimal encoded text
output.

The `Base64` factory has methods to create `Parser`s that incrementally decode
base-64 encoded text input into byte buffers, and methods to create `Writer`s
that incrementally encode byte buffers to base-64 encoded text output.

### Formatters

The `Display` interface provides a standard way for implementing classes to
directly output human readable display strings.  Similarly, the `Debug`
interface provides a standard way for implementing classes to directly output
developer readable debug strings.

`Format` provides extension methods to output display and debug strings for all
types, including builtin JavaScript types.  `OutputStyle` provides helper
functions to conditionally emit ASCII escape codes to stylize text for console
output.

### Diagnostics

A `Tag` abstracts over a source input location.  A `Mark` describes a source
input position, and a `Span` describes a source input range.  A `Diagnostic`
attaches an informational message to a source input location, and supports
displaying the diagnostic as an annotated snippet of the relevant source input.

## Installation

### npm

For an npm-managed project, `npm install @swim/codec` to make it a dependency.
TypeScript sources will be installed into `node_modules/@swim/codec/main`.
Transpiled JavaScript and TypeScript definition files install into
`node_modules/@swim/codec/lib/main`.  And a pre-built UMD script can
be found in `node_modules/@swim/codec/dist/main/swim-codec.js`.

### Browser

Browser applications can load `swim-core.js`, which comes bundled with the
**swim/codec** library, directly from the swimOS CDN.

```html
<!-- Development -->
<script src="https://cdn.swimos.org/js/latest/swim-core.js"></script>

<!-- Production -->
<script src="https://cdn.swimos.org/js/latest/swim-core.min.js"></script>
```

Alternatively, the standalone `swim-system.js` script may be loaded
from the swimOS CDN, which bundles **@swim/codec** together with all other
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

**@swim/codec** can be imported as an ES6 module from TypeScript and other
ES6-compatible environments.

```typescript
import * as codec from "@swim/codec";
```

### CommonJS/Node.js

**@swim/codec** can also be used as a CommonJS module in Node.js applications.

```javascript
var codec = require("@swim/codec");
```

### Browser

When loaded by a web browser, the `swim-core.js` script adds all
**@swim/codec** library exports to the global `swim` namespace.

The `swim-system.js` script also adds all **@swim/codec** library exports
to the global `swim` namespace, making it a drop-in replacement for
`swim-core.js` when additional **@swim/system** libraries are needed.
