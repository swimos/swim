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

package swim.waml;

import java.util.Iterator;
import java.util.Map;
import swim.annotations.Contravariant;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Output;
import swim.codec.Write;
import swim.codec.WriteException;

@Public
@Since("5.0")
public interface WamlTupleWriter<V, @Contravariant T> extends WamlWriter<T> {

  @Nullable Iterator<? extends Map.Entry<String, V>> getFields(@Nullable T tuple) throws WamlException;

  default WamlWriter<String> keyWriter() {
    return WamlLang.keyFormat();
  }

  WamlWriter<V> valueWriter();

  @Override
  default Write<?> write(Output<?> output, @Nullable Object attrs,
                         @Nullable T tuple, WamlWriterOptions options) {
    return this.writeTuple(output, attrs, tuple, options);
  }

  @Override
  default Write<?> writeBlock(Output<?> output, @Nullable T tuple, WamlWriterOptions options) {
    final Iterator<? extends Map.Entry<String, V>> fields;
    try {
      fields = this.getFields(tuple);
    } catch (WamlException cause) {
      return Write.error(cause);
    }
    if (fields == null) {
      return Write.done();
    }
    return this.writeFields(output, fields, options);
  }

  @Override
  default Write<?> writeInline(Output<?> output, @Nullable T tuple, WamlWriterOptions options) {
    final Object attrs;
    try {
      attrs = this.getAttrs(tuple);
    } catch (WamlException cause) {
      return Write.error(cause);
    }
    return this.writeUnit(output, attrs, options);
  }

  default Write<?> writeFields(Output<?> output, Iterator<? extends Map.Entry<String, V>> fields,
                               WamlWriterOptions options) {
    return WriteWamlFields.write(output, this, options, fields, null, null, null, 1);
  }

}

final class WriteWamlFields<V> extends Write<Object> {

  final WamlTupleWriter<V, ?> writer;
  final WamlWriterOptions options;
  final Iterator<? extends Map.Entry<String, V>> fields;
  final @Nullable String key;
  final @Nullable V value;
  final @Nullable Write<?> write;
  final int step;

  WriteWamlFields(WamlTupleWriter<V, ?> writer, WamlWriterOptions options,
                  Iterator<? extends Map.Entry<String, V>> fields, @Nullable String key,
                  @Nullable V value, @Nullable Write<?> write, int step) {
    this.writer = writer;
    this.options = options;
    this.fields = fields;
    this.key = key;
    this.value = value;
    this.write = write;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteWamlFields.write(output, this.writer, this.options, this.fields,
                                 this.key, this.value, this.write, this.step);
  }

  static <V> Write<Object> write(Output<?> output, WamlTupleWriter<V, ?> writer,
                                 WamlWriterOptions options,
                                 Iterator<? extends Map.Entry<String, V>> fields,
                                 @Nullable String key, @Nullable V value,
                                 @Nullable Write<?> write, int step) {
    do {
      if (step == 1) {
        if (!fields.hasNext()) {
          return Write.done();
        }
        final Map.Entry<String, V> entry = fields.next();
        key = entry.getKey();
        value = entry.getValue();
        if (key != null) {
          step = 2;
        } else {
          step = 5;
        }
      }
      if (step == 2) {
        if (write == null) {
          write = writer.keyWriter().write(output, key, options);
        } else {
          write = write.produce(output);
        }
        if (write.isDone()) {
          key = null;
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
        if (!options.whitespace()) {
          step = 5;
        } else if (output.isCont()) {
          output.write(' ');
          step = 5;
        }
      }
      if (step == 5) {
        if (write == null) {
          write = writer.valueWriter().write(output, value, options);
        } else {
          write = write.produce(output);
        }
        if (write.isDone()) {
          value = null;
          write = null;
          if (!fields.hasNext()) {
            return Write.done();
          }
          step = 6;
        } else if (write.isError()) {
          return write.asError();
        }
      }
      if (step == 6 && output.isCont()) {
        output.write(',');
        step = 7;
      }
      if (step == 7) {
        if (!options.whitespace()) {
          step = 1;
          continue;
        } else if (output.isCont()) {
          output.write(' ');
          step = 1;
          continue;
        }
      }
      break;
    } while (true);
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteWamlFields<V>(writer, options, fields, key, value, write, step);
  }

}
