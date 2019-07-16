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

package swim.recon;

import swim.codec.Base16;
import swim.codec.Output;
import swim.codec.Utf8;
import swim.codec.Writer;
import swim.codec.WriterException;

final class StringWriter extends Writer<Object, Object> {
  final String string;
  final int index;
  final int escape;
  final int step;

  StringWriter(String string, int index, int escape, int step) {
    this.string = string;
    this.index = index;
    this.escape = escape;
    this.step = step;
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return write(output, this.string, this.index, this.escape, this.step);
  }

  static int sizeOf(String string) {
    int size = 0;
    size += 1; // '"';
    for (int i = 0, n = string.length(); i < n; i = string.offsetByCodePoints(i, 1)) {
      final int c = string.codePointAt(i);
      if (c == '"' || c  == '\\' || c == '\b' || c == '\f' || c == '\n' || c == '\r' || c == '\t') {
        size += 2;
      } else if (c < 0x20) {
        size += 6;
      } else {
        size += Utf8.sizeOf(c);
      }
    }
    size += 1; // '"';
    return size;
  }

  static Writer<Object, Object> write(Output<?> output, String string,
                                      int index, int escape, int step) {
    if (step == 1 && output.isCont()) {
      output = output.write('"');
      step = 2;
    }
    final int length = string.length();
    while (step >= 2 && step <= 8 && output.isCont()) {
      if (step == 2) {
        if (index < length) {
          final int c = string.codePointAt(index);
          index = string.offsetByCodePoints(index, 1);
          if (c == '"' || c == '\\') {
            output = output.write('\\');
            escape = c;
            step = 3;
          } else if (c == '\b') {
            output = output.write('\\');
            escape = 'b';
            step = 3;
          } else if (c == '\f') {
            output = output.write('\\');
            escape = 'f';
            step = 3;
          } else if (c == '\n') {
            output = output.write('\\');
            escape = 'n';
            step = 3;
          } else if (c == '\r') {
            output = output.write('\\');
            escape = 'r';
            step = 3;
          } else if (c == '\t') {
            output = output.write('\\');
            escape = 't';
            step = 3;
          } else if (c < 0x20) {
            output = output.write('\\');
            escape = c;
            step = 4;
          } else {
            output = output.write(c);
          }
        } else {
          step = 9;
          break;
        }
      } else if (step == 3) {
        output = output.write(escape);
        escape = 0;
        step = 2;
      } else if (step == 4) {
        output = output.write('u');
        step = 5;
      } else if (step == 5) {
        output = output.write(Base16.uppercase().encodeDigit((escape >>> 12) & 0xf));
        step = 6;
      } else if (step == 6) {
        output = output.write(Base16.uppercase().encodeDigit((escape >>> 8) & 0xf));
        step = 7;
      } else if (step == 7) {
        output = output.write(Base16.uppercase().encodeDigit((escape >>> 4) & 0xf));
        step = 8;
      } else if (step == 8) {
        output = output.write(Base16.uppercase().encodeDigit(escape & 0xf));
        escape = 0;
        step = 2;
      }
    }
    if (step == 9 && output.isCont()) {
      output = output.write('"');
      return done();
    }
    if (output.isDone()) {
      return error(new WriterException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new StringWriter(string, index, escape, step);
  }

  static Writer<Object, Object> write(Output<?> output, String string) {
    return write(output, string, 0, 0, 1);
  }
}
