# <a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/breach-marlin-blue-wide.svg"></a> Swim Codec Library

The Swim Codec library implements an incremental I/O engine, providing:

- functional parsers and writers
- display, debug, and diagnostic formatters
- Unicode and binary codecs

## Overview

### Inputs and Outputs

An `Input` reader abstracts over a non-blocking token input stream, with single
token lookahead. An `Output` writer abstracts over a non-blocking token output
stream.

### Parsers and Writers

A `Parser` incrementally reads from a sequence of `Input` chunks to produce a
parsed result. A `Writer` incrementally writes to a sequence of `Output`
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

### Binary formats

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
directly output human readable display strings. Similarly, the `Debug`
interface provides a standard way for implementing classes to directly output
developer readable debug strings.

`Format` provides extension methods to output display and debug strings for all
types, including builtin JavaScript types. `OutputStyle` provides helper
functions to conditionally emit ASCII escape codes to stylize text for console
output.

### Diagnostics

A `Tag` abstracts over a source input location. A `Mark` describes a source
input position, and a `Span` describes a source input range. A `Diagnostic`
attaches an informational message to a source input location, and supports
displaying the diagnostic as an annotated snippet of the relevant source input.
