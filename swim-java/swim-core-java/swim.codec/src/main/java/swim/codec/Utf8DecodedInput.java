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

final class Utf8DecodedInput extends Input {
  Input input;
  UtfErrorMode errorMode;
  long offset;
  int line;
  int column;
  int state;
  int c1;
  int c2;
  int c3;
  int have;
  InputException error;

  Utf8DecodedInput(Input input, UtfErrorMode errorMode, long offset, int line,
                   int column, int c1, int c2, int c3, int have, int state,
                   InputException error) {
    this.input = input;
    this.errorMode = errorMode;
    this.offset = offset;
    this.line = line;
    this.column = column;
    this.c1 = c1;
    this.c2 = c2;
    this.c3 = c3;
    this.have = have;
    this.state = state;
    this.error = error;
  }

  Utf8DecodedInput(Input input, UtfErrorMode errorMode) {
    this(input, errorMode, 0L, 1, 1, -1, -1, -1, 0, DECODE, null);
  }

  @Override
  public boolean isCont() {
    return state() >= 0;
  }

  @Override
  public boolean isEmpty() {
    return state() == EMPTY;
  }

  @Override
  public boolean isDone() {
    return state() == DONE;
  }

  @Override
  public boolean isError() {
    return state() == ERROR;
  }

  @Override
  public boolean isPart() {
    return this.input.isPart();
  }

  @Override
  public Input isPart(boolean isPart) {
    this.input = this.input.isPart(isPart);
    return this;
  }

  int state() {
    if (this.state == DECODE) {
      Input input = this.input;
      final int c1;
      final int c2;
      final int c3;
      final int c4;
      if (this.c1 >= 0) { // use buffered c1
        c1 = this.c1;
      } else if (input.isCont()) {
        c1 = input.head();
        input = input.step();
      } else {
        c1 = -1;
      }
      if (c1 == 0 && this.errorMode.isNonZero()) { // invalid NUL byte
        this.have = 1;
        this.state = ERROR;
        this.error = new InputException("invalid NUL byte");
      } else if (c1 >= 0 && c1 <= 0x7f) { // U+0000..U+007F
        this.have = 1;
        this.state = c1;
      } else if (c1 >= 0xc2 && c1 <= 0xf4) {
        if (this.c2 >= 0) { // use buffered c2
          c2 = this.c2;
        } else if (input.isCont()) {
          c2 = input.head();
        } else {
          c2 = -1;
        }
        if (c1 >= 0xc2 && c1 <= 0xdf && c2 >= 0x80 && c2 <= 0xbf) { // U+0080..U+07FF
          if (this.c2 < 0) { // consume valid c2
            input = input.step();
          }
          this.have = 2;
          this.state = (c1 & 0x1f) << 6 | c2 & 0x3f;
        } else if (c1 == 0xe0 && c2 >= 0xa0 && c2 <= 0xbf // U+0800..U+0FFF
                || c1 >= 0xe1 && c1 <= 0xec && c2 >= 0x80 && c2 <= 0xbf // U+1000..U+CFFF
                || c1 == 0xed && c2 >= 0x80 && c2 <= 0x9f // U+D000..U+D7FF
                || c1 >= 0xee && c1 <= 0xef && c2 >= 0x80 && c2 <= 0xbf) { // U+E000..U+FFFF
          if (this.c2 < 0) { // consume valid c2
            input = input.step();
          }
          if (this.c3 >= 0) { // use buffered c3
            c3 = this.c3;
          } else if (input.isCont()) {
            c3 = input.head();
          } else {
            c3 = -1;
          }
          if (c3 >= 0x80 && c3 <= 0xbf) {
            if (this.c3 < 0) { // consume valid c3
              input = input.step();
            }
            this.have = 3;
            this.state = (c1 & 0x0f) << 12 | (c2 & 0x3f) << 6 | c3 & 0x3f;
          } else if (c3 >= 0) { // invalid c3
            this.have = 2;
            if (this.errorMode.isFatal()) {
              this.state = ERROR;
              this.error = new InputException(invalid(c1, c2, c3));
            } else {
              this.state = this.errorMode.replacementChar();
            }
          } else if (input.isDone()) { // truncated c3
            this.have = 2;
            if (this.errorMode.isFatal()) {
              this.state = ERROR;
              this.error = new InputException(invalid(c1, c2));
            } else {
              this.state = this.errorMode.replacementChar();
            }
          } else if (input.isEmpty()) { // awaiting c3
            this.c1 = c1;
            this.c2 = c2;
            this.state = EMPTY;
          }
        } else if (c1 == 0xf0 && c2 >= 0x90 && c2 <= 0xbf // U+10000..U+3FFFF
                || c1 >= 0xf1 && c1 <= 0xf3 && c2 >= 0x80 && c2 <= 0xbf // U+40000..U+FFFFF
                || c1 == 0xf4 && c2 >= 0x80 && c2 <= 0x8f) { // U+100000..U+10FFFF
          if (this.c2 < 0) { // consume valid c2
            input = input.step();
          }
          if (this.c3 >= 0) { // use buffered c3
            c3 = this.c3;
          } else if (input.isCont()) {
            c3 = input.head();
          } else {
            c3 = -1;
          }
          if (c3 >= 0x80 && c3 <= 0xbf) {
            if (this.c3 < 0) { // consume valid c3
              input = input.step();
            }
            if (input.isCont()) {
              c4 = input.head();
            } else {
              c4 = -1;
            }
            if (c4 >= 0x80 && c4 <= 0xbf) {
              input = input.step(); // consume valid c4
              this.have = 4;
              this.state = (c1 & 0x07) << 18 | (c2 & 0x3f) << 12 | (c3 & 0x3f) << 6 | c4 & 0x3f;
            } else if (c4 >= 0) { // invalid c4
              this.have = 3;
              if (this.errorMode.isFatal()) {
                this.state = ERROR;
                this.error = new InputException(invalid(c1, c2, c3, c4));
              } else {
                this.state = this.errorMode.replacementChar();
              }
            } else if (input.isDone()) { // truncated c4
              this.have = 3;
              if (this.errorMode.isFatal()) {
                this.state = ERROR;
                this.error = new InputException(invalid(c1, c2, c3));
              } else {
                this.state = this.errorMode.replacementChar();
              }
            } else if (input.isEmpty()) { // awaiting c4
              this.c1 = c1;
              this.c2 = c2;
              this.c3 = c3;
              this.state = EMPTY;
            }
          } else if (c3 >= 0) { // invalid c3
            this.have = 2;
            if (this.errorMode.isFatal()) {
              this.state = ERROR;
              this.error = new InputException(invalid(c1, c2, c3));
            } else {
              this.state = this.errorMode.replacementChar();
            }
          } else if (input.isDone()) { // truncated c3
            this.have = 2;
            if (this.errorMode.isFatal()) {
              this.state = ERROR;
              this.error = new InputException(invalid(c1, c2));
            } else {
              this.state = this.errorMode.replacementChar();
            }
          } else if (input.isEmpty()) { // awaiting c3
            this.c1 = c1;
            this.c2 = c2;
            this.state = EMPTY;
          }
        } else if (c2 >= 0) { // invalid c2
          this.have = 1;
          if (this.errorMode.isFatal()) {
            this.state = ERROR;
            this.error = new InputException(invalid(c1, c2));
          } else {
            this.state = this.errorMode.replacementChar();
          }
        } else if (input.isDone()) { // truncated c2
          this.have = 1;
          if (this.errorMode.isFatal()) {
            this.state = ERROR;
            this.error = new InputException(invalid(c1));
          } else {
            this.state = this.errorMode.replacementChar();
          }
        } else if (input.isEmpty()) { // awaiting c2
          this.c1 = c1;
          this.state = EMPTY;
        }
      } else if (c1 >= 0) { // invalid c1
        this.have = 1;
        if (this.errorMode.isFatal()) {
          this.state = ERROR;
          this.error = new InputException(invalid(c1));
        } else {
          this.state = this.errorMode.replacementChar();
        }
      } else if (input.isDone()) { // end of input
        this.state = DONE;
      } else if (input.isEmpty()) { // awaiting c1
        this.state = EMPTY;
      }
      this.input = input;
    }
    return this.state;
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
  public int head() {
    final int state = state();
    if (state < 0) {
      throw new InputException();
    }
    return state;
  }

  @Override
  public Input step() {
    final int state = state();
    if (state >= 0) {
      this.offset += (long) this.have;
      if (state == '\n') {
        this.line += 1;
        this.column = 1;
      } else {
        this.column += 1;
      }
      this.c1 = -1;
      this.c2 = -1;
      this.c3 = -1;
      this.have = 0;
      this.state = DECODE;
      return this;
    } else {
      final Throwable error = new InputException("invalid step");
      return Input.error(error, this.input.id(), mark(), this.input.settings());
    }
  }

  @Override
  public Input fork(Object condition) {
    if (condition instanceof Input) {
      this.input = (Input) condition;
      this.state = DECODE;
    }
    return this;
  }

  @Override
  public Throwable trap() {
    if (state() == ERROR) {
      return this.error;
    } else {
      throw new IllegalStateException();
    }
  }

  @Override
  public Input seek(Mark mark) {
    this.input.seek(mark);
    if (mark != null) {
      this.offset = mark.offset;
      this.line = mark.line;
      this.column = mark.column;
    } else {
      this.offset = 0L;
      this.line = 1;
      this.column = 1;
    }
    this.c1 = -1;
    this.c2 = -1;
    this.c3 = -1;
    this.have = 0;
    this.state = DECODE;
    this.error = null;
    return this;
  }

  @Override
  public Object id() {
    return this.input.id();
  }

  @Override
  public Input id(Object id) {
    this.input = this.input.id(id);
    return this;
  }

  @Override
  public Mark mark() {
    return Mark.at(this.offset, this.line, this.column);
  }

  @Override
  public Input mark(Mark mark) {
    this.input = this.input.mark(mark);
    this.offset = mark.offset;
    this.line = mark.line;
    this.column = mark.column;
    return this;
  }

  public long offset() {
    return this.offset;
  }

  public int line() {
    return this.line;
  }

  public int column() {
    return this.column;
  }

  @Override
  public InputSettings settings() {
    return this.input.settings();
  }

  @Override
  public Input settings(InputSettings settings) {
    this.input = this.input.settings(settings);
    return this;
  }

  @Override
  public Input clone() {
    return new Utf8DecodedInput(this.input.clone(), this.errorMode, this.offset,
                                this.line, this.column, this.c1, this.c2, this.c3,
                                this.have, this.state, this.error);
  }

  private static final int DECODE = -1;
  private static final int EMPTY = -2;
  private static final int DONE = -3;
  private static final int ERROR = -4;
}
