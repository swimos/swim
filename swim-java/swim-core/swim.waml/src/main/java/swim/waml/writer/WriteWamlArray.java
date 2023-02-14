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
import swim.codec.Output;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.util.Assume;
import swim.waml.WamlArrayForm;
import swim.waml.WamlAttrForm;
import swim.waml.WamlWriter;

@Internal
public final class WriteWamlArray<E> extends Write<Object> {

  final WamlWriter writer;
  final WamlArrayForm<E, ?, ?> form;
  final Iterator<? extends E> elements;
  final Iterator<? extends Map.Entry<String, ?>> attrs;
  final @Nullable Write<?> write;
  final int step;

  public WriteWamlArray(WamlWriter writer, WamlArrayForm<E, ?, ?> form,
                        Iterator<? extends E> elements,
                        Iterator<? extends Map.Entry<String, ?>> attrs,
                        @Nullable Write<?> write, int step) {
    this.writer = writer;
    this.form = form;
    this.elements = elements;
    this.attrs = attrs;
    this.write = write;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteWamlArray.write(output, this.writer, this.form, this.elements,
                                this.attrs, this.write, this.step);
  }

  public static <E> Write<Object> write(Output<?> output, WamlWriter writer,
                                        WamlArrayForm<E, ?, ?> form,
                                        Iterator<? extends E> elements,
                                        Iterator<? extends Map.Entry<String, ?>> attrs,
                                        @Nullable Write<?> write, int step) {
    do {
      if (step == 1) {
        if (write == null) {
          if (attrs.hasNext()) {
            final Map.Entry<String, ?> attr = attrs.next();
            final String name = attr.getKey();
            final WamlAttrForm<Object, ?> attrForm = Assume.conformsNullable(form.getAttrForm(name));
            if (attrForm == null) {
              return Write.error(new WriteException("Unsupported attribute: " + name));
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
      output.write('[');
      step = 4;
    }
    do {
      if (step == 4) {
        if (write == null) {
          if (elements.hasNext()) {
            write = form.elementForm().write(output, elements.next(), writer);
          } else {
            step = 7;
            break;
          }
        } else {
          write = write.produce(output);
        }
        if (write.isDone()) {
          write = null;
          if (elements.hasNext()) {
            step = 5;
          } else {
            step = 7;
            break;
          }
        } else if (write.isError()) {
          return write.asError();
        }
      }
      if (step == 5 && output.isCont()) {
        output.write(',');
        step = 6;
      }
      if (step == 6) {
        if (writer.options().whitespace()) {
          if (output.isCont()) {
            output.write(' ');
            step = 4;
            continue;
          }
        } else {
          step = 4;
          continue;
        }
      }
      break;
    } while (true);
    if (step == 7 && output.isCont()) {
      output.write(']');
      return Write.done();
    }
    if (output.isDone()) {
      return Write.error(new WriteException("Truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteWamlArray<E>(writer, form, elements, attrs, write, step);
  }

}
