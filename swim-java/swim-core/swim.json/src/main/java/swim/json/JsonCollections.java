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

import java.lang.reflect.Constructor;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.lang.reflect.TypeVariable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Output;
import swim.codec.Write;
import swim.expr.Term;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class JsonCollections implements JsonProvider, ToSource {

  final JsonCodec codec;
  final int priority;

  private JsonCollections(JsonCodec codec, int priority) {
    this.codec = codec;
    this.priority = priority;
  }

  @Override
  public int priority() {
    return this.priority;
  }

  @Override
  public @Nullable JsonForm<?> resolveJsonForm(Type javaType) {
    final Class<?> javaClass;
    if (javaType instanceof Class<?>) {
      javaClass = (Class<?>) javaType;
    } else if (javaType instanceof ParameterizedType) {
      final Type rawType = ((ParameterizedType) javaType).getRawType();
      if (rawType instanceof Class<?>) {
        javaClass = (Class<?>) rawType;
      } else {
        return null;
      }
    } else {
      return null;
    }
    if (List.class.isAssignableFrom(javaClass)) {
      return JsonCollections.listForm(this.codec, javaClass, javaType);
    } else if (Map.class.isAssignableFrom(javaClass)) {
      return JsonCollections.mapForm(this.codec, javaClass, javaType);
    }
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonCollections", "provider");
    notation.appendArgument(this.codec);
    if (this.priority != GENERIC_PRIORITY) {
      notation.appendArgument(this.priority);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static JsonCollections provider(JsonCodec codec, int priority) {
    return new JsonCollections(codec, priority);
  }

  public static JsonCollections provider(JsonCodec codec) {
    return new JsonCollections(codec, GENERIC_PRIORITY);
  }

  public static <E, T extends List<E>> JsonArrayForm<E, T, T> listForm(Class<?> listClass, JsonForm<E> elementForm) {
    if (!List.class.isAssignableFrom(listClass)) {
      throw new IllegalArgumentException(listClass.getName() + " is not a subclass of " + List.class.getName());
    }
    Constructor<T> constructor;
    do {
      if (listClass == List.class) {
        listClass = ArrayList.class;
      }
      try {
        constructor = Assume.conforms(listClass.getDeclaredConstructor());
        break;
      } catch (NoSuchMethodException cause) {
        listClass = listClass.getSuperclass();
        assert listClass != null;
      }
    } while (true);
    constructor.setAccessible(true);
    return new JsonCollections.ListForm<E, T>(constructor, elementForm);
  }

  public static <E, T extends List<E>> @Nullable JsonArrayForm<E, T, T> listForm(JsonCodec codec, Class<?> listClass, Type listType) {
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
        final JsonForm<E> elementForm;
        if (typeArguments != null && typeArguments.length == 1) {
          elementForm = codec.forType(typeArguments[0]);
        } else {
          elementForm = Assume.conforms(codec);
        }
        if (elementForm != null) {
          return JsonCollections.listForm(listClass, elementForm);
        } else {
          return null;
        }
      } else if (listType instanceof Class<?>) {
        final Class<?> baseClass = (Class<?>) listType;
        final Type[] interfaceTypes = baseClass.getGenericInterfaces();
        for (int i = 0; i < interfaceTypes.length; i += 1) {
          final JsonArrayForm<E, T, T> listForm = JsonCollections.listForm(codec, listClass, interfaceTypes[i]);
          if (listForm != null) {
            return listForm;
          }
        }
        listType = baseClass.getSuperclass();
        continue;
      } else {
        return null;
      }
    } while (true);
  }

  public static <K, V, T extends Map<K, V>> JsonObjectForm<K, V, T, T> mapForm(Class<?> mapClass, JsonForm<K> keyForm, JsonForm<V> valueForm) {
    if (!Map.class.isAssignableFrom(mapClass)) {
      throw new IllegalArgumentException(mapClass.getName() + " is not a subclass of " + Map.class.getName());
    }
    Constructor<T> constructor;
    do {
      if (mapClass == Map.class) {
        mapClass = HashMap.class;
      } else if (mapClass == SortedMap.class) {
        mapClass = TreeMap.class;
      }
      try {
        constructor = Assume.conforms(mapClass.getDeclaredConstructor());
        break;
      } catch (NoSuchMethodException cause) {
        mapClass = mapClass.getSuperclass();
        assert mapClass != null;
      }
    } while (true);
    constructor.setAccessible(true);
    return new JsonCollections.MapForm<K, V, T>(constructor, keyForm, valueForm);
  }

  public static <K, V, T extends Map<K, V>> @Nullable JsonObjectForm<K, V, T, T> mapForm(JsonCodec codec, Class<?> mapClass, Type mapType) {
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
        final JsonForm<K> keyForm;
        final JsonForm<V> valueForm;
        if (typeArguments != null && typeArguments.length == 2) {
          if (typeArguments[0] instanceof TypeVariable) {
            final Type[] bounds = ((TypeVariable) typeArguments[0]).getBounds();
            if (bounds.length == 1 && bounds[0] == Object.class) {
              keyForm = Assume.conforms(JsonJava.keyForm());
            } else {
              keyForm = codec.forType(typeArguments[0]);
            }
          } else {
            keyForm = codec.forType(typeArguments[0]);
          }
          valueForm = codec.forType(typeArguments[1]);
        } else {
          keyForm = Assume.conforms(JsonJava.keyForm());
          valueForm = Assume.conforms(codec);
        }
        if (keyForm != null && valueForm != null) {
          return JsonCollections.mapForm(mapClass, keyForm, valueForm);
        } else {
          return null;
        }
      } else if (mapType instanceof Class<?>) {
        final Class<?> baseClass = (Class<?>) mapType;
        final Type[] interfaceTypes = baseClass.getGenericInterfaces();
        for (int i = 0; i < interfaceTypes.length; i += 1) {
          final JsonObjectForm<K, V, T, T> mapForm = JsonCollections.mapForm(codec, mapClass, interfaceTypes[i]);
          if (mapForm != null) {
            return mapForm;
          }
        }
        mapType = baseClass.getSuperclass();
        continue;
      } else {
        return null;
      }
    } while (true);
  }

  static final class ListForm<E, T extends List<E>> implements JsonArrayForm<E, T, T>, ToSource {

    final Constructor<T> constructor;
    final JsonForm<E> elementForm;

    ListForm(Constructor<T> constructor, JsonForm<E> elementForm) {
      this.constructor = constructor;
      this.elementForm = elementForm;
    }

    @Override
    public JsonForm<E> elementForm() {
      return this.elementForm;
    }

    @Override
    public T arrayBuilder() {
      try {
        return this.constructor.newInstance();
      } catch (ReflectiveOperationException cause) {
        throw new UnsupportedOperationException(cause);
      }
    }

    @Override
    public T appendElement(T builder, @Nullable E element) {
      builder.add(element);
      return builder;
    }

    @Override
    public T buildArray(T builder) {
      return builder;
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable T value, JsonWriter writer) {
      if (value != null) {
        return writer.writeArray(output, this, value.iterator());
      } else {
        return writer.writeNull(output);
      }
    }

    @Override
    public Term intoTerm(@Nullable T value) {
      return Term.from(value);
    }

    @Override
    public @Nullable T fromTerm(Term term) {
      return term.objectValue(this.constructor.getDeclaringClass());
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonCollections", "listForm")
              .appendArgument(this.constructor.getDeclaringClass())
              .appendArgument(this.elementForm)
              .endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class MapForm<K, V, T extends Map<K, V>> implements JsonFieldForm<K, V, T>, JsonObjectForm<K, V, T, T>, ToSource {

    final Constructor<T> constructor;
    final JsonForm<K> keyForm;
    final JsonForm<V> valueForm;

    MapForm(Constructor<T> constructor, JsonForm<K> keyForm, JsonForm<V> valueForm) {
      this.constructor = constructor;
      this.keyForm = keyForm;
      this.valueForm = valueForm;
    }

    @Override
    public JsonForm<K> keyForm() {
      return this.keyForm;
    }

    @Override
    public JsonForm<V> valueForm() {
      return this.valueForm;
    }

    @Override
    public JsonFieldForm<K, V, T> getFieldForm(K key) {
      return this;
    }

    @Override
    public T objectBuilder() {
      try {
        return this.constructor.newInstance();
      } catch (ReflectiveOperationException cause) {
        throw new UnsupportedOperationException(cause);
      }
    }

    @Override
    public T updateField(T builder, K key, @Nullable V value) {
      builder.put(key, value);
      return builder;
    }

    @Override
    public T buildObject(T builder) {
      return builder;
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable T value, JsonWriter writer) {
      if (value != null) {
        return writer.writeObject(output, this, value.entrySet().iterator());
      } else {
        return writer.writeNull(output);
      }
    }

    @Override
    public Term intoTerm(@Nullable T value) {
      return Term.from(value);
    }

    @Override
    public @Nullable T fromTerm(Term term) {
      return term.objectValue(this.constructor.getDeclaringClass());
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JsonCollections", "mapForm")
              .appendArgument(this.constructor.getDeclaringClass())
              .appendArgument(this.keyForm)
              .appendArgument(this.valueForm)
              .endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

}
