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

import java.util.Iterator;
import swim.annotations.Internal;
import swim.annotations.Nullable;
import swim.codec.Base16;
import swim.codec.Output;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.expr.ExprWriter;
import swim.expr.Term;
import swim.expr.TermForm;
import swim.util.Assume;

@Internal
public final class WriteFormatExpr extends Write<Object> {

  final ExprWriter writer;
  final TermForm<?> form;
  final Iterator<Object> parts; // Iterator<String | Term>
  final @Nullable Object part; // String | Term | null
  final @Nullable Write<?> write;
  final int index;
  final int escape;
  final int step;

  public WriteFormatExpr(ExprWriter writer, TermForm<?> form, Iterator<Object> parts,
                         @Nullable Object part, @Nullable Write<?> write,
                         int index, int escape, int step) {
    this.writer = writer;
    this.form = form;
    this.parts = parts;
    this.part = part;
    this.write = write;
    this.index = index;
    this.escape = escape;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteFormatExpr.write(output, this.writer, this.form, this.parts,
                                 this.part, this.write, this.index,
                                 this.escape, this.step);
  }

  public static Write<Object> write(Output<?> output, ExprWriter writer,
                                    TermForm<?> form, Iterator<Object> parts,
                                    @Nullable Object part, @Nullable Write<?> write,
                                    int index, int escape, int step) {
    do {
      if (step == 1) {
        if (parts.hasNext()) {
          part = parts.next();
          if (part instanceof String) {
            step = 2;
          } else if (part instanceof Term) {
            step = 9;
          } else {
            return Write.error(new WriteException("Unexpected part: " + part));
          }
        } else {
          return Write.done();
        }
      }
      if (step == 2) {
        part = Assume.nonNull(part);
        while (index < ((String) part).length() && output.isCont()) {
          final int c = ((String) part).codePointAt(index);
          if (c == '{' || c == '}') {
            output.write('\\');
            escape = c;
            step = 3;
            break;
          } else if (c == '\b') {
            output.write('\\');
            escape = 'b';
            step = 3;
            break;
          } else if (c == '\f') {
            output.write('\\');
            escape = 'f';
            step = 3;
            break;
          } else if (c == '\n') {
            output.write('\\');
            escape = 'n';
            step = 3;
            break;
          } else if (c == '\r') {
            output.write('\\');
            escape = 'r';
            step = 3;
            break;
          } else if (c == '\t') {
            output.write('\\');
            escape = 't';
            step = 3;
            break;
          } else if (c < 0x20) {
            output.write('\\');
            escape = c;
            step = 4;
            break;
          } else {
            output.write(c);
            index = ((String) part).offsetByCodePoints(index, 1);
          }
        }
        if (index >= ((String) part).length()) {
          part = null;
          index = 0;
          step = 1;
          continue;
        }
      }
      if (step == 3 && output.isCont()) {
        part = Assume.nonNull(part);
        output.write(escape);
        index = ((String) part).offsetByCodePoints(index, 1);
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
        part = Assume.nonNull(part);
        output.write(Base16.uppercase().encodeDigit(escape & 0xF));
        index = ((String) part).offsetByCodePoints(index, 1);
        escape = 0;
        step = 2;
        continue;
      }
      if (step == 9 && output.isCont()) {
        output.write('{');
        step = 10;
      }
      if (step == 10) {
        part = Assume.nonNull(part);
        if (write == null) {
          write = writer.writeTerm(output, form, (Term) part);
        } else {
          write = write.produce(output);
        }
        if (write.isDone()) {
          write = null;
          step = 11;
        } else if (write.isError()) {
          return write.asError();
        }
      }
      if (step == 11 && output.isCont()) {
        output.write('}');
        part = null;
        step = 1;
        continue;
      }
      break;
    } while (true);
    if (output.isDone()) {
      return Write.error(new WriteException("Truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteFormatExpr(writer, form, parts, part,
                               write, index, escape, step);
  }

}
