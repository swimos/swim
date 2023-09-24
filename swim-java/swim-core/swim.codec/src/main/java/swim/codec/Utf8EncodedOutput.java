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
import java.util.NoSuchElementException;
import swim.annotations.CheckReturnValue;
import swim.annotations.NonNull;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

@Public
@Since("5.0")
public final class Utf8EncodedOutput<T> extends EncodedOutput<T> {

  Output<T> output;
  UtfErrorMode errorMode;
  int c2;
  int c3;
  int c4;
  int index;
  @Nullable OutputException error;

  Utf8EncodedOutput(Output<T> output, UtfErrorMode errorMode,
                    int c2, int c3, int c4, int index,
                    @Nullable OutputException error) {
    this.output = output;
    this.errorMode = errorMode;
    this.c2 = c2;
    this.c3 = c3;
    this.c4 = c4;
    this.index = index;
    this.error = error;
  }

  public Utf8EncodedOutput(Output<T> output, UtfErrorMode errorMode) {
    this(output, errorMode, 0, 0, 0, 4, null);
  }

  public Utf8EncodedOutput(Output<T> output) {
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
  public Utf8EncodedOutput<T> asLast(boolean last) {
    this.output.asLast(last);
    return this;
  }

  @Override
  public Utf8EncodedOutput<T> write(int c) {
    if (this.error != null) {
      throw new IllegalStateException("output error", this.error);
    }

    int c1 = 0;
    int c2 = this.c2;
    int c3 = this.c3;
    int c4 = this.c4;
    int index = this.index;
    while (index < 4) {
      if (this.output.isCont()) {
        switch (index) {
          case 1:
            this.output.write(c2);
            this.c2 = 0;
            break;
          case 2:
            this.output.write(c3);
            this.c3 = 0;
            break;
          case 3:
            this.output.write(c4);
            this.c4 = 0;
            break;
          default:
            throw new AssertionError("unreachable");
        }
        index += 1;
      } else {
        this.error = new OutputException("unable to flush buffered code units");
        return this;
      }
    }
    if (c >= 0 && c <= 0x7F) { // U+0000..U+007F
      c4 = c;
      index = 3;
    } else if (c >= 0x80 && c <= 0x7FF) { // U+0080..U+07FF
      c3 = 0xC0 | (c >>> 6);
      c4 = 0x80 | (c & 0x3F);
      index = 2;
    } else if ((c >= 0x0800 && c <= 0xFFFF) // U+0800..U+D7FF
            || (c >= 0xE000 && c <= 0xFFFF)) { // U+E000..U+FFFF
      c2 = 0xE0 | (c >>> 12);
      c3 = 0x80 | ((c >>> 6) & 0x3F);
      c4 = 0x80 | (c & 0x3F);
      index = 1;
    } else if (c >= 0x10000 && c <= 0x10FFFF) { // U+10000..U+10FFFF
      c1 = 0xF0 | (c >>> 18);
      c2 = 0x80 | ((c >>> 12) & 0x3F);
      c3 = 0x80 | ((c >>> 6) & 0x3F);
      c4 = 0x80 | (c & 0x3F);
      index = 0;
    } else { // surrogate or invalid code point
      if (this.errorMode.isFatal()) {
        this.error = new OutputException("invalid code point: U+" + Integer.toHexString(c));
        return this;
      } else {
        return this.write(this.errorMode.replacementChar());
      }
    }
    do {
      switch (index) {
        case 0:
          this.output.write(c1);
          break;
        case 1:
          this.output.write(c2);
          this.c2 = 0;
          break;
        case 2:
          this.output.write(c3);
          this.c3 = 0;
          break;
        case 3:
          this.output.write(c4);
          this.c4 = 0;
          break;
        default:
          throw new AssertionError("unreachable");
      }
      index += 1;
    } while (index < 4 && this.output.isCont());
    if (index < 4) {
      if (index < 3) {
        if (index < 2) {
          this.c2 = c2;
        }
        this.c3 = c3;
      }
      this.c4 = c4;
    }
    this.index = index;
    return this;
  }

  @Override
  public void flush() {
    int index = this.index;
    while (index < 4 && this.output.isCont()) {
      switch (index) {
        case 1:
          this.output.write(this.c2);
          this.c2 = 0;
          break;
        case 2:
          this.output.write(this.c3);
          this.c3 = 0;
          break;
        case 3:
          this.output.write(this.c4);
          this.c4 = 0;
          break;
        default:
          throw new AssertionError("unreachable");
      }
      index += 1;
    }
    this.index = index;
    this.output.flush();
  }

  @Override
  public Utf8EncodedOutput<T> resume(Output<T> output) {
    this.output = output;
    return this;
  }

  @CheckReturnValue
  @Override
  public @Nullable T get() throws OutputException {
    if (this.error == null) {
      return this.output.get();
    } else {
      throw this.error;
    }
  }

  @CheckReturnValue
  @Override
  public @NonNull T getNonNull() throws OutputException {
    if (this.error == null) {
      return this.output.getNonNull();
    } else {
      throw this.error;
    }
  }

  @CheckReturnValue
  @Override
  public @Nullable T getUnchecked() {
    if (this.error == null) {
      return this.output.getUnchecked();
    } else {
      throw new NoSuchElementException("output error", this.error);
    }
  }

  @CheckReturnValue
  @Override
  public @NonNull T getNonNullUnchecked() {
    if (this.error == null) {
      return this.output.getNonNullUnchecked();
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
  public Utf8EncodedOutput<T> clone() {
    return new Utf8EncodedOutput<T>(this.output.clone(), this.errorMode,
                                    this.c2, this.c3, this.c4,
                                    this.index, this.error);
  }

  static final Utf8EncodedOutput<ByteBuffer> FULL = new Utf8EncodedOutput<ByteBuffer>(BinaryOutput.full(), UtfErrorMode.fatal());

  public static Utf8EncodedOutput<ByteBuffer> full() {
    return FULL;
  }

  public static Utf8EncodedOutput<ByteBuffer> full(UtfErrorMode errorMode) {
    if (errorMode == UtfErrorMode.fatal()) {
      return FULL;
    } else {
      return new Utf8EncodedOutput<ByteBuffer>(BinaryOutput.full(), errorMode);
    }
  }

}
