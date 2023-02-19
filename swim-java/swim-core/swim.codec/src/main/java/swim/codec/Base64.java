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

import java.io.IOException;
import java.nio.ByteBuffer;
import swim.annotations.CheckReturnValue;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Notation;

/**
 * Base-64 (7-bit ASCII) encoding {@link Parse}/{@link Write} factory.
 */
@Public
@Since("5.0")
public abstract class Base64 {

  Base64() {
    // sealed
  }

  /**
   * Returns a 64 character string, where the character at index {@code i}
   * is the encoding of the base-64 digit {@code i}.
   */
  public abstract String alphabet();

  /**
   * Returns {@code true} if this base-64 encoding requires padding.
   */
  public abstract boolean isPadded();

  /**
   * Returns this {@code Base64} encoding with required padding,
   * if {@code isPadded} is {@code true}.
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
      final Notation notation = new Notation();
      notation.append("Invalid base-64 digit: ");
      notation.appendSourceCodePoint(c);
      throw new IllegalArgumentException(notation.toString());
    }
  }

  /**
   * Returns the Unicode code point of the base-64 digit that encodes the given
   * 7-bit quantity.
   */
  public char encodeDigit(int b) {
    return this.alphabet().charAt(b);
  }

  /**
   * Decodes the base-64 digits {@code c1}, {@code c2}, {@code c3},
   * and {@code c4}, and writes the 8 to 24 bit quantity they represent
   * to the given {@code output}.
   */
  public void writeQuantum(Output<?> output, int c1, int c2, int c3, int c4) {
    final int x = this.decodeDigit(c1);
    final int y = this.decodeDigit(c2);
    if (c3 != '=') {
      final int z = this.decodeDigit(c3);
      if (c4 != '=') {
        final int w = this.decodeDigit(c4);
        output.write((x << 2) | (y >>> 4));
        output.write((y << 4) | (z >>> 2));
        output.write((z << 6) | w);
      } else {
        output.write((x << 2) | (y >>> 4));
        output.write((y << 4) | (z >>> 2));
      }
    } else if (c4 == '=') {
      output.write((x << 2) | (y >>> 4));
    } else {
      throw new IllegalArgumentException("Improperly padded base-64");
    }
  }

  /**
   * Returns an {@link Output} that accepts base64-encoded characters
   * and writes decoded bytes to the given {@code output}.
   */
  public <T> Output<T> decodedOutput(Output<T> output) {
    return new Base64DecodedOutput<T>(this, output);
  }

  /**
   * Returns a {@code Parse} instance that decodes base-64 (7-bit ASCII)
   * encoded input, and writes the decoded bytes to {@code output}.
   */
  public <T> Parse<T> parser(Output<T> output) {
    return new ParseBase64<T>(this, output);
  }

  /**
   * Parses the base-64 (7-bit ASCII) encoded {@code input}, and writes the
   * decoded bytes to {@code output}, returning a {@code Parse} continuation
   * that knows how to parse any additional input.
   */
  public <T> Parse<T> parse(Input input, Output<T> output) {
    return ParseBase64.parse(input, this, output, 0, 0, 0, 1);
  }

  /**
   * Parses the base-64 (7-bit ASCII) encoded {@code input}, and writes the
   * decoded bytes to a growable array.
   */
  public Parse<byte[]> parseByteArray(Input input) {
    return ParseBase64.parse(input, this, new ByteArrayOutput(), 0, 0, 0, 1);
  }

  public Parse<byte[]> parseByteArray() {
    return new ParseBase64<byte[]>(this, new ByteArrayOutput());
  }

  /**
   * Parses the base-64 (t-bit ASCII) encoded {@code input}, and writes the
   * decoded bytes to a growable buffer.
   */
  public Parse<ByteBuffer> parseByteBuffer(Input input) {
    return ParseBase64.parse(input, this, new ByteBufferOutput(), 0, 0, 0, 1);
  }

  public Parse<ByteBuffer> parseByteBuffer() {
    return new ParseBase64<ByteBuffer>(this, new ByteBufferOutput());
  }

  /**
   * Writes the base-64 (7-bit ASCII) encoding of the {@code input} byte array
   * to the {@code output}.
   */
  public Write<?> writeByteArray(Output<?> output, byte[] input) {
    return WriteBase64.write(output, this, ByteBuffer.wrap(input), 0, input.length, 1);
  }

  /**
   * Returns a {@code Write} continuation that writes the base-64
   * (7-bit ASCII) encoding of the {@code input} byte array.
   */
  public Write<?> writeByteArray(byte[] input) {
    return new WriteBase64(this, ByteBuffer.wrap(input), 0, input.length, 1);
  }

  /**
   * Writes the base-64 (7-bit ASCII) encoding of the {@code input} byte buffer
   * to the {@code output}.
   */
  public Write<?> writeByteBuffer(Output<?> output, ByteBuffer input) {
    return WriteBase64.write(output, this, input, input.position(), input.limit(), 1);
  }

  /**
   * Returns a {@code Write} continuation that writes the base-64
   * (7-bit ASCII) encoding of the {@code input} byte buffer.
   */
  public Write<?> writeByteBuffer(ByteBuffer input) {
    return new WriteBase64(this, input, input.position(), input.limit(), 1);
  }

  private static final Base64 STANDARD = new Base64Standard(true);

  /**
   * Returns the {@code Base64} encoding with the standard alphabet.
   */
  public static Base64 standard() {
    return STANDARD;
  }

  private static final Base64 STANDARD_UNPADDED = new Base64Standard(false);

  static Base64 standardUnpadded() {
    return STANDARD_UNPADDED;
  }

  /**
   * Returns the {@code Base64} encoding with the standard alphabet,
   * and required padding, if {@code isPadded} is {@code true}.
   */
  public static Base64 standard(boolean isPadded) {
    if (isPadded) {
      return Base64.standard();
    } else {
      return Base64.standardUnpadded();
    }
  }

  private static final Base64 URL = new Base64Url(true);

  /**
   * Returns the {@code Base64} encoding with the url
   * and filename safe alphabet.
   */
  public static Base64 url() {
    return URL;
  }

  private static final Base64 URL_UNPADDED = new Base64Url(false);

  public static Base64 urlUnpadded() {
    return URL_UNPADDED;
  }

  /**
   * Returns the {@code Base64} encoding with the url and filename safe
   * alphabet, and required padding, if {@code isPadded} is {@code true}.
   */
  public static Base64 url(boolean isPadded) {
    if (isPadded) {
      return Base64.url();
    } else {
      return Base64.urlUnpadded();
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

  @Override
  public Base64 isPadded(boolean isPadded) {
    if (isPadded == this.isPadded) {
      return this;
    } else {
      return Base64.standard(isPadded);
    }
  }

  @Override
  public boolean isDigit(int c) {
    return (c >= '0' && c <= '9')
        || (c >= 'A' && c <= 'Z')
        || (c >= 'a' && c <= 'z')
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

  @Override
  public Base64 isPadded(boolean isPadded) {
    if (isPadded == this.isPadded) {
      return this;
    } else {
      return Base64.url(isPadded);
    }
  }

  @Override
  public boolean isDigit(int c) {
    return (c >= '0' && c <= '9')
        || (c >= 'A' && c <= 'Z')
        || (c >= 'a' && c <= 'z')
        || c == '-' || c == '_';
  }

}

/**
 * An {@link Output} that accepts base64-encoded characters
 * and writes decoded bytes to a composed {@code output}.
 */
final class Base64DecodedOutput<T> extends Output<T> {

  final Base64 base64;
  final Output<T> output;
  int p;
  int q;
  int r;
  int have;
  @Nullable IOException error;

  Base64DecodedOutput(Base64 base64, Output<T> output,
                      int p, int q, int r, int have,
                      @Nullable IOException error) {
    this.base64 = base64;
    this.output = output;
    this.p = p;
    this.q = q;
    this.r = r;
    this.have = have;
    this.error = error;
  }

  Base64DecodedOutput(Base64 base64, Output<T> output) {
    this(base64, output, 0, 0, 0, 0, null);
  }

  @Override
  public boolean isCont() {
    return this.have != -1 && this.output.isCont();
  }

  @Override
  public boolean isFull() {
    return this.have != -1 && this.output.isFull();
  }

  @Override
  public boolean isDone() {
    return (this.have == -1 && this.error == null) || this.output.isDone();
  }

  @Override
  public boolean isError() {
    return (this.have == -1 && this.error != null) || this.output.isError();
  }

  @Override
  public boolean isLast() {
    return this.output.isLast();
  }

  @Override
  public Base64DecodedOutput<T> asLast(boolean last) {
    this.output.asLast(last);
    return this;
  }

  @Override
  public Base64DecodedOutput<T> write(int c) {
    if (this.have == 0) {
      if (this.base64.isDigit(c)) {
        this.p = c;
        this.have = 1;
      } else if (c < 0) {
        this.have = -1;
        this.error = new IOException("Incomplete base64 quantum");
      } else {
        this.have = -1;
        this.error = new IOException(Base64DecodedOutput.invalidDigit(c));
      }
    } else if (this.have == 1) {
      if (this.base64.isDigit(c)) {
        this.q = c;
        this.have = 2;
      } else if (c < 0) {
        this.p = 0;
        this.have = -1;
        this.error = new IOException("Incomplete base64 quantum");
      } else {
        this.p = 0;
        this.have = -1;
        this.error = new IOException(Base64DecodedOutput.invalidDigit(c));
      }
    } else if (this.have == 2) {
      if (this.base64.isDigit(c)) {
        this.r = c;
        this.have = 3;
      } else if (c == '=') {
        this.r = '=';
        this.have = 3;
      } else if (c < 0) {
        if (!this.base64.isPadded()) {
          this.base64.writeQuantum(this.output, this.p, this.q, '=', '=');
          this.q = 0;
          this.p = 0;
          this.have = 0;
        } else {
          this.q = 0;
          this.p = 0;
          this.have = -1;
          this.error = new IOException("Incomplete base64 quantum");
        }
      } else {
        this.q = 0;
        this.p = 0;
        this.have = -1;
        this.error = new IOException(Base64DecodedOutput.invalidDigit(c));
      }
    } else if (this.have == 3) {
      if (this.r != '=') {
        if (this.base64.isDigit(c)) {
          this.base64.writeQuantum(this.output, this.p, this.q, this.r, c);
          this.r = 0;
          this.q = 0;
          this.p = 0;
          this.have = 0;
        } else if (c == '=') {
          this.base64.writeQuantum(this.output, this.p, this.q, this.r, '=');
          this.r = 0;
          this.q = 0;
          this.p = 0;
          this.have = -1;
        } else if (c < 0) {
          if (!this.base64.isPadded()) {
            this.base64.writeQuantum(this.output, this.p, this.q, this.r, '=');
            this.r = 0;
            this.q = 0;
            this.p = 0;
            this.have = -1;
          } else {
            this.r = 0;
            this.q = 0;
            this.p = 0;
            this.have = -1;
            this.error = new IOException("Incomplete base64 quantum");
          }
        } else {
          this.r = 0;
          this.q = 0;
          this.p = 0;
          this.have = -1;
          this.error = new IOException(Base64DecodedOutput.invalidDigit(c));
        }
      } else {
        if (c == '=') {
          this.base64.writeQuantum(this.output, this.p, this.q, '=', '=');
          this.r = 0;
          this.q = 0;
          this.p = 0;
          this.have = -1;
        } else if (c < 0) {
          this.r = 0;
          this.q = 0;
          this.p = 0;
          this.have = -1;
          this.error = new IOException("Incomplete base64 quantum");
        } else {
          this.r = 0;
          this.q = 0;
          this.p = 0;
          this.have = -1;
          this.error = new IOException(Base64DecodedOutput.invalidPadding(c));
        }
      }
    } else if (this.have == -1) {
      // done or error
    } else {
      throw new AssertionError(); // unreachable
    }

    return this;
  }

  @Override
  public @Nullable T get() {
    if (this.error == null) {
      if (this.have <= 0) {
        return this.output.get();
      } else {
        return this.write(-1).get();
      }
    } else {
      throw new IllegalStateException("Output error", this.error);
    }
  }

  @CheckReturnValue
  @Override
  public Throwable getError() {
    if (this.error != null) {
      return this.error;
    } else {
      return this.output.getError();
    }
  }

  @Override
  public Base64DecodedOutput<T> clone() {
    return new Base64DecodedOutput<T>(this.base64, this.output.clone(),
                                      this.p, this.q, this.r,
                                      this.have, this.error);
  }

  private static String invalidDigit(int c) {
    final Notation notation = new Notation();
    notation.append("Expected base64 digit, but found ");
    notation.appendSourceCodePoint(c);
    return notation.toString();
  }

  private static String invalidPadding(int c) {
    final Notation notation = new Notation();
    notation.append("Expected '=', but found ");
    notation.appendSourceCodePoint(c);
    return notation.toString();
  }

}

final class ParseBase64<T> extends Parse<T> {

  final Base64 base64;
  final Output<T> output;
  final int p;
  final int q;
  final int r;
  final int step;

  ParseBase64(Base64 base64, Output<T> output, int p, int q, int r, int step) {
    this.base64 = base64;
    this.output = output;
    this.p = p;
    this.q = q;
    this.r = r;
    this.step = step;
  }

  ParseBase64(Base64 base64, Output<T> output) {
    this(base64, output, 0, 0, 0, 1);
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseBase64.parse(input, this.base64, this.output.clone(),
                             this.p, this.q, this.r, this.step);
  }

  static <T> Parse<T> parse(Input input, Base64 base64, Output<T> output,
                            int p, int q, int r, int step) {
    int c;
    do {
      if (step == 1) {
        if (input.isCont()) {
          c = input.head();
          if (base64.isDigit(c)) {
            input.step();
            p = c;
            step = 2;
          } else {
            return Parse.done(output.get());
          }
        } else if (input.isDone()) {
          return Parse.done(output.get());
        }
      }
      if (step == 2) {
        if (input.isCont()) {
          c = input.head();
          if (base64.isDigit(c)) {
            input.step();
            q = c;
            step = 3;
          } else {
            return Parse.error(Diagnostic.expected("base64 digit", input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected("base64 digit", input));
        }
      }
      if (step == 3) {
        if (input.isCont()) {
          c = input.head();
          if (base64.isDigit(c)) {
            input.step();
            r = c;
            step = 4;
          } else if (c == '=') {
            input.step();
            r = '=';
            step = 5;
          } else if (!base64.isPadded()) {
            base64.writeQuantum(output, p, q, '=', '=');
            return Parse.done(output.get());
          } else {
            return Parse.error(Diagnostic.expected("base64 digit", input));
          }
        } else if (input.isDone()) {
          if (!base64.isPadded()) {
            base64.writeQuantum(output, p, q, '=', '=');
            return Parse.done(output.get());
          } else {
            return Parse.error(Diagnostic.expected("base64 digit", input));
          }
        }
      }
      if (step == 4) {
        if (input.isCont()) {
          c = input.head();
          if (base64.isDigit(c)) {
            input.step();
            base64.writeQuantum(output, p, q, r, c);
            r = 0;
            q = 0;
            p = 0;
            step = 1;
            continue;
          } else if (c == '=') {
            input.step();
            base64.writeQuantum(output, p, q, r, '=');
            return Parse.done(output.get());
          } else if (!base64.isPadded()) {
            base64.writeQuantum(output, p, q, r, '=');
            return Parse.done(output.get());
          } else {
            return Parse.error(Diagnostic.expected("base64 digit", input));
          }
        } else if (input.isDone()) {
          if (!base64.isPadded()) {
            base64.writeQuantum(output, p, q, r, '=');
            return Parse.done(output.get());
          } else {
            return Parse.error(Diagnostic.expected("base64 digit", input));
          }
        }
      } else if (step == 5) {
        if (input.isCont()) {
          c = input.head();
          if (c == '=') {
            input.step();
            base64.writeQuantum(output, p, q, r, c);
            return Parse.done(output.get());
          } else {
            return Parse.error(Diagnostic.expected('=', input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected('=', input));
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseBase64<T>(base64, output, p, q, r, step);
  }

}

final class WriteBase64 extends Write<Object> {

  final Base64 base64;
  final ByteBuffer input;
  final int index;
  final int limit;
  final int step;

  WriteBase64(Base64 base64, ByteBuffer input, int index, int limit, int step) {
    this.base64 = base64;
    this.input = input;
    this.index = index;
    this.limit = limit;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteBase64.write(output, this.base64, this.input,
                             this.index, this.limit, this.step);
  }

  static Write<Object> write(Output<?> output, Base64 base64, ByteBuffer input,
                             int index, int limit, int step) {
    while (index + 2 < limit && output.isCont()) {
      final int x = input.get(index) & 0xFF;
      final int y = input.get(index + 1) & 0xFF;
      final int z = input.get(index + 2) & 0xFF;
      if (step == 1 && output.isCont()) {
        output.write(base64.encodeDigit(x >>> 2));
        step = 2;
      }
      if (step == 2 && output.isCont()) {
        output.write(base64.encodeDigit(((x << 4) | (y >>> 4)) & 0x3F));
        step = 3;
      }
      if (step == 3 && output.isCont()) {
        output.write(base64.encodeDigit(((y << 2) | (z >>> 6)) & 0x3F));
        step = 4;
      }
      if (step == 4 && output.isCont()) {
        output.write(base64.encodeDigit(z & 0x3F));
        index += 3;
        step = 1;
      }
    }
    if (index + 1 < limit && output.isCont()) {
      final int x = input.get(index) & 0xFF;
      final int y = input.get(index + 1) & 0xFF;
      if (step == 1 && output.isCont()) {
        output.write(base64.encodeDigit(x >>> 2));
        step = 2;
      }
      if (step == 2 && output.isCont()) {
        output.write(base64.encodeDigit(((x << 4) | (y >>> 4)) & 0x3F));
        step = 3;
      }
      if (step == 3 && output.isCont()) {
        output.write(base64.encodeDigit((y << 2) & 0x3F));
        step = 4;
      }
      if (step == 4) {
        if (!base64.isPadded()) {
          index += 2;
        } else if (output.isCont()) {
          output.write('=');
          index += 2;
        }
      }
    } else if (index < limit && output.isCont()) {
      final int x = input.get(index) & 0xFF;
      if (step == 1 && output.isCont()) {
        output.write(base64.encodeDigit(x >>> 2));
        step = 2;
      }
      if (step == 2 && output.isCont()) {
        output.write(base64.encodeDigit((x << 4) & 0x3F));
        step = 3;
      }
      if (step == 3) {
        if (!base64.isPadded()) {
          index += 1;
        } else if (output.isCont()) {
          output.write('=');
          step = 4;
        }
      }
      if (step == 4 && output.isCont()) {
        output.write('=');
        index += 1;
      }
    }
    if (index == limit) {
      return Write.done();
    } else if (output.isDone()) {
      return Write.error(new WriteException("Truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteBase64(base64, input, index, limit, step);
  }

}
