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

package swim.expr.writer;

import swim.annotations.Internal;
import swim.codec.Base16;
import swim.codec.Output;
import swim.codec.Write;
import swim.codec.WriteException;

@Internal
public final class WriteStringTerm extends Write<Object> {

  final String string;
  final int index;
  final int escape;
  final int step;

  public WriteStringTerm(String string, int index, int escape, int step) {
    this.string = string;
    this.index = index;
    this.escape = escape;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteStringTerm.write(output, this.string, this.index,
                                 this.escape, this.step);
  }

  public static Write<Object> write(Output<?> output, String string,
                                    int index, int escape, int step) {
    if (step == 1 && output.isCont()) {
      output.write('"');
      step = 2;
    }
    do {
      if (step == 2 && output.isCont()) {
        if (index < string.length()) {
          final int c = string.codePointAt(index);
          index = string.offsetByCodePoints(index, 1);
          if (c == '"' || c == '\\') {
            output.write('\\');
            escape = c;
            step = 3;
          } else if (c == '\b') {
            output.write('\\');
            escape = 'b';
            step = 3;
          } else if (c == '\f') {
            output.write('\\');
            escape = 'f';
            step = 3;
          } else if (c == '\n') {
            output.write('\\');
            escape = 'n';
            step = 3;
          } else if (c == '\r') {
            output.write('\\');
            escape = 'r';
            step = 3;
          } else if (c == '\t') {
            output.write('\\');
            escape = 't';
            step = 3;
          } else if (c < 0x20) {
            output.write('\\');
            escape = c;
            step = 4;
          } else {
            output.write(c);
            continue;
          }
        } else {
          step = 9;
          break;
        }
      }
      if (step == 3 && output.isCont()) {
        output.write(escape);
        escape = 0;
        step = 2;
        continue;
      }
      if (step == 4 && output.isCont()) {
        output.write('u');
        step = 5;
      }
      if (step == 5 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit((escape >>> 12) & 0xF));
        step = 6;
      }
      if (step == 6 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit((escape >>> 8) & 0xF));
        step = 7;
      }
      if (step == 7 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit((escape >>> 4) & 0xF));
        step = 8;
      }
      if (step == 8 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit(escape & 0xF));
        escape = 0;
        step = 2;
        continue;
      }
      break;
    } while (true);
    if (step == 9 && output.isCont()) {
      output.write('"');
      return Write.done();
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteStringTerm(string, index, escape, step);
  }

}
