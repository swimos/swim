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

final class Utf8DecodedOutput<T> extends Output<T> {
  Output<T> output;
  final UtfErrorMode errorMode;
  int c1;
  int c2;
  int c3;
  int have;

  Utf8DecodedOutput(Output<T> output, UtfErrorMode errorMode,
                    int c1, int c2, int c3, int have) {
    this.output = output;
    this.errorMode = errorMode;
    this.c1 = c1;
    this.c2 = c2;
    this.c3 = c3;
    this.have = have;
  }

  Utf8DecodedOutput(Output<T> output, UtfErrorMode errorMode) {
    this(output, errorMode, -1, -1, -1, 0);
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
    return this.output.isError();
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
    int c1 = this.c1;
    int c2 = this.c2;
    int c3 = this.c3;
    int c4 = -1;
    int have = this.have;

    if (c >= 0) {
      switch (have) {
        case 0:
          c1 = c & 0xff;
          have = 1;
          break;
        case 1:
          c2 = c & 0xff;
          have = 2;
          break;
        case 2:
          c3 = c & 0xff;
          have = 3;
          break;
        case 3:
          c4 = c & 0xff;
          have = 4;
          break;
        default:
          throw new AssertionError("unreachable");
      }
    }

    if (c1 == 0 && this.errorMode.isNonZero()) { // invalid NUL byte
      return error(new OutputException("unexpected NUL byte"));
    } else if (c1 >= 0 && c1 <= 0x7f) { // U+0000..U+007F
      this.output = this.output.write(c1);
      this.have = 0;
    } else if (c1 >= 0xc2 && c1 <= 0xf4) {
      if (c1 >= 0xc2 && c1 <= 0xdf && c2 >= 0x80 && c2 <= 0xbf) { // U+0080..U+07FF
        this.output = this.output.write((c1 & 0x1f) << 6 | c2 & 0x3f);
        this.c1 = -1;
        this.have = 0;
      } else if (c1 == 0xe0 && c2 >= 0xa0 && c2 <= 0xbf // U+0800..U+0FFF
              || c1 >= 0xe1 && c1 <= 0xec && c2 >= 0x80 && c2 <= 0xbf // U+1000..U+CFFF
              || c1 == 0xed && c2 >= 0x80 && c2 <= 0x9f // U+D000..U+D7FF
              || c1 >= 0xee && c1 <= 0xef && c2 >= 0x80 && c2 <= 0xbf) { // U+E000..U+FFFF
        if (c3 >= 0x80 && c3 <= 0xbf) {
          this.output = this.output.write((c1 & 0x0f) << 12 | (c2 & 0x3f) << 6 | c3 & 0x3f);
          this.c1 = -1;
          this.c2 = -1;
          this.have = 0;
        } else if (c3 >= 0) { // invalid c3
          if (this.errorMode.isFatal()) {
            return error(new OutputException(invalid(c1, c2, c3)));
          }
          this.output = this.output.write(this.errorMode.replacementChar());
          this.c1 = c3;
          this.c2 = -1;
          this.have = 1;
        } else if (c < 0 || this.output.isDone()) { // incomplete c3
          return error(new OutputException(invalid(c1, c2)));
        } else { // awaiting c3
          this.c2 = c2;
          this.have = 2;
        }
      } else if (c1 == 0xf0 && c2 >= 0x90 && c2 <= 0xbf // U+10000..U+3FFFF
              || c1 >= 0xf1 && c1 <= 0xf3 && c2 >= 0x80 && c2 <= 0xbf // U+40000..U+FFFFF
              || c1 == 0xf4 && c2 >= 0x80 && c2 <= 0x8f) { // U+100000..U+10FFFF
        if (c3 >= 0x80 && c3 <= 0xbf) {
          if (c4 >= 0x80 && c4 <= 0xbf) {
            this.have = 4;
            this.output = this.output.write((c1 & 0x07) << 18 | (c2 & 0x3f) << 12 | (c3 & 0x3f) << 6 | c4 & 0x3f);
            this.c1 = -1;
            this.c2 = -1;
            this.c3 = -1;
            this.have = 0;
          } else if (c4 >= 0) { // invalid c4
            if (this.errorMode.isFatal()) {
              return error(new OutputException(invalid(c1, c2, c3, c4)));
            }
            this.output = this.output.write(this.errorMode.replacementChar());
            this.c1 = c4;
            this.c2 = -1;
            this.c3 = -1;
            this.have = 1;
          } else if (c < 0 || this.output.isDone()) { // incomplete c4
            return error(new OutputException(invalid(c1, c2, c3)));
          } else { // awaiting c4
            this.c3 = c3;
            this.have = 3;
          }
        } else if (c3 >= 0) { // invalid c3
          if (this.errorMode.isFatal()) {
            return error(new OutputException(invalid(c1, c2, c3)));
          }
          this.output = this.output.write(this.errorMode.replacementChar());
          this.c1 = c3;
          this.c2 = -1;
          this.have = 1;
        } else if (c < 0 || this.output.isDone()) { // incomplete c3
          return error(new OutputException(invalid(c1, c2)));
        } else { // awaiting c3
          this.c2 = c2;
          this.have = 2;
        }
      } else if (c2 >= 0) { // invalid c2
        if (this.errorMode.isFatal()) {
          return error(new OutputException(invalid(c1, c2)));
        }
        this.output = this.output.write(this.errorMode.replacementChar());
        this.c1 = c2;
        this.have = 1;
      } else if (c < 0 || this.output.isDone()) { // incomplete c2
        return error(new OutputException(invalid(c1)));
      } else { // awaiting c2
        this.c1 = c1;
        this.have = 1;
      }
    } else if (c1 >= 0) { // invalid c1
      if (this.errorMode.isFatal()) {
        return error(new OutputException(invalid(c1)));
      }
      this.output = this.output.write(this.errorMode.replacementChar());
      this.have = 0;
    }
    if (this.output.isError()) {
      return this.output;
    }
    return this;
  }

  private static String invalid(int c1) {
    Output<String> output = Unicode.stringOutput();
    output = output.write("invalid UTF-8 code unit: ");
    Base16.uppercase().writeIntLiteral(c1, output, 2);
    return output.bind();
  }

  private static String invalid(int c1, int c2) {
    Output<String> output = Unicode.stringOutput();
    output = output.write("invalid UTF-8 code unit sequence: ");
    Base16.uppercase().writeIntLiteral(c1, output, 2);
    output = output.write(' ');
    Base16.uppercase().writeIntLiteral(c2, output, 2);
    return output.bind();
  }

  private static String invalid(int c1, int c2, int c3) {
    Output<String> output = Unicode.stringOutput();
    output = output.write("invalid UTF-8 code unit sequence: ");
    Base16.uppercase().writeIntLiteral(c1, output, 2);
    output = output.write(' ');
    Base16.uppercase().writeIntLiteral(c2, output, 2);
    output = output.write(' ');
    Base16.uppercase().writeIntLiteral(c3, output, 2);
    return output.bind();
  }

  private static String invalid(int c1, int c2, int c3, int c4) {
    Output<String> output = Unicode.stringOutput();
    output = output.write("invalid UTF-8 code unit sequence: ");
    Base16.uppercase().writeIntLiteral(c1, output, 2);
    output = output.write(' ');
    Base16.uppercase().writeIntLiteral(c2, output, 2);
    output = output.write(' ');
    Base16.uppercase().writeIntLiteral(c3, output, 2);
    output = output.write(' ');
    Base16.uppercase().writeIntLiteral(c4, output, 2);
    return output.bind();
  }

  @Override
  public OutputSettings settings() {
    return this.output.settings();
  }

  @Override
  public Output<T> settings(OutputSettings settings) {
    this.output = this.output.settings(settings);
    return this;
  }

  @Override
  public Output<T> fork(Object condition) {
    this.output = this.output.fork(condition);
    return this;
  }

  @Override
  public T bind() {
    if (this.have == 0) {
      return this.output.bind();
    } else {
      return write(-1).bind();
    }
  }

  @Override
  public Throwable trap() {
    return this.output.trap();
  }

  @Override
  public Output<T> clone() {
    return new Utf8DecodedOutput<T>(this.output.clone(), this.errorMode,
                                    this.c1, this.c2, this.c3, this.have);
  }
}
