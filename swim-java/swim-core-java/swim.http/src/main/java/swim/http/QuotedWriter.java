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

package swim.http;

import swim.codec.Output;
import swim.codec.Writer;
import swim.codec.WriterException;

final class QuotedWriter extends Writer<Object, Object> {
  final String quoted;
  final int index;
  final int escape;
  final int step;

  QuotedWriter(String quoted, int index, int escape, int step) {
    this.quoted = quoted;
    this.index = index;
    this.escape = escape;
    this.step = step;
  }

  QuotedWriter(String quoted) {
    this(quoted, 0, 0, 1);
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return write(output, this.quoted, this.index, this.escape, this.step);
  }

  static Writer<Object, Object> write(Output<?> output, String quoted,
                                      int index, int escape, int step) {
    final int length = quoted.length();
    if (step == 1 && output.isCont()) {
      output = output.write('"');
      step = 2;
    }
    do {
      if (step == 2 && output.isCont()) {
        if (index < length) {
          final int c = quoted.codePointAt(index);
          if (Http.isQuotedChar(c)) {
            output = output.write(c);
          } else if (Http.isVisibleChar(c)) {
            output = output.write('\\');
            escape = c;
            step = 3;
          } else {
            return error(new HttpException("invalid quoted: " + quoted));
          }
          index = quoted.offsetByCodePoints(index, 1);
          continue;
        } else {
          step = 4;
          break;
        }
      }
      if (step == 3 && output.isCont()) {
        output = output.write(escape);
        escape = 0;
        step = 2;
        continue;
      }
      break;
    } while (true);
    if (step == 4 && output.isCont()) {
      output = output.write('"');
      return done();
    }
    if (output.isDone()) {
      return error(new WriterException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new QuotedWriter(quoted, index, escape, step);
  }

  static Writer<Object, Object> write(Output<?> output, String quoted) {
    return write(output, quoted, 0, 0, 1);
  }
}
