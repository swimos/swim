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

import java.util.NoSuchElementException;
import swim.annotations.CheckReturnValue;
import swim.annotations.Covariant;
import swim.annotations.NonNull;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * An {@link Output} that accepts UTF-8 code unit sequences and writes
 * decoded Unicode code points to a composed {@code output}, handling
 * invalid code unit sequences according to a {@link UtfErrorMode} policy.
 */
@Public
@Since("5.0")
public final class Utf8DecodedOutput<@Covariant T> extends Output<T> {

  final Output<T> output;
  final UtfErrorMode errorMode;
  int c1;
  int c2;
  int c3;
  int have;
  @Nullable OutputException error;

  Utf8DecodedOutput(Output<T> output, UtfErrorMode errorMode,
                    int c1, int c2, int c3, int have,
                    @Nullable OutputException error) {
    this.output = output;
    this.errorMode = errorMode;
    this.c1 = c1;
    this.c2 = c2;
    this.c3 = c3;
    this.have = have;
    this.error = error;
  }

  public Utf8DecodedOutput(Output<T> output, UtfErrorMode errorMode) {
    this(output, errorMode, -1, -1, -1, 0, null);
  }

  public Utf8DecodedOutput(Output<T> output) {
    this(output, UtfErrorMode.fatal());
  }

  @Override
  public boolean isCont() {
    return this.error == null && this.output.isCont();
  }

  @Override
  public boolean isFull() {
    return this.error == null && this.output.isFull();
  }

  @Override
  public boolean isDone() {
    return this.error == null && this.output.isDone();
  }

  @Override
  public boolean isError() {
    return this.error != null || this.output.isError();
  }

  @Override
  public boolean isLast() {
    return this.output.isLast();
  }

  @Override
  public Utf8DecodedOutput<T> asLast(boolean last) {
    this.output.asLast(last);
    return this;
  }

  @Override
  public Utf8DecodedOutput<T> write(int c) {
    if (this.error != null) {
      throw new IllegalStateException("output error", this.error);
    }

    int c1 = this.c1;
    int c2 = this.c2;
    int c3 = this.c3;
    int c4 = -1;
    int have = this.have;

    if (c >= 0) {
      switch (have) {
        case 0:
          c1 = c & 0xFF;
          have = 1;
          break;
        case 1:
          c2 = c & 0xFF;
          have = 2;
          break;
        case 2:
          c3 = c & 0xFF;
          have = 3;
          break;
        case 3:
          c4 = c & 0xFF;
          have = 4;
          break;
        default:
          throw new AssertionError("unreachable");
      }
    }

    if (c1 == 0 && this.errorMode.isNonZero()) { // invalid NUL byte
      this.error = new OutputException("unexpected NUL byte");
      return this;
    } else if (c1 >= 0 && c1 <= 0x7F) { // U+0000..U+007F
      this.output.write(c1);
      this.have = 0;
    } else if (c1 >= 0xC2 && c1 <= 0xF4) {
      if (c1 >= 0xC2 && c1 <= 0xDF && c2 >= 0x80 && c2 <= 0xBF) { // U+0080..U+07FF
        this.output.write((c1 & 0x1F) << 6 | (c2 & 0x3F));
        this.c1 = -1;
        this.have = 0;
      } else if ((c1 == 0xE0 && c2 >= 0xA0 && c2 <= 0xBF) // U+0800..U+0FFF
              || (c1 >= 0xE1 && c1 <= 0xEC && c2 >= 0x80 && c2 <= 0xBF) // U+1000..U+CFFF
              || (c1 == 0xED && c2 >= 0x80 && c2 <= 0x9F) // U+D000..U+D7FF
              || (c1 >= 0xEE && c1 <= 0xEF && c2 >= 0x80 && c2 <= 0xBF)) { // U+E000..U+FFFF
        if (c3 >= 0x80 && c3 <= 0xBF) {
          this.output.write((c1 & 0x0F) << 12 | (c2 & 0x3F) << 6 | (c3 & 0x3F));
          this.c1 = -1;
          this.c2 = -1;
          this.have = 0;
        } else if (c3 >= 0) { // invalid c3
          if (this.errorMode.isFatal()) {
            this.error = new OutputException(Utf8DecodedOutput.invalid(c1, c2, c3));
            return this;
          }
          this.output.write(this.errorMode.replacementChar());
          this.c1 = c3;
          this.c2 = -1;
          this.have = 1;
        } else if (c < 0 || this.output.isDone()) { // incomplete c3
          this.error = new OutputException(Utf8DecodedOutput.invalid(c1, c2));
          return this;
        } else { // awaiting c3
          this.c2 = c2;
          this.have = 2;
        }
      } else if ((c1 == 0xF0 && c2 >= 0x90 && c2 <= 0xBF) // U+10000..U+3FFFF
              || (c1 >= 0xF1 && c1 <= 0xF3 && c2 >= 0x80 && c2 <= 0xBF) // U+40000..U+FFFFF
              || (c1 == 0xF4 && c2 >= 0x80 && c2 <= 0x8F)) { // U+100000..U+10FFFF
        if (c3 >= 0x80 && c3 <= 0xBF) {
          if (c4 >= 0x80 && c4 <= 0xBF) {
            this.have = 4;
            this.output.write((c1 & 0x07) << 18 | (c2 & 0x3F) << 12 | (c3 & 0x3F) << 6 | (c4 & 0x3F));
            this.c1 = -1;
            this.c2 = -1;
            this.c3 = -1;
            this.have = 0;
          } else if (c4 >= 0) { // invalid c4
            if (this.errorMode.isFatal()) {
              this.error = new OutputException(Utf8DecodedOutput.invalid(c1, c2, c3, c4));
              return this;
            }
            this.output.write(this.errorMode.replacementChar());
            this.c1 = c4;
            this.c2 = -1;
            this.c3 = -1;
            this.have = 1;
          } else if (c < 0 || this.output.isDone()) { // incomplete c4
            this.error = new OutputException(Utf8DecodedOutput.invalid(c1, c2, c3));
            return this;
          } else { // awaiting c4
            this.c3 = c3;
            this.have = 3;
          }
        } else if (c3 >= 0) { // invalid c3
          if (this.errorMode.isFatal()) {
            this.error = new OutputException(Utf8DecodedOutput.invalid(c1, c2, c3));
            return this;
          }
          this.output.write(this.errorMode.replacementChar());
          this.c1 = c3;
          this.c2 = -1;
          this.have = 1;
        } else if (c < 0 || this.output.isDone()) { // incomplete c3
          this.error = new OutputException(Utf8DecodedOutput.invalid(c1, c2));
          return this;
        } else { // awaiting c3
          this.c2 = c2;
          this.have = 2;
        }
      } else if (c2 >= 0) { // invalid c2
        if (this.errorMode.isFatal()) {
          this.error = new OutputException(Utf8DecodedOutput.invalid(c1, c2));
          return this;
        }
        this.output.write(this.errorMode.replacementChar());
        this.c1 = c2;
        this.have = 1;
      } else if (c < 0 || this.output.isDone()) { // incomplete c2
        this.error = new OutputException(Utf8DecodedOutput.invalid(c1));
        return this;
      } else { // awaiting c2
        this.c1 = c1;
        this.have = 1;
      }
    } else if (c1 >= 0) { // invalid c1
      if (this.errorMode.isFatal()) {
        this.error = new OutputException(Utf8DecodedOutput.invalid(c1));
        return this;
      }
      this.output.write(this.errorMode.replacementChar());
      this.have = 0;
    }

    return this;
  }

  @CheckReturnValue
  @Override
  public @Nullable T get() throws OutputException {
    if (this.error == null) {
      if (this.have == 0) {
        return this.output.get();
      } else {
        return this.write(-1).get();
      }
    } else {
      throw this.error;
    }
  }

  @CheckReturnValue
  @Override
  public @NonNull T getNonNull() throws OutputException {
    if (this.error == null) {
      if (this.have == 0) {
        return this.output.getNonNull();
      } else {
        return this.write(-1).getNonNull();
      }
    } else {
      throw this.error;
    }
  }

  @CheckReturnValue
  @Override
  public @Nullable T getUnchecked() {
    if (this.error == null) {
      if (this.have == 0) {
        return this.output.getUnchecked();
      } else {
        return this.write(-1).getUnchecked();
      }
    } else {
      throw new NoSuchElementException("output error", this.error);
    }
  }

  @CheckReturnValue
  @Override
  public @NonNull T getNonNullUnchecked() {
    if (this.error == null) {
      if (this.have == 0) {
        return this.output.getNonNullUnchecked();
      } else {
        return this.write(-1).getNonNullUnchecked();
      }
    } else {
      throw new NoSuchElementException("output error", this.error);
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
  public Utf8DecodedOutput<T> clone() {
    return new Utf8DecodedOutput<T>(this.output.clone(), this.errorMode,
                                    this.c1, this.c2, this.c3,
                                    this.have, this.error);
  }

  static String invalid(int c1) {
    final StringOutput output = new StringOutput();
    output.append("invalid UTF-8 code unit: ");
    Base16.uppercase().writeIntLiteral(output, c1, 2).assertDone();
    return output.get();
  }

  static String invalid(int c1, int c2) {
    final StringOutput output = new StringOutput();
    output.append("invalid UTF-8 code unit sequence: ");
    Base16.uppercase().writeIntLiteral(output, c1, 2).assertDone();
    output.append(' ');
    Base16.uppercase().writeIntLiteral(output, c2, 2).assertDone();
    return output.get();
  }

  static String invalid(int c1, int c2, int c3) {
    final StringOutput output = new StringOutput();
    output.append("invalid UTF-8 code unit sequence: ");
    Base16.uppercase().writeIntLiteral(output, c1, 2).assertDone();
    output.append(' ');
    Base16.uppercase().writeIntLiteral(output, c2, 2).assertDone();
    output.append(' ');
    Base16.uppercase().writeIntLiteral(output, c3, 2).assertDone();
    return output.get();
  }

  static String invalid(int c1, int c2, int c3, int c4) {
    final StringOutput output = new StringOutput();
    output.append("invalid UTF-8 code unit sequence: ");
    Base16.uppercase().writeIntLiteral(output, c1, 2).assertDone();
    output.append(' ');
    Base16.uppercase().writeIntLiteral(output, c2, 2).assertDone();
    output.append(' ');
    Base16.uppercase().writeIntLiteral(output, c3, 2).assertDone();
    output.append(' ');
    Base16.uppercase().writeIntLiteral(output, c4, 2).assertDone();
    return output.get();
  }

}
