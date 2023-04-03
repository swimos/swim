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

import java.lang.reflect.Constructor;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.lang.reflect.TypeVariable;
import java.util.ArrayList;
import java.util.Collections;
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
import swim.expr.TermException;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class WamlCollections implements WamlProvider, ToSource {

  final WamlCodec codec;
  final int priority;

  private WamlCollections(WamlCodec codec, int priority) {
    this.codec = codec;
    this.priority = priority;
  }

  @Override
  public int priority() {
    return this.priority;
  }

  @Override
  public @Nullable WamlForm<?> resolveWamlForm(Type javaType) throws WamlFormException {
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
      return WamlCollections.listForm(this.codec, javaClass, javaType);
    } else if (Map.class.isAssignableFrom(javaClass)) {
      return WamlCollections.mapForm(this.codec, javaClass, javaType);
    }

    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlCollections", "provider");
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

  public static WamlCollections provider(WamlCodec codec, int priority) {
    return new WamlCollections(codec, priority);
  }

  public static WamlCollections provider(WamlCodec codec) {
    return new WamlCollections(codec, GENERIC_PRIORITY);
  }

  public static <E, T extends List<E>> WamlArrayForm<E, T, T> listForm(Class<?> listClass, WamlForm<E> elementForm) {
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
    return new WamlCollections.ListForm<E, T>(constructor, elementForm);
  }

  public static <E, T extends List<E>> @Nullable WamlArrayForm<E, T, T> listForm(WamlCodec codec, Class<?> listClass, Type listType) throws WamlFormException {
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
        final WamlForm<E> elementForm;
        if (typeArguments != null && typeArguments.length == 1) {
          elementForm = codec.getWamlForm(typeArguments[0]);
        } else {
          elementForm = Assume.conforms(codec);
        }
        return WamlCollections.listForm(listClass, elementForm);
      } else if (listType instanceof Class<?>) {
        final Class<?> baseClass = (Class<?>) listType;
        final Type[] interfaceTypes = baseClass.getGenericInterfaces();
        for (int i = 0; i < interfaceTypes.length; i += 1) {
          final WamlArrayForm<E, T, T> listForm = WamlCollections.listForm(codec, listClass, interfaceTypes[i]);
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

  public static <K, V, T extends Map<K, V>> WamlObjectForm<K, V, T, T> mapForm(Class<?> mapClass, WamlForm<K> keyForm, WamlForm<V> valueForm) {
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
    return new WamlCollections.MapForm<K, V, T>(constructor, keyForm, valueForm);
  }

  public static <K, V, T extends Map<K, V>> @Nullable WamlObjectForm<K, V, T, T> mapForm(WamlCodec codec, Class<?> mapClass, Type mapType) throws WamlFormException {
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
        final WamlForm<K> keyForm;
        final WamlForm<V> valueForm;
        if (typeArguments != null && typeArguments.length == 2) {
          if (typeArguments[0] instanceof TypeVariable) {
            final Type[] bounds = ((TypeVariable) typeArguments[0]).getBounds();
            if (bounds.length == 1 && bounds[0] == Object.class) {
              keyForm = Assume.conforms(WamlJava.keyForm());
            } else {
              keyForm = codec.getWamlForm(typeArguments[0]);
            }
          } else {
            keyForm = codec.getWamlForm(typeArguments[0]);
          }
          valueForm = codec.getWamlForm(typeArguments[1]);
        } else {
          keyForm = Assume.conforms(WamlJava.keyForm());
          valueForm = Assume.conforms(codec);
        }
        return WamlCollections.mapForm(mapClass, keyForm, valueForm);
      } else if (mapType instanceof Class<?>) {
        final Class<?> baseClass = (Class<?>) mapType;
        final Type[] interfaceTypes = baseClass.getGenericInterfaces();
        for (int i = 0; i < interfaceTypes.length; i += 1) {
          final WamlObjectForm<K, V, T, T> mapForm = WamlCollections.mapForm(codec, mapClass, interfaceTypes[i]);
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

  static final class ListForm<E, T extends List<E>> implements WamlArrayForm<E, T, T>, ToSource {

    final Constructor<T> constructor;
    final WamlForm<E> elementForm;

    ListForm(Constructor<T> constructor, WamlForm<E> elementForm) {
      this.constructor = constructor;
      this.elementForm = elementForm;
    }

    @Override
    public WamlForm<E> elementForm() {
      return this.elementForm;
    }

    @Override
    public T arrayBuilder() throws WamlException {
      try {
        return this.constructor.newInstance();
      } catch (ReflectiveOperationException cause) {
        throw new WamlException("unable to construct array builder", cause);
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
    public Write<?> write(Output<?> output, @Nullable T value, WamlWriter writer) {
      if (value != null) {
        return writer.writeArray(output, this, value.iterator(), Collections.emptyIterator());
      } else {
        return writer.writeUnit(output, this, Collections.emptyIterator());
      }
    }

    @Override
    public Term intoTerm(@Nullable T value) throws TermException {
      return Term.from(value);
    }

    @Override
    public @Nullable T fromTerm(Term term) {
      return term.objectValue(this.constructor.getDeclaringClass());
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlCollections", "listForm")
              .appendArgument(this.constructor.getDeclaringClass())
              .appendArgument(this.elementForm)
              .endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class MapForm<K, V, T extends Map<K, V>> implements WamlFieldForm<K, V, T>, WamlObjectForm<K, V, T, T>, ToSource {

    final Constructor<T> constructor;
    final WamlForm<K> keyForm;
    final WamlForm<V> valueForm;

    MapForm(Constructor<T> constructor, WamlForm<K> keyForm, WamlForm<V> valueForm) {
      this.constructor = constructor;
      this.keyForm = keyForm;
      this.valueForm = valueForm;
    }

    @Override
    public WamlForm<K> keyForm() {
      return this.keyForm;
    }

    @Override
    public WamlForm<V> valueForm() {
      return this.valueForm;
    }

    @Override
    public WamlFieldForm<K, V, T> getFieldForm(K key) {
      return this;
    }

    @Override
    public T objectBuilder() throws WamlException {
      try {
        return this.constructor.newInstance();
      } catch (ReflectiveOperationException cause) {
        throw new WamlException("unable to construct object builder", cause);
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
    public Write<?> write(Output<?> output, @Nullable T value, WamlWriter writer) {
      if (value != null) {
        return writer.writeObject(output, this, value.entrySet().iterator(), Collections.emptyIterator());
      } else {
        return writer.writeUnit(output, this, Collections.emptyIterator());
      }
    }

    @Override
    public Term intoTerm(@Nullable T value) throws TermException {
      return Term.from(value);
    }

    @Override
    public @Nullable T fromTerm(Term term) {
      return term.objectValue(this.constructor.getDeclaringClass());
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlCollections", "mapForm")
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
