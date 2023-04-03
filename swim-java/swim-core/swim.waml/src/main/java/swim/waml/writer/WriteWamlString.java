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

import java.util.Iterator;
import java.util.Map;
import swim.annotations.Internal;
import swim.annotations.Nullable;
import swim.codec.Base16;
import swim.codec.Output;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.util.Assume;
import swim.waml.WamlAttrForm;
import swim.waml.WamlException;
import swim.waml.WamlForm;
import swim.waml.WamlWriter;

@Internal
public final class WriteWamlString extends Write<Object> {

  final WamlWriter writer;
  final WamlForm<?> form;
  final String string;
  final Iterator<? extends Map.Entry<String, ?>> attrs;
  final @Nullable Write<?> write;
  final int index;
  final int escape;
  final int step;

  public WriteWamlString(WamlWriter writer, WamlForm<?> form, String string,
                         Iterator<? extends Map.Entry<String, ?>> attrs,
                         @Nullable Write<?> write, int index, int escape, int step) {
    this.writer = writer;
    this.form = form;
    this.string = string;
    this.attrs = attrs;
    this.write = write;
    this.index = index;
    this.escape = escape;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteWamlString.write(output, this.writer, this.form, this.string,
                                 this.attrs, this.write, this.index,
                                 this.escape, this.step);
  }

  public static Write<Object> write(Output<?> output, WamlWriter writer,
                                    WamlForm<?> form, String string,
                                    Iterator<? extends Map.Entry<String, ?>> attrs,
                                    @Nullable Write<?> write, int index,
                                    int escape, int step) {
    do {
      if (step == 1) {
        if (write == null) {
          if (attrs.hasNext()) {
            final Map.Entry<String, ?> attr = attrs.next();
            final String name = attr.getKey();
            final WamlAttrForm<Object, ?> attrForm;
            try {
              attrForm = Assume.conforms(form.getAttrForm(name));
            } catch (WamlException cause) {
              return Write.error(cause);
            }
            write = writer.writeAttr(output, attrForm, name, attr.getValue());
          } else {
            step = 3;
            break;
          }
        } else {
          write = write.produce(output);
        }
        if (write.isDone()) {
          write = null;
          step = 2;
        } else if (write.isError()) {
          return write.asError();
        }
      }
      if (step == 2) {
        if (writer.options().whitespace()) {
          if (output.isCont()) {
            output.write(' ');
            if (attrs.hasNext()) {
              step = 1;
              continue;
            } else {
              step = 3;
              break;
            }
          }
        } else if (attrs.hasNext()) {
          step = 1;
          continue;
        } else {
          step = 3;
          break;
        }
      }
      break;
    } while (true);
    if (step == 3 && output.isCont()) {
      output.write('"');
      step = 4;
    }
    do {
      if (step == 4 && output.isCont()) {
        if (index < string.length()) {
          final int c = string.codePointAt(index);
          index = string.offsetByCodePoints(index, 1);
          if (c == '"' || c == '\\') {
            output.write('\\');
            escape = c;
            step = 5;
          } else if (c == '\b') {
            output.write('\\');
            escape = 'b';
            step = 5;
          } else if (c == '\f') {
            output.write('\\');
            escape = 'f';
            step = 5;
          } else if (c == '\n') {
            output.write('\\');
            escape = 'n';
            step = 5;
          } else if (c == '\r') {
            output.write('\\');
            escape = 'r';
            step = 5;
          } else if (c == '\t') {
            output.write('\\');
            escape = 't';
            step = 5;
          } else if (c < 0x20) {
            output.write('\\');
            escape = c;
            step = 6;
          } else {
            output.write(c);
            continue;
          }
        } else {
          step = 11;
          break;
        }
      }
      if (step == 5 && output.isCont()) {
        output.write(escape);
        escape = 0;
        step = 4;
        continue;
      }
      if (step == 6 && output.isCont()) {
        output.write('u');
        step = 7;
      }
      if (step == 7 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit((escape >>> 12) & 0xF));
        step = 8;
      }
      if (step == 8 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit((escape >>> 8) & 0xF));
        step = 9;
      }
      if (step == 9 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit((escape >>> 4) & 0xF));
        step = 10;
      }
      if (step == 10 && output.isCont()) {
        output.write(Base16.uppercase().encodeDigit(escape & 0xF));
        escape = 0;
        step = 4;
        continue;
      }
      break;
    } while (true);
    if (step == 11 && output.isCont()) {
      output.write('"');
      return Write.done();
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteWamlString(writer, form, string, attrs,
                               write, index, escape, step);
  }

}
