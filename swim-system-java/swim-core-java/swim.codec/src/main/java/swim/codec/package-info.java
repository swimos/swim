// Copyright 2015-2019 SWIM.AI inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Incremental I/O; functional parsers and writers; display, debug, and
 * diagnostic formatters; and Unicode and binary codecs.  {@code swim.codec}
 * enables efficient, interruptible transcoding of network protocols and data
 * formats, without blocking or intermediate buffering.
 *
 * <h2>Inputs and Outputs</h2>
 *
 * <p>An {@link Input} reader abstracts over a non-blocking token input stream,
 * with single token lookahead.  An {@link Output} writer abstracts over a
 * non-blocking token output stream.</p>
 *
 * <h2>Parsers and Writers</h2>
 *
 * <p>A {@link Parser} incrementally reads from a sequence of {@link Input}
 * chunks to produce a parsed result.  A {@link Writer} incrementally writes
 * to a sequence of {@link Output} chunks.</p>
 *
 * <h2>Decoders and Encoders</h2>
 *
 * <p>A {@link Decoder} incrementally decodes a sequence of {@link InputBuffer
 * input buffers} to produce a decoded result.  An {@link Encoder}
 * incrementally encodes a value into a sequence of {@link OutputBuffer output
 * buffers}.</p>
 *
 * <h2>Binary codecs</h2>
 *
 * <p>The {@link Binary} factory has methods to create {@link Input} readers
 * that read bytes out of byte buffers, and methods to create {@link Output}
 * writers that write bytes into byte buffers.</p>
 *
 * <h2>Text codecs</h2>
 *
 * <p>The {@link Unicode} factory has methods to create {@link Input} readers
 * that read Unicode code points out of strings, and methods to create {@link
 * Output} writers that write Unicode code points into strings.</p>
 *
 * <p>The {@link Utf8} factory has methods to create {@link Input} readers
 * that decode Unicode code points out of UTF-8 encoded byte buffers, and
 * methods to create {@link Output} writers that encode Unicode code points
 * into UTF-8 encoded byte buffers.</p>
 *
 * <h2>Binary-Text codecs</h2>
 *
 * <p>The {@link Base10} factory has methods to create {@link Parser}s that
 * incrementally parse decimal formatted integers, and methods to create {@link
 * Writer}s that incrementally write decimal formatted integers.</p>
 *
 * <p>The {@link Base16} factory has methods to create {@link Parser}s that
 * incrementally decode hexadecimal encoded text input into byte buffers, and
 * methods to create {@link Writer}s that incrementally encode byte buffers to
 * hexadecimal encoded text output.</p>
 *
 * <p>The {@link Base64} factory has methods to create {@link Parser}s that
 * incrementally decode base-64 encoded text input into byte buffers, and
 * methods to create {@link Writer}s that incrementally encode byte buffers to
 * base-64 encoded text output.</p>
 *
 * <h2>Formatters</h2>
 *
 * <p>The {@link Display} interface provides a standard way for implementing
 * classes to directly output human readable display strings.  Similarly, the
 * {@link Debug} interface provides a standard way for implementing classes to
 * directly output developer readable debug strings.</p>
 *
 * <p>{@link Format} provides extension methods to output display and debug
 * strings for all types, including builtin Java types.  {@link OutputStyle}
 * provides helper functions to conditionally emit ASCII escape codes to
 * stylize text for console output.</p>
 *
 * <h2>Diagnostics</h2>
 *
 * <p>A {@link Tag} abstracts over a source input location.  A {@link Mark}
 * describes a source input position, and a {@link Span} describes a source
 * input range.  A {@link Diagnostic} attaches an informational message to a
 * source input location, and supports displaying the diagnostic as an
 * annotated snippet of the relevant source input.</p>
 */
package swim.codec;
