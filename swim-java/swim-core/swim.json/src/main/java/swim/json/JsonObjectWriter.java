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
import swim.collections.UniformMap;
import swim.decl.FilterMode;
import swim.util.Assume;
import swim.util.Iterators;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public interface JsonObjectWriter<V, @Contravariant T> extends JsonWriter<T> {

  JsonFieldWriter<? extends V, T> getFieldWriter(T object, String key) throws JsonException;

  Iterator<JsonFieldWriter<? extends V, T>> getFieldWriters(T object) throws JsonException;

  @Override
  default Write<?> write(Output<?> output, @Nullable T object, JsonWriterOptions options) {
    if (object == null) {
      return this.writeNull(output);
    }
    final Iterator<JsonFieldWriter<? extends V, T>> fieldWriters;
    try {
      fieldWriters = this.getFieldWriters(object);
    } catch (JsonException cause) {
      return Write.error(cause);
    }
    return this.writeObject(output, object, fieldWriters, options);
  }

  default Write<?> writeObject(Output<?> output, T object,
                               Iterator<JsonFieldWriter<? extends V, T>> fieldWriters,
                               JsonWriterOptions options) {
    return WriteJsonObject.write(output, this, options, object, fieldWriters, null, null, null, 1);
  }

  static <V, T> JsonObjectWriter<V, T> serializer(@Nullable String typeName,
                                                  UniformMap<String, JsonFieldWriter<? extends V, T>> fieldWriters,
                                                  @Nullable JsonFieldFormat<? extends V, T> annexFieldFormat) {
    return new JsonObjectSerializer<V, T>(typeName, fieldWriters, annexFieldFormat);
  }

  static <V, T> JsonObjectWriter<V, T> prefixer(@Nullable String typeName, JsonFieldWriter<? extends V, T> prefixWriter,
                                                JsonObjectWriter<V, T> writer) {
    return new JsonObjectPrefixer<V, T>(typeName, prefixWriter, writer);
  }

}

final class JsonObjectSerializer<V, T> implements JsonObjectWriter<V, T>, WriteSource {

  final @Nullable String typeName;
  final UniformMap<String, JsonFieldWriter<? extends V, T>> fieldWriters;
  final @Nullable JsonFieldFormat<? extends V, T> annexFieldFormat;

  JsonObjectSerializer(@Nullable String typeName,
                       UniformMap<String, JsonFieldWriter<? extends V, T>> fieldWriters,
                       @Nullable JsonFieldFormat<? extends V, T> annexFieldFormat) {
    this.typeName = typeName;
    this.fieldWriters = fieldWriters.commit();
    this.annexFieldFormat = annexFieldFormat;
  }

  @Override
  public @Nullable String typeName() {
    return this.typeName;
  }

  @Nullable JsonFieldFormat<? extends V, T> getAnnexFieldFormat(T object, String key) throws JsonException {
    if (this.annexFieldFormat == null) {
      return null;
    }
    final JsonFormat<? extends V> annexValueFormat = this.annexFieldFormat.valueFormat();
    if (!(annexValueFormat instanceof JsonObjectFormat<?, ?, ?>)) {
      return null;
    }
    final V annexValue = this.annexFieldFormat.getValue(object);
    final JsonFieldFormat<?, ? extends V> annexedFieldFormat =
        Assume.<JsonObjectFormat<?, ?, V>>conforms(annexValueFormat).getFieldFormat(annexValue, key);
    return this.annexFieldFormat.flattened(key, Assume.conforms(annexedFieldFormat), FilterMode.DEFINED);
  }

  @Nullable Iterator<? extends JsonFieldFormat<? extends V, T>> getAnnexFieldFormats(T object) throws JsonException {
    if (this.annexFieldFormat == null) {
      return null;
    }
    final JsonFormat<? extends V> annexValueFormat = this.annexFieldFormat.valueFormat();
    if (!(annexValueFormat instanceof JsonObjectFormat<?, ?, ?>)) {
      return null;
    }
    final V annexValue = this.annexFieldFormat.getValue(object);
    final Iterator<? extends JsonFieldFormat<?, ? extends V>> annexedFieldFormats =
        Assume.<JsonObjectFormat<?, ?, V>>conforms(annexValueFormat).getFieldFormats(annexValue);
    return new AnnexedFieldIterator<V, V, T>(Assume.conforms(this.annexFieldFormat),
                                             Assume.conforms(annexedFieldFormats));
  }

  @Override
  public JsonFieldWriter<? extends V, T> getFieldWriter(T object, String key) throws JsonException {
    JsonFieldWriter<? extends V, T> fieldWriter = this.fieldWriters.get(key);
    if (fieldWriter == null) {
      fieldWriter = this.getAnnexFieldFormat(object, key);
      if (fieldWriter == null) {
        throw new JsonException(Notation.of("unsupported key: ")
                                        .appendSource(key)
                                        .toString());
      }
    }
    return fieldWriter;
  }

  @Override
  public Iterator<JsonFieldWriter<? extends V, T>> getFieldWriters(T object) throws JsonException {
    Iterator<JsonFieldWriter<? extends V, T>> fieldWriters = this.fieldWriters.valueIterator();
    final Iterator<? extends JsonFieldFormat<? extends V, T>> annexFieldFormats = this.getAnnexFieldFormats(object);
    if (annexFieldFormats != null) {
      fieldWriters = Iterators.concat(fieldWriters, annexFieldFormats);
    }
    return fieldWriters;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonObjectWriter", "serializer")
            .appendArgument(this.typeName)
            .appendArgument(this.fieldWriters)
            .appendArgument(this.annexFieldFormat)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final class AnnexedFieldIterator<V, W extends V, T> implements Iterator<JsonFieldFormat<W, T>> {

    final JsonFieldFormat<V, T> annexFieldFormat;
    final Iterator<JsonFieldFormat<W, V>> annexedFieldFormats;

    AnnexedFieldIterator(JsonFieldFormat<V, T> annexFieldFormat,
                         Iterator<JsonFieldFormat<W, V>> annexedFieldFormats) {
      this.annexFieldFormat = annexFieldFormat;
      this.annexedFieldFormats = annexedFieldFormats;
    }

    @Override
    public boolean hasNext() {
      return this.annexedFieldFormats.hasNext();
    }

    @Override
    public JsonFieldFormat<W, T> next() {
      final JsonFieldFormat<W, V> annexedFieldFormat = this.annexedFieldFormats.next();
      return this.annexFieldFormat.flattened(annexedFieldFormat.key(), annexedFieldFormat, FilterMode.DEFINED);
    }

  }

}

final class JsonObjectPrefixer<V, T> implements JsonObjectWriter<V, T>, WriteSource {

  final @Nullable String typeName;
  final JsonFieldWriter<? extends V, T> prefixWriter;
  final JsonObjectWriter<V, T> writer;

  JsonObjectPrefixer(@Nullable String typeName, JsonFieldWriter<? extends V, T> prefixWriter,
                     JsonObjectWriter<V, T> writer) {
    this.typeName = typeName;
    this.prefixWriter = prefixWriter;
    this.writer = writer;
  }

  @Override
  public @Nullable String typeName() {
    return this.typeName;
  }

  @Override
  public JsonFieldWriter<? extends V, T> getFieldWriter(T object, String key) throws JsonException {
    if (this.prefixWriter.key().equals(key)) {
      return this.prefixWriter;
    }
    return this.writer.getFieldWriter(object, key);
  }

  @Override
  public Iterator<JsonFieldWriter<? extends V, T>> getFieldWriters(T object) throws JsonException {
    return Iterators.prefixed(this.prefixWriter, this.writer.getFieldWriters(object));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonObjectWriter", "prefixer")
            .appendArgument(this.typeName)
            .appendArgument(this.prefixWriter)
            .appendArgument(this.writer)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

}

final class WriteJsonObject<V, T> extends Write<Object> {

  final JsonObjectWriter<V, T> writer;
  final JsonWriterOptions options;
  final T object;
  final Iterator<JsonFieldWriter<? extends V, T>> fieldWriters;
  final @Nullable JsonFieldWriter<V, T> fieldWriter;
  final @Nullable V value;
  final @Nullable Write<?> write;
  final int step;

  WriteJsonObject(JsonObjectWriter<V, T> writer, JsonWriterOptions options,
                  T object, Iterator<JsonFieldWriter<? extends V, T>> fieldWriters,
                  @Nullable JsonFieldWriter<V, T> fieldWriter, @Nullable V value,
                  @Nullable Write<?> write, int step) {
    this.writer = writer;
    this.options = options;
    this.object = object;
    this.fieldWriters = fieldWriters;
    this.fieldWriter = fieldWriter;
    this.value = value;
    this.write = write;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteJsonObject.write(output, this.writer, this.options, this.object, this.fieldWriters,
                                 this.fieldWriter, this.value, this.write, this.step);
  }

  static <V, T> Write<Object> write(Output<?> output, JsonObjectWriter<V, T> writer,
                                    JsonWriterOptions options, T object,
                                    Iterator<JsonFieldWriter<? extends V, T>> fieldWriters,
                                    @Nullable JsonFieldWriter<V, T> fieldWriter,
                                    @Nullable V value, @Nullable Write<?> write, int step) {
    if (step == 1 && output.isCont()) {
      output.write('{');
      do {
        if (!fieldWriters.hasNext()) {
          step = 5;
          break;
        }
        fieldWriter = Assume.conforms(fieldWriters.next());
        final boolean include;
        try {
          value = fieldWriter.getValue(object);
          include = fieldWriter.filterValue(object, value);
        } catch (JsonException cause) {
          return Write.error(cause);
        }
        if (include) {
          step = 2;
          break;
        } else {
          fieldWriter = null;
          value = null;
          continue;
        }
      } while (true);
    }
    do {
      if (step == 2) {
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
              step = 5;
              break;
            }
            fieldWriter = Assume.conforms(fieldWriters.next());
            final boolean include;
            try {
              value = fieldWriter.getValue(object);
              include = fieldWriter.filterValue(object, value);
            } catch (JsonException cause) {
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
      output.write('}');
      return Write.done();
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteJsonObject<V, T>(writer, options, object, fieldWriters,
                                     fieldWriter, value, write, step);
  }

}
