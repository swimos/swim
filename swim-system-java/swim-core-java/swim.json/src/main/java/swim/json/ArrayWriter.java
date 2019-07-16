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

package swim.json;

import java.util.Iterator;
import swim.codec.Output;
import swim.codec.Writer;
import swim.codec.WriterException;

final class ArrayWriter<I, V> extends Writer<Object, Object> {
  final JsonWriter<I, V> json;
  final Iterator<I> items;
  final Writer<?, ?> part;
  final int index;
  final int step;

  ArrayWriter(JsonWriter<I, V> json, Iterator<I> items, Writer<?, ?> part, int index, int step) {
    this.json = json;
    this.items = items;
    this.part = part;
    this.index = index;
    this.step = step;
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return write(output, this.json, this.items, this.part, this.index, this.step);
  }

  static <I, V> Writer<Object, Object> write(Output<?> output, JsonWriter<I, V> json, Iterator<I> items,
                                             Writer<?, ?> part, int index, int step) {
    if (step == 1 && output.isCont()) {
      output = output.write('[');
      step = 2;
    }
    do {
      if (step == 2) {
        if (part == null) {
          if (items.hasNext()) {
            part = json.writeValue(items.next(), output, index);
          } else {
            step = 4;
            break;
          }
        } else {
          part = part.pull(output);
        }
        if (part.isDone()) {
          part = null;
          index += 1;
          if (items.hasNext()) {
            step = 3;
          } else {
            step = 4;
            break;
          }
        } else if (part.isError()) {
          return part.asError();
        } else {
          break;
        }
      }
      if (step == 3 && output.isCont()) {
        output = output.write(',');
        step = 2;
        continue;
      }
    } while (step == 2);
    if (step == 4 && output.isCont()) {
      output = output.write(']');
      return done();
    }
    if (output.isDone()) {
      return error(new WriterException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new ArrayWriter<I, V>(json, items, part, index, step);
  }

  static <I, V> Writer<Object, Object> write(Output<?> output, JsonWriter<I, V> json, Iterator<I> items) {
    return write(output, json, items, null, 0, 1);
  }
}
