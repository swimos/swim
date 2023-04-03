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
import swim.waml.WamlAttrForm;
import swim.waml.WamlException;
import swim.waml.WamlFieldForm;
import swim.waml.WamlObjectForm;
import swim.waml.WamlWriter;

@Internal
public final class WriteWamlObject<K, V> extends Write<Object> {

  final WamlWriter writer;
  final WamlObjectForm<K, V, ?, ?> form;
  final Iterator<? extends Map.Entry<K, V>> fields;
  final Iterator<? extends Map.Entry<String, ?>> attrs;
  final @Nullable WamlFieldForm<K, V, ?> fieldForm;
  final @Nullable V value;
  final @Nullable Write<?> write;
  final int step;

  public WriteWamlObject(WamlWriter writer, WamlObjectForm<K, V, ?, ?> form,
                         Iterator<? extends Map.Entry<K, V>> fields,
                         Iterator<? extends Map.Entry<String, ?>> attrs,
                         @Nullable WamlFieldForm<K, V, ?> fieldForm,
                         @Nullable V value, @Nullable Write<?> write, int step) {
    this.writer = writer;
    this.form = form;
    this.fields = fields;
    this.attrs = attrs;
    this.fieldForm = fieldForm;
    this.value = value;
    this.write = write;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteWamlObject.write(output, this.writer, this.form, this.fields,
                                 this.attrs, this.fieldForm, this.value,
                                 this.write, this.step);
  }

  public static <K, V> Write<Object> write(Output<?> output, WamlWriter writer,
                                           WamlObjectForm<K, V, ?, ?> form,
                                           Iterator<? extends Map.Entry<K, V>> fields,
                                           Iterator<? extends Map.Entry<String, ?>> attrs,
                                           @Nullable WamlFieldForm<K, V, ?> fieldForm,
                                           @Nullable V value, @Nullable Write<?> write,
                                           int step) {
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
      output.write('{');
      step = 4;
    }
    do {
      if (step == 4) {
        if (write == null) {
          if (fields.hasNext()) {
            final Map.Entry<K, V> field = fields.next();
            final K key = field.getKey();
            value = field.getValue();
            try {
              fieldForm = form.getFieldForm(key);
            } catch (WamlException cause) {
              return Write.error(cause);
            }
            write = fieldForm.keyForm().write(output, key, writer);
          } else {
            step = 10;
            break;
          }
        } else {
          write = write.produce(output);
        }
        if (write.isDone()) {
          write = null;
          step = 5;
        } else if (write.isError()) {
          return write.asError();
        }
      }
      if (step == 5 && output.isCont()) {
        output.write(':');
        step = 6;
      }
      if (step == 6) {
        if (writer.options().whitespace()) {
          if (output.isCont()) {
            output.write(' ');
            step = 7;
          }
        } else {
          step = 7;
        }
      }
      if (step == 7) {
        fieldForm = Assume.nonNull(fieldForm);
        if (write == null) {
          write = fieldForm.valueForm().write(output, value, writer);
        } else {
          write = write.produce(output);
        }
        if (write.isDone()) {
          fieldForm = null;
          value = null;
          write = null;
          if (fields.hasNext()) {
            step = 8;
          } else {
            step = 10;
            break;
          }
        } else if (write.isError()) {
          return write.asError();
        }
      }
      if (step == 8 && output.isCont()) {
        output.write(',');
        step = 9;
      }
      if (step == 9) {
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
    if (step == 10 && output.isCont()) {
      output.write('}');
      return Write.done();
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteWamlObject<K, V>(writer, form, fields, attrs,
                                     fieldForm, value, write, step);
  }

}
