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

package swim.waml.writer;

import swim.annotations.Internal;
import swim.annotations.Nullable;
import swim.codec.Base16;
import swim.codec.Output;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.waml.WamlAttrForm;
import swim.waml.WamlWriter;

@Internal
public final class WriteWamlAttr<A> extends Write<Object> {

  final WamlWriter writer;
  final WamlAttrForm<A, ?> form;
  final String name;
  final A args;
  final @Nullable Write<?> write;
  final int index;
  final int escape;
  final int step;

  public WriteWamlAttr(WamlWriter writer, WamlAttrForm<A, ?> form, String name, A args,
                       @Nullable Write<?> write, int index, int escape, int step) {
    this.writer = writer;
    this.form = form;
    this.name = name;
    this.args = args;
    this.write = write;
    this.index = index;
    this.escape = escape;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteWamlAttr.write(output, this.writer, this.form, this.name, this.args,
                               this.write, this.index, this.escape, this.step);
  }

  public static <A> Write<Object> write(Output<?> output, WamlWriter writer,
                                        WamlAttrForm<A, ?> form, String name,
                                        A args, @Nullable Write<?> write,
                                        int index, int escape, int step) {
    if (step == 1 && output.isCont()) {
      output.write('@');
      if (writer.isIdentifier(name)) {
        step = 2;
      } else {
        step = 3;
      }
    }
    if (step == 2) {
      int c;
      if (name.length() == 0) {
        return Write.error(new WriteException("Blank identifier"));
      }
      if (index == 0 && output.isCont()) {
        c = name.codePointAt(0);
        if (writer.isIdentifierStartChar(c)) {
          output.write(c);
          index = name.offsetByCodePoints(0, 1);
        }
      }
      while (index < name.length() && output.isCont()) {
        c = name.codePointAt(index);
        if (writer.isIdentifierChar(c)) {
          output.write(c);
          index = name.offsetByCodePoints(index, 1);
        } else {
          return Write.error(new WriteException("Invalid identifier"));
        }
      }
      if (index >= name.length()) {
        if (form.isNullary(args)) {
          return Write.done();
        } else {
          step = 13;
        }
      }
    }
    if (step == 3 && output.isCont()) {
      output.write('"');
      step = 5;
    }
    do {
      if (step == 5 && output.isCont()) {
        if (index < name.length()) {
          final int c = name.codePointAt(index);
          index = name.offsetByCodePoints(index, 1);
          if (c == '"' || c == '\\') {
            output.write('\\');
            escape = c;
            step = 6;
            continue;
          } else if (c == '\b') {
            output.write('\\');
            escape = 'b';
            step = 6;
            continue;
          } else if (c == '\f') {
            output.write('\\');
            escape = 'f';
            step = 6;
            continue;
          } else if (c == '\n') {
            output.write('\\');
            escape = 'n';
            step = 6;
            continue;
          } else if (c == '\r') {
            output.write('\\');
            escape = 'r';
            step = 6;
            continue;
          } else if (c == '\t') {
            output.write('\\');
            escape = 't';
            step = 6;
            continue;
          } else if (c < 0x20) {
            output.write('\\');
            escape = c;
            step = 7;
            continue;
          } else {
            output.write(c);
            continue;
          }
        } else {
          step = 12;
          break;
        }
      } else if (step == 6 && output.isCont()) {
        output.write(escape);
        escape = 0;
        step = 5;
        continue;
      } else if (step == 7 && output.isCont()) {
        output.write('u');
        step = 8;
        continue;
      } else if (step == 8 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit((escape >>> 12) & 0xF));
        step = 9;
        continue;
      } else if (step == 9 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit((escape >>> 8) & 0xF));
        step = 10;
        continue;
      } else if (step == 10 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit((escape >>> 4) & 0xF));
        step = 11;
        continue;
      } else if (step == 11 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit(escape & 0xF));
        escape = 0;
        step = 5;
        continue;
      }
      break;
    } while (true);
    if (step == 12 && output.isCont()) {
      output.write('"');
      if (form.isNullary(args)) {
        return Write.done();
      } else {
        step = 13;
      }
    }
    if (step == 13 && output.isCont()) {
      output.write('(');
      step = 14;
    }
    if (step == 14) {
      if (write == null) {
        write = form.argsForm().writeBlock(output, args, writer);
      } else {
        write = write.produce(output);
      }
      if (write.isDone()) {
        step = 15;
      } else if (write.isError()) {
        return write.asError();
      }
    }
    if (step == 15 && output.isCont()) {
      output.write(')');
      return Write.done();
    }
    if (output.isDone()) {
      return Write.error(new WriteException("Truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteWamlAttr<A>(writer, form, name, args,
                                write, index, escape, step);
  }

}
