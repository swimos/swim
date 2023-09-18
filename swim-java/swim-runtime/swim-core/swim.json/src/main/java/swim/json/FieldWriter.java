// Copyright 2015-2023 Nstream, inc.
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

import swim.codec.Output;
import swim.codec.Writer;
import swim.codec.WriterException;

final class FieldWriter<I, V> extends Writer<Object, Object> {

  final JsonWriter<I, V> json;
  final V key;
  final V value;
  final Writer<?, ?> part;
  final int step;

  FieldWriter(JsonWriter<I, V> json, V key, V value, Writer<?, ?> part, int step) {
    this.json = json;
    this.key = key;
    this.value = value;
    this.part = part;
    this.step = step;
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return FieldWriter.write(output, this.json, this.key, this.value, this.part, this.step);
  }

  static <I, V> Writer<Object, Object> write(Output<?> output, JsonWriter<I, V> json,
                                             V key, V value, Writer<?, ?> part, int step) {
    if (step == 1) {
      if (part == null) {
        part = json.writeValue(output, key);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        part = null;
        step = 2;
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (step == 2 && output.isCont()) {
      output = output.write(':');
      step = 3;
    }
    if (step == 3) {
      if (part == null) {
        part = json.writeValue(output, value);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        return Writer.done();
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (output.isDone()) {
      return Writer.error(new WriterException("truncated"));
    } else if (output.isError()) {
      return Writer.error(output.trap());
    }
    return new FieldWriter<I, V>(json, key, value, part, step);
  }

  static <I, V> Writer<Object, Object> write(Output<?> output, JsonWriter<I, V> json, V key, V value) {
    return FieldWriter.write(output, json, key, value, null, 1);
  }

}
