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
import swim.annotations.Contravariant;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Output;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.collections.UniformMap;
import swim.decl.FilterMode;
import swim.util.Assume;
import swim.util.Iterators;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public interface WamlObjectWriter<V, @Contravariant T> extends WamlWriter<T> {

  WamlFieldWriter<? extends V, T> getFieldWriter(T object, String key) throws WamlException;

  Iterator<WamlFieldWriter<? extends V, T>> getFieldWriters(T object) throws WamlException;

  @Override
  default Write<?> write(Output<?> output, @Nullable Object attrs,
                         @Nullable T object, WamlWriterOptions options) {
    if (object == null) {
      return this.writeUnit(output, attrs, options);
    }
    final Iterator<WamlFieldWriter<? extends V, T>> fieldWriters;
    try {
      fieldWriters = this.getFieldWriters(object);
    } catch (WamlException cause) {
      return Write.error(cause);
    }
    return this.writeObject(output, attrs, object, fieldWriters, options);
  }

  default Write<?> writeObject(Output<?> output, @Nullable Object attrs, T object,
                               Iterator<WamlFieldWriter<? extends V, T>> fieldWriters,
                               WamlWriterOptions options) {
    return WriteWamlObject.write(output, this, options, attrs, object, fieldWriters, null, null, null, 1);
  }

  static <V, T> WamlObjectWriter<V, T> serializer(@Nullable String typeName,
                                                  UniformMap<String, WamlFieldWriter<? extends V, T>> fieldWriters,
                                                  @Nullable WamlFieldFormat<? extends V, T> annexFieldFormat) {
    return new WamlObjectSerializer<V, T>(typeName, fieldWriters, annexFieldFormat);
  }

}

final class WamlObjectSerializer<V, T> implements WamlObjectWriter<V, T>, WriteSource {

  final @Nullable String typeName;
  final UniformMap<String, WamlFieldWriter<? extends V, T>> fieldWriters;
  final @Nullable WamlFieldFormat<? extends V, T> annexFieldFormat;

  WamlObjectSerializer(@Nullable String typeName,
                       UniformMap<String, WamlFieldWriter<? extends V, T>> fieldWriters,
                       @Nullable WamlFieldFormat<? extends V, T> annexFieldFormat) {
    this.typeName = typeName;
    this.fieldWriters = fieldWriters.commit();
    this.annexFieldFormat = annexFieldFormat;
  }

  @Override
  public @Nullable String typeName() {
    return this.typeName;
  }

  @Nullable WamlFieldFormat<? extends V, T> getAnnexFieldFormat(T object, String key) throws WamlException {
    if (this.annexFieldFormat == null) {
      return null;
    }
    final WamlFormat<? extends V> annexValueFormat = this.annexFieldFormat.valueFormat();
    if (!(annexValueFormat instanceof WamlObjectFormat<?, ?, ?>)) {
      return null;
    }
    final V annexValue = this.annexFieldFormat.getValue(object);
    final WamlFieldFormat<?, ? extends V> annexedFieldFormat =
        Assume.<WamlObjectFormat<?, ?, V>>conforms(annexValueFormat).getFieldFormat(annexValue, key);
    return this.annexFieldFormat.flattened(key, Assume.conforms(annexedFieldFormat), FilterMode.DEFINED);
  }

  @Nullable Iterator<? extends WamlFieldFormat<? extends V, T>> getAnnexFieldFormats(T object) throws WamlException {
    if (this.annexFieldFormat == null) {
      return null;
    }
    final WamlFormat<? extends V> annexValueFormat = this.annexFieldFormat.valueFormat();
    if (!(annexValueFormat instanceof WamlObjectFormat<?, ?, ?>)) {
      return null;
    }
    final V annexValue = this.annexFieldFormat.getValue(object);
    final Iterator<? extends WamlFieldFormat<?, ? extends V>> annexedFieldFormats =
        Assume.<WamlObjectFormat<?, ?, V>>conforms(annexValueFormat).getFieldFormats(annexValue);
    return new AnnexedFieldIterator<V, V, T>(Assume.conforms(this.annexFieldFormat),
                                             Assume.conforms(annexedFieldFormats));
  }

  @Override
  public WamlFieldWriter<? extends V, T> getFieldWriter(T object, String key) throws WamlException {
    WamlFieldWriter<? extends V, T> fieldWriter = this.fieldWriters.get(key);
    if (fieldWriter == null) {
      fieldWriter = this.getAnnexFieldFormat(object, key);
      if (fieldWriter == null) {
        throw new WamlException(Notation.of("unsupported key: ")
                                        .appendSource(key)
                                        .toString());
      }
    }
    return fieldWriter;
  }

  @Override
  public Iterator<WamlFieldWriter<? extends V, T>> getFieldWriters(T object) throws WamlException {
    Iterator<WamlFieldWriter<? extends V, T>> fieldWriters = this.fieldWriters.valueIterator();
    final Iterator<? extends WamlFieldFormat<? extends V, T>> annexFieldFormats = this.getAnnexFieldFormats(object);
    if (annexFieldFormats != null) {
      fieldWriters = Iterators.concat(fieldWriters, annexFieldFormats);
    }
    return fieldWriters;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlObjectWriter", "serializer")
            .appendArgument(this.typeName)
            .appendArgument(this.fieldWriters)
            .appendArgument(this.annexFieldFormat)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final class AnnexedFieldIterator<V, W extends V, T> implements Iterator<WamlFieldFormat<W, T>> {

    final WamlFieldFormat<V, T> annexFieldFormat;
    final Iterator<WamlFieldFormat<W, V>> annexedFieldFormats;

    AnnexedFieldIterator(WamlFieldFormat<V, T> annexFieldFormat,
                         Iterator<WamlFieldFormat<W, V>> annexedFieldFormats) {
      this.annexFieldFormat = annexFieldFormat;
      this.annexedFieldFormats = annexedFieldFormats;
    }

    @Override
    public boolean hasNext() {
      return this.annexedFieldFormats.hasNext();
    }

    @Override
    public WamlFieldFormat<W, T> next() {
      final WamlFieldFormat<W, V> annexedFieldFormat = this.annexedFieldFormats.next();
      return this.annexFieldFormat.flattened(annexedFieldFormat.key(), annexedFieldFormat, FilterMode.DEFINED);
    }

  }

}

final class WriteWamlObject<V, T> extends Write<Object> {

  final WamlObjectWriter<V, T> writer;
  final WamlWriterOptions options;
  final @Nullable Object attrs;
  final T object;
  final Iterator<WamlFieldWriter<? extends V, T>> fieldWriters;
  final @Nullable WamlFieldWriter<V, T> fieldWriter;
  final @Nullable V value;
  final @Nullable Write<?> write;
  final int step;

  WriteWamlObject(WamlObjectWriter<V, T> writer, WamlWriterOptions options,
                  @Nullable Object attrs, T object,
                  Iterator<WamlFieldWriter<? extends V, T>> fieldWriters,
                  @Nullable WamlFieldWriter<V, T> fieldWriter, @Nullable V value,
                  @Nullable Write<?> write, int step) {
    this.writer = writer;
    this.options = options;
    this.attrs = attrs;
    this.object = object;
    this.fieldWriters = fieldWriters;
    this.fieldWriter = fieldWriter;
    this.value = value;
    this.write = write;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteWamlObject.write(output, this.writer, this.options, this.attrs, this.object,
                                 this.fieldWriters, this.fieldWriter, this.value, this.write, this.step);
  }

  static <V, T> Write<Object> write(Output<?> output, WamlObjectWriter<V, T> writer,
                                    WamlWriterOptions options, @Nullable Object attrs, T object,
                                    Iterator<WamlFieldWriter<? extends V, T>> fieldWriters,
                                    @Nullable WamlFieldWriter<V, T> fieldWriter,
                                    @Nullable V value, @Nullable Write<?> write, int step) {
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
      output.write('{');
      do {
        if (!fieldWriters.hasNext()) {
          step = 6;
          break;
        }
        fieldWriter = Assume.conforms(fieldWriters.next());
        final boolean include;
        try {
          value = fieldWriter.getValue(object);
          include = fieldWriter.filterValue(object, value);
        } catch (WamlException cause) {
          return Write.error(cause);
        }
        if (include) {
          step = 3;
          break;
        } else {
          fieldWriter = null;
          value = null;
          continue;
        }
      } while (true);
    }
    do {
      if (step == 3) {
        if (write == null) {
          write = Assume.nonNull(fieldWriter).writeField(output, object, value, options);
        } else {
          write = write.produce(output);
        }
        if (write.isDone()) {
          fieldWriter = null;
          value = null;
          write = null;
          do {
            if (!fieldWriters.hasNext()) {
              step = 6;
              break;
            }
            fieldWriter = Assume.conforms(fieldWriters.next());
            final boolean include;
            try {
              value = fieldWriter.getValue(object);
              include = fieldWriter.filterValue(object, value);
            } catch (WamlException cause) {
              return Write.error(cause);
            }
            if (include) {
              step = 4;
              break;
            } else {
              fieldWriter = null;
              value = null;
              continue;
            }
          } while (true);
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
      output.write('}');
      return Write.done();
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteWamlObject<V, T>(writer, options, attrs, object, fieldWriters,
                                     fieldWriter, value, write, step);
  }

}
