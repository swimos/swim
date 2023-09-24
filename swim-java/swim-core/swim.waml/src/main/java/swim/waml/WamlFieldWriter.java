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
public interface WamlFieldWriter<V, T> extends PropertyGetter<V, T> {

  String key();

  default WamlWriter<String> keyWriter() {
    return WamlLang.keyFormat();
  }

  @Override
  @Nullable V getValue(T object) throws WamlException;

  WamlWriter<V> valueWriter();

  default boolean filterValue(T object, @Nullable V value) throws WamlException {
    return true;
  }

  default Write<?> writeField(Output<?> output, T object, @Nullable V value,
                              WamlWriterOptions options) {
    return WriteWamlField.write(output, this, options, object, value, null, 1);
  }

  static <V, T> WamlFieldWriter<V, T> forValue(String key, WamlWriter<String> keyWriter,
                                               @Nullable V value, WamlWriter<V> valueWriter,
                                               FilterMode filterMode) {
    return new WamlFieldValueWriter<V, T>(key, keyWriter, value, valueWriter, filterMode);
  }

  static <V, T extends Map<String, V>> WamlFieldWriter<V, T> forKey(String key, WamlWriter<String> keyWriter,
                                                                    WamlWriter<V> valueWriter, FilterMode filterMode) {
    return new WamlFieldKeyWriter<V, T>(key, keyWriter, valueWriter, filterMode);
  }

  static <V, T> WamlFieldWriter<V, T> forIndex(String key, WamlWriter<String> keyWriter,
                                               VarHandle arrayHandle, int index, WamlWriter<V> valueWriter,
                                               FilterMode filterMode) throws WamlProviderException {
    final List<Class<?>> coordinateTypes = arrayHandle.coordinateTypes();
    if (coordinateTypes.size() != 2 || !coordinateTypes.get(1).equals(Integer.TYPE)) {
      throw new WamlProviderException("invalid array handle " + arrayHandle);
    }
    return new WamlFieldIndexWriter<V, T>(key, keyWriter, arrayHandle, index, valueWriter, filterMode);
  }

  static <V> WamlFieldWriter<V, Object[]> forIndex(String key, WamlWriter<String> keyWriter, int index,
                                                   WamlWriter<V> valueWriter, FilterMode filterMode) {
    return new WamlFieldIndexWriter<V, Object[]>(key, keyWriter, WamlFieldIndexWriter.OBJECT_ARRAY,
                                                 index, valueWriter, filterMode);
  }

  static <V, T> WamlFieldWriter<V, T> forField(String key, WamlWriter<String> keyWriter,
                                               VarHandle fieldHandle, WamlWriter<V> valueWriter,
                                               FilterMode filterMode) throws WamlProviderException {
    if (fieldHandle.coordinateTypes().size() != 1) {
      throw new WamlProviderException("invalid field handle " + fieldHandle);
    }
    return new WamlFieldHandleWriter<V, T>(key, keyWriter, fieldHandle, valueWriter, filterMode);
  }

  static <V, T> WamlFieldWriter<V, T> forField(String key, WamlWriter<String> keyWriter,
                                               Field field, WamlWriter<V> valueWriter,
                                               FilterMode filterMode) throws WamlProviderException {
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
      throw new WamlProviderException("inaccessible field " + field, cause);
    }

    return WamlFieldWriter.forField(key, keyWriter, fieldHandle, valueWriter, filterMode);
  }

  static <V, T> WamlFieldWriter<V, T> forGetter(String key, WamlWriter<String> keyWriter,
                                                PropertyGetter<V, T> getter, WamlWriter<V> valueWriter,
                                                FilterMode filterMode) {
    return new WamlFieldGetterWriter<V, T>(key, keyWriter, getter, valueWriter, filterMode);
  }

  static <V, T> WamlFieldWriter<V, T> forGetter(String key, WamlWriter<String> keyWriter,
                                                MethodHandle getterHandle, WamlWriter<V> valueWriter,
                                                FilterMode filterMode) throws WamlProviderException {
    final MethodType methodType = getterHandle.type();
    if (methodType.parameterCount() != 1) {
      throw new WamlProviderException("invalid getter method signature " + getterHandle);
    }

    final CallSite callSite;
    try {
      callSite = LambdaMetafactory.metafactory(MethodHandles.lookup(), "getValue",
                                               MethodType.methodType(PropertyGetter.class),
                                               MethodType.methodType(Object.class, Object.class),
                                               getterHandle, methodType);
    } catch (LambdaConversionException cause) {
      throw new WamlProviderException(cause);
    }

    final PropertyGetter<V, T> getter;
    try {
      getter = (PropertyGetter<V, T>) callSite.getTarget().invokeExact();
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new WamlProviderException(cause);
    }

    return new WamlFieldGetterWriter<V, T>(key, keyWriter, getter, valueWriter, filterMode);
  }

  static <V, T> WamlFieldWriter<V, T> forGetter(String key, WamlWriter<String> keyWriter,
                                                Method getterMethod, WamlWriter<V> valueWriter,
                                                FilterMode filterMode) throws WamlProviderException {
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
      throw new WamlProviderException("inaccessible getter method " + getterMethod, cause);
    }

    return WamlFieldWriter.forGetter(key, keyWriter, getterHandle, valueWriter, filterMode);
  }

}

final class WamlFieldValueWriter<V, T> implements WamlFieldWriter<V, T>, WriteSource {

  final String key;
  final WamlWriter<String> keyWriter;
  final @Nullable V value;
  final WamlWriter<V> valueWriter;
  final FilterMode filterMode;

  WamlFieldValueWriter(String key, WamlWriter<String> keyWriter, @Nullable V value,
                       WamlWriter<V> valueWriter, FilterMode filterMode) {
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
  public WamlWriter<String> keyWriter() {
    return this.keyWriter;
  }

  @Override
  public @Nullable V getValue(T object) {
    return this.value;
  }

  @Override
  public WamlWriter<V> valueWriter() {
    return this.valueWriter;
  }

  @Override
  public boolean filterValue(T object, @Nullable V value) throws WamlException {
    return this.valueWriter.filter(value, this.filterMode);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlFieldWriter", "forValue")
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

final class WamlFieldKeyWriter<V, T extends Map<String, V>> implements WamlFieldWriter<V, T>, WriteSource {

  final String key;
  final WamlWriter<String> keyWriter;
  final WamlWriter<V> valueWriter;
  final FilterMode filterMode;

  WamlFieldKeyWriter(String key, WamlWriter<String> keyWriter,
                     WamlWriter<V> valueWriter, FilterMode filterMode) {
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
  public WamlWriter<String> keyWriter() {
    return this.keyWriter;
  }

  @Override
  public @Nullable V getValue(T object) {
    return object.get(this.key);
  }

  @Override
  public WamlWriter<V> valueWriter() {
    return this.valueWriter;
  }

  @Override
  public boolean filterValue(T object, @Nullable V value) throws WamlException {
    return this.valueWriter.filter(value, this.filterMode);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlFieldWriter", "forKey")
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

final class WamlFieldIndexWriter<V, T> implements WamlFieldWriter<V, T>, WriteSource {

  final String key;
  final WamlWriter<String> keyWriter;
  final VarHandle arrayHandle;
  final int index;
  final WamlWriter<V> valueWriter;
  final FilterMode filterMode;

  WamlFieldIndexWriter(String key, WamlWriter<String> keyWriter, VarHandle arrayHandle,
                       int index, WamlWriter<V> valueWriter, FilterMode filterMode) {
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
  public WamlWriter<String> keyWriter() {
    return this.keyWriter;
  }

  @Override
  public @Nullable V getValue(T object) {
    return (V) this.arrayHandle.get(object, this.index);
  }

  @Override
  public WamlWriter<V> valueWriter() {
    return this.valueWriter;
  }

  @Override
  public boolean filterValue(T object, @Nullable V value) throws WamlException {
    return this.valueWriter.filter(value, this.filterMode);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlFieldWriter", "forIndex")
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

final class WamlFieldHandleWriter<V, T> implements WamlFieldWriter<V, T>, WriteSource {

  final String key;
  final WamlWriter<String> keyWriter;
  final VarHandle fieldHandle;
  final WamlWriter<V> valueWriter;
  final FilterMode filterMode;

  WamlFieldHandleWriter(String key, WamlWriter<String> keyWriter, VarHandle fieldHandle,
                        WamlWriter<V> valueWriter, FilterMode filterMode) {
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
  public WamlWriter<String> keyWriter() {
    return this.keyWriter;
  }

  @Override
  public @Nullable V getValue(T object) {
    return (V) this.fieldHandle.get(object);
  }

  @Override
  public WamlWriter<V> valueWriter() {
    return this.valueWriter;
  }

  @Override
  public boolean filterValue(T object, @Nullable V value) throws WamlException {
    return this.valueWriter.filter(value, this.filterMode);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlFieldWriter", "forField")
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

final class WamlFieldGetterWriter<V, T> implements WamlFieldWriter<V, T>, WriteSource {

  final String key;
  final WamlWriter<String> keyWriter;
  final PropertyGetter<V, T> getter;
  final WamlWriter<V> valueWriter;
  final FilterMode filterMode;

  WamlFieldGetterWriter(String key, WamlWriter<String> keyWriter,  PropertyGetter<V, T> getter,
                        WamlWriter<V> valueWriter, FilterMode filterMode) {
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
  public WamlWriter<String> keyWriter() {
    return this.keyWriter;
  }

  @Override
  public @Nullable V getValue(T object) throws WamlException {
    try {
      return this.getter.getValue(object);
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new WamlException(cause);
    }
  }

  @Override
  public WamlWriter<V> valueWriter() {
    return this.valueWriter;
  }

  @Override
  public boolean filterValue(T object, @Nullable V value) throws WamlException {
    return this.valueWriter.filter(value, this.filterMode);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlFieldWriter", "forGetter")
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

final class WriteWamlField<V, T> extends Write<Object> {

  final WamlFieldWriter<V, T> writer;
  final WamlWriterOptions options;
  final T object;
  final @Nullable V value;
  final @Nullable Write<?> write;
  final int step;

  WriteWamlField(WamlFieldWriter<V, T> writer, WamlWriterOptions options,
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
    return WriteWamlField.write(output, this.writer, this.options, this.object,
                                this.value, this.write, this.step);
  }

  static <V, T> Write<Object> write(Output<?> output, WamlFieldWriter<V, T> writer,
                                    WamlWriterOptions options, T object, @Nullable V value,
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
    return new WriteWamlField<V, T>(writer, options, object, value, write, step);
  }

}
