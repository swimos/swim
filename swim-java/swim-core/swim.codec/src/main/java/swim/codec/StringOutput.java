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

import java.io.Flushable;
import java.io.IOException;
import swim.annotations.CheckReturnValue;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

@Public
@Since("5.0")
public final class StringOutput extends Output<String> implements Appendable {

  final Appendable output;
  @Nullable IOException error;
  boolean last;

  StringOutput(Appendable output, @Nullable IOException error, boolean last) {
    this.output = output;
    this.last = last;
  }

  public StringOutput(Appendable output) {
    this(output, null, true);
  }

  public StringOutput() {
    this(new StringBuilder(), null, true);
  }

  public Appendable output() {
    return this.output;
  }

  @Override
  public boolean isCont() {
    return this.error == null;
  }

  @Override
  public boolean isFull() {
    return false;
  }

  @Override
  public boolean isDone() {
    return false;
  }

  @Override
  public boolean isError() {
    return this.error != null;
  }

  @Override
  public boolean isLast() {
    return this.last;
  }

  @Override
  public StringOutput asLast(boolean last) {
    this.last = last;
    return this;
  }

  @Override
  public StringOutput write(int codePoint) {
    if (this.error == null) {
      try {
        if (codePoint < 0) {
          this.output.append((char) 0xFFFD); // invalid code point
        } else if (codePoint <= 0xD7FF) { // U+0000 to U+D7FF
          this.output.append((char) codePoint);
        } else if (codePoint <= 0xDFFF) { // U+D800 to U+DFFF
          this.output.append((char) 0xFFFD); // invalid code point in surrogate range
        } else if (codePoint <= 0xFFFF) { // U+E000 to U+FFFF
          this.output.append((char) codePoint);
        } else if (codePoint <= 0x10FFFF) { // U+10000 to U+10FFFF
          this.output.append((char) (0xD800 | ((codePoint - 0x10000) >>> 10 & 0x3FF))); // high surrogate
          this.output.append((char) (0xDC00 | ((codePoint - 0x10000) & 0x3FF))); // low surrogate
        } else {
          this.output.append((char) 0xFFFD); // invalid code point
        }
      } catch (IOException error) {
        this.error = error;
      }
    }
    return this;
  }

  @Override
  public StringOutput append(char c) {
    if (this.error == null) {
      try {
        this.output.append(c);
      } catch (IOException error) {
        this.error = error;
      }
    }
    return this;
  }

  @Override
  public StringOutput append(@Nullable CharSequence csq) {
    if (this.error == null) {
      try {
        this.output.append(csq);
      } catch (IOException error) {
        this.error = error;
      }
    }
    return this;
  }

  @Override
  public StringOutput append(@Nullable CharSequence csq, int start, int end) {
    if (this.error == null) {
      try {
        this.output.append(csq, start, end);
      } catch (IOException error) {
        this.error = error;
      }
    }
    return this;
  }

  @Override
  public void flush() {
    if (this.error == null && this.output instanceof Flushable) {
      try {
        ((Flushable) this.output).flush();
      } catch (IOException error) {
        this.error = error;
      }
    }
  }

  @Override
  public String get() {
    return this.output.toString();
  }

  @CheckReturnValue
  @Override
  public Throwable getError() {
    if (this.error != null) {
      return this.error;
    } else {
      return super.getError();
    }
  }

  @Override
  public StringOutput clone() {
    return new StringOutput(new StringBuilder(this.output.toString()), this.error, this.last);
  }

  @Override
  public String toString() {
    return this.output.toString();
  }

  public static Output<?> from(Appendable output) {
    if (output instanceof Output<?>) {
      return (Output<?>) output;
    } else {
      return new StringOutput(output);
    }
  }

}
