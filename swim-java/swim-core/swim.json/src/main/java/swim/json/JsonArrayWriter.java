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

import java.util.Iterator;
import swim.annotations.Contravariant;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Output;
import swim.codec.Write;
import swim.codec.WriteException;

@Public
@Since("5.0")
public interface JsonArrayWriter<E, @Contravariant T> extends JsonWriter<T> {

  @Nullable Iterator<E> getElements(@Nullable T value) throws JsonException;

  JsonWriter<E> elementWriter();

  @Override
  default Write<?> write(Output<?> output, @Nullable T value, JsonWriterOptions options) {
    final Iterator<E> elements;
    try {
      elements = this.getElements(value);
    } catch (JsonException cause) {
      return Write.error(cause);
    }
    if (elements == null) {
      return this.writeNull(output);
    }
    return this.writeArray(output, elements, options);
  }

  default Write<?> writeArray(Output<?> output, Iterator<E> elements, JsonWriterOptions options) {
    return WriteJsonArray.write(output, this, options, elements, null, 1);
  }

}

final class WriteJsonArray<E> extends Write<Object> {

  final JsonArrayWriter<E, ?> writer;
  final JsonWriterOptions options;
  final Iterator<E> elements;
  final @Nullable Write<?> write;
  final int step;

  WriteJsonArray(JsonArrayWriter<E, ?> writer, JsonWriterOptions options,
                 Iterator<E> elements, @Nullable Write<?> write, int step) {
    this.writer = writer;
    this.options = options;
    this.elements = elements;
    this.write = write;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteJsonArray.write(output, this.writer, this.options,
                                this.elements, this.write, this.step);
  }

  static <E> Write<Object> write(Output<?> output, JsonArrayWriter<E, ?> writer,
                                 JsonWriterOptions options, Iterator<E> elements,
                                 @Nullable Write<?> write, int step) {
    if (step == 1 && output.isCont()) {
      output.write('[');
      step = 2;
    }
    do {
      if (step == 2) {
        if (write == null) {
          if (elements.hasNext()) {
            write = writer.elementWriter().write(output, elements.next(), options);
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
        if (!options.whitespace()) {
          step = 2;
          continue;
        } else if (output.isCont()) {
          output.write(' ');
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
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteJsonArray<E>(writer, options, elements, write, step);
  }

}
