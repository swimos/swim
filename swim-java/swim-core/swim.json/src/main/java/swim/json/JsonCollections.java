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

import java.lang.invoke.CallSite;
import java.lang.invoke.LambdaConversionException;
import java.lang.invoke.LambdaMetafactory;
import java.lang.invoke.MethodHandle;
import java.lang.invoke.MethodHandles;
import java.lang.invoke.MethodType;
import java.lang.reflect.Constructor;
import java.lang.reflect.Executable;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.lang.reflect.TypeVariable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.function.Supplier;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.decl.FilterMode;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.Result;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class JsonCollections implements JsonProvider, WriteSource {

  final JsonMetaCodec metaCodec;
  final int priority;

  private JsonCollections(JsonMetaCodec metaCodec, int priority) {
    this.metaCodec = metaCodec;
    this.priority = priority;
  }

  @Override
  public int priority() {
    return this.priority;
  }

  @Override
  public @Nullable JsonFormat<?> resolveJsonFormat(Type type) throws JsonProviderException {
    final Class<?> classType;
    if (type instanceof Class<?>) {
      classType = (Class<?>) type;
    } else if (type instanceof ParameterizedType) {
      final Type rawType = ((ParameterizedType) type).getRawType();
      if (rawType instanceof Class<?>) {
        classType = (Class<?>) rawType;
      } else {
        return null;
      }
    } else {
      return null;
    }

    if (List.class.isAssignableFrom(classType)) {
      return JsonCollections.listFormat(this.metaCodec, classType, type);
    } else if (Map.class.isAssignableFrom(classType)) {
      return JsonCollections.mapFormat(this.metaCodec, classType, type, FilterMode.DEFAULT);
    }

    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonCollections", "provider")
            .appendArgument(this.metaCodec);
    if (this.priority != GENERIC_PRIORITY) {
      notation.appendArgument(this.priority);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  public static JsonCollections provider(JsonMetaCodec metaCodec, int priority) {
    return new JsonCollections(metaCodec, priority);
  }

  public static JsonCollections provider(JsonMetaCodec metaCodec) {
    return new JsonCollections(metaCodec, GENERIC_PRIORITY);
  }

  public static <E, T extends List<E>> JsonFormat<T> listFormat(Supplier<T> creator,
                                                                JsonFormat<E> elementFormat) {
    return new ListFormat<E, T>(creator, elementFormat);
  }

  public static <E, T extends List<E>> JsonFormat<T> listFormat(MethodHandle creatorHandle,
                                                                JsonFormat<E> elementFormat) throws JsonProviderException {
    final MethodType methodType = creatorHandle.type();
    if (methodType.parameterCount() != 0) {
      throw new JsonProviderException("invalid creator signature " + creatorHandle);
    }

    final CallSite callSite;
    try {
      callSite = LambdaMetafactory.metafactory(MethodHandles.lookup(), "get",
                                               MethodType.methodType(Supplier.class),
                                               MethodType.methodType(Object.class),
                                               creatorHandle, methodType);
    } catch (LambdaConversionException cause) {
      throw new JsonProviderException(cause);
    }

    final Supplier<T> creator;
    try {
      creator = (Supplier<T>) callSite.getTarget().invokeExact();
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new JsonProviderException(cause);
    }

    return new ListFormat<E, T>(creator, elementFormat);
  }

  public static <E, T extends List<E>> JsonFormat<T> listFormat(Executable creatorExecutable,
                                                                JsonFormat<E> elementFormat) throws JsonProviderException {
    MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      lookup = MethodHandles.privateLookupIn(creatorExecutable.getDeclaringClass(), lookup);
    } catch (IllegalAccessException | SecurityException cause) {
      // Proceed with the original lookup object.
    }

    final MethodHandle creatorHandle;
    if (creatorExecutable instanceof Constructor<?>) {
      try {
        creatorHandle = lookup.unreflectConstructor((Constructor<?>) creatorExecutable);
      } catch (IllegalAccessException cause) {
        throw new JsonProviderException("inaccessible creator " + creatorExecutable, cause);
      }
    } else if (creatorExecutable instanceof Method) {
      try {
        creatorHandle = lookup.unreflect((Method) creatorExecutable);
      } catch (IllegalAccessException cause) {
        throw new JsonProviderException("inaccessible creator " + creatorExecutable, cause);
      }
    } else {
      throw new AssertionError("unreachable");
    }

    return JsonCollections.listFormat(creatorHandle, elementFormat);
  }

  public static <E, T extends List<E>> JsonFormat<T> listFormat(Class<?> listClass,
                                                                JsonFormat<E> elementFormat) throws JsonProviderException {
    if (!List.class.isAssignableFrom(listClass)) {
      throw new JsonProviderException(listClass.getName() + " is not a subclass of " + List.class.getName());
    }
    do {
      if (listClass == List.class) {
        listClass = ArrayList.class;
      }
      if (!listClass.isInterface() && (listClass.getModifiers() & Modifier.ABSTRACT) == 0) {
        try {
          final Constructor<?> constructor = listClass.getDeclaredConstructor();
          return JsonCollections.listFormat(constructor, elementFormat);
        } catch (NoSuchMethodException cause) {
          // proceed
        }
      }
      listClass = listClass.getSuperclass();
      assert listClass != null;
    } while (true);
  }

  public static <E, T extends List<E>> @Nullable JsonFormat<T> listFormat(JsonMetaCodec metaCodec,
                                                                          Class<?> listClass,
                                                                          Type listType) throws JsonProviderException {
    do {
      Type[] typeArguments = null;
      if (listType instanceof ParameterizedType) {
        final ParameterizedType parameterizedType = (ParameterizedType) listType;
        final Type rawType = parameterizedType.getRawType();
        if (rawType instanceof Class<?>) {
          listType = (Class<?>) rawType;
          typeArguments = parameterizedType.getActualTypeArguments();
        }
      }
      if (listType == List.class) {
        final JsonFormat<E> elementFormat;
        if (typeArguments != null && typeArguments.length == 1) {
          elementFormat = metaCodec.getJsonFormat(typeArguments[0]);
        } else {
          elementFormat = Assume.conforms(metaCodec);
        }
        return JsonCollections.listFormat(listClass, elementFormat);
      } else if (listType instanceof Class<?> baseClass) {
        final Type[] interfaceTypes = baseClass.getGenericInterfaces();
        for (int i = 0; i < interfaceTypes.length; i += 1) {
          final JsonFormat<T> listFormat = JsonCollections.listFormat(metaCodec, listClass, interfaceTypes[i]);
          if (listFormat != null) {
            return listFormat;
          }
        }
        listType = baseClass.getSuperclass();
        continue;
      }
      break;
    } while (true);
    return null;
  }

  public static <V, T extends Map<String, V>> JsonFormat<T> mapFormat(Supplier<T> creator,
                                                                      JsonFormat<String> keyFormat,
                                                                      JsonFormat<V> valueFormat,
                                                                      FilterMode filterMode) {
    return new MapFormat<V, T>(creator, keyFormat, valueFormat, filterMode);
  }

  public static <V, T extends Map<String, V>> JsonFormat<T> mapFormat(MethodHandle creatorHandle,
                                                                      JsonFormat<String> keyFormat,
                                                                      JsonFormat<V> valueFormat,
                                                                      FilterMode filterMode) throws JsonProviderException {
    final MethodType methodType = creatorHandle.type();
    if (methodType.parameterCount() != 0) {
      throw new JsonProviderException("invalid creator signature " + creatorHandle);
    }

    final CallSite callSite;
    try {
      callSite = LambdaMetafactory.metafactory(MethodHandles.lookup(), "get",
                                               MethodType.methodType(Supplier.class),
                                               MethodType.methodType(Object.class),
                                               creatorHandle, methodType);
    } catch (LambdaConversionException cause) {
      throw new JsonProviderException(cause);
    }

    final Supplier<T> creator;
    try {
      creator = (Supplier<T>) callSite.getTarget().invokeExact();
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new JsonProviderException(cause);
    }

    return new MapFormat<V, T>(creator, keyFormat, valueFormat, filterMode);
  }

  public static <V, T extends Map<String, V>> JsonFormat<T> mapFormat(Executable creatorExecutable,
                                                                      JsonFormat<String> keyFormat,
                                                                      JsonFormat<V> valueFormat,
                                                                      FilterMode filterMode) throws JsonProviderException {
    MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      lookup = MethodHandles.privateLookupIn(creatorExecutable.getDeclaringClass(), lookup);
    } catch (IllegalAccessException | SecurityException cause) {
      // Proceed with the original lookup object.
    }

    final MethodHandle creatorHandle;
    if (creatorExecutable instanceof Constructor<?>) {
      try {
        creatorHandle = lookup.unreflectConstructor((Constructor<?>) creatorExecutable);
      } catch (IllegalAccessException cause) {
        throw new JsonProviderException("inaccessible creator " + creatorExecutable, cause);
      }
    } else if (creatorExecutable instanceof Method) {
      try {
        creatorHandle = lookup.unreflect((Method) creatorExecutable);
      } catch (IllegalAccessException cause) {
        throw new JsonProviderException("inaccessible creator " + creatorExecutable, cause);
      }
    } else {
      throw new AssertionError("unreachable");
    }

    return JsonCollections.mapFormat(creatorHandle, keyFormat, valueFormat, filterMode);
  }

  public static <V, T extends Map<String, V>> JsonFormat<T> mapFormat(Class<?> mapClass,
                                                                      JsonFormat<String> keyFormat,
                                                                      JsonFormat<V> valueFormat,
                                                                      FilterMode filterMode) throws JsonProviderException {
    if (!Map.class.isAssignableFrom(mapClass)) {
      throw new JsonProviderException(mapClass.getName() + " is not a subclass of " + Map.class.getName());
    }
    do {
      if (mapClass == Map.class) {
        mapClass = HashMap.class;
      } else if (mapClass == SortedMap.class) {
        mapClass = TreeMap.class;
      }
      if (!mapClass.isInterface() && (mapClass.getModifiers() & Modifier.ABSTRACT) == 0) {
        try {
          final Constructor<?> constructor = mapClass.getDeclaredConstructor();
          return JsonCollections.mapFormat(constructor, keyFormat, valueFormat, filterMode);
        } catch (NoSuchMethodException cause) {
          // proceed
        }
      }
      mapClass = mapClass.getSuperclass();
      assert mapClass != null;
    } while (true);
  }

  public static <V, T extends Map<String, V>> @Nullable JsonFormat<T> mapFormat(JsonMetaCodec metaCodec,
                                                                                Class<?> mapClass,
                                                                                Type mapType,
                                                                                FilterMode filterMode) throws JsonProviderException {
    do {
      Type[] typeArguments = null;
      if (mapType instanceof ParameterizedType) {
        final ParameterizedType parameterizedType = (ParameterizedType) mapType;
        final Type rawType = parameterizedType.getRawType();
        if (rawType instanceof Class<?>) {
          mapType = (Class<?>) rawType;
          typeArguments = parameterizedType.getActualTypeArguments();
        }
      }
      if (mapType == Map.class) {
        final JsonFormat<String> keyFormat;
        final JsonFormat<V> valueFormat;
        if (typeArguments != null && typeArguments.length == 2) {
          if (typeArguments[0] instanceof TypeVariable) {
            final Type[] bounds = ((TypeVariable) typeArguments[0]).getBounds();
            if (bounds.length == 1 && bounds[0] == Object.class) {
              keyFormat = JsonLang.keyFormat();
            } else {
              keyFormat = metaCodec.getJsonFormat(typeArguments[0]);
            }
          } else {
            keyFormat = metaCodec.getJsonFormat(typeArguments[0]);
          }
          valueFormat = metaCodec.getJsonFormat(typeArguments[1]);
        } else {
          keyFormat = JsonLang.keyFormat();
          valueFormat = Assume.conforms(metaCodec);
        }
        return JsonCollections.mapFormat(mapClass, keyFormat, valueFormat, filterMode);
      } else if (mapType instanceof Class<?> baseClass) {
        final Type[] interfaceTypes = baseClass.getGenericInterfaces();
        for (int i = 0; i < interfaceTypes.length; i += 1) {
          final JsonFormat<T> mapFormat = JsonCollections.mapFormat(metaCodec, mapClass, interfaceTypes[i], filterMode);
          if (mapFormat != null) {
            return mapFormat;
          }
        }
        mapType = baseClass.getSuperclass();
        continue;
      }
      break;
    } while (true);
    return null;
  }

  static <V, T extends Map<String, V>> Iterator<JsonFieldFormat<? extends V, T>> mapFieldFormatIterator(Iterator<String> keys,
                                                                                                        JsonFormat<String> keyWriter,
                                                                                                        JsonFormat<V> valueWriter,
                                                                                                        FilterMode filterMode) {
    return new MapFieldFormatIterator<V, T>(keys, keyWriter, valueWriter, filterMode);
  }

  static final class ListFormat<E, T extends List<E>> implements JsonFormat<T>, JsonArrayParser<E, T, T>, JsonArrayWriter<E, T>, WriteSource {

    final Supplier<T> creator;
    final JsonFormat<E> elementFormat;

    ListFormat(Supplier<T> creator, JsonFormat<E> elementFormat) {
      this.creator = creator;
      this.elementFormat = elementFormat;
    }

    @Override
    public @Nullable String typeName() {
      return "array";
    }

    @Override
    public JsonParser<E> elementParser() {
      return this.elementFormat;
    }

    @Override
    public T arrayBuilder() throws JsonException {
      try {
        return this.creator.get();
      } catch (Throwable cause) {
        Result.throwFatal(cause);
        throw new JsonException(cause);
      }
    }

    @Override
    public T appendElement(T object, @Nullable E element) {
      object.add(element);
      return object;
    }

    @Override
    public @Nullable T buildArray(T object) {
      return object;
    }

    @Override
    public @Nullable Iterator<E> getElements(@Nullable T object) {
      if (object == null) {
        return null;
      }
      return object.iterator();
    }

    @Override
    public JsonWriter<E> elementWriter() {
      return this.elementFormat;
    }

    @Override
    public boolean filter(@Nullable T object, FilterMode filterMode) {
      switch (filterMode) {
        case DEFINED:
        case TRUTHY:
          return object != null;
        case DISTINCT:
          return object != null && !object.isEmpty();
        default:
          return true;
      }
    }

    @Override
    public @Nullable T initializer() throws JsonException {
      try {
        return this.creator.get();
      } catch (Throwable cause) {
        Result.throwFatal(cause);
        throw new JsonException(cause);
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonCollections", "listFormat")
              .appendArgument(this.creator)
              .appendArgument(this.elementFormat)
              .endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

  }

  static final class MapFormat<V, T extends Map<String, V>> implements JsonFormat<T>, JsonObjectFormat<V, T, T>, WriteSource {

    final Supplier<T> creator;
    final JsonFormat<String> keyFormat;
    final JsonFormat<V> valueFormat;
    final FilterMode filterMode;

    MapFormat(Supplier<T> creator, JsonFormat<String> keyFormat,
              JsonFormat<V> valueFormat, FilterMode filterMode) {
      this.creator = creator;
      this.keyFormat = keyFormat;
      this.valueFormat = valueFormat;
      this.filterMode = filterMode;
    }

    @Override
    public @Nullable String typeName() {
      return "object";
    }

    @Override
    public JsonFieldFormat<? extends V, T> getFieldFormat(@Nullable T object, String key) {
      return JsonFieldFormat.forKey(key, this.keyFormat, this.valueFormat, this.filterMode);
    }

    @Override
    public Iterator<JsonFieldFormat<? extends V, T>> getFieldFormats(@Nullable T object) {
      if (object == null) {
        return Collections.emptyIterator();
      }
      return new MapFieldFormatIterator<V, T>(object.keySet().iterator(), this.keyFormat,
                                              this.valueFormat, this.filterMode);
    }

    @Override
    public Iterator<JsonFieldFormat<? extends V, T>> getDeclaredFieldFormats() {
      return Collections.emptyIterator();
    }

    @Override
    public JsonParser<String> keyParser() {
      return this.keyFormat;
    }

    @Override
    public T objectBuilder() throws JsonException {
      try {
        return this.creator.get();
      } catch (Throwable cause) {
        Result.throwFatal(cause);
        throw new JsonException(cause);
      }
    }

    @Override
    public JsonFieldParser<? extends V, T> getFieldParser(T object, String key) {
      return JsonFieldParser.forKey(key, this.valueFormat);
    }

    @Override
    public @Nullable T buildObject(T object) {
      return object;
    }

    @Override
    public JsonFieldWriter<? extends V, T> getFieldWriter(T object, String key) {
      return JsonFieldWriter.forKey(key, this.keyFormat, this.valueFormat, this.filterMode);
    }

    @Override
    public Iterator<JsonFieldWriter<? extends V, T>> getFieldWriters(T object) {
      return Assume.conforms(new MapFieldFormatIterator<V, T>(object.keySet().iterator(), this.keyFormat,
                                                              this.valueFormat, this.filterMode));
    }

    @Override
    public boolean filter(@Nullable T object, FilterMode filterMode) {
      switch (filterMode) {
        case DEFINED:
        case TRUTHY:
          return object != null;
        case DISTINCT:
          return object != null && !object.isEmpty();
        default:
          return true;
      }
    }

    @Override
    public @Nullable T merged(@Nullable T newObject, @Nullable T oldObject) {
      if (newObject == null || oldObject == null) {
        return newObject;
      }
      newObject.putAll(oldObject);
      return newObject;
    }

    @Override
    public @Nullable T initializer() throws JsonException {
      try {
        return this.creator.get();
      } catch (Throwable cause) {
        Result.throwFatal(cause);
        throw new JsonException(cause);
      }
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonCollections", "mapFormat")
              .appendArgument(this.creator)
              .appendArgument(this.keyFormat)
              .appendArgument(this.valueFormat)
              .endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

  }

  static final class MapFieldFormatIterator<V, T extends Map<String, V>> implements Iterator<JsonFieldFormat<? extends V, T>> {

    final Iterator<String> keys;
    final JsonFormat<String> keyFormat;
    final JsonFormat<V> valueFormat;
    final FilterMode filterMode;

    MapFieldFormatIterator(Iterator<String> keys, JsonFormat<String> keyFormat,
                           JsonFormat<V> valueFormat, FilterMode filterMode) {
      this.keys = keys;
      this.keyFormat = keyFormat;
      this.valueFormat = valueFormat;
      this.filterMode = filterMode;
    }

    @Override
    public boolean hasNext() {
      return this.keys.hasNext();
    }

    @Override
    public JsonFieldFormat<? extends V, T> next() {
      return JsonFieldFormat.forKey(this.keys.next(), this.keyFormat,
                                    this.valueFormat, this.filterMode);
    }

  }

}
