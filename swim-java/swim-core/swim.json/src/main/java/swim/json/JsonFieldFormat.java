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

package swim.json;

import java.lang.invoke.MethodHandles;
import java.lang.invoke.VarHandle;
import java.util.List;
import java.util.Map;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.decl.FilterMode;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.Result;
import swim.util.ToSource;
import swim.util.UpdatableMap;

@Public
@Since("5.0")
public interface JsonFieldFormat<V, T> extends JsonFieldParser<V, T>, JsonFieldWriter<V, T> {

  JsonFormat<V> valueFormat();

  default @Nullable T merged(@Nullable T newObject, @Nullable T oldObject) throws JsonException {
    if (newObject == null || oldObject == null) {
      return newObject;
    }
    final V newValue = this.getValue(newObject);
    final V oldValue = this.getValue(oldObject);
    final V mergedValue = this.valueFormat().merged(newValue, oldValue);
    return this.updatedValue(newObject, mergedValue);
  }

  default T mergedValue(T object, @Nullable V newValue) throws JsonException {
    final V oldValue = this.getValue(object);
    final V mergedValue = this.valueFormat().merged(newValue, oldValue);
    return this.updatedValue(object, mergedValue);
  }

  default <W extends V> JsonFieldFormat<W, T> flattened(String key, JsonFieldFormat<W, V> innerFieldFormat,
                                                        FilterMode filterMode) {
    return new JsonFlattenedFieldFormat<V, W, T>(key, this, innerFieldFormat, filterMode);
  }

  static <V, T extends Map<String, V>> JsonFieldFormat<V, T> forKey(String key, JsonFormat<String> keyFormat,
                                                                    JsonFormat<V> valueFormat, FilterMode filterMode) {
    return new JsonFieldKeyFormat<V, T>(key, keyFormat, valueFormat, filterMode);
  }

  static <V, T> JsonFieldFormat<V, T> forIndex(String key, JsonFormat<String> keyFormat,
                                               VarHandle arrayHandle, int index, JsonFormat<V> valueFormat,
                                               FilterMode filterMode) throws JsonProviderException {
    final List<Class<?>> coordinateTypes = arrayHandle.coordinateTypes();
    if (coordinateTypes.size() != 2 || !coordinateTypes.get(1).equals(Integer.TYPE)) {
      throw new JsonProviderException("invalid array handle " + arrayHandle);
    }
    return new JsonFieldIndexFormat<V, T>(key, keyFormat, arrayHandle, index, valueFormat, filterMode);
  }

  static <V> JsonFieldFormat<V, Object[]> forIndex(String key, JsonFormat<String> keyFormat, int index,
                                                   JsonFormat<V> valueFormat, FilterMode filterMode) {
    return new JsonFieldIndexFormat<V, Object[]>(key, keyFormat, JsonFieldIndexFormat.OBJECT_ARRAY,
                                                 index, valueFormat, filterMode);
  }

  static <V, T> JsonFieldFormat<V, T> combining(JsonFormat<V> valueFormat,
                                                JsonFieldParser<V, T> fieldParser,
                                                JsonFieldWriter<V, T> fieldWriter) {
    return new JsonCombiningFieldFormat<V, T>(valueFormat, fieldParser, fieldWriter);
  }

  static <V, T> JsonFieldFormat<V, T> merging(JsonFormat<V> valueFormat,
                                              JsonFieldParser<V, T> fieldParser,
                                              JsonFieldWriter<V, T> fieldWriter) {
    return new JsonMergingFieldFormat<V, T>(valueFormat, fieldParser, fieldWriter);
  }

}

final class JsonFieldKeyFormat<V, T extends Map<String, V>> implements JsonFieldFormat<V, T>, ToSource {

  final String key;
  final JsonFormat<String> keyFormat;
  final JsonFormat<V> valueFormat;
  final FilterMode filterMode;

  JsonFieldKeyFormat(String key, JsonFormat<String> keyFormat,
                     JsonFormat<V> valueFormat, FilterMode filterMode) {
    this.key = key;
    this.keyFormat = keyFormat;
    this.valueFormat = valueFormat;
    this.filterMode = filterMode;
  }

  @Override
  public JsonFormat<V> valueFormat() {
    return this.valueFormat;
  }

  @Override
  public JsonParser<V> valueParser() {
    return this.valueFormat;
  }

  @Override
  public T updatedValue(T object, @Nullable V value) throws JsonException {
    try {
      if (object instanceof UpdatableMap<?, ?>) {
        return Assume.conforms(((UpdatableMap<String, V>) object).updated(this.key, value));
      }
      object.put(this.key, value);
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new JsonException(cause);
    }
    return object;
  }

  @Override
  public String key() {
    return this.key;
  }

  @Override
  public JsonWriter<String> keyWriter() {
    return this.keyFormat;
  }

  @Override
  public @Nullable V getValue(T object) {
    return object.get(this.key);
  }

  @Override
  public JsonWriter<V> valueWriter() {
    return this.valueFormat;
  }

  @Override
  public boolean filterValue(T object, @Nullable V value) throws JsonException {
    return this.valueFormat.filter(value, this.filterMode);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonFieldFormat", "forKey")
            .appendArgument(this.key)
            .appendArgument(this.keyFormat)
            .appendArgument(this.valueFormat)
            .appendArgument(this.filterMode)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}

final class JsonFieldIndexFormat<V, T> implements JsonFieldFormat<V, T>, ToSource {

  final String key;
  final JsonFormat<String> keyFormat;
  final VarHandle arrayHandle;
  final int index;
  final JsonFormat<V> valueFormat;
  final FilterMode filterMode;

  JsonFieldIndexFormat(String key, JsonFormat<String> keyFormat, VarHandle arrayHandle,
                       int index, JsonFormat<V> valueFormat, FilterMode filterMode) {
    this.key = key;
    this.keyFormat = keyFormat;
    this.arrayHandle = arrayHandle;
    this.index = index;
    this.valueFormat = valueFormat;
    this.filterMode = filterMode;
  }

  @Override
  public JsonFormat<V> valueFormat() {
    return this.valueFormat;
  }

  @Override
  public JsonParser<V> valueParser() {
    return this.valueFormat;
  }

  @Override
  public T updatedValue(T object, @Nullable V value) {
    this.arrayHandle.set(object, this.index, value);
    return object;
  }

  @Override
  public String key() {
    return this.key;
  }

  @Override
  public JsonWriter<String> keyWriter() {
    return this.keyFormat;
  }

  @Override
  public @Nullable V getValue(T object) {
    return (V) this.arrayHandle.get(object, this.index);
  }

  @Override
  public JsonWriter<V> valueWriter() {
    return this.valueFormat;
  }

  @Override
  public boolean filterValue(T object, @Nullable V value) throws JsonException {
    return this.valueFormat.filter(value, this.filterMode);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonFieldFormat", "forIndex")
            .appendArgument(this.key)
            .appendArgument(this.keyFormat)
            .appendArgument(this.arrayHandle)
            .appendArgument(this.valueFormat)
            .appendArgument(this.filterMode)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  /**
   * {@code VarHandle} for atomically accessing elements of an {@code Object} array.
   */
  static final VarHandle OBJECT_ARRAY;

  static {
    // Initialize var handles.
    OBJECT_ARRAY = MethodHandles.arrayElementVarHandle(Object.class.arrayType());
  }

}

class JsonCombiningFieldFormat<V, T> implements JsonFieldFormat<V, T>, ToSource {

  final JsonFormat<V> valueFormat;
  final JsonFieldParser<V, T> fieldParser;
  final JsonFieldWriter<V, T> fieldWriter;

  JsonCombiningFieldFormat(JsonFormat<V> valueFormat, JsonFieldParser<V, T> fieldParser,
                           JsonFieldWriter<V, T> fieldWriter) {
    this.valueFormat = valueFormat;
    this.fieldParser = fieldParser;
    this.fieldWriter = fieldWriter;
  }

  @Override
  public JsonFormat<V> valueFormat() {
    return this.valueFormat;
  }

  @Override
  public @Nullable T merged(@Nullable T newObject, @Nullable T oldObject) throws JsonException {
    if (newObject == null || oldObject == null) {
      return newObject;
    }
    final V newValue = this.fieldWriter.getValue(newObject);
    final V oldValue = this.fieldWriter.getValue(oldObject);
    final V mergedValue = this.valueFormat.merged(newValue, oldValue);
    return this.fieldParser.updatedValue(newObject, mergedValue);
  }

  @Override
  public T mergedValue(T object, @Nullable V newValue) throws JsonException {
    final V oldValue = this.fieldWriter.getValue(object);
    final V mergedValue = this.valueFormat.merged(newValue, oldValue);
    return this.fieldParser.updatedValue(object, mergedValue);
  }

  @Override
  public JsonParser<V> valueParser() {
    return this.fieldParser.valueParser();
  }

  @Override
  public T updatedValue(T object, @Nullable V value) throws JsonException {
    return this.fieldParser.updatedValue(object, value);
  }

  @Override
  public String key() {
    return this.fieldWriter.key();
  }

  @Override
  public JsonWriter<String> keyWriter() {
    return this.fieldWriter.keyWriter();
  }

  @Override
  public @Nullable V getValue(T object) throws JsonException {
    return this.fieldWriter.getValue(object);
  }

  @Override
  public JsonWriter<V> valueWriter() {
    return this.fieldWriter.valueWriter();
  }

  @Override
  public boolean filterValue(T object, @Nullable V value) throws JsonException {
    return this.fieldWriter.filterValue(object, value);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonFieldFormat", "combining")
            .appendArgument(this.valueFormat)
            .appendArgument(this.fieldParser)
            .appendArgument(this.fieldWriter)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}

class JsonMergingFieldFormat<V, T> extends JsonCombiningFieldFormat<V, T> {

  JsonMergingFieldFormat(JsonFormat<V> valueFormat, JsonFieldParser<V, T> fieldParser,
                         JsonFieldWriter<V, T> fieldWriter) {
    super(valueFormat, fieldParser, fieldWriter);
  }

  @Override
  public T updatedValue(T object, @Nullable V newValue) throws JsonException {
    final V oldValue = this.fieldWriter.getValue(object);
    final V mergedValue = this.valueFormat.merged(newValue, oldValue);
    return this.fieldParser.updatedValue(object, mergedValue);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonFieldFormat", "merging")
            .appendArgument(this.valueFormat)
            .appendArgument(this.fieldParser)
            .appendArgument(this.fieldWriter)
            .endInvoke();
  }

}

final class JsonFlattenedFieldFormat<V, W extends V, T> implements JsonFieldFormat<W, T>, ToSource {

  final String key;
  final JsonFieldFormat<V, T> outerFieldFormat;
  final JsonFieldFormat<W, V> innerFieldFormat;
  final FilterMode filterMode;

  JsonFlattenedFieldFormat(String key, JsonFieldFormat<V, T> outerFieldFormat,
                           JsonFieldFormat<W, V> innerFieldFormat, FilterMode filterMode) {
    this.key = key;
    this.outerFieldFormat = outerFieldFormat;
    this.innerFieldFormat = innerFieldFormat;
    this.filterMode = filterMode;
  }

  @Override
  public JsonFormat<W> valueFormat() {
    return this.innerFieldFormat.valueFormat();
  }

  @Override
  public JsonParser<W> valueParser() {
    return this.innerFieldFormat.valueParser();
  }

  @Override
  public T updatedValue(T object, @Nullable W value) throws JsonException {
    V nested = this.outerFieldFormat.getValue(object);
    if (nested == null) {
      nested = this.outerFieldFormat.valueParser().initializer();
      if (nested == null) {
        return object;
      }
    }
    nested = this.innerFieldFormat.updatedValue(nested, value);
    return this.outerFieldFormat.updatedValue(object, nested);
  }

  @Override
  public String key() {
    return this.key;
  }

  @Override
  public JsonWriter<String> keyWriter() {
    return this.innerFieldFormat.keyWriter();
  }

  @Override
  public @Nullable W getValue(T object) throws JsonException {
    final V nested = this.outerFieldFormat.getValue(object);
    if (nested == null) {
      return null;
    }
    return this.innerFieldFormat.getValue(nested);
  }

  @Override
  public JsonWriter<W> valueWriter() {
    return this.innerFieldFormat.valueWriter();
  }

  @Override
  public boolean filterValue(T object, @Nullable W value) throws JsonException {
    final V nested = this.outerFieldFormat.getValue(object);
    if (nested == null) {
      switch (this.filterMode) {
        case DEFINED:
        case TRUTHY:
        case DISTINCT:
          return false;
        default:
          return true;
      }
    }
    return this.innerFieldFormat.filterValue(nested, value);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.appendSource(this.outerFieldFormat)
            .beginInvoke("flattened")
            .appendArgument(this.key)
            .appendArgument(this.innerFieldFormat)
            .appendArgument(this.filterMode)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
