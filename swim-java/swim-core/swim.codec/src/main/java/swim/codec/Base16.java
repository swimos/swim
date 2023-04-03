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

import java.nio.ByteBuffer;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Notation;

/**
 * Base-16 (hexadecimal) encoding {@link Parse}/{@link Write} factory.
 */
@Public
@Since("5.0")
public final class Base16 {

  final String alphabet;

  Base16(String alphabet) {
    this.alphabet = alphabet;
  }

  /**
   * Returns a 16 character string, where the character at index {@code i}
   * is the encoding of the base-16 digit {@code i}.
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
   * Writes the base-16 (hexadecimal) encoding of the {@code input} byte array
   * to the {@code output}.
   */
  public Write<?> writeByteArray(Output<?> output, byte[] input) {
    return WriteBase16.write(output, this, ByteBuffer.wrap(input), 0, input.length, 1);
  }

  /**
   * Returns a {@code Write} continuation that writes the base-16
   * (hexadecimal) encoding of the {@code input} byte array.
   */
  public Write<?> writeByteArray(byte[] input) {
    return new WriteBase16(this, ByteBuffer.wrap(input), 0, input.length, 1);
  }

  /**
   * Writes the base-16 (hexadecimal) encoding of the {@code input} byte buffer
   * to the {@code output}.
   */
  public Write<?> writeByteBuffer(Output<?> output, ByteBuffer input) {
    return WriteBase16.write(output, this, input, input.position(), input.limit(), 1);
  }

  /**
   * Returns a {@code Write} continuation that writes the base-16
   * (hexadecimal) encoding of the {@code input} byte buffer.
   */
  public Write<?> writeByteBuffer(ByteBuffer input) {
    return new WriteBase16(this, input, input.position(), input.limit(), 1);
  }

  public Write<?> writeInt(Output<?> output, int input, int width) {
    return WriteBase16Integer.write(output, this, input & 0xFFFFFFFFL, width, 0, 3);
  }

  public Write<?> writeInt(Output<?> output, int input) {
    return WriteBase16Integer.write(output, this, input & 0xFFFFFFFFL, 0, 0, 3);
  }

  public Write<?> writeIntLiteral(Output<?> output, int input, int width) {
    return WriteBase16Integer.write(output, this, input & 0xFFFFFFFFL, width, 0, 1);
  }

  public Write<?> writeIntLiteral(Output<?> output, int input) {
    return WriteBase16Integer.write(output, this, input & 0xFFFFFFFFL, 0, 0, 1);
  }

  public Write<?> writeLong(Output<?> output, long input, int width) {
    return WriteBase16Integer.write(output, this, input, width, 0, 3);
  }

  public Write<?> writeLong(Output<?> output, long input) {
    return WriteBase16Integer.write(output, this, input, 0, 0, 3);
  }

  public Write<?> writeLongLiteral(Output<?> output, long input, int width) {
    return WriteBase16Integer.write(output, this, input, width, 0, 1);
  }

  public Write<?> writeLongLiteral(Output<?> output, long input) {
    return WriteBase16Integer.write(output, this, input, 0, 0, 1);
  }

  private static final Base16 LOWERCASE = new Base16("0123456789abcdef");

  /**
   * Returns the {@code Base16} encoding with lowercase alphanumeric digits.
   */
  public static Base16 lowercase() {
    return LOWERCASE;
  }

  private static final Base16 UPPERCASE = new Base16("0123456789ABCDEF");

  /**
   * Returns the {@code Base16} encoding with uppercase alphanumeric digits.
   */
  public static Base16 uppercase() {
    return UPPERCASE;
  }

  /**
   * Returns a {@code Parse} that decodes base-16 (hexadecimal) encoded input,
   * and writes the decoded bytes to {@code output}.
   */
  public static <T> Parse<T> parser(Output<T> output) {
    return new ParseBase16<T>(output, 0, 1);
  }

  /**
   * Parses the base-16 (hexadecimal) encoded {@code input}, and writes the
   * decoded bytes to {@code output}.
   */
  public static <T> Parse<T> parse(Input input, Output<T> output) {
    return ParseBase16.parse(input, output, 0, 1);
  }

  /**
   * Parses the base-16 (hexadecimal) encoded {@code input}, and writes the
   * decoded bytes to a growable array.
   */
  public static Parse<byte[]> parseByteArray(Input input) {
    return ParseBase16.parse(input, new ByteArrayOutput(), 0, 1);
  }

  public static Parse<byte[]> parseByteArray() {
    return new ParseBase16<byte[]>(new ByteArrayOutput(), 0, 1);
  }

  public static Parse<byte[]> parseByteArray(String string) {
    final StringInput input = new StringInput(string);
    return Base16.parseByteArray(input).complete(input);
  }

  /**
   * Parses the base-16 (hexadecimal) encoded {@code input}, and writes the
   * decoded bytes to a growable buffer.
   */
  public static Parse<ByteBuffer> parseByteBuffer(Input input) {
    return ParseBase16.parse(input, new ByteBufferOutput(), 0, 1);
  }

  public static Parse<ByteBuffer> parseByteBuffer() {
    return new ParseBase16<ByteBuffer>(new ByteBufferOutput(), 0, 1);
  }

  public static Parse<ByteBuffer> parseByteBuffer(String string) {
    final StringInput input = new StringInput(string);
    return Base16.parseByteBuffer(input).complete(input);
  }

  /**
   * Returns {@code true} if the Unicode code point {@code c} is a valid
   * base-16 digit.
   */
  public static boolean isDigit(int c) {
    return (c >= '0' && c <= '9')
        || (c >= 'A' && c <= 'F')
        || (c >= 'a' && c <= 'f');
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
      throw new IllegalArgumentException(Notation.of("invalid base-16 digit: ")
                                                 .appendSourceCodePoint(c)
                                                 .toString());
    }
  }

  /**s
   * Decodes the base-16 digits {@code c1} and {@code c2}, and writes
   * the 8-bit quantity they represent to the given {@code output}.
   */
  public static void writeQuantum(Output<?> output, int c1, int c2) {
    final int x = Base16.decodeDigit(c1);
    final int y = Base16.decodeDigit(c2);
    output.write(x << 4 | y);
  }

}

final class ParseBase16<T> extends Parse<T> {

  final Output<T> output;
  final int p;
  final int step;

  ParseBase16(Output<T> output, int p, int step) {
    this.output = output;
    this.p = p;
    this.step = step;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseBase16.parse(input, this.output.clone(), this.p, this.step);
  }

  static <T> Parse<T> parse(Input input, Output<T> output, int p, int step) {
    int c;
    do {
      if (step == 1) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          p = c;
          input.step();
          step = 2;
        } else if (input.isReady()) {
          try {
            return Parse.done(output.get());
          } catch (OutputException cause) {
            return Parse.diagnostic(input, cause);
          }
        }
      }
      if (step == 2) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          Base16.writeQuantum(output, p, c);
          p = 0;
          input.step();
          step = 1;
          continue;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("base-16 digit", input));
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseBase16<T>(output, p, step);
  }

}

final class WriteBase16 extends Write<Object> {

  final Base16 base16;
  final ByteBuffer input;
  final int index;
  final int limit;
  final int step;

  WriteBase16(Base16 base16, ByteBuffer input, int index, int limit, int step) {
    this.base16 = base16;
    this.input = input;
    this.index = index;
    this.limit = limit;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteBase16.write(output, this.base16, this.input,
                             this.index, this.limit, this.step);
  }

  static Write<Object> write(Output<?> output, Base16 base16, ByteBuffer input,
                             int index, int limit, int step) {
    while (index < limit) {
      final int x = input.get(index) & 0xFF;
      if (step == 1 && output.isCont()) {
        output.write(base16.encodeDigit(x >>> 4));
        step = 2;
      }
      if (step == 2 && output.isCont()) {
        output.write(base16.encodeDigit(x & 0x0F));
        index += 1;
        step = 1;
      }
    }
    if (index == limit) {
      return Write.done();
    } else if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteBase16(base16, input, index, limit, step);
  }

}

final class WriteBase16Integer extends Write<Object> {

  final Base16 base16;
  final long input;
  final int width;
  final int index;
  final int step;

  WriteBase16Integer(Base16 base16, long input, int width, int index, int step) {
    this.base16 = base16;
    this.input = input;
    this.width = width;
    this.index = index;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteBase16Integer.write(output, this.base16, this.input,
                                    this.width, this.index, this.step);
  }

  static Write<Object> write(Output<?> output, Base16 base16, long input,
                             int width, int index, int step) {
    if (step == 1 && output.isCont()) {
      output.write('0');
      step = 2;
    }
    if (step == 2 && output.isCont()) {
      output.write('x');
      step = 3;
    }
    if (step == 3 && output.isCont()) {
      if (input >= 0L && input < 16L && width <= 1) {
        output.write(base16.encodeDigit((int) input));
        return Write.done();
      } else {
        int i = 15;
        final int[] digits = new int[16];
        long x = input;
        while (x != 0L || i >= 16 - width) {
          digits[i] = (int) x & 0xF;
          x >>>= 4;
          i -= 1;
        }
        i += 1 + index;
        while (i < 16 && output.isCont()) {
          output.write(base16.encodeDigit(digits[i]));
          index += 1;
          i += 1;
        }
        if (i == 16) {
          return Write.done();
        }
      }
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteBase16Integer(base16, input, width, index, step);
  }

}
