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

import java.lang.reflect.Type;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class Text {

  private Text() {
    // static
  }

  static final MediaType TEXT_PLAIN = MediaType.of("text", "plain");

  static final MediaType TEXT_PLAIN_UTF8 = TEXT_PLAIN.withParam("charset", "utf-8");

  public static Format<String> stringCodec() {
    return StringCodec.INSTANCE;
  }

  public static Format<String> stringCodec(MediaType mediaType) {
    if (TEXT_PLAIN_UTF8.equals(mediaType)) {
      return StringCodec.INSTANCE;
    }
    return new StringCodec(mediaType, UtfErrorMode.fatal());
  }

  public static Format<String> stringCodec(UtfErrorMode errorMode) {
    if (errorMode == UtfErrorMode.fatal()) {
      return StringCodec.INSTANCE;
    }
    return new StringCodec(TEXT_PLAIN_UTF8, errorMode);
  }

  public static Format<String> stringCodec(MediaType mediaType, UtfErrorMode errorMode) {
    if (TEXT_PLAIN_UTF8.equals(mediaType) && errorMode == UtfErrorMode.fatal()) {
      return StringCodec.INSTANCE;
    }
    return new StringCodec(mediaType, errorMode);
  }

  public static MetaFormat metaCodec() {
    return TextMetaCodec.INSTANCE;
  }

  public static MetaFormat metaCodec(Format<String> stringCodec) {
    return new TextMetaCodec(stringCodec);
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

  public static Parse<String> parse(Input input, @Nullable StringBuilder output) {
    return ParseString.parse(input, output);
  }

  public static Parse<String> parse(Input input) {
    return ParseString.parse(input, null);
  }

  public static Parse<String> parse(@Nullable StringBuilder output) {
    return new ParseString(output);
  }

  public static Parse<String> parse() {
    return new ParseString(null);
  }

  public static Write<?> write(Output<?> output, @Nullable String value) {
    if (value == null) {
      return Write.done();
    }
    return WriteString.write(output, value, 0);
  }

  public static Write<?> write(@Nullable String value) {
    if (value == null) {
      return Write.done();
    }
    return new WriteString(value, 0);
  }

  public static Decode<String> decode(Input input) {
    return new Utf8DecodedInput(input, UtfErrorMode.fatal()).parseInto(new ParseString(null));
  }

  public static Decode<String> decode() {
    return new Utf8DecodedInput(BinaryInput.empty(), UtfErrorMode.fatal()).parseInto(new ParseString(null));
  }

  public static Encode<?> encode(Output<?> output, @Nullable String value) {
    if (value == null) {
      return Encode.done();
    }
    return new Utf8EncodedOutput<>(output, UtfErrorMode.fatal()).writeFrom(new WriteString(value, 0));
  }

  public static Encode<?> encode(@Nullable String value) {
    if (value == null) {
      return Encode.done();
    }
    return new Utf8EncodedOutput<>(BinaryOutput.full(), UtfErrorMode.fatal()).writeFrom(new WriteString(value, 0));
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

final class StringCodec implements Format<String>, WriteSource {

  final MediaType mediaType;

  final UtfErrorMode errorMode;

  StringCodec(MediaType mediaType, UtfErrorMode errorMode) {
    this.mediaType = mediaType;
    this.errorMode = errorMode;
  }

  @Override
  public MediaType mediaType() {
    return this.mediaType;
  }

  @Override
  public long sizeOf(@Nullable String value) {
    if (value == null) {
      return 0L;
    }
    return (long) Text.sizeOf(value, this.errorMode);
  }

  @Override
  public Decode<String> decode(InputBuffer input) {
    return new Utf8DecodedInput(input, this.errorMode).parseInto(new ParseString(null));
  }

  @Override
  public Encode<?> encode(OutputBuffer<?> output, @Nullable String value) {
    if (value == null) {
      return Encode.done();
    }
    return new Utf8EncodedOutput<>(output, this.errorMode).writeFrom(new WriteString(value, 0));
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
    if (value == null) {
      return Write.done();
    }
    return WriteString.write(output, value, 0);
  }

  @Override
  public Write<?> write(@Nullable String value) {
    if (value == null) {
      return Write.done();
    }
    return new WriteString(value, 0);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Text", "stringCodec");
    if (!this.mediaType.equals(Text.TEXT_PLAIN_UTF8)) {
      notation.appendArgument(this.mediaType);
    }
    if (!this.errorMode.equals(UtfErrorMode.fatal())) {
      notation.appendArgument(this.errorMode);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final StringCodec INSTANCE = new StringCodec(Text.TEXT_PLAIN_UTF8, UtfErrorMode.fatal());

}

final class TextMetaCodec implements MetaFormat, WriteSource {

  final Format<String> stringCodec;

  TextMetaCodec(Format<String> stringCodec) {
    this.stringCodec = stringCodec;
  }

  @Override
  public MediaType mediaType() {
    return this.stringCodec.mediaType();
  }

  @Override
  public <T> Format<T> getFormat(Type type) throws CodecException {
    if (type instanceof Class<?>) {
      final Class<?> classType = (Class<?>) type;
      if (classType.isAssignableFrom(String.class)) {
        return Assume.conforms(this.stringCodec);
      }
    }
    throw new CodecException("no codec for " + type);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Text", "stringCodec");
    if (!this.stringCodec.equals(StringCodec.INSTANCE)) {
      notation.appendArgument(this.stringCodec);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final TextMetaCodec INSTANCE = new TextMetaCodec(StringCodec.INSTANCE);

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

final class WriteString extends Write<Object> {

  final String input;
  final int index;

  WriteString(String input, int index) {
    this.input = input;
    this.index = index;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteString.write(output, this.input, this.index);
  }

  static Write<Object> write(Output<?> output, String input, int index) {
    while (index < input.length() && output.isCont()) {
      output.write(input.codePointAt(index));
      index = input.offsetByCodePoints(index, 1);
    }
    if (index == input.length()) {
      return Write.done();
    } else if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteString(input, index);
  }

}

final class ParseLine extends Parse<String> {

  final @Nullable StringBuilder builder;

  ParseLine(@Nullable StringBuilder builder) {
    this.builder = builder;
  }

  @Override
  public Parse<String> consume(Input input) {
    return ParseLine.parse(input, this.builder);
  }

  static Parse<String> parse(Input input, @Nullable StringBuilder builder) {
    if (builder == null) {
      builder = new StringBuilder();
    }
    while (input.isCont()) {
      final int c = input.head();
      input.step();
      if (c == '\r') {
        continue;
      } else if (c != '\n') {
        builder.appendCodePoint(c);
      } else {
        return Parse.done(builder.toString());
      }
    }
    if (input.isDone()) {
      return Parse.done(builder.toString());
    } else if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseLine(builder);
  }

}
