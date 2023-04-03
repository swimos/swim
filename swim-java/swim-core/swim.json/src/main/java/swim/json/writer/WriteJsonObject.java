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

package swim.json.writer;

import java.util.Iterator;
import java.util.Map;
import swim.annotations.Internal;
import swim.annotations.Nullable;
import swim.codec.Output;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.json.JsonException;
import swim.json.JsonFieldForm;
import swim.json.JsonObjectForm;
import swim.json.JsonWriter;
import swim.util.Assume;

@Internal
public final class WriteJsonObject<K, V> extends Write<Object> {

  final JsonWriter writer;
  final JsonObjectForm<K, V, ?, ?> form;
  final Iterator<? extends Map.Entry<K, V>> fields;
  final @Nullable JsonFieldForm<K, V, ?> fieldForm;
  final @Nullable V value;
  final @Nullable Write<?> write;
  final int step;

  public WriteJsonObject(JsonWriter writer, JsonObjectForm<K, V, ?, ?> form,
                         Iterator<? extends Map.Entry<K, V>> fields,
                         @Nullable JsonFieldForm<K, V, ?> fieldForm,
                         @Nullable V value, @Nullable Write<?> write, int step) {
    this.writer = writer;
    this.form = form;
    this.fields = fields;
    this.fieldForm = fieldForm;
    this.value = value;
    this.write = write;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteJsonObject.write(output, this.writer, this.form, this.fields,
                                 this.fieldForm, this.value, this.write,
                                 this.step);
  }

  public static <K, V> Write<Object> write(Output<?> output, JsonWriter writer,
                                           JsonObjectForm<K, V, ?, ?> form,
                                           Iterator<? extends Map.Entry<K, V>> fields,
                                           @Nullable JsonFieldForm<K, V, ?> fieldForm,
                                           @Nullable V value, @Nullable Write<?> write,
                                           int step) {
    if (step == 1 && output.isCont()) {
      output.write('{');
      step = 2;
    }
    do {
      if (step == 2) {
        if (write == null) {
          if (fields.hasNext()) {
            final Map.Entry<K, V> field = fields.next();
            final K key = field.getKey();
            value = field.getValue();
            try {
              fieldForm = form.getFieldForm(key);
              write = fieldForm.keyForm().write(output, key, writer);
            } catch (JsonException cause) {
              return Write.error(cause);
            }
          } else {
            step = 8;
            break;
          }
        } else {
          write = write.produce(output);
        }
        if (write.isDone()) {
          write = null;
          step = 3;
        } else if (write.isError()) {
          return write.asError();
        }
      }
      if (step == 3 && output.isCont()) {
        output.write(':');
        step = 4;
      }
      if (step == 4) {
        if (writer.options().whitespace()) {
          if (output.isCont()) {
            output.write(' ');
            step = 5;
          }
        } else {
          step = 5;
        }
      }
      if (step == 5) {
        fieldForm = Assume.nonNull(fieldForm);
        if (write == null) {
          try {
            write = fieldForm.valueForm().write(output, value, writer);
          } catch (JsonException cause) {
            return Write.error(cause);
          }
        } else {
          write = write.produce(output);
        }
        if (write.isDone()) {
          fieldForm = null;
          value = null;
          write = null;
          if (fields.hasNext()) {
            step = 6;
          } else {
            step = 8;
            break;
          }
        } else if (write.isError()) {
          return write.asError();
        }
      }
      if (step == 6 && output.isCont()) {
        output.write(',');
        step = 7;
      }
      if (step == 7) {
        if (writer.options().whitespace()) {
          if (output.isCont()) {
            output.write(' ');
            step = 2;
            continue;
          }
        } else {
          step = 2;
          continue;
        }
      }
      break;
    } while (true);
    if (step == 8 && output.isCont()) {
      output.write('}');
      return Write.done();
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteJsonObject<K, V>(writer, form, fields, fieldForm,
                                     value, write, step);
  }

}
