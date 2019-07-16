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

package swim.codec;

import java.nio.ByteBuffer;

/**
 * Base-64 (7-bit ASCII) encoding {@link Parser}/{@link Writer} factory.
 */
public abstract class Base64 {
  Base64() {
    // stub
  }

  /**
   * Returns a 64 character string, where the character at index {@code i} is
   * the encoding of the base-64 digit {@code i}.
   */
  public abstract String alphabet();

  /**
   * Returns {@code true} if this base-64 encoding requires padding.
   */
  public abstract boolean isPadded();

  /**
   * Returns this {@code Base64} encoding with required padding, if {@code
   * isPadded} is {@code true}.
   */
  public abstract Base64 isPadded(boolean isPadded);

  /**
   * Returns {@code true} if the Unicode code point {@code c} is a valid
   * base-64 digit.
   */
  public abstract boolean isDigit(int c);

  /**
   * Returns the 7-bit quantity represented by the base-64 digit {@code c}.
   *
   * @throws IllegalArgumentException if {@code c} is not a valid base-64 digit.
   */
  public int decodeDigit(int c) {
    if (c >= 'A' && c <= 'Z') {
      return c - 'A';
    } else if (c >= 'a' && c <= 'z') {
      return c + (26 - 'a');
    } else if (c >= '0' && c <= '9') {
      return c + (52 - '0');
    } else if (c == '+' || c == '-') {
      return 62;
    } else if (c == '/' || c == '_') {
      return 63;
    } else {
      final Output<String> message = Unicode.stringOutput();
      message.write("Invalid base-64 digit: ");
      Format.debugChar(c, message);
      throw new IllegalArgumentException(message.bind());
    }
  }

  /**
   * Returns the Unicode code point of the base-64 digit that encodes the given
   * 7-bit quantity.
   */
  public char encodeDigit(int b) {
    return alphabet().charAt(b);
  }

  /**
   * Decodes the base-64 digits {@code c1}, {@code c2}, {@code c3}, and {@code
   * c4}, and writes the 8 to 24 bit quantity they represent to the given
   * {@code output}.
   */
  public void writeQuantum(int c1, int c2, int c3, int c4, Output<?> output) {
    final int x = decodeDigit(c1);
    final int y = decodeDigit(c2);
    if (c3 != '=') {
      final int z = decodeDigit(c3);
      if (c4 != '=') {
        final int w = decodeDigit(c4);
        output.write((x << 2) | (y >>> 4));
        output.write((y << 4) | (z >>> 2));
        output.write((z << 6) | w);
      } else {
        output.write((x << 2) | (y >>> 4));
        output.write((y << 4) | (z >>> 2));
      }
    } else {
      if (c4 != '=') {
        throw new IllegalArgumentException("Improperly padded base-64");
      }
      output.write((x << 2) | (y >>> 4));
    }
  }

  /**
   * Returns a {@code Parser} that decodes base-64 (7-bit ASCII) encoded input,
   * and writes the decoded bytes to {@code output}.
   */
  public <O> Parser<O> parser(Output<O> output) {
    return new Base64Parser<O>(output, this);
  }

  /**
   * Parses the base-64 (7-bit ASCII) encoded {@code input}, and writes the
   * decoded bytes to {@code output}, returning a {@code Parser} continuation
   * that knows how to parse any additional input.
   */
  public <O> Parser<O> parse(Input input, Output<O> output) {
    return Base64Parser.parse(input, output, this);
  }

  /**
   * Parses the base-64 (7-bit ASCII) encoded {@code input}, and writes the
   * decoded bytes to a growable array, returning a {@code Parser} continuation
   * that knows how to parse any additional input.  The returned {@code Parser}
   * {@link Parser#bind() binds} a {@code byte[]} array containing all parsed
   * base-64 data.
   */
  public Parser<byte[]> parseByteArray(Input input) {
    return Base64Parser.parse(input, Binary.byteArrayOutput(), this);
  }

  /**
   * Parses the base-64 (t-bit ASCII) encoded {@code input}, and writes the
   * decoded bytes to a growable buffer, returning a {@code Parser} continuation
   * that knows how to parse any additional input.  The returned {@code Parser}
   * {@link Parser#bind() binds} a {@code ByteBuffer} containing all parsed
   * base-64 data.
   */
  public Parser<ByteBuffer> parseByteBuffer(Input input) {
    return Base64Parser.parse(input, Binary.byteBufferOutput(), this);
  }

  /**
   * Returns a {@code Writer} that, when fed an input {@code byte[]} array,
   * returns a continuation that writes the base-64 (7-bit ASCII) encoding of
   * the input byte array.
   */
  @SuppressWarnings("unchecked")
  public Writer<byte[], ?> byteArrayWriter() {
    return (Writer<byte[], ?>) (Writer<?, ?>) new Base64Writer(this);
  }

  /**
   * Returns a {@code Writer} continuation that writes the base-64 (7-bit ASCII)
   * encoding of the {@code input} byte array.
   */
  @SuppressWarnings("unchecked")
  public Writer<?, byte[]> byteArrayWriter(byte[] input) {
    return (Writer<?, byte[]>) (Writer<?, ?>) new Base64Writer(input, input, this);
  }

  /**
   * Returns a {@code Writer} that, when fed an input {@code ByteBuffer},
   * returns a continuation that writes the base-64 (7-bit ASCII) encoding of
   * the input byte buffer.
   */
  @SuppressWarnings("unchecked")
  public Writer<ByteBuffer, ?> byteBufferWriter() {
    return (Writer<ByteBuffer, ?>) (Writer<?, ?>) new Base64Writer(this);
  }

  /**
   * Returns a {@code Writer} continuation that writes the base-64 (7-bit ASCII)
   * encoding of the {@code input} byte buffer.
   */
  @SuppressWarnings("unchecked")
  public Writer<?, ByteBuffer> byteBufferWriter(ByteBuffer input) {
    return (Writer<?, ByteBuffer>) (Writer<?, ?>) new Base64Writer(input, input, this);
  }

  /**
   * Writes the base-64 (7-bit ASCII) encoding of the {@code input} byte array
   * to the {@code output}, returning a {@code Writer} continuation that knows
   * how to write any remaining output that couldn't be immediately generated.
   */
  public Writer<?, ?> writeByteArray(byte[] input, Output<?> output) {
    return Base64Writer.write(output, input, this);
  }

  /**
   * Writes the base-64 (7-bit ASCII) encoding of the {@code input} byte buffer
   * to the {@code output}, returning a {@code Writer} continuation that knows
   * how to write any remaining output that couldn't be immediately generated.
   */
  public Writer<?, ?> writeByteBuffer(ByteBuffer input, Output<?> output) {
    return Base64Writer.write(output, input, this);
  }

  private static Base64 standard;
  private static Base64 standardUnpadded;
  private static Base64 url;
  private static Base64 urlUnpadded;

  /**
   * Returns the {@code Base64} encoding with the standard alphabet.
   */
  public static Base64 standard() {
    if (standard == null) {
      standard = new Base64Standard(true);
    }
    return standard;
  }

  static Base64 standardUnpadded() {
    if (standardUnpadded == null) {
      standardUnpadded = new Base64Standard(false);
    }
    return standardUnpadded;
  }

  /**
   * Returns the {@code Base64} encoding with the standard alphabet, and
   * required padding, if {@code isPadded} is {@code true}.
   */
  public static Base64 standard(boolean isPadded) {
    if (isPadded) {
      return standard();
    } else {
      return standardUnpadded();
    }
  }

  /**
   * Returns the {@code Base64} encoding with the url and filename safe
   * alphabet.
   */
  public static Base64 url() {
    if (url == null) {
      url = new Base64Url(true);
    }
    return url;
  }

  public static Base64 urlUnpadded() {
    if (urlUnpadded == null) {
      urlUnpadded = new Base64Url(false);
    }
    return urlUnpadded;
  }

  /**
   * Returns the {@code Base64} encoding with the url and filename safe
   * alphabet, and required padding, if {@code isPadded} is {@code true}.
   */
  public static Base64 url(boolean isPadded) {
    if (isPadded) {
      return url();
    } else {
      return urlUnpadded();
    }
  }
}

final class Base64Standard extends Base64 {
  final boolean isPadded;

  Base64Standard(boolean isPadded) {
    this.isPadded = isPadded;
  }

  @Override
  public String alphabet() {
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  }

  @Override
  public boolean isPadded() {
    return this.isPadded;
  }

  public Base64 isPadded(boolean isPadded) {
    if (isPadded == this.isPadded) {
      return this;
    } else {
      return Base64.standard(isPadded);
    }
  }

  @Override
  public boolean isDigit(int c) {
    return c >= '0' && c <= '9'
        || c >= 'A' && c <= 'Z'
        || c >= 'a' && c <= 'z'
        || c == '+' || c == '/';
  }
}

final class Base64Url extends Base64 {
  final boolean isPadded;

  Base64Url(boolean isPadded) {
    this.isPadded = isPadded;
  }

  @Override
  public String alphabet() {
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  }

  @Override
  public boolean isPadded() {
    return this.isPadded;
  }

  public Base64 isPadded(boolean isPadded) {
    if (isPadded == this.isPadded) {
      return this;
    } else {
      return Base64.url(isPadded);
    }
  }

  @Override
  public boolean isDigit(int c) {
    return c >= '0' && c <= '9'
        || c >= 'A' && c <= 'Z'
        || c >= 'a' && c <= 'z'
        || c == '-' || c == '_';
  }
}
