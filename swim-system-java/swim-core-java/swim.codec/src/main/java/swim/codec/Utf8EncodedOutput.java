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

final class Utf8EncodedOutput<T> extends Output<T> {
  Output<T> output;
  UtfErrorMode errorMode;
  int c2;
  int c3;
  int c4;
  int index;

  Utf8EncodedOutput(Output<T> output, UtfErrorMode errorMode, int c2, int c3, int c4, int index) {
    this.output = output;
    this.errorMode = errorMode;
    this.c2 = c2;
    this.c3 = c3;
    this.c4 = c4;
    this.index = index;
  }

  Utf8EncodedOutput(Output<T> output, UtfErrorMode errorMode) {
    this(output, errorMode, 0, 0, 0, 4);
  }

  @Override
  public boolean isCont() {
    return this.output.isCont();
  }

  @Override
  public boolean isFull() {
    return this.output.isFull();
  }

  @Override
  public boolean isDone() {
    return this.output.isDone();
  }

  @Override
  public boolean isError() {
    return false;
  }

  @Override
  public boolean isPart() {
    return this.output.isPart();
  }

  @Override
  public Output<T> isPart(boolean isPart) {
    this.output = this.output.isPart(isPart);
    return this;
  }

  @Override
  public Output<T> write(int c) {
    int c1 = 0;
    int c2 = this.c2;
    int c3 = this.c3;
    int c4 = this.c4;
    int index = this.index;
    while (index < 4) {
      if (this.output.isCont()) {
        switch (index) {
          case 1: this.output = this.output.write(c2); this.c2 = 0; break;
          case 2: this.output = this.output.write(c3); this.c3 = 0; break;
          case 3: this.output = this.output.write(c4); this.c4 = 0; break;
          default: throw new AssertionError("unreachable");
        }
        index += 1;
      } else {
        return error(new OutputException("unable to flush buffered code units"));
      }
    }
    if (c >= 0 && c <= 0x7f) { // U+0000..U+007F
      c4 = c;
      index = 3;
    } else if (c >= 0x80 && c <= 0x7ff) { // U+0080..U+07FF
      c3 = 0xc0 | (c >>> 6);
      c4 = 0x80 | (c & 0x3f);
      index = 2;
    } else if (c >= 0x0800 && c <= 0xffff || // U+0800..U+D7FF
               c >= 0xe000 && c <= 0xffff) { // U+E000..U+FFFF
      c2 = 0xe0 | (c  >>> 12);
      c3 = 0x80 | ((c >>>  6) & 0x3f);
      c4 = 0x80 | (c & 0x3f);
      index = 1;
    } else if (c >= 0x10000 && c <= 0x10ffff) { // U+10000..U+10FFFF
      c1 = 0xf0 | (c  >>> 18);
      c2 = 0x80 | ((c >>> 12) & 0x3f);
      c3 = 0x80 | ((c >>>  6) & 0x3f);
      c4 = 0x80 | (c & 0x3f);
      index = 0;
    } else { // surrogate or invalid code point
      if (this.errorMode.isFatal()) {
        return error(new OutputException("invalid code point: U+" + Integer.toHexString(c)));
      } else {
        return write(this.errorMode.replacementChar());
      }
    }
    do {
      switch (index) {
        case 0: this.output = this.output.write(c1); break;
        case 1: this.output = this.output.write(c2); this.c2 = 0; break;
        case 2: this.output = this.output.write(c3); this.c3 = 0; break;
        case 3: this.output = this.output.write(c4); this.c4 = 0; break;
        default: throw new AssertionError("unreachable");
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
  public Output<T> flush() {
    int index = this.index;
    while (index < 4) {
      if (this.output.isCont()) {
        switch (index) {
          case 1: this.output = this.output.write(this.c2); this.c2 = 0; break;
          case 2: this.output = this.output.write(this.c3); this.c3 = 0; break;
          case 3: this.output = this.output.write(this.c4); this.c4 = 0; break;
          default: throw new AssertionError("unreachable");
        }
        index += 1;
      } else {
        return error(new OutputException("unable to flush buffered code units"));
      }
    }
    this.index = index;
    return this;
  }

  @Override
  public OutputSettings settings() {
    return this.output.settings();
  }

  @Override
  public Output<T> settings(OutputSettings settings) {
    this.output.settings(settings);
    return this;
  }

  @SuppressWarnings("unchecked")
  @Override
  public Output<T> fork(Object condition) {
    if (condition instanceof Output<?>) {
      this.output = (Output<T>) condition;
    }
    return this;
  }

  @Override
  public T bind() {
    return this.output.bind();
  }

  @Override
  public Output<T> clone() {
    return new Utf8EncodedOutput<T>(this.output.clone(), this.errorMode,
                                    this.c2, this.c3, this.c4, this.index);
  }
}
