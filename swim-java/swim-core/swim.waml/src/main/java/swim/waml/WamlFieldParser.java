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
import swim.util.Assume;
import swim.util.Notation;
import swim.util.PropertySetter;
import swim.util.PropertyUpdater;
import swim.util.Result;
import swim.util.WriteSource;
import swim.util.UpdatableMap;

@Public
@Since("5.0")
public interface WamlFieldParser<V, T> extends PropertyUpdater<V, T> {

  WamlParser<V> valueParser();

  @Override
  T updatedValue(T object, @Nullable V value) throws WamlException;

  static <V, T> WamlFieldParser<V, T> dummy() {
    return Assume.conforms(WamlDummyFieldParser.INSTANCE);
  }

  static <V, T extends Map<String, V>> WamlFieldParser<V, T> forKey(String key, WamlParser<V> valueParser) {
    return new WamlFieldKeyParser<V, T>(key, valueParser);
  }

  static <V, T> WamlFieldParser<V, T> forIndex(VarHandle arrayHandle, int index, WamlParser<V> valueParser) throws WamlProviderException {
    final List<Class<?>> coordinateTypes = arrayHandle.coordinateTypes();
    if (coordinateTypes.size() != 2 || !coordinateTypes.get(1).equals(Integer.TYPE)) {
      throw new WamlProviderException("invalid array handle " + arrayHandle);
    }
    return new WamlFieldIndexParser<V, T>(arrayHandle, index, valueParser);
  }

  static <V> WamlFieldParser<V, Object[]> forIndex(int index, WamlParser<V> valueParser) {
    return new WamlFieldIndexParser<V, Object[]>(WamlFieldIndexParser.OBJECT_ARRAY, index, valueParser);
  }

  static <V, T> WamlFieldParser<V, T> forField(VarHandle fieldHandle, WamlParser<V> valueParser) throws WamlProviderException {
    if (fieldHandle.coordinateTypes().size() != 1) {
      throw new WamlProviderException("invalid field handle " + fieldHandle);
    }
    return new WamlFieldHandleParser<V, T>(fieldHandle, valueParser);
  }

  static <V, T> WamlFieldParser<V, T> forField(Field field, WamlParser<V> valueParser) throws WamlProviderException {
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

    return WamlFieldParser.forField(fieldHandle, valueParser);
  }

  static <V, T> WamlFieldParser<V, T> forUpdater(PropertyUpdater<V, T> updater, WamlParser<V> valueParser) {
    return new WamlFieldUpdaterParser<V, T>(updater, valueParser);
  }

  static <V, T> WamlFieldParser<V, T> forUpdater(MethodHandle updaterHandle, WamlParser<V> valueParser) throws WamlProviderException {
    MethodType methodType = updaterHandle.type();
    if (methodType.parameterCount() != 2) {
      throw new WamlProviderException("invalid updater method signature " + updaterHandle);
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
      throw new WamlProviderException(cause);
    }

    final PropertyUpdater<V, T> updater;
    try {
      updater = (PropertyUpdater<V, T>) callSite.getTarget().invokeExact();
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new WamlProviderException(cause);
    }

    return new WamlFieldUpdaterParser<V, T>(updater, valueParser);
  }

  static <V, T> WamlFieldParser<V, T> forUpdater(Method updaterMethod, WamlParser<V> valueParser) throws WamlProviderException {
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
      throw new WamlProviderException("inaccessible updater method " + updaterMethod, cause);
    }

    return WamlFieldParser.forUpdater(updaterHandle, valueParser);
  }

  static <V, T> WamlFieldParser<V, T> forSetter(PropertySetter<V, T> setter, WamlParser<V> valueParser) {
    return new WamlFieldSetterParser<V, T>(setter, valueParser);
  }

  static <V, T> WamlFieldParser<V, T> forSetter(MethodHandle setterHandle, WamlParser<V> valueParser) throws WamlProviderException {
    MethodType methodType = setterHandle.type();
    if (methodType.parameterCount() != 2) {
      throw new WamlProviderException("invalid setter method signature " + setterHandle);
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
      throw new WamlProviderException(cause);
    }

    final PropertySetter<V, T> setter;
    try {
      setter = (PropertySetter<V, T>) callSite.getTarget().invokeExact();
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new WamlProviderException(cause);
    }

    return new WamlFieldSetterParser<V, T>(setter, valueParser);
  }

  static <V, T> WamlFieldParser<V, T> forSetter(Method setterMethod, WamlParser<V> valueParser) throws WamlProviderException {
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
      throw new WamlProviderException("inaccessible setter method " + setterMethod, cause);
    }

    return WamlFieldParser.forSetter(setterHandle, valueParser);
  }

}

final class WamlDummyFieldParser<V, T> implements WamlFieldParser<V, T>, WriteSource {

  @Override
  public WamlParser<V> valueParser() {
    return WamlParser.dummy();
  }

  @Override
  public T updatedValue(T object, @Nullable V value) {
    return object;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlFieldParser", "dummy").endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final WamlDummyFieldParser<Object, Object> INSTANCE = new WamlDummyFieldParser<Object, Object>();

}

final class WamlFieldKeyParser<V, T extends Map<String, V>> implements WamlFieldParser<V, T>, WriteSource {

  final String key;
  final WamlParser<V> valueParser;

  WamlFieldKeyParser(String key, WamlParser<V> valueParser) {
    this.key = key;
    this.valueParser = valueParser;
  }

  @Override
  public WamlParser<V> valueParser() {
    return this.valueParser;
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
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlFieldParser", "forKey")
            .appendArgument(this.key)
            .appendArgument(this.valueParser)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

}

final class WamlFieldIndexParser<V, T> implements WamlFieldParser<V, T>, WriteSource {

  final VarHandle arrayHandle;
  final int index;
  final WamlParser<V> valueParser;

  WamlFieldIndexParser(VarHandle arrayHandle, int index, WamlParser<V> valueParser) {
    this.arrayHandle = arrayHandle;
    this.index = index;
    this.valueParser = valueParser;
  }

  @Override
  public WamlParser<V> valueParser() {
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
    notation.beginInvoke("WamlFieldParser", "forIndex")
            .appendArgument(this.arrayHandle)
            .appendArgument(this.index)
            .appendArgument(this.valueParser)
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

final class WamlFieldHandleParser<V, T> implements WamlFieldParser<V, T>, WriteSource {

  final VarHandle fieldHandle;
  final WamlParser<V> valueParser;

  WamlFieldHandleParser(VarHandle fieldHandle, WamlParser<V> valueParser) {
    this.fieldHandle = fieldHandle;
    this.valueParser = valueParser;
  }

  @Override
  public WamlParser<V> valueParser() {
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
    notation.beginInvoke("WamlFieldParser", "forField")
            .appendArgument(this.fieldHandle)
            .appendArgument(this.valueParser)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

}

final class WamlFieldUpdaterParser<V, T> implements WamlFieldParser<V, T>, WriteSource {

  final PropertyUpdater<V, T> updater;
  final WamlParser<V> valueParser;

  WamlFieldUpdaterParser(PropertyUpdater<V, T> updater, WamlParser<V> valueParser) {
    this.updater = updater;
    this.valueParser = valueParser;
  }

  @Override
  public WamlParser<V> valueParser() {
    return this.valueParser;
  }

  @Override
  public T updatedValue(T object, @Nullable V value) throws WamlException {
    try {
      return this.updater.updatedValue(object, value);
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new WamlException(cause);
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlFieldParser", "forUpdater")
            .appendArgument(this.updater)
            .appendArgument(this.valueParser)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

}

final class WamlFieldSetterParser<V, T> implements WamlFieldParser<V, T>, WriteSource {

  final PropertySetter<V, T> setter;
  final WamlParser<V> valueParser;

  WamlFieldSetterParser(PropertySetter<V, T> setter, WamlParser<V> valueParser) {
    this.setter = setter;
    this.valueParser = valueParser;
  }

  @Override
  public WamlParser<V> valueParser() {
    return this.valueParser;
  }

  @Override
  public T updatedValue(T object, @Nullable V value) throws WamlException {
    try {
      this.setter.setValue(object, value);
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new WamlException(cause);
    }
    return object;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlFieldParser", "forSetter")
            .appendArgument(this.setter)
            .appendArgument(this.valueParser)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

}
