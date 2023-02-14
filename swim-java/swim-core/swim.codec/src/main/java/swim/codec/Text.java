// Copyright 2015-2022 Swim.inc
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

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Notation;
import swim.util.ToSource;

/**
 * Text transcoder.
 */
@Public
@Since("5.0")
public final class Text {

  private Text() {
    // static
  }

  static final MediaType TEXT_PLAIN = MediaType.create("text", "plain");

  static final TextTranscoder TRANSCODER = new TextTranscoder(TEXT_PLAIN, UtfErrorMode.fatal());

  public static Translator<String> transcoder() {
    return TRANSCODER;
  }

  public static Translator<String> transcoder(MediaType mediaType) {
    if (TEXT_PLAIN.equals(mediaType)) {
      return TRANSCODER;
    } else {
      return new TextTranscoder(mediaType, UtfErrorMode.fatal());
    }
  }

  public static Translator<String> transcoder(UtfErrorMode errorMode) {
    if (errorMode == UtfErrorMode.fatal()) {
      return TRANSCODER;
    } else {
      return new TextTranscoder(TEXT_PLAIN, errorMode);
    }
  }

  public static Translator<String> transcoder(MediaType mediaType, UtfErrorMode errorMode) {
    if (TEXT_PLAIN.equals(mediaType) && errorMode == UtfErrorMode.fatal()) {
      return TRANSCODER;
    } else {
      return new TextTranscoder(mediaType, errorMode);
    }
  }

  public static Parse<String> parseLine(Input input, @Nullable StringBuilder output) {
    return ParseLine.parse(input, output);
  }

  public static Parse<String> parseLine(Input input) {
    return ParseLine.parse(input, null);
  }

  public static Parse<String> parseLine(@Nullable StringBuilder output) {
    return new ParseLine(output);
  }

  public static Parse<String> parseLine() {
    return new ParseLine(null);
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
    } else if ((c >= 0x0800 && c <= 0xFFFF) // U+0800..U+D7FF
            || (c >= 0xE000 && c <= 0xFFFF)) { // U+E000..U+FFFF
      return 3;
    } else if (c >= 0x10000 && c <= 0x10FFFF) { // U+10000..U+10FFFF
      return 4;
    } else { // surrogate or invalid code point
      if (errorMode.isReplacement()) {
        return Text.sizeOf(errorMode.replacementChar());
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
    } else if ((c >= 0x0800 && c <= 0xFFFF) // U+0800..U+D7FF
            || (c >= 0xE000 && c <= 0xFFFF)) { // U+E000..U+FFFF
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
      size += Text.sizeOf(string.codePointAt(i), errorMode);
    }
    return size;
  }

}

final class TextTranscoder implements Translator<String>, ToSource {

  final MediaType mediaType;

  final UtfErrorMode errorMode;

  TextTranscoder(MediaType mediaType, UtfErrorMode errorMode) {
    this.mediaType = mediaType;
    this.errorMode = errorMode;
  }

  @Override
  public MediaType mediaType() {
    return this.mediaType;
  }

  @Override
  public long sizeOf(@Nullable String value) {
    if (value != null) {
      return (long) Text.sizeOf(value, this.errorMode);
    } else {
      return 0L;
    }
  }

  @Override
  public Decode<String> decode(InputBuffer input) {
    return new Utf8DecodedInput(input, this.errorMode).parseInto(new ParseString(null));
  }

  @Override
  public Encode<?> encode(OutputBuffer<?> output, @Nullable String value) {
    if (value != null) {
      return new Utf8EncodedOutput<>(output, this.errorMode).writeFrom(new WriteString<>(value, 0));
    } else {
      return Encode.done();
    }
  }

  @Override
  public Parse<String> parse(Input input) {
    return ParseString.parse(input, null);
  }

  @Override
  public Parse<String> parse() {
    return new ParseString(null);
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable String value) {
    if (value != null) {
      return WriteString.write(output, value, 0);
    } else {
      return Write.done();
    }
  }

  @Override
  public Write<?> write(@Nullable String value) {
    if (value != null) {
      return new WriteString<Object>(value, 0);
    } else {
      return Write.done();
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Text", "transcoder");
    if (!this.mediaType.equals(Text.TEXT_PLAIN)) {
      notation.appendArgument(this.mediaType);
    }
    if (!this.errorMode.equals(UtfErrorMode.fatal())) {
      notation.appendArgument(this.errorMode);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}

final class ParseString extends Parse<String> {

  final @Nullable StringBuilder builder;

  ParseString(@Nullable StringBuilder builder) {
    this.builder = builder;
  }

  @Override
  public Parse<String> consume(Input input) {
    return ParseString.parse(input, this.builder);
  }

  static Parse<String> parse(Input input, @Nullable StringBuilder builder) {
    if (builder == null) {
      builder = new StringBuilder();
    }
    while (input.isCont()) {
      builder.appendCodePoint(input.head());
      input.step();
    }
    if (input.isDone()) {
      return Parse.done(builder.toString());
    } else if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseString(builder);
  }

}

final class WriteString<T> extends Write<T> {

  final String input;
  final int index;

  WriteString(String input, int index) {
    this.input = input;
    this.index = index;
  }

  @Override
  public Write<T> produce(Output<?> output) {
    return WriteString.write(output, this.input, this.index);
  }

  static <T> Write<T> write(Output<?> output, String input, int index) {
    while (index < input.length() && output.isCont()) {
      output.write(input.codePointAt(index));
      index = input.offsetByCodePoints(index, 1);
    }
    if (index == input.length()) {
      return Write.done();
    } else if (output.isDone()) {
      return Write.error(new WriteException("Truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteString<T>(input, index);
  }

}

final class ParseLine extends Parse<String> {

  final @Nullable StringBuilder output;

  ParseLine(@Nullable StringBuilder output) {
    this.output = output;
  }

  @Override
  public Parse<String> consume(Input input) {
    return ParseLine.parse(input, this.output);
  }

  static Parse<String> parse(Input input, @Nullable StringBuilder output) {
    if (output == null) {
      output = new StringBuilder();
    }
    while (input.isCont()) {
      final int c = input.head();
      input.step();
      if (c == '\r') {
        continue;
      } else if (c != '\n') {
        output.appendCodePoint(c);
      } else {
        return Parse.done(output.toString());
      }
    }
    if (input.isDone()) {
      return Parse.done(output.toString());
    } else if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseLine(output);
  }

}
