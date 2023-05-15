// Copyright 2015-2023 Swim.inc
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

package swim.codec;

import java.io.IOException;
import java.io.InputStream;

/**
 * UTF-8 {@link Input}/{@link Output} factory.
 */
public final class Utf8 {

  private Utf8() {
    // static
  }

  public static Input decodedInput(Input input, UtfErrorMode errorMode) {
    return new Utf8DecodedInput(input, errorMode);
  }

  public static Input decodedInput(Input input) {
    return new Utf8DecodedInput(input, UtfErrorMode.fatal());
  }

  public static Input decodedInput(String input, UtfErrorMode errorMode) {
    return new Utf8DecodedInput(Unicode.stringInput(input), errorMode);
  }

  public static Input decodedInput(String input) {
    return new Utf8DecodedInput(Unicode.stringInput(input), UtfErrorMode.fatal());
  }

  /**
   * Returns a new {@code Output} that accepts UTF-8 code unit sequences, and
   * writes decoded Unicode code points to the composed {@code output}, handling
   * invalid code unit sequences according to the {@code errorMode} policy.
   */
  public static <T> Output<T> decodedOutput(Output<T> output, UtfErrorMode errorMode) {
    return new Utf8DecodedOutput<T>(output, errorMode);
  }

  /**
   * Returns a new {@code Output} that accepts UTF-8 code unit sequences, and
   * writes decoded Unicode code points to the composed {@code output}, handling
   * invalid code unit sequences according to the {@link UtfErrorMode#fatal()}
   * policy.
   */
  public static <T> Output<T> decodedOutput(Output<T> output) {
    return new Utf8DecodedOutput<T>(output, UtfErrorMode.fatal());
  }

  /**
   * Returns a new {@code Output} that accepts UTF-8 code unit sequences, and
   * writes decoded Unicode code points to a growable {@code String}, handling
   * invalid code unit sequences according to the {@link UtfErrorMode#fatal()}
   * policy. The returned {@code Output} accepts an unbounded number of UTF-8
   * code units, remaining permanently in the <em>cont</em> state, and {@link
   * Output#bind() binds} a {@code String} containing all decoded code points.
   */
  public static Output<String> decodedString() {
    return Utf8.decodedOutput(Unicode.stringOutput());
  }

  public static <T> Output<T> encodedOutput(Output<T> output, UtfErrorMode errorMode) {
    return new Utf8EncodedOutput<T>(output, errorMode);
  }

  public static <T> Output<T> encodedOutput(Output<T> output) {
    return new Utf8EncodedOutput<T>(output, UtfErrorMode.fatal());
  }

  public static Parser<String> stringParser(StringBuilder builder, UtfErrorMode errorMode) {
    return new InputParser<String>(Utf8.decodedInput(Input.empty(), errorMode), Unicode.stringParser(builder));
  }

  public static Parser<String> stringParser(StringBuilder builder) {
    return new InputParser<String>(Utf8.decodedInput(Input.empty()), Unicode.stringParser(builder));
  }

  public static Parser<String> stringParser(UtfErrorMode errorMode) {
    return new InputParser<String>(Utf8.decodedInput(Input.empty(), errorMode), Unicode.stringParser());
  }

  public static Parser<String> stringParser() {
    return new InputParser<String>(Utf8.decodedInput(Input.empty()), Unicode.stringParser());
  }

  public static Parser<String> parseString(Input input, StringBuilder builder, UtfErrorMode errorMode) {
    return InputParser.parse(Utf8.decodedInput(input, errorMode), Unicode.stringParser(builder));
  }

  public static Parser<String> parseString(Input input, StringBuilder builder) {
    return InputParser.parse(Utf8.decodedInput(input), Unicode.stringParser(builder));
  }

  public static Parser<String> parseString(Input input, UtfErrorMode errorMode) {
    return InputParser.parse(Utf8.decodedInput(input, errorMode), Unicode.stringParser());
  }

  public static Parser<String> parseString(Input input) {
    return InputParser.parse(Utf8.decodedInput(input), Unicode.stringParser());
  }

  public static <I, O> Writer<I, O> stringWriter(O input, UtfErrorMode errorMode) {
    final Writer<I, O> writer = Unicode.stringWriter(input);
    return new OutputWriter<I, O>(Utf8.encodedOutput(Output.full(), errorMode), writer);
  }

  public static <I, O> Writer<I, O> stringWriter(O input) {
    final Writer<I, O> writer = Unicode.stringWriter(input);
    return new OutputWriter<I, O>(Utf8.encodedOutput(Output.full()), writer);
  }

  public static <O> Writer<?, O> writeString(Output<?> output, O input, UtfErrorMode errorMode) {
    return OutputWriter.write(Utf8.encodedOutput(output, errorMode), Unicode.stringWriter(input));
  }

  public static <O> Writer<?, O> writeString(Output<?> output, O input) {
    return OutputWriter.write(Utf8.encodedOutput(output), Unicode.stringWriter(input));
  }

  /**
   * Returns a new {@code Decoder} that writes decoded Unicode code points to
   * the given {@code output}, handling invalid code unit sequences according
   * to the {@code errorMode} policy.
   */
  public static <O> Decoder<O> outputDecoder(Output<O> output, UtfErrorMode errorMode) {
    return new OutputParser<O>(Utf8.decodedInput(Input.empty(), errorMode), output);
  }

  /**
   * Returns a new {@code Decoder} that writes decoded Unicode code points to
   * the given {@code output}, handling invalid code unit sequences according
   * to the {@link UtfErrorMode#fatal()} policy.
   */
  public static <O> Decoder<O> outputDecoder(Output<O> output) {
    return new OutputParser<O>(Utf8.decodedInput(Input.empty()), output);
  }

  /**
   * Writes the decoded Unicode code points of the {@code input} buffer to the
   * given {@code output}, returning a {@code Decoder} continuation that knows
   * how to decode subsequent input buffers. Handles invalid code unit
   * sequences according to the {@code errorMode} policy.
   */
  public static <O> Decoder<O> decodeOutput(InputBuffer input, Output<O> output, UtfErrorMode errorMode) {
    return OutputParser.parse(Utf8.decodedInput(input, errorMode), output);
  }

  /**
   * Writes the decoded Unicode code points of the {@code input} buffer to the
   * given {@code output}, returning a {@code Decoder} continuation that knows
   * how to decode subsequent input buffers. Handles invalid code unit
   * sequences according to the {@link UtfErrorMode#fatal()} policy.
   */
  public static <O> Decoder<O> decodeOutput(Input input, Output<O> output) {
    return OutputParser.parse(Utf8.decodedInput(input), output);
  }

  public static <O> Parser<O> decodedParser(Parser<O> parser, UtfErrorMode errorMode) {
    return new InputParser<O>(Utf8.decodedInput(Input.empty(), errorMode), parser);
  }

  public static <O> Parser<O> decodedParser(Parser<O> parser) {
    return new InputParser<O>(Utf8.decodedInput(Input.empty()), parser);
  }

  public static <O> Parser<O> parseDecoded(Input input, Parser<O> parser, UtfErrorMode errorMode) {
    return InputParser.parse(Utf8.decodedInput(input, errorMode), parser);
  }

  public static <O> Parser<O> parseDecoded(Input input, Parser<O> parser) {
    return InputParser.parse(Utf8.decodedInput(input), parser);
  }

  public static <I, O> Writer<I, O> encodedWriter(Writer<I, O> writer, UtfErrorMode errorMode) {
    return new OutputWriter<I, O>(Utf8.encodedOutput(Output.full(), errorMode), writer);
  }

  public static <I, O> Writer<I, O> encodedWriter(Writer<I, O> writer) {
    return new OutputWriter<I, O>(Utf8.encodedOutput(Output.full()), writer);
  }

  public static <I, O> Writer<I, O> writeEncoded(Output<?> output, Writer<I, O> writer, UtfErrorMode errorMode) {
    return OutputWriter.write(Utf8.encodedOutput(output, errorMode), writer);
  }

  public static <I, O> Writer<I, O> writeEncoded(Output<?> output, Writer<I, O> writer) {
    return OutputWriter.write(Utf8.encodedOutput(output), writer);
  }

  public static <O> Decoder<O> decode(InputStream input, Parser<O> parser) throws IOException {
    return Binary.decode(input, Utf8.decodedParser(parser));
  }

  public static <O> O read(InputStream input, Parser<O> parser) throws IOException {
    return Binary.read(input, Utf8.decodedParser(parser));
  }

  /**
   * Returns the number of bytes in the UTF-8 encoding of the Unicode code
   * point {@code c}, handling invalid code unit sequences according to the
   * {@code errorMode} policy. Returns the size of the {@link
   * UtfErrorMode#replacementChar()} for surrogates and invalid code points,
   * if {@link UtfErrorMode#isReplacement()} is `true`; otherwise returns `0`
   * for surrogates and invalid code points. Uses the two byte modified UTF-8
   * encoding of the NUL character ({@code U+0000}), if {@link
   * UtfErrorMode#isNonZero()} is `true`.
   */
  public static int sizeOf(int c, UtfErrorMode errorMode) {
    if (c == 0x0000 && errorMode.isNonZero()) { // Modified UTF-8
      return 2; // U+0000 encoded as 0xC0, 0x80
    } else if (c >= 0x0000 && c <= 0x007F) { // U+0000..U+007F
      return 1;
    } else if (c >= 0x0080 && c <= 0x07FF) { // U+0080..U+07FF
      return 2;
    } else if (c >= 0x0800 && c <= 0xFFFF) { // U+0800..U+FFFF
      return 3;
    } else if (c >= 0x10000 && c <= 0x10FFFF) { // U+10000..U+10FFFF
      return 4;
    } else { // surrogate or invalid code point
      if (errorMode.isReplacement()) {
        return Utf8.sizeOf(errorMode.replacementChar());
      } else {
        return 0;
      }
    }
  }

  /**
   * Returns the number of bytes in the UTF-8 encoding of the Unicode code
   * point {@code c}; returns the size of the Unicode replacement character
   * ({@code U+FFFD}) for surrogates and invalid code points.
   */
  public static int sizeOf(int c) {
    if (c >= 0x0000 && c <= 0x007F) { // U+0000..U+007F
      return 1;
    } else if (c >= 0x0080 && c <= 0x07FF) { // U+0080..U+07FF
      return 2;
    } else if (c >= 0x0800 && c <= 0xFFFF) { // U+08000..U+FFFF
      return 3;
    } else if (c >= 0x10000 && c <= 0x10FFFF) { // U+10000..U+10FFFF
      return 4;
    } else { // surrogate or invalid code point
      return 3;
    }
  }

  /**
   * Returns the number of bytes in the UTF-8 encoding the given {@code string},
   * handling invalid code unit sequences according to the {@code errorMode}
   * policy.
   */
  public static int sizeOf(String string, UtfErrorMode errorMode) {
    int size = 0;
    for (int i = 0, n = string.length(); i < n; i = string.offsetByCodePoints(i, 1)) {
      size += Utf8.sizeOf(string.codePointAt(i), errorMode);
    }
    return size;
  }

  /**
   * Returns the number of bytes in the UTF-8 encoding the given {@code string},
   * assuming the Unicode replacement character ({@code U+FFFD}) replaces
   * unpaired surrogates and invalid code points.
   */
  public static int sizeOf(String string) {
    int size = 0;
    for (int i = 0, n = string.length(); i < n; i = string.offsetByCodePoints(i, 1)) {
      size += Utf8.sizeOf(string.codePointAt(i));
    }
    return size;
  }

}
