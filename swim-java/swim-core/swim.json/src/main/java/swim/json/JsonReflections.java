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
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.AbstractMap.SimpleImmutableEntry;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
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
public final class JsonReflections implements JsonProvider, ToSource {

  final JsonCodec codec;
  final int priority;

  private JsonReflections(JsonCodec codec, int priority) {
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

    return JsonReflections.reflectionForm(this.codec, javaClass);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonReflections", "provider");
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

  public static JsonReflections provider(JsonCodec codec, int priority) {
    return new JsonReflections(codec, priority);
  }

  public static JsonReflections provider(JsonCodec codec) {
    return new JsonReflections(codec, GENERIC_PRIORITY);
  }

  public static <T> @Nullable JsonObjectForm<String, Object, T, T> reflectionForm(JsonCodec codec, Class<?> javaClass) {
    final Constructor<T> constructor;
    try {
      constructor = Assume.conforms(javaClass.getDeclaredConstructor());
    } catch (NoSuchMethodException cause) {
      return null;
    }
    constructor.setAccessible(true);
    final LinkedHashMap<String, JsonReflectionFieldForm<Object, T>> fieldForms = new LinkedHashMap<String, JsonReflectionFieldForm<Object, T>>();
    JsonReflections.reflectFields(codec, javaClass, fieldForms);
    return new JsonReflectionForm<T>(codec, constructor, fieldForms, null);
  }

  static <T> void reflectFields(JsonCodec codec, @Nullable Class<?> javaClass, Map<String, JsonReflectionFieldForm<Object, T>> fieldForms) {
    if (javaClass != null) {
      JsonReflections.reflectFields(codec, javaClass.getSuperclass(), fieldForms);
      final Field[] fields = javaClass.getDeclaredFields();
      for (int i = 0; i < fields.length; i += 1) {
        JsonReflections.reflectField(codec, fields[i], fieldForms);
      }
    }
  }

  static <T> void reflectField(JsonCodec codec, Field field, Map<String, JsonReflectionFieldForm<Object, T>> fieldForms) {
    final int modifiers = field.getModifiers();
    if ((modifiers & (Modifier.STATIC | Modifier.TRANSIENT)) == 0) {
      if ((modifiers & (Modifier.FINAL | Modifier.PRIVATE | Modifier.PROTECTED)) != 0 || modifiers == 0) {
        field.setAccessible(true);
      }
      final JsonForm<Object> valueForm = codec.forType(field.getGenericType());
      if (valueForm != null) {
        final JsonKey keyAnnotation = field.getAnnotation(JsonKey.class);
        String fieldKey = keyAnnotation != null ? keyAnnotation.value() : null;
        if (fieldKey == null || fieldKey.length() == 0) {
          fieldKey = field.getName();
        }
        fieldForms.put(fieldKey, new JsonReflectionFieldForm<Object, T>(field, valueForm));
      }
    }
  }

}

final class JsonReflectionForm<T> implements JsonObjectForm<String, Object, T, T>, JsonFieldForm<String, Object, T>, ToSource {

  final JsonCodec codec;
  final Constructor<T> constructor;
  final Map<String, JsonReflectionFieldForm<Object, T>> fieldForms;
  final @Nullable String tag;

  JsonReflectionForm(JsonCodec codec, Constructor<T> constructor,
                     Map<String, JsonReflectionFieldForm<Object, T>> fieldForms,
                     @Nullable String tag) {
    this.codec = codec;
    this.constructor = constructor;
    this.fieldForms = fieldForms;
    this.tag = tag;
  }

  @Override
  public JsonForm<String> keyForm() {
    return JsonJava.keyForm();
  }

  @Override
  public JsonForm<Object> valueForm() {
    return this.codec;
  }

  @Override
  public T updateField(T builder, String key, @Nullable Object value) {
    return builder; // unreachable
  }

  @Override
  public @Nullable JsonForm<T> taggedForm(String tag) {
    if (Objects.equals(this.tag, tag)) {
      return this;
    } else {
      return new JsonReflectionForm<T>(this.codec, this.constructor,
                                       this.fieldForms, tag);
    }
  }

  @Override
  public @Nullable JsonFieldForm<String, Object, T> getFieldForm(String key) {
    final JsonFieldForm<String, Object, T> fieldForm = this.fieldForms.get(key);
    if (fieldForm != null) {
      return fieldForm;
    } else if (this.tag != null && "type".equals(key)) {
      return this;
    } else {
      return null;
    }
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
  public T buildObject(T builder) {
    return builder;
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable T value, JsonWriter writer) {
    if (value != null) {
      return writer.writeObject(output, this, new JsonReflectionForm.FieldIterator<T>(value, this.tag, this.fieldForms.entrySet().iterator()));
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
    notation.beginInvoke("JsonReflections", "reflectionForm")
            .appendArgument(this.codec)
            .appendArgument(this.constructor.getDeclaringClass())
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  static final class FieldIterator<T> implements Iterator<Map.Entry<String, Object>> {

    final T object;
    @Nullable String tag;
    final Iterator<Map.Entry<String, JsonReflectionFieldForm<Object, T>>> iterator;

    FieldIterator(T object, @Nullable String tag, Iterator<Map.Entry<String, JsonReflectionFieldForm<Object, T>>> iterator) {
      this.object = object;
      this.tag = tag;
      this.iterator = iterator;
    }

    @Override
    public boolean hasNext() {
      return this.tag != null || this.iterator.hasNext();
    }

    @Override
    public Map.Entry<String, Object> next() {
      final String tag = this.tag;
      if (tag != null) {
        this.tag = null;
        return new SimpleImmutableEntry<String, Object>("type", tag);
      } else {
        final Map.Entry<String, JsonReflectionFieldForm<Object, T>> fieldEntry = this.iterator.next();
        final String key = fieldEntry.getKey();
        final JsonReflectionFieldForm<Object, T> fieldForm = fieldEntry.getValue();
        final Object value;
        try {
          value = fieldForm.field.get(this.object);
        } catch (IllegalAccessException cause) {
          throw new UnsupportedOperationException(cause);
        }
        return new SimpleImmutableEntry<String, Object>(key, value);
      }
    }

  }

}

final class JsonReflectionFieldForm<V, B> implements JsonFieldForm<String, V, B> {

  final Field field;
  final JsonForm<V> valueForm;

  JsonReflectionFieldForm(Field field, JsonForm<V> valueForm) {
    this.field = field;
    this.valueForm = valueForm;
  }

  @Override
  public JsonForm<String> keyForm() {
    return JsonJava.keyForm();
  }

  @Override
  public JsonForm<V> valueForm() {
    return this.valueForm;
  }

  @Override
  public B updateField(B builder, String key, @Nullable V value) {
    try {
      this.field.set(builder, value);
    } catch (IllegalAccessException cause) {
      throw new UnsupportedOperationException(cause);
    }
    return builder;
  }

}
