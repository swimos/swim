// Copyright 2015-2023 Nstream, inc.
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
 * Base-16 (hexadecimal) encoding {@link Parser}/{@link Writer} factory.
 */
public final class Base16 {

  final String alphabet;

  Base16(String alphabet) {
    this.alphabet = alphabet;
  }

  /**
   * Returns a 16 character string, where the character at index {@code i} is
   * the encoding of the base-16 digit {@code i}.
   */
  public String alphabet() {
    return this.alphabet;
  }

  /**
   * Returns the Unicode code point of the base-16 digit that encodes the given
   * 4-bit quantity.
   */
  public char encodeDigit(int b) {
    return this.alphabet.charAt(b);
  }

  /**
   * Returns a {@code Writer} that, when fed an input {@code byte[]} array,
   * returns a continuation that writes the base-16 (hexadecimal) encoding of
   * the input byte array.
   */
  @SuppressWarnings("unchecked")
  public Writer<byte[], ?> byteArrayWriter() {
    return (Writer<byte[], ?>) (Writer<?, ?>) new Base16Writer(this);
  }

  /**
   * Returns a {@code Writer} continuation that writes the base-16 (hexadecimal)
   * encoding of the {@code input} byte array.
   */
  @SuppressWarnings("unchecked")
  public Writer<?, byte[]> byteArrayWriter(byte[] input) {
    return (Writer<?, byte[]>) (Writer<?, ?>) new Base16Writer(this, input, input);
  }

  /**
   * Returns a {@code Writer} that, when fed an input {@code ByteBuffer},
   * returns a continuation that writes the base-16 (hexadecimal) encoding of
   * the input byte buffer.
   */
  @SuppressWarnings("unchecked")
  public Writer<ByteBuffer, ?> byteBufferWriter() {
    return (Writer<ByteBuffer, ?>) (Writer<?, ?>) new Base16Writer(this);
  }

  /**
   * Returns a {@code Writer} continuation that writes the base-16 (hexadecimal)
   * encoding of the {@code input} byte buffer.
   */
  @SuppressWarnings("unchecked")
  public Writer<?, ByteBuffer> byteBufferWriter(ByteBuffer input) {
    return (Writer<?, ByteBuffer>) (Writer<?, ?>) new Base16Writer(this, input, input);
  }

  /**
   * Writes the base-16 (hexadecimal) encoding of the {@code input} byte array
   * to the {@code output}, returning a {@code Writer} continuation that knows
   * how to write any remaining output that couldn't be immediately generated.
   */
  public Writer<?, ?> writeByteArray(Output<?> output, byte[] input) {
    return Base16Writer.write(output, this, null, input);
  }

  /**
   * Writes the base-16 (hexadecimal) encoding of the {@code input} byte buffer
   * to the {@code output}, returning a {@code Writer} continuation that knows
   * how to write any remaining output that couldn't be immediately generated.
   */
  public Writer<?, ?> writeByteBuffer(Output<?> output, ByteBuffer input) {
    return Base16Writer.write(output, this, null, input);
  }

  public Writer<?, ?> writeInt(Output<?> output, int input, int width) {
    return Base16IntegerWriter.write(output, this, null, input, width, false);
  }

  public Writer<?, ?> writeInt(Output<?> output, int input) {
    return Base16IntegerWriter.write(output, this, null, input, 0, false);
  }

  public Writer<?, ?> writeLong(Output<?> output, long input, int width) {
    return Base16IntegerWriter.write(output, this, null, input, width, false);
  }

  public Writer<?, ?> writeLong(Output<?> output, long input) {
    return Base16IntegerWriter.write(output, this, null, input, 0, false);
  }

  public Writer<?, ?> writeIntLiteral(Output<?> output, int input, int width) {
    return Base16IntegerWriter.write(output, this, null, input, width, true);
  }

  public Writer<?, ?> writeIntLiteral(Output<?> output, int input) {
    return Base16IntegerWriter.write(output, this, null, input, 0, true);
  }

  public Writer<?, ?> writeLongLiteral(Output<?> output, long input, int width) {
    return Base16IntegerWriter.write(output, this, null, input, width, true);
  }

  public Writer<?, ?> writeLongLiteral(Output<?> output, long input) {
    return Base16IntegerWriter.write(output, this, null, input, 0, true);
  }

  private static Base16 lowercase;
  private static Base16 uppercase;

  /**
   * Returns the {@code Base16} encoding with lowercase alphanumeric digits.
   */
  public static Base16 lowercase() {
    if (Base16.lowercase == null) {
      Base16.lowercase = new Base16("0123456789abcdef");
    }
    return Base16.lowercase;
  }

  /**
   * Returns the {@code Base16} encoding with uppercase alphanumeric digits.
   */
  public static Base16 uppercase() {
    if (Base16.uppercase == null) {
      Base16.uppercase = new Base16("0123456789ABCDEF");
    }
    return Base16.uppercase;
  }

  /**
   * Returns a {@code Parser} that decodes base-16 (hexadecimal) encoded input,
   * and writes the decoded bytes to {@code output}.
   */
  public static <O> Parser<O> parser(Output<O> output) {
    return new Base16Parser<O>(output);
  }

  /**
   * Parses the base-16 (hexadecimal) encoded {@code input}, and writes the
   * decoded bytes to {@code output}, returning a {@code Parser} continuation
   * that knows how to parse any additional input.
   */
  public static <O> Parser<O> parse(Input input, Output<O> output) {
    return Base16Parser.parse(input, output);
  }

  /**
   * Parses the base-16 (hexadecimal) encoded {@code input}, and writes the
   * decoded bytes to a growable array, returning a {@code Parser} continuation
   * that knows how to parse any additional input. The returned {@code Parser}
   * {@link Parser#bind() binds} a {@code byte[]} array containing all parsed
   * base-16 data.
   */
  public static Parser<byte[]> parseByteArray(Input input) {
    return Base16Parser.parse(input, Binary.byteArrayOutput());
  }

  /**
   * Parses the base-16 (hexadecimal) encoded {@code input}, and writes the
   * decoded bytes to a growable buffer, returning a {@code Parser} continuation
   * that knows how to parse any additional input. The returned {@code Parser}
   * {@link Parser#bind() binds} a {@code ByteBuffer} containing all parsed
   * base-16 data.
   */
  public static Parser<ByteBuffer> parseByteBuffer(Input input) {
    return Base16Parser.parse(input, Binary.byteBufferOutput());
  }

  /**
   * Returns {@code true} if the Unicode code point {@code c} is a valid
   * base-16 digit.
   */
  public static boolean isDigit(int c) {
    return c >= '0' && c <= '9'
        || c >= 'A' && c <= 'F'
        || c >= 'a' && c <= 'f';
  }

  /**
   * Returns the 4-bit quantity represented by the base-16 digit {@code c}.
   *
   * @throws IllegalArgumentException if {@code c} is not a valid base-16 digit.
   */
  public static int decodeDigit(int c) {
    if (c >= '0' && c <= '9') {
      return c - '0';
    } else if (c >= 'A' && c <= 'F') {
      return 10 + (c - 'A');
    } else if (c >= 'a' && c <= 'f') {
      return 10 + (c - 'a');
    } else {
      Output<String> message = Unicode.stringOutput();
      message = message.write("Invalid base-16 digit: ");
      message = Format.debugChar(message, c);
      throw new IllegalArgumentException(message.bind());
    }
  }

  /**s
   * Decodes the base-16 digits {@code c1} and {@code c2}, and writes the 8-bit
   * quantity they represent to the given {@code output}.
   *
   * @return the continuation of the {@code output}.
   */
  public static <T> Output<T> writeQuantum(Output<T> output, int c1, int c2) {
    final int x = Base16.decodeDigit(c1);
    final int y = Base16.decodeDigit(c2);
    output = output.write(x << 4 | y);
    return output;
  }

}
