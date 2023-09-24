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
import swim.util.WriteSource;
import swim.util.UpdatableMap;

@Public
@Since("5.0")
public interface WamlFieldFormat<V, T> extends WamlFieldParser<V, T>, WamlFieldWriter<V, T> {

  WamlFormat<V> valueFormat();

  default @Nullable T merged(@Nullable T newObject, @Nullable T oldObject) throws WamlException {
    if (newObject == null || oldObject == null) {
      return newObject;
    }
    final V newValue = this.getValue(newObject);
    final V oldValue = this.getValue(oldObject);
    final V mergedValue = this.valueFormat().merged(newValue, oldValue);
    return this.updatedValue(newObject, mergedValue);
  }

  default T mergedValue(T object, @Nullable V newValue) throws WamlException {
    final V oldValue = this.getValue(object);
    final V mergedValue = this.valueFormat().merged(newValue, oldValue);
    return this.updatedValue(object, mergedValue);
  }

  default <W extends V> WamlFieldFormat<W, T> flattened(String key, WamlFieldFormat<W, V> innerFieldFormat,
                                                        FilterMode filterMode) {
    return new WamlFlattenedFieldFormat<V, W, T>(key, this, innerFieldFormat, filterMode);
  }

  static <V, T extends Map<String, V>> WamlFieldFormat<V, T> forKey(String key, WamlFormat<String> keyFormat,
                                                                    WamlFormat<V> valueFormat, FilterMode filterMode) {
    return new WamlFieldKeyFormat<V, T>(key, keyFormat, valueFormat, filterMode);
  }

  static <V, T> WamlFieldFormat<V, T> forIndex(String key, WamlFormat<String> keyFormat,
                                               VarHandle arrayHandle, int index, WamlFormat<V> valueFormat,
                                               FilterMode filterMode) throws WamlProviderException {
    final List<Class<?>> coordinateTypes = arrayHandle.coordinateTypes();
    if (coordinateTypes.size() != 2 || !coordinateTypes.get(1).equals(Integer.TYPE)) {
      throw new WamlProviderException("invalid array handle " + arrayHandle);
    }
    return new WamlFieldIndexFormat<V, T>(key, keyFormat, arrayHandle, index, valueFormat, filterMode);
  }

  static <V> WamlFieldFormat<V, Object[]> forIndex(String key, WamlFormat<String> keyFormat, int index,
                                                   WamlFormat<V> valueFormat, FilterMode filterMode) {
    return new WamlFieldIndexFormat<V, Object[]>(key, keyFormat, WamlFieldIndexFormat.OBJECT_ARRAY,
                                                 index, valueFormat, filterMode);
  }

  static <V, T> WamlFieldFormat<V, T> combining(WamlFormat<V> valueFormat,
                                                WamlFieldParser<V, T> fieldParser,
                                                WamlFieldWriter<V, T> fieldWriter) {
    return new WamlCombiningFieldFormat<V, T>(valueFormat, fieldParser, fieldWriter);
  }

  static <V, T> WamlFieldFormat<V, T> merging(WamlFormat<V> valueFormat,
                                              WamlFieldParser<V, T> fieldParser,
                                              WamlFieldWriter<V, T> fieldWriter) {
    return new WamlMergingFieldFormat<V, T>(valueFormat, fieldParser, fieldWriter);
  }

}

final class WamlFieldKeyFormat<V, T extends Map<String, V>> implements WamlFieldFormat<V, T>, WriteSource {

  final String key;
  final WamlFormat<String> keyFormat;
  final WamlFormat<V> valueFormat;
  final FilterMode filterMode;

  WamlFieldKeyFormat(String key, WamlFormat<String> keyFormat,
                     WamlFormat<V> valueFormat, FilterMode filterMode) {
    this.key = key;
    this.keyFormat = keyFormat;
    this.valueFormat = valueFormat;
    this.filterMode = filterMode;
  }

  @Override
  public WamlFormat<V> valueFormat() {
    return this.valueFormat;
  }

  @Override
  public WamlParser<V> valueParser() {
    return this.valueFormat;
  }

  @Override
  public T updatedValue(T object, @Nullable V value) throws WamlException {
    try {
      if (object instanceof UpdatableMap<?, ?>) {
        return Assume.conforms(((UpdatableMap<String, V>) object).updated(this.key, value));
      }
      object.put(this.key, value);
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new WamlException(cause);
    }
    return object;
  }

  @Override
  public String key() {
    return this.key;
  }

  @Override
  public WamlWriter<String> keyWriter() {
    return this.keyFormat;
  }

  @Override
  public @Nullable V getValue(T object) {
    return object.get(this.key);
  }

  @Override
  public WamlWriter<V> valueWriter() {
    return this.valueFormat;
  }

  @Override
  public boolean filterValue(T object, @Nullable V value) throws WamlException {
    return this.valueFormat.filter(value, this.filterMode);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlFieldFormat", "forKey")
            .appendArgument(this.key)
            .appendArgument(this.keyFormat)
            .appendArgument(this.valueFormat)
            .appendArgument(this.filterMode)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

}

final class WamlFieldIndexFormat<V, T> implements WamlFieldFormat<V, T>, WriteSource {

  final String key;
  final WamlFormat<String> keyFormat;
  final VarHandle arrayHandle;
  final int index;
  final WamlFormat<V> valueFormat;
  final FilterMode filterMode;

  WamlFieldIndexFormat(String key, WamlFormat<String> keyFormat, VarHandle arrayHandle,
                       int index, WamlFormat<V> valueFormat, FilterMode filterMode) {
    this.key = key;
    this.keyFormat = keyFormat;
    this.arrayHandle = arrayHandle;
    this.index = index;
    this.valueFormat = valueFormat;
    this.filterMode = filterMode;
  }

  @Override
  public WamlFormat<V> valueFormat() {
    return this.valueFormat;
  }

  @Override
  public WamlParser<V> valueParser() {
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
  public WamlWriter<String> keyWriter() {
    return this.keyFormat;
  }

  @Override
  public @Nullable V getValue(T object) {
    return (V) this.arrayHandle.get(object, this.index);
  }

  @Override
  public WamlWriter<V> valueWriter() {
    return this.valueFormat;
  }

  @Override
  public boolean filterValue(T object, @Nullable V value) throws WamlException {
    return this.valueFormat.filter(value, this.filterMode);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlFieldFormat", "forIndex")
            .appendArgument(this.key)
            .appendArgument(this.keyFormat)
            .appendArgument(this.arrayHandle)
            .appendArgument(this.valueFormat)
            .appendArgument(this.filterMode)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
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

class WamlCombiningFieldFormat<V, T> implements WamlFieldFormat<V, T>, WriteSource {

  final WamlFormat<V> valueFormat;
  final WamlFieldParser<V, T> fieldParser;
  final WamlFieldWriter<V, T> fieldWriter;

  WamlCombiningFieldFormat(WamlFormat<V> valueFormat, WamlFieldParser<V, T> fieldParser,
                           WamlFieldWriter<V, T> fieldWriter) {
    this.valueFormat = valueFormat;
    this.fieldParser = fieldParser;
    this.fieldWriter = fieldWriter;
  }

  @Override
  public WamlFormat<V> valueFormat() {
    return this.valueFormat;
  }

  @Override
  public @Nullable T merged(@Nullable T newObject, @Nullable T oldObject) throws WamlException {
    if (newObject == null || oldObject == null) {
      return newObject;
    }
    final V newValue = this.fieldWriter.getValue(newObject);
    final V oldValue = this.fieldWriter.getValue(oldObject);
    final V mergedValue = this.valueFormat.merged(newValue, oldValue);
    return this.fieldParser.updatedValue(newObject, mergedValue);
  }

  @Override
  public T mergedValue(T object, @Nullable V newValue) throws WamlException {
    final V oldValue = this.fieldWriter.getValue(object);
    final V mergedValue = this.valueFormat.merged(newValue, oldValue);
    return this.fieldParser.updatedValue(object, mergedValue);
  }

  @Override
  public WamlParser<V> valueParser() {
    return this.fieldParser.valueParser();
  }

  @Override
  public T updatedValue(T object, @Nullable V value) throws WamlException {
    return this.fieldParser.updatedValue(object, value);
  }

  @Override
  public String key() {
    return this.fieldWriter.key();
  }

  @Override
  public WamlWriter<String> keyWriter() {
    return this.fieldWriter.keyWriter();
  }

  @Override
  public @Nullable V getValue(T object) throws WamlException {
    return this.fieldWriter.getValue(object);
  }

  @Override
  public WamlWriter<V> valueWriter() {
    return this.fieldWriter.valueWriter();
  }

  @Override
  public boolean filterValue(T object, @Nullable V value) throws WamlException {
    return this.fieldWriter.filterValue(object, value);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlFieldFormat", "combining")
            .appendArgument(this.valueFormat)
            .appendArgument(this.fieldParser)
            .appendArgument(this.fieldWriter)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

}

class WamlMergingFieldFormat<V, T> extends WamlCombiningFieldFormat<V, T> {

  WamlMergingFieldFormat(WamlFormat<V> valueFormat, WamlFieldParser<V, T> fieldParser,
                         WamlFieldWriter<V, T> fieldWriter) {
    super(valueFormat, fieldParser, fieldWriter);
  }

  @Override
  public T updatedValue(T object, @Nullable V newValue) throws WamlException {
    final V oldValue = this.fieldWriter.getValue(object);
    final V mergedValue = this.valueFormat.merged(newValue, oldValue);
    return this.fieldParser.updatedValue(object, mergedValue);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlFieldFormat", "merging")
            .appendArgument(this.valueFormat)
            .appendArgument(this.fieldParser)
            .appendArgument(this.fieldWriter)
            .endInvoke();
  }

}

final class WamlFlattenedFieldFormat<V, W extends V, T> implements WamlFieldFormat<W, T>, WriteSource {

  final String key;
  final WamlFieldFormat<V, T> outerFieldFormat;
  final WamlFieldFormat<W, V> innerFieldFormat;
  final FilterMode filterMode;

  WamlFlattenedFieldFormat(String key, WamlFieldFormat<V, T> outerFieldFormat,
                           WamlFieldFormat<W, V> innerFieldFormat, FilterMode filterMode) {
    this.key = key;
    this.outerFieldFormat = outerFieldFormat;
    this.innerFieldFormat = innerFieldFormat;
    this.filterMode = filterMode;
  }

  @Override
  public WamlFormat<W> valueFormat() {
    return this.innerFieldFormat.valueFormat();
  }

  @Override
  public WamlParser<W> valueParser() {
    return this.innerFieldFormat.valueParser();
  }

  @Override
  public T updatedValue(T object, @Nullable W value) throws WamlException {
    V nested = this.outerFieldFormat.getValue(object);
    if (nested == null) {
      nested = this.outerFieldFormat.valueParser().initializer(null);
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
  public WamlWriter<String> keyWriter() {
    return this.innerFieldFormat.keyWriter();
  }

  @Override
  public @Nullable W getValue(T object) throws WamlException {
    final V nested = this.outerFieldFormat.getValue(object);
    if (nested == null) {
      return null;
    }
    return this.innerFieldFormat.getValue(nested);
  }

  @Override
  public WamlWriter<W> valueWriter() {
    return this.innerFieldFormat.valueWriter();
  }

  @Override
  public boolean filterValue(T object, @Nullable W value) throws WamlException {
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
    return WriteSource.toString(this);
  }

}
