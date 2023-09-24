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

import java.lang.invoke.CallSite;
import java.lang.invoke.LambdaConversionException;
import java.lang.invoke.LambdaMetafactory;
import java.lang.invoke.MethodHandle;
import java.lang.invoke.MethodHandles;
import java.lang.invoke.MethodType;
import java.lang.invoke.VarHandle;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.List;
import java.util.Map;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Output;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.decl.FilterMode;
import swim.util.Notation;
import swim.util.PropertyGetter;
import swim.util.Result;
import swim.util.WriteSource;

@Public
@Since("5.0")
public interface JsonFieldWriter<V, T> extends PropertyGetter<V, T> {

  String key();

  default JsonWriter<String> keyWriter() {
    return JsonLang.keyFormat();
  }

  @Override
  @Nullable V getValue(T object) throws JsonException;

  JsonWriter<V> valueWriter();

  default boolean filterValue(T object, @Nullable V value) throws JsonException {
    return true;
  }

  default Write<?> writeField(Output<?> output, T object, @Nullable V value,
                              JsonWriterOptions options) {
    return WriteJsonField.write(output, this, options, object, value, null, 1);
  }

  static <V, T> JsonFieldWriter<V, T> forValue(String key, JsonWriter<String> keyWriter,
                                               @Nullable V value, JsonWriter<V> valueWriter,
                                               FilterMode filterMode) {
    return new JsonFieldValueWriter<V, T>(key, keyWriter, value, valueWriter, filterMode);
  }

  static <V, T extends Map<String, V>> JsonFieldWriter<V, T> forKey(String key, JsonWriter<String> keyWriter,
                                                                    JsonWriter<V> valueWriter, FilterMode filterMode) {
    return new JsonFieldKeyWriter<V, T>(key, keyWriter, valueWriter, filterMode);
  }

  static <V, T> JsonFieldWriter<V, T> forIndex(String key, JsonWriter<String> keyWriter,
                                               VarHandle arrayHandle, int index, JsonWriter<V> valueWriter,
                                               FilterMode filterMode) throws JsonProviderException {
    final List<Class<?>> coordinateTypes = arrayHandle.coordinateTypes();
    if (coordinateTypes.size() != 2 || !coordinateTypes.get(1).equals(Integer.TYPE)) {
      throw new JsonProviderException("invalid array handle " + arrayHandle);
    }
    return new JsonFieldIndexWriter<V, T>(key, keyWriter, arrayHandle, index, valueWriter, filterMode);
  }

  static <V> JsonFieldWriter<V, Object[]> forIndex(String key, JsonWriter<String> keyWriter, int index,
                                                   JsonWriter<V> valueWriter, FilterMode filterMode) {
    return new JsonFieldIndexWriter<V, Object[]>(key, keyWriter, JsonFieldIndexWriter.OBJECT_ARRAY,
                                                 index, valueWriter, filterMode);
  }

  static <V, T> JsonFieldWriter<V, T> forField(String key, JsonWriter<String> keyWriter,
                                               VarHandle fieldHandle, JsonWriter<V> valueWriter,
                                               FilterMode filterMode) throws JsonProviderException {
    if (fieldHandle.coordinateTypes().size() != 1) {
      throw new JsonProviderException("invalid field handle " + fieldHandle);
    }
    return new JsonFieldHandleWriter<V, T>(key, keyWriter, fieldHandle, valueWriter, filterMode);
  }

  static <V, T> JsonFieldWriter<V, T> forField(String key, JsonWriter<String> keyWriter,
                                               Field field, JsonWriter<V> valueWriter,
                                               FilterMode filterMode) throws JsonProviderException {
    MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      lookup = MethodHandles.privateLookupIn(field.getDeclaringClass(), lookup);
    } catch (IllegalAccessException | SecurityException cause) {
      // Proceed with the original lookup object.
    }

    final VarHandle fieldHandle;
    try {
      fieldHandle = lookup.unreflectVarHandle(field);
    } catch (IllegalAccessException cause) {
      throw new JsonProviderException("inaccessible field " + field, cause);
    }

    return JsonFieldWriter.forField(key, keyWriter, fieldHandle, valueWriter, filterMode);
  }

  static <V, T> JsonFieldWriter<V, T> forGetter(String key, JsonWriter<String> keyWriter,
                                                PropertyGetter<V, T> getter, JsonWriter<V> valueWriter,
                                                FilterMode filterMode) {
    return new JsonFieldGetterWriter<V, T>(key, keyWriter, getter, valueWriter, filterMode);
  }

  static <V, T> JsonFieldWriter<V, T> forGetter(String key, JsonWriter<String> keyWriter,
                                                MethodHandle getterHandle, JsonWriter<V> valueWriter,
                                                FilterMode filterMode) throws JsonProviderException {
    final MethodType methodType = getterHandle.type();
    if (methodType.parameterCount() != 1) {
      throw new JsonProviderException("invalid getter method signature " + getterHandle);
    }

    final CallSite callSite;
    try {
      callSite = LambdaMetafactory.metafactory(MethodHandles.lookup(), "getValue",
                                               MethodType.methodType(PropertyGetter.class),
                                               MethodType.methodType(Object.class, Object.class),
                                               getterHandle, methodType);
    } catch (LambdaConversionException cause) {
      throw new JsonProviderException(cause);
    }

    final PropertyGetter<V, T> getter;
    try {
      getter = (PropertyGetter<V, T>) callSite.getTarget().invokeExact();
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new JsonProviderException(cause);
    }

    return new JsonFieldGetterWriter<V, T>(key, keyWriter, getter, valueWriter, filterMode);
  }

  static <V, T> JsonFieldWriter<V, T> forGetter(String key, JsonWriter<String> keyWriter,
                                                Method getterMethod, JsonWriter<V> valueWriter,
                                                FilterMode filterMode) throws JsonProviderException {
    MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      lookup = MethodHandles.privateLookupIn(getterMethod.getDeclaringClass(), lookup);
    } catch (IllegalAccessException | SecurityException cause) {
      // Proceed with the original lookup object.
    }

    final MethodHandle getterHandle;
    try {
      getterHandle = lookup.unreflect(getterMethod);
    } catch (IllegalAccessException cause) {
      throw new JsonProviderException("inaccessible getter method " + getterMethod, cause);
    }

    return JsonFieldWriter.forGetter(key, keyWriter, getterHandle, valueWriter, filterMode);
  }

}

final class JsonFieldValueWriter<V, T> implements JsonFieldWriter<V, T>, WriteSource {

  final String key;
  final JsonWriter<String> keyWriter;
  final @Nullable V value;
  final JsonWriter<V> valueWriter;
  final FilterMode filterMode;

  JsonFieldValueWriter(String key, JsonWriter<String> keyWriter, @Nullable V value,
                       JsonWriter<V> valueWriter, FilterMode filterMode) {
    this.key = key;
    this.keyWriter = keyWriter;
    this.value = value;
    this.valueWriter = valueWriter;
    this.filterMode = filterMode;
  }

  @Override
  public String key() {
    return this.key;
  }

  @Override
  public JsonWriter<String> keyWriter() {
    return this.keyWriter;
  }

  @Override
  public @Nullable V getValue(T object) {
    return this.value;
  }

  @Override
  public JsonWriter<V> valueWriter() {
    return this.valueWriter;
  }

  @Override
  public boolean filterValue(T object, @Nullable V value) throws JsonException {
    return this.valueWriter.filter(value, this.filterMode);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonFieldWriter", "forValue")
            .appendArgument(this.key)
            .appendArgument(this.value)
            .appendArgument(this.valueWriter)
            .appendArgument(this.filterMode)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

}

final class JsonFieldKeyWriter<V, T extends Map<String, V>> implements JsonFieldWriter<V, T>, WriteSource {

  final String key;
  final JsonWriter<String> keyWriter;
  final JsonWriter<V> valueWriter;
  final FilterMode filterMode;

  JsonFieldKeyWriter(String key, JsonWriter<String> keyWriter,
                     JsonWriter<V> valueWriter, FilterMode filterMode) {
    this.key = key;
    this.keyWriter = keyWriter;
    this.valueWriter = valueWriter;
    this.filterMode = filterMode;
  }

  @Override
  public String key() {
    return this.key;
  }

  @Override
  public JsonWriter<String> keyWriter() {
    return this.keyWriter;
  }

  @Override
  public @Nullable V getValue(T object) {
    return object.get(this.key);
  }

  @Override
  public JsonWriter<V> valueWriter() {
    return this.valueWriter;
  }

  @Override
  public boolean filterValue(T object, @Nullable V value) throws JsonException {
    return this.valueWriter.filter(value, this.filterMode);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonFieldWriter", "forKey")
            .appendArgument(this.key)
            .appendArgument(this.keyWriter)
            .appendArgument(this.valueWriter)
            .appendArgument(this.filterMode)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

}

final class JsonFieldIndexWriter<V, T> implements JsonFieldWriter<V, T>, WriteSource {

  final String key;
  final JsonWriter<String> keyWriter;
  final VarHandle arrayHandle;
  final int index;
  final JsonWriter<V> valueWriter;
  final FilterMode filterMode;

  JsonFieldIndexWriter(String key, JsonWriter<String> keyWriter, VarHandle arrayHandle,
                       int index, JsonWriter<V> valueWriter, FilterMode filterMode) {
    this.key = key;
    this.keyWriter = keyWriter;
    this.arrayHandle = arrayHandle;
    this.index = index;
    this.valueWriter = valueWriter;
    this.filterMode = filterMode;
  }

  @Override
  public String key() {
    return this.key;
  }

  @Override
  public JsonWriter<String> keyWriter() {
    return this.keyWriter;
  }

  @Override
  public @Nullable V getValue(T object) {
    return (V) this.arrayHandle.get(object, this.index);
  }

  @Override
  public JsonWriter<V> valueWriter() {
    return this.valueWriter;
  }

  @Override
  public boolean filterValue(T object, @Nullable V value) throws JsonException {
    return this.valueWriter.filter(value, this.filterMode);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonFieldWriter", "forIndex")
            .appendArgument(this.key)
            .appendArgument(this.keyWriter)
            .appendArgument(this.arrayHandle)
            .appendArgument(this.valueWriter)
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

final class JsonFieldHandleWriter<V, T> implements JsonFieldWriter<V, T>, WriteSource {

  final String key;
  final JsonWriter<String> keyWriter;
  final VarHandle fieldHandle;
  final JsonWriter<V> valueWriter;
  final FilterMode filterMode;

  JsonFieldHandleWriter(String key, JsonWriter<String> keyWriter, VarHandle fieldHandle,
                        JsonWriter<V> valueWriter, FilterMode filterMode) {
    this.key = key;
    this.keyWriter = keyWriter;
    this.fieldHandle = fieldHandle;
    this.valueWriter = valueWriter;
    this.filterMode = filterMode;
  }

  @Override
  public String key() {
    return this.key;
  }

  @Override
  public JsonWriter<String> keyWriter() {
    return this.keyWriter;
  }

  @Override
  public @Nullable V getValue(T object) {
    return (V) this.fieldHandle.get(object);
  }

  @Override
  public JsonWriter<V> valueWriter() {
    return this.valueWriter;
  }

  @Override
  public boolean filterValue(T object, @Nullable V value) throws JsonException {
    return this.valueWriter.filter(value, this.filterMode);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonFieldWriter", "forField")
            .appendArgument(this.key)
            .appendArgument(this.fieldHandle)
            .appendArgument(this.valueWriter)
            .appendArgument(this.filterMode)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

}

final class JsonFieldGetterWriter<V, T> implements JsonFieldWriter<V, T>, WriteSource {

  final String key;
  final JsonWriter<String> keyWriter;
  final PropertyGetter<V, T> getter;
  final JsonWriter<V> valueWriter;
  final FilterMode filterMode;

  JsonFieldGetterWriter(String key, JsonWriter<String> keyWriter, PropertyGetter<V, T> getter,
                        JsonWriter<V> valueWriter, FilterMode filterMode) {
    this.key = key;
    this.keyWriter = keyWriter;
    this.getter = getter;
    this.valueWriter = valueWriter;
    this.filterMode = filterMode;
  }

  @Override
  public String key() {
    return this.key;
  }

  @Override
  public JsonWriter<String> keyWriter() {
    return this.keyWriter;
  }

  @Override
  public @Nullable V getValue(T object) throws JsonException {
    try {
      return this.getter.getValue(object);
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new JsonException(cause);
    }
  }

  @Override
  public JsonWriter<V> valueWriter() {
    return this.valueWriter;
  }

  @Override
  public boolean filterValue(T object, @Nullable V value) throws JsonException {
    return this.valueWriter.filter(value, this.filterMode);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonFieldWriter", "forGetter")
            .appendArgument(this.key)
            .appendArgument(this.getter)
            .appendArgument(this.valueWriter)
            .appendArgument(this.filterMode)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

}

final class WriteJsonField<V, T> extends Write<Object> {

  final JsonFieldWriter<V, T> writer;
  final JsonWriterOptions options;
  final T object;
  final @Nullable V value;
  final @Nullable Write<?> write;
  final int step;

  WriteJsonField(JsonFieldWriter<V, T> writer, JsonWriterOptions options,
                 T object, @Nullable V value, @Nullable Write<?> write, int step) {
    this.writer = writer;
    this.options = options;
    this.object = object;
    this.value = value;
    this.write = write;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteJsonField.write(output, this.writer, this.options, this.object,
                                this.value, this.write, this.step);
  }

  static <V, T> Write<Object> write(Output<?> output, JsonFieldWriter<V, T> writer,
                                    JsonWriterOptions options, T object, @Nullable V value,
                                    @Nullable Write<?> write, int step) {
    if (step == 1) {
      if (write == null) {
        write = writer.keyWriter().write(output, writer.key(), options);
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
      output.write(':');
      step = 3;
    }
    if (step == 3) {
      if (!options.whitespace()) {
        step = 4;
      } else if (output.isCont()) {
        output.write(' ');
        step = 4;
      }
    }
    if (step == 4) {
      if (write == null) {
        write = writer.valueWriter().write(output, value, options);
      } else {
        write = write.produce(output);
      }
      if (write.isDone()) {
        return Write.done();
      } else if (write.isError()) {
        return write.asError();
      }
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteJsonField<V, T>(writer, options, object, value, write, step);
  }

}
