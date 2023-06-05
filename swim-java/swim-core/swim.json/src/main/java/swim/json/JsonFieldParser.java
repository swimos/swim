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
import swim.util.Assume;
import swim.util.Notation;
import swim.util.PropertySetter;
import swim.util.PropertyUpdater;
import swim.util.Result;
import swim.util.ToSource;
import swim.util.UpdatableMap;

@Public
@Since("5.0")
public interface JsonFieldParser<V, T> extends PropertyUpdater<V, T> {

  JsonParser<V> valueParser();

  @Override
  T updatedValue(T object, @Nullable V value) throws JsonException;

  static <V, T> JsonFieldParser<V, T> dummy() {
    return Assume.conforms(JsonDummyFieldParser.INSTANCE);
  }

  static <V, T extends Map<String, V>> JsonFieldParser<V, T> forKey(String key, JsonParser<V> valueParser) {
    return new JsonFieldKeyParser<V, T>(key, valueParser);
  }

  static <V, T> JsonFieldParser<V, T> forIndex(VarHandle arrayHandle, int index, JsonParser<V> valueParser) throws JsonProviderException {
    final List<Class<?>> coordinateTypes = arrayHandle.coordinateTypes();
    if (coordinateTypes.size() != 2 || !coordinateTypes.get(1).equals(Integer.TYPE)) {
      throw new JsonProviderException("invalid array handle " + arrayHandle);
    }
    return new JsonFieldIndexParser<V, T>(arrayHandle, index, valueParser);
  }

  static <V> JsonFieldParser<V, Object[]> forIndex(int index, JsonParser<V> valueParser) {
    return new JsonFieldIndexParser<V, Object[]>(JsonFieldIndexParser.OBJECT_ARRAY, index, valueParser);
  }

  static <V, T> JsonFieldParser<V, T> forField(VarHandle fieldHandle, JsonParser<V> valueParser) throws JsonProviderException {
    if (fieldHandle.coordinateTypes().size() != 1) {
      throw new JsonProviderException("invalid field handle " + fieldHandle);
    }
    return new JsonFieldHandleParser<V, T>(fieldHandle, valueParser);
  }

  static <V, T> JsonFieldParser<V, T> forField(Field field, JsonParser<V> valueParser) throws JsonProviderException {
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

    return JsonFieldParser.forField(fieldHandle, valueParser);
  }

  static <V, T> JsonFieldParser<V, T> forUpdater(PropertyUpdater<V, T> updater, JsonParser<V> valueParser) {
    return new JsonFieldUpdaterParser<V, T>(updater, valueParser);
  }

  static <V, T> JsonFieldParser<V, T> forUpdater(MethodHandle updaterHandle, JsonParser<V> valueParser) throws JsonProviderException {
    MethodType methodType = updaterHandle.type();
    if (methodType.parameterCount() != 2) {
      throw new JsonProviderException("invalid updater method signature " + updaterHandle);
    }
    //if (!methodType.parameterType(0).isAssignableFrom(methodType.returnType())) {
    //  throw new IllegalArgumentException("return type of updater method " + updaterHandle
    //                                   + " must be assignable to receiver type");
    //}
    methodType = methodType.changeParameterType(1, methodType.wrap().parameterType(1));

    final CallSite callSite;
    try {
      callSite = LambdaMetafactory.metafactory(MethodHandles.lookup(), "updatedValue",
                                               MethodType.methodType(PropertyUpdater.class),
                                               MethodType.methodType(Object.class, Object.class, Object.class),
                                               updaterHandle, methodType);
    } catch (LambdaConversionException cause) {
      throw new JsonProviderException(cause);
    }

    final PropertyUpdater<V, T> updater;
    try {
      updater = (PropertyUpdater<V, T>) callSite.getTarget().invokeExact();
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new JsonProviderException(cause);
    }

    return new JsonFieldUpdaterParser<V, T>(updater, valueParser);
  }

  static <V, T> JsonFieldParser<V, T> forUpdater(Method updaterMethod, JsonParser<V> valueParser) throws JsonProviderException {
    MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      lookup = MethodHandles.privateLookupIn(updaterMethod.getDeclaringClass(), lookup);
    } catch (IllegalAccessException | SecurityException cause) {
      // Proceed with the original lookup object.
    }

    final MethodHandle updaterHandle;
    try {
      updaterHandle = lookup.unreflect(updaterMethod);
    } catch (IllegalAccessException cause) {
      throw new JsonProviderException("inaccessible updater method " + updaterMethod, cause);
    }

    return JsonFieldParser.forUpdater(updaterHandle, valueParser);
  }

  static <V, T> JsonFieldParser<V, T> forSetter(PropertySetter<V, T> setter, JsonParser<V> valueParser) {
    return new JsonFieldSetterParser<V, T>(setter, valueParser);
  }

  static <V, T> JsonFieldParser<V, T> forSetter(MethodHandle setterHandle, JsonParser<V> valueParser) throws JsonProviderException {
    MethodType methodType = setterHandle.type();
    if (methodType.parameterCount() != 2) {
      throw new JsonProviderException("invalid setter method signature " + setterHandle);
    }
    methodType = methodType.changeReturnType(void.class)
                           .changeParameterType(1, methodType.wrap().parameterType(1));

    final CallSite callSite;
    try {
      callSite = LambdaMetafactory.metafactory(MethodHandles.lookup(), "setValue",
                                               MethodType.methodType(PropertySetter.class),
                                               MethodType.methodType(void.class, Object.class, Object.class),
                                               setterHandle, methodType);
    } catch (LambdaConversionException cause) {
      throw new JsonProviderException(cause);
    }

    final PropertySetter<V, T> setter;
    try {
      setter = (PropertySetter<V, T>) callSite.getTarget().invokeExact();
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new JsonProviderException(cause);
    }

    return new JsonFieldSetterParser<V, T>(setter, valueParser);
  }

  static <V, T> JsonFieldParser<V, T> forSetter(Method setterMethod, JsonParser<V> valueParser) throws JsonProviderException {
    MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      lookup = MethodHandles.privateLookupIn(setterMethod.getDeclaringClass(), lookup);
    } catch (IllegalAccessException | SecurityException cause) {
      // Proceed with the original lookup object.
    }

    final MethodHandle setterHandle;
    try {
      setterHandle = lookup.unreflect(setterMethod);
    } catch (IllegalAccessException cause) {
      throw new JsonProviderException("inaccessible setter method " + setterMethod, cause);
    }

    return JsonFieldParser.forSetter(setterHandle, valueParser);
  }

}

final class JsonDummyFieldParser<V, T> implements JsonFieldParser<V, T>, ToSource {

  @Override
  public JsonParser<V> valueParser() {
    return JsonParser.dummy();
  }

  @Override
  public T updatedValue(T object, @Nullable V value) {
    return object;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonFieldParser", "dummy").endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  static final JsonDummyFieldParser<Object, Object> INSTANCE = new JsonDummyFieldParser<Object, Object>();

}

final class JsonFieldKeyParser<V, T extends Map<String, V>> implements JsonFieldParser<V, T>, ToSource {

  final String key;
  final JsonParser<V> valueParser;

  JsonFieldKeyParser(String key, JsonParser<V> valueParser) {
    this.key = key;
    this.valueParser = valueParser;
  }

  @Override
  public JsonParser<V> valueParser() {
    return this.valueParser;
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
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonFieldParser", "forKey")
            .appendArgument(this.key)
            .appendArgument(this.valueParser)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}

final class JsonFieldIndexParser<V, T> implements JsonFieldParser<V, T>, ToSource {

  final VarHandle arrayHandle;
  final int index;
  final JsonParser<V> valueParser;

  JsonFieldIndexParser(VarHandle arrayHandle, int index, JsonParser<V> valueParser) {
    this.arrayHandle = arrayHandle;
    this.index = index;
    this.valueParser = valueParser;
  }

  @Override
  public JsonParser<V> valueParser() {
    return this.valueParser;
  }

  @Override
  public T updatedValue(T object, @Nullable V value) {
    this.arrayHandle.set(object, this.index, value);
    return object;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonFieldParser", "forIndex")
            .appendArgument(this.arrayHandle)
            .appendArgument(this.index)
            .appendArgument(this.valueParser)
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

final class JsonFieldHandleParser<V, T> implements JsonFieldParser<V, T>, ToSource {

  final VarHandle fieldHandle;
  final JsonParser<V> valueParser;

  JsonFieldHandleParser(VarHandle fieldHandle, JsonParser<V> valueParser) {
    this.fieldHandle = fieldHandle;
    this.valueParser = valueParser;
  }

  @Override
  public JsonParser<V> valueParser() {
    return this.valueParser;
  }

  @Override
  public T updatedValue(T object, @Nullable V value) {
    this.fieldHandle.set(object, value);
    return object;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonFieldParser", "forField")
            .appendArgument(this.fieldHandle)
            .appendArgument(this.valueParser)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}

final class JsonFieldUpdaterParser<V, T> implements JsonFieldParser<V, T>, ToSource {

  final PropertyUpdater<V, T> updater;
  final JsonParser<V> valueParser;

  JsonFieldUpdaterParser(PropertyUpdater<V, T> updater, JsonParser<V> valueParser) {
    this.updater = updater;
    this.valueParser = valueParser;
  }

  @Override
  public JsonParser<V> valueParser() {
    return this.valueParser;
  }

  @Override
  public T updatedValue(T object, @Nullable V value) throws JsonException {
    try {
      return this.updater.updatedValue(object, value);
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new JsonException(cause);
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonFieldParser", "forUpdater")
            .appendArgument(this.updater)
            .appendArgument(this.valueParser)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}

final class JsonFieldSetterParser<V, T> implements JsonFieldParser<V, T>, ToSource {

  final PropertySetter<V, T> setter;
  final JsonParser<V> valueParser;

  JsonFieldSetterParser(PropertySetter<V, T> setter, JsonParser<V> valueParser) {
    this.setter = setter;
    this.valueParser = valueParser;
  }

  @Override
  public JsonParser<V> valueParser() {
    return this.valueParser;
  }

  @Override
  public T updatedValue(T object, @Nullable V value) throws JsonException {
    try {
      this.setter.setValue(object, value);
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new JsonException(cause);
    }
    return object;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonFieldParser", "forSetter")
            .appendArgument(this.setter)
            .appendArgument(this.valueParser)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
