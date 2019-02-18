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

final class MarkupTextWriter extends Writer<Object, Object> {
  final String text;
  final int index;
  final int escape;
  final int step;

  MarkupTextWriter(String text, int index, int escape, int step) {
    this.text = text;
    this.index = index;
    this.escape = escape;
    this.step = step;
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return write(output, this.text, this.index, this.escape, this.step);
  }

  static int sizeOf(String text) {
    int size = 0;
    for (int i = 0, n = text.length(); i < n; i = text.offsetByCodePoints(i, 1)) {
      final int c = text.codePointAt(i);
      if (c == '$' || c == '@' || c == '[' || c  == '\\' || c == ']' || c == '{' || c == '}'
          || c == '\b' || c == '\f' || c == '\n' || c == '\r' || c == '\t') {
        size += 2;
      } else if (c < 0x20) {
        size += 6;
      } else {
        size += Utf8.sizeOf(c);
      }
    }
    return size;
  }

  static Writer<Object, Object> write(Output<?> output, String text, int index,
                                      int escape, int step) {
    final int length = text.length();
    while (output.isCont()) {
      if (step == 1) {
        if (index < length) {
          final int c = text.codePointAt(index);
          index = text.offsetByCodePoints(index, 1);
          if (c == '$' || c == '@' || c == '[' || c == '\\' || c == ']' || c == '{' || c == '}') {
            output = output.write('\\');
            escape = c;
            step = 2;
          } else if (c == '\b') {
            output = output.write('\\');
            escape = 'b';
            step = 2;
          } else if (c == '\f') {
            output = output.write('\\');
            escape = 'f';
            step = 2;
          } else if (c == '\n') {
            output = output.write('\\');
            escape = 'n';
            step = 2;
          } else if (c == '\r') {
            output = output.write('\\');
            escape = 'r';
            step = 2;
          } else if (c == '\t') {
            output = output.write('\\');
            escape = 't';
            step = 2;
          } else if (c < 0x20) {
            output = output.write('\\');
            escape = c;
            step = 3;
          } else {
            output = output.write(c);
          }
        } else {
          return done();
        }
      } else if (step == 2) {
        output = output.write(escape);
        escape = 0;
        step = 1;
      } else if (step == 3) {
        output = output.write('u');
        step = 4;
      } else if (step == 4) {
        output = output.write(Base16.uppercase().encodeDigit((escape >>> 12) & 0xf));
        step = 5;
      } else if (step == 5) {
        output = output.write(Base16.uppercase().encodeDigit((escape >>> 8) & 0xf));
        step = 6;
      } else if (step == 6) {
        output = output.write(Base16.uppercase().encodeDigit((escape >>> 4) & 0xf));
        step = 7;
      } else if (step == 7) {
        output = output.write(Base16.uppercase().encodeDigit(escape & 0xf));
        escape = 0;
        step = 1;
      }
    }
    if (output.isDone()) {
      return error(new WriterException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new MarkupTextWriter(text, index, escape, step);
  }

  static Writer<Object, Object> write(Output<?> output, String text) {
    return write(output, text, 0, 0, 1);
  }
}
