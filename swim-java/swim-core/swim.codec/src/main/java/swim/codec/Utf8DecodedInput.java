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
import swim.annotations.CheckReturnValue;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Assume;

@Public
@Since("5.0")
public final class Utf8DecodedInput extends DecodedInput {

  Input input;
  UtfErrorMode errorMode;
  long offset;
  int line;
  int column;
  int c1;
  int c2;
  int c3;
  int have;
  int state;
  @Nullable IOException error;

  Utf8DecodedInput(Input input, UtfErrorMode errorMode, long offset,
                   int line, int column, int c1, int c2, int c3, int have,
                   int state, @Nullable IOException error) {
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

  public Utf8DecodedInput(Input input, UtfErrorMode errorMode) {
    this(input, errorMode, 0L, 1, 1, -1, -1, -1, 0, DECODE_STATE, null);
  }

  public Utf8DecodedInput(Input input) {
    this(input, UtfErrorMode.fatal());
  }

  @Override
  public boolean isCont() {
    return this.state() >= 0;
  }

  @Override
  public boolean isEmpty() {
    return this.state() == EMPTY_STATE;
  }

  @Override
  public boolean isDone() {
    return this.state() == DONE_STATE;
  }

  @Override
  public boolean isError() {
    return this.state() == ERROR_STATE;
  }

  @Override
  public boolean isLast() {
    return this.input.isLast();
  }

  @Override
  public Utf8DecodedInput asLast(boolean last) {
    this.input = this.input.asLast(last);
    return this;
  }

  @Override
  public Utf8DecodedInput resume(Input input) {
    this.input = input;
    this.state = DECODE_STATE;
    return this;
  }

  int state() {
    if (this.state == DECODE_STATE) {
      final Input input = this.input;
      final int c1;
      final int c2;
      final int c3;
      final int c4;
      if (this.c1 >= 0) { // use buffered c1
        c1 = this.c1;
      } else if (input.isCont()) {
        c1 = input.head();
        input.step();
      } else {
        c1 = -1;
      }
      if (c1 == 0 && this.errorMode.isNonZero()) { // invalid NUL byte
        this.have = 1;
        this.state = ERROR_STATE;
        this.error = new UtfException("Invalid NUL byte");
      } else if (c1 >= 0 && c1 <= 0x7F) { // U+0000..U+007F
        this.have = 1;
        this.state = c1;
      } else if (c1 >= 0xC2 && c1 <= 0xF4) {
        if (this.c2 >= 0) { // use buffered c2
          c2 = this.c2;
        } else if (input.isCont()) {
          c2 = input.head();
        } else {
          c2 = -1;
        }
        if (c1 >= 0xC2 && c1 <= 0xDF && c2 >= 0x80 && c2 <= 0xBF) { // U+0080..U+07FF
          if (this.c2 < 0) { // consume valid c2
            input.step();
          }
          this.have = 2;
          this.state = (c1 & 0x1F) << 6 | (c2 & 0x3F);
        } else if ((c1 == 0xE0 && c2 >= 0xA0 && c2 <= 0xBF) // U+0800..U+0FFF
                || (c1 >= 0xE1 && c1 <= 0xEC && c2 >= 0x80 && c2 <= 0xBF) // U+1000..U+CFFF
                || (c1 == 0xED && c2 >= 0x80 && c2 <= 0x9F) // U+D000..U+D7FF
                || (c1 >= 0xEE && c1 <= 0xEF && c2 >= 0x80 && c2 <= 0xBF)) { // U+E000..U+FFFF
          if (this.c2 < 0) { // consume valid c2
            input.step();
          }
          if (this.c3 >= 0) { // use buffered c3
            c3 = this.c3;
          } else if (input.isCont()) {
            c3 = input.head();
          } else {
            c3 = -1;
          }
          if (c3 >= 0x80 && c3 <= 0xBF) {
            if (this.c3 < 0) { // consume valid c3
              input.step();
            }
            this.have = 3;
            this.state = (c1 & 0x0F) << 12 | (c2 & 0x3F) << 6 | (c3 & 0x3F);
          } else if (c3 >= 0) { // invalid c3
            this.have = 2;
            if (this.errorMode.isFatal()) {
              this.state = ERROR_STATE;
              this.error = new UtfException(Utf8DecodedInput.invalid(c1, c2, c3));
            } else {
              this.state = this.errorMode.replacementChar();
            }
          } else if (input.isDone()) { // truncated c3
            this.have = 2;
            if (this.errorMode.isFatal()) {
              this.state = ERROR_STATE;
              this.error = new UtfException(Utf8DecodedInput.invalid(c1, c2));
            } else {
              this.state = this.errorMode.replacementChar();
            }
          } else if (input.isEmpty()) { // awaiting c3
            this.c1 = c1;
            this.c2 = c2;
            this.state = EMPTY_STATE;
          }
        } else if ((c1 == 0xF0 && c2 >= 0x90 && c2 <= 0xBF) // U+10000..U+3FFFF
                || (c1 >= 0xF1 && c1 <= 0xF3 && c2 >= 0x80 && c2 <= 0xBF) // U+40000..U+FFFFF
                || (c1 == 0xF4 && c2 >= 0x80 && c2 <= 0x8F)) { // U+100000..U+10FFFF
          if (this.c2 < 0) { // consume valid c2
            input.step();
          }
          if (this.c3 >= 0) { // use buffered c3
            c3 = this.c3;
          } else if (input.isCont()) {
            c3 = input.head();
          } else {
            c3 = -1;
          }
          if (c3 >= 0x80 && c3 <= 0xBF) {
            if (this.c3 < 0) { // consume valid c3
              input.step();
            }
            if (input.isCont()) {
              c4 = input.head();
            } else {
              c4 = -1;
            }
            if (c4 >= 0x80 && c4 <= 0xBF) {
              input.step(); // consume valid c4
              this.have = 4;
              this.state = (c1 & 0x07) << 18 | (c2 & 0x3F) << 12 | (c3 & 0x3F) << 6 | (c4 & 0x3F);
            } else if (c4 >= 0) { // invalid c4
              this.have = 3;
              if (this.errorMode.isFatal()) {
                this.state = ERROR_STATE;
                this.error = new UtfException(Utf8DecodedInput.invalid(c1, c2, c3, c4));
              } else {
                this.state = this.errorMode.replacementChar();
              }
            } else if (input.isDone()) { // truncated c4
              this.have = 3;
              if (this.errorMode.isFatal()) {
                this.state = ERROR_STATE;
                this.error = new UtfException(Utf8DecodedInput.invalid(c1, c2, c3));
              } else {
                this.state = this.errorMode.replacementChar();
              }
            } else if (input.isEmpty()) { // awaiting c4
              this.c1 = c1;
              this.c2 = c2;
              this.c3 = c3;
              this.state = EMPTY_STATE;
            }
          } else if (c3 >= 0) { // invalid c3
            this.have = 2;
            if (this.errorMode.isFatal()) {
              this.state = ERROR_STATE;
              this.error = new UtfException(Utf8DecodedInput.invalid(c1, c2, c3));
            } else {
              this.state = this.errorMode.replacementChar();
            }
          } else if (input.isDone()) { // truncated c3
            this.have = 2;
            if (this.errorMode.isFatal()) {
              this.state = ERROR_STATE;
              this.error = new UtfException(Utf8DecodedInput.invalid(c1, c2));
            } else {
              this.state = this.errorMode.replacementChar();
            }
          } else if (input.isEmpty()) { // awaiting c3
            this.c1 = c1;
            this.c2 = c2;
            this.state = EMPTY_STATE;
          }
        } else if (c2 >= 0) { // invalid c2
          this.have = 1;
          if (this.errorMode.isFatal()) {
            this.state = ERROR_STATE;
            this.error = new UtfException(Utf8DecodedInput.invalid(c1, c2));
          } else {
            this.state = this.errorMode.replacementChar();
          }
        } else if (input.isDone()) { // truncated c2
          this.have = 1;
          if (this.errorMode.isFatal()) {
            this.state = ERROR_STATE;
            this.error = new UtfException(Utf8DecodedInput.invalid(c1));
          } else {
            this.state = this.errorMode.replacementChar();
          }
        } else if (input.isEmpty()) { // awaiting c2
          this.c1 = c1;
          this.state = EMPTY_STATE;
        }
      } else if (c1 >= 0) { // invalid c1
        this.have = 1;
        if (this.errorMode.isFatal()) {
          this.state = ERROR_STATE;
          this.error = new UtfException(Utf8DecodedInput.invalid(c1));
        } else {
          this.state = this.errorMode.replacementChar();
        }
      } else if (input.isDone()) { // end of input
        this.state = DONE_STATE;
      } else if (input.isEmpty()) { // awaiting c1
        this.state = EMPTY_STATE;
      }
    }
    return this.state;
  }

  @Override
  public int head() {
    final int state = this.state();
    if (state < 0) {
      throw new IllegalStateException();
    }
    return state;
  }

  @Override
  public int lookahead(int k) {
    final Input input = this.input;
    int c1 = this.c1;
    int c2 = this.c2;
    int c3 = this.c3;
    int c4 = -1;
    int state = this.state;
    int j = 0;
    while (k > 0) {
      if (c1 < 0) {
        c1 = input.lookahead(j);
        j += 1;
      }
      if (c1 == 0 && this.errorMode.isNonZero()) { // invalid NUL byte
        state = ERROR_STATE;
      } else if (c1 >= 0 && c1 <= 0x7F) { // U+0000..U+007F
        state = c1;
      } else if (c1 >= 0xC2 && c1 <= 0xF4) {
        if (c2 < 0) {
          c2 = input.lookahead(j);
          j += 1;
        }
        if (c1 >= 0xC2 && c1 <= 0xDF && c2 >= 0x80 && c2 <= 0xBF) { // U+0080..U+07FF
          state = (c1 & 0x1F) << 6 | (c2 & 0x3F);
        } else if ((c1 == 0xE0 && c2 >= 0xA0 && c2 <= 0xBF) // U+0800..U+0FFF
                || (c1 >= 0xE1 && c1 <= 0xEC && c2 >= 0x80 && c2 <= 0xBF) // U+1000..U+CFFF
                || (c1 == 0xED && c2 >= 0x80 && c2 <= 0x9F) // U+D000..U+D7FF
                || (c1 >= 0xEE && c1 <= 0xEF && c2 >= 0x80 && c2 <= 0xBF)) { // U+E000..U+FFFF
          if (c3 < 0) {
            c3 = input.lookahead(j);
            j += 1;
          }
          if (c3 >= 0x80 && c3 <= 0xBF) {
            state = (c1 & 0x0F) << 12 | (c2 & 0x3F) << 6 | (c3 & 0x3F);
          } else if (c3 >= 0) { // invalid c3
            if (this.errorMode.isFatal()) {
              state = ERROR_STATE;
            } else {
              state = this.errorMode.replacementChar();
            }
          } else if (input.isLast()) { // truncated c3
            if (this.errorMode.isFatal()) {
              state = ERROR_STATE;
            } else {
              state = this.errorMode.replacementChar();
            }
          } else { // awaiting c3
            state = EMPTY_STATE;
          }
        } else if ((c1 == 0xF0 && c2 >= 0x90 && c2 <= 0xBF) // U+10000..U+3FFFF
                || (c1 >= 0xF1 && c1 <= 0xF3 && c2 >= 0x80 && c2 <= 0xBF) // U+40000..U+FFFFF
                || (c1 == 0xF4 && c2 >= 0x80 && c2 <= 0x8F)) { // U+100000..U+10FFFF
          if (c3 < 0) {
            c3 = input.lookahead(j);
            j += 1;
          }
          if (c3 >= 0x80 && c3 <= 0xBF) {
            c4 = input.lookahead(j);
            j += 1;
            if (c4 >= 0x80 && c4 <= 0xBF) {
              state = (c1 & 0x07) << 18 | (c2 & 0x3F) << 12 | (c3 & 0x3F) << 6 | (c4 & 0x3F);
            } else if (c4 >= 0) { // invalid c4
              if (this.errorMode.isFatal()) {
                state = ERROR_STATE;
              } else {
                state = this.errorMode.replacementChar();
              }
            } else if (input.isLast()) { // truncated c4
              if (this.errorMode.isFatal()) {
                state = ERROR_STATE;
              } else {
                state = this.errorMode.replacementChar();
              }
            } else { // awaiting c4
              state = EMPTY_STATE;
            }
          } else if (c3 >= 0) { // invalid c3
            if (this.errorMode.isFatal()) {
              state = ERROR_STATE;
            } else {
              state = this.errorMode.replacementChar();
            }
          } else if (input.isLast()) { // truncated c3
            if (this.errorMode.isFatal()) {
              state = ERROR_STATE;
            } else {
              state = this.errorMode.replacementChar();
            }
          } else { // awaiting c3
            state = EMPTY_STATE;
          }
        } else if (c2 >= 0) { // invalid c2
          if (this.errorMode.isFatal()) {
            state = ERROR_STATE;
          } else {
            state = this.errorMode.replacementChar();
          }
        } else if (input.isLast()) { // truncated c2
          if (this.errorMode.isFatal()) {
            state = ERROR_STATE;
          } else {
            state = this.errorMode.replacementChar();
          }
        } else { // awaiting c2
          state = EMPTY_STATE;
        }
      } else if (c1 >= 0) { // invalid c1
        if (this.errorMode.isFatal()) {
          state = ERROR_STATE;
        } else {
          state = this.errorMode.replacementChar();
        }
      } else if (input.isLast()) { // end of input
        state = DONE_STATE;
      } else { // awaiting c1
        state = EMPTY_STATE;
      }
      if (state >= 0) {
        k -= 1;
      } else {
        break;
      }
    }
    if (k == 0 && state >= 0) {
      return state;
    } else {
      return -1;
    }
  }

  @Override
  public Utf8DecodedInput step() {
    final int state = this.state();
    if (state < 0) {
      throw new IllegalStateException("Invalid step");
    }
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
    this.state = DECODE_STATE;
    return this;
  }

  @CheckReturnValue
  @Override
  public Throwable getError() {
    if (this.state() == ERROR_STATE) {
      return Assume.nonNull(this.error);
    } else {
      return super.getError();
    }
  }

  @Override
  public Utf8DecodedInput seek(@Nullable SourcePosition position) {
    this.input = this.input.seek(position);
    if (position != null) {
      this.offset = position.offset();
      this.line = position.line();
      this.column = position.column();
    } else {
      this.offset = 0L;
      this.line = 1;
      this.column = 1;
    }
    this.c1 = -1;
    this.c2 = -1;
    this.c3 = -1;
    this.have = 0;
    this.state = DECODE_STATE;
    this.error = null;
    return this;
  }

  @Override
  public @Nullable String identifier() {
    return this.input.identifier();
  }

  @Override
  public Utf8DecodedInput withIdentifier(@Nullable String identifier) {
    this.input = this.input.withIdentifier(identifier);
    return this;
  }

  @Override
  public SourcePosition position() {
    return SourcePosition.at(this.offset, this.line, this.column);
  }

  @Override
  public Utf8DecodedInput withPosition(SourcePosition position) {
    this.input = this.input.withPosition(position);
    this.offset = position.offset();
    this.line = position.line();
    this.column = position.column();
    return this;
  }

  @Override
  public long offset() {
    return this.offset;
  }

  @Override
  public int line() {
    return this.line;
  }

  @Override
  public int column() {
    return this.column;
  }

  @Override
  public Utf8DecodedInput clone() {
    return new Utf8DecodedInput(this.input.clone(), this.errorMode, this.offset,
                                this.line, this.column, this.c1, this.c2, this.c3,
                                this.have, this.state, this.error);
  }

  private static final Utf8DecodedInput EMPTY = new Utf8DecodedInput(BinaryInput.empty(), UtfErrorMode.fatal());

  public static Utf8DecodedInput empty() {
    return EMPTY;
  }

  public static Utf8DecodedInput empty(UtfErrorMode errorMode) {
    if (errorMode == UtfErrorMode.fatal()) {
      return EMPTY;
    } else {
      return new Utf8DecodedInput(BinaryInput.empty(), errorMode);
    }
  }

  private static final int DECODE_STATE = -1;
  private static final int EMPTY_STATE = -2;
  private static final int DONE_STATE = -3;
  private static final int ERROR_STATE = -4;

  private static String invalid(int c1) {
    final StringOutput output = new StringOutput();
    output.append("Invalid UTF-8 code unit: ");
    Base16.uppercase().writeIntLiteral(output, c1, 2).checkDone();
    return output.get();
  }

  private static String invalid(int c1, int c2) {
    final StringOutput output = new StringOutput();
    output.append("Invalid UTF-8 code unit sequence: ");
    Base16.uppercase().writeIntLiteral(output, c1, 2).checkDone();
    output.append(' ');
    Base16.uppercase().writeIntLiteral(output, c2, 2).checkDone();
    return output.get();
  }

  private static String invalid(int c1, int c2, int c3) {
    final StringOutput output = new StringOutput();
    output.append("Invalid UTF-8 code unit sequence: ");
    Base16.uppercase().writeIntLiteral(output, c1, 2).checkDone();
    output.append(' ');
    Base16.uppercase().writeIntLiteral(output, c2, 2).checkDone();
    output.append(' ');
    Base16.uppercase().writeIntLiteral(output, c3, 2).checkDone();
    return output.get();
  }

  private static String invalid(int c1, int c2, int c3, int c4) {
    final StringOutput output = new StringOutput();
    output.append("Invalid UTF-8 code unit sequence: ");
    Base16.uppercase().writeIntLiteral(output, c1, 2).checkDone();
    output.append(' ');
    Base16.uppercase().writeIntLiteral(output, c2, 2).checkDone();
    output.append(' ');
    Base16.uppercase().writeIntLiteral(output, c3, 2).checkDone();
    output.append(' ');
    Base16.uppercase().writeIntLiteral(output, c4, 2).checkDone();
    return output.get();
  }

}
