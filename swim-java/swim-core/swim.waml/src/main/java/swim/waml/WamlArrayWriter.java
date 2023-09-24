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

package swim.waml;

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
public interface WamlArrayWriter<E, @Contravariant T> extends WamlWriter<T> {

  @Nullable Iterator<? extends E> getElements(@Nullable T value) throws WamlException;

  WamlWriter<E> elementWriter();

  @Override
  default Write<?> write(Output<?> output, @Nullable Object attrs,
                         @Nullable T value, WamlWriterOptions options) {
    final Iterator<? extends E> elements;
    try {
      elements = this.getElements(value);
    } catch (WamlException cause) {
      return Write.error(cause);
    }
    if (elements == null) {
      return this.writeUnit(output, attrs, options);
    }
    return this.writeArray(output, attrs, elements, options);
  }

  default Write<?> writeArray(Output<?> output, @Nullable Object attrs,
                              Iterator<? extends E> elements, WamlWriterOptions options) {
    return WriteWamlArray.write(output, this, options, attrs, elements, null, 1);
  }

}

final class WriteWamlArray<E> extends Write<Object> {

  final WamlArrayWriter<E, ?> writer;
  final WamlWriterOptions options;
  final @Nullable Object attrs;
  final Iterator<? extends E> elements;
  final @Nullable Write<?> write;
  final int step;

  WriteWamlArray(WamlArrayWriter<E, ?> writer, WamlWriterOptions options, @Nullable Object attrs,
                 Iterator<? extends E> elements, @Nullable Write<?> write, int step) {
    this.writer = writer;
    this.options = options;
    this.attrs = attrs;
    this.elements = elements;
    this.write = write;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteWamlArray.write(output, this.writer, this.options, this.attrs,
                                this.elements, this.write, this.step);
  }

  static <E> Write<Object> write(Output<?> output, WamlArrayWriter<E, ?> writer,
                                 WamlWriterOptions options, @Nullable Object attrs,
                                 Iterator<? extends E> elements,
                                 @Nullable Write<?> write, int step) {
    if (step == 1) {
      if (write == null) {
        write = writer.attrsWriter().writeAttrs(output, attrs, options, options.whitespace());
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
    if (step == 2 && output.isCont()) {
      output.write('[');
      step = 3;
    }
    do {
      if (step == 3) {
        if (write == null) {
          if (elements.hasNext()) {
            write = writer.elementWriter().write(output, elements.next(), options);
          } else {
            step = 6;
            break;
          }
        } else {
          write = write.produce(output);
        }
        if (write.isDone()) {
          write = null;
          if (elements.hasNext()) {
            step = 4;
          } else {
            step = 6;
            break;
          }
        } else if (write.isError()) {
          return write.asError();
        }
      }
      if (step == 4 && output.isCont()) {
        output.write(',');
        step = 5;
      }
      if (step == 5) {
        if (!options.whitespace()) {
          step = 3;
          continue;
        } else if (output.isCont()) {
          output.write(' ');
          step = 3;
          continue;
        }
      }
      break;
    } while (true);
    if (step == 6 && output.isCont()) {
      output.write(']');
      return Write.done();
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteWamlArray<E>(writer, options, attrs, elements, write, step);
  }

}
