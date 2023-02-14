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
import swim.annotations.Internal;
import swim.annotations.Nullable;
import swim.codec.Output;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.json.JsonArrayForm;
import swim.json.JsonWriter;

@Internal
public final class WriteJsonArray<E> extends Write<Object> {

  final JsonWriter writer;
  final JsonArrayForm<E, ?, ?> form;
  final Iterator<? extends E> elements;
  final @Nullable Write<?> write;
  final int step;

  public WriteJsonArray(JsonWriter writer, JsonArrayForm<E, ?, ?> form,
                        Iterator<? extends E> elements,
                        @Nullable Write<?> write, int step) {
    this.writer = writer;
    this.form = form;
    this.elements = elements;
    this.write = write;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteJsonArray.write(output, this.writer, this.form,
                                this.elements, this.write, this.step);
  }

  public static <E> Write<Object> write(Output<?> output, JsonWriter writer,
                                        JsonArrayForm<E, ?, ?> form,
                                        Iterator<? extends E> elements,
                                        @Nullable Write<?> write, int step) {
    if (step == 1 && output.isCont()) {
      output.write('[');
      step = 2;
    }
    do {
      if (step == 2) {
        if (write == null) {
          if (elements.hasNext()) {
            write = form.elementForm().write(output, elements.next(), writer);
          } else {
            step = 5;
            break;
          }
        } else {
          write = write.produce(output);
        }
        if (write.isDone()) {
          write = null;
          if (elements.hasNext()) {
            step = 3;
          } else {
            step = 5;
            break;
          }
        } else if (write.isError()) {
          return write.asError();
        }
      }
      if (step == 3 && output.isCont()) {
        output.write(',');
        step = 4;
      }
      if (step == 4) {
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
    if (step == 5 && output.isCont()) {
      output.write(']');
      return Write.done();
    }
    if (output.isDone()) {
      return Write.error(new WriteException("Truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteJsonArray<E>(writer, form, elements, write, step);
  }

}
