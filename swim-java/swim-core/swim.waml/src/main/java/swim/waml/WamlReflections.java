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
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.AbstractMap.SimpleImmutableEntry;
import java.util.Collections;
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
import swim.expr.TermException;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class WamlReflections implements WamlProvider, ToSource {

  final WamlCodec codec;
  final int priority;

  private WamlReflections(WamlCodec codec, int priority) {
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

    return WamlReflections.reflectionForm(this.codec, javaClass);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlReflections", "provider");
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

  public static WamlReflections provider(WamlCodec codec, int priority) {
    return new WamlReflections(codec, priority);
  }

  public static WamlReflections provider(WamlCodec codec) {
    return new WamlReflections(codec, GENERIC_PRIORITY);
  }

  public static <T> @Nullable WamlObjectForm<String, Object, T, T> reflectionForm(WamlCodec codec, Class<?> javaClass) throws WamlFormException {
    final Constructor<T> constructor;
    try {
      constructor = Assume.conforms(javaClass.getDeclaredConstructor());
    } catch (NoSuchMethodException cause) {
      throw new WamlFormException("missing default constructor", cause);
    }
    constructor.setAccessible(true);
    final LinkedHashMap<String, WamlReflectionFieldForm<Object, T>> fieldForms = new LinkedHashMap<String, WamlReflectionFieldForm<Object, T>>();
    WamlReflections.reflectFields(codec, javaClass, fieldForms);
    return new WamlReflectionForm<T>(codec, constructor, fieldForms, null);
  }

  static <T> void reflectFields(WamlCodec codec, @Nullable Class<?> javaClass, Map<String, WamlReflectionFieldForm<Object, T>> fieldForms) throws WamlFormException {
    if (javaClass != null) {
      WamlReflections.reflectFields(codec, javaClass.getSuperclass(), fieldForms);
      final Field[] fields = javaClass.getDeclaredFields();
      for (int i = 0; i < fields.length; i += 1) {
        WamlReflections.reflectField(codec, fields[i], fieldForms);
      }
    }
  }

  static <T> void reflectField(WamlCodec codec, Field field, Map<String, WamlReflectionFieldForm<Object, T>> fieldForms) throws WamlFormException {
    final int modifiers = field.getModifiers();
    if ((modifiers & (Modifier.STATIC | Modifier.TRANSIENT)) == 0) {
      if ((modifiers & (Modifier.FINAL | Modifier.PRIVATE | Modifier.PROTECTED)) != 0 || modifiers == 0) {
        field.setAccessible(true);
      }
      final WamlForm<Object> valueForm = codec.getWamlForm(field.getGenericType());
      if (valueForm != null) {
        final WamlProperty propertyAnnotation = field.getAnnotation(WamlProperty.class);
        String propertyName = propertyAnnotation != null ? propertyAnnotation.value() : null;
        if (propertyName == null || propertyName.length() == 0) {
          propertyName = field.getName();
        }
        fieldForms.put(propertyName, new WamlReflectionFieldForm<Object, T>(field, valueForm));
      }
    }
  }

}

final class WamlReflectionForm<T> implements WamlAttrForm<Object, T>, WamlObjectForm<String, Object, T, T>, ToSource {

  final WamlCodec codec;
  final Constructor<T> constructor;
  final Map<String, WamlReflectionFieldForm<Object, T>> fieldForms;
  final @Nullable String tag;

  WamlReflectionForm(WamlCodec codec, Constructor<T> constructor,
                     Map<String, WamlReflectionFieldForm<Object, T>> fieldForms,
                     @Nullable String tag) {
    this.codec = codec;
    this.constructor = constructor;
    this.fieldForms = fieldForms;
    this.tag = tag;
  }

  @Override
  public WamlForm<Object> argsForm() {
    return this.codec.tupleForm();
  }

  @Override
  public boolean isNullary(@Nullable Object args) {
    return args == null;
  }

  @Override
  public WamlForm<T> refineForm(WamlForm<T> form, String name, @Nullable Object args) {
    return this;
  }

  @Override
  public WamlForm<T> refineForm(WamlForm<T> form, String name) {
    return this;
  }

  @Override
  public WamlForm<T> taggedForm(String tag) {
    if (Objects.equals(this.tag, tag)) {
      return this;
    } else {
      return new WamlReflectionForm<T>(this.codec, this.constructor,
                                       this.fieldForms, tag);
    }
  }

  @Override
  public WamlAttrForm<?, ? extends T> getAttrForm(String name) throws WamlException {
    if (this.tag != null && this.tag.equals(name)) {
      return this;
    } else {
      return WamlObjectForm.super.getAttrForm(name);
    }
  }

  @Override
  public WamlForm<String> keyForm() {
    return WamlJava.keyForm();
  }

  @Override
  public WamlFieldForm<String, Object, T> getFieldForm(String key) throws WamlException {
    final WamlFieldForm<String, Object, T> fieldForm = this.fieldForms.get(key);
    if (fieldForm != null) {
      return fieldForm;
    } else {
      return WamlObjectForm.super.getFieldForm(key);
    }
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
  public T buildObject(T builder) {
    return builder;
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable T value, WamlWriter writer) {
    if (value != null) {
      final Iterator<Map.Entry<String, Object>> parts = new WamlReflectionForm.FieldIterator<T>(value, this.fieldForms.entrySet().iterator());
      final Iterator<Map.Entry<String, Object>> attrs;
      if (this.tag != null) {
        attrs = Collections.singleton((Map.Entry<String, Object>) new SimpleImmutableEntry<String, Object>(this.tag, null)).iterator();
      } else {
        attrs = Collections.emptyIterator();
      }
      return writer.writeObject(output, this, parts, attrs);
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
    notation.beginInvoke("WamlReflections", "reflectionForm")
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
    final Iterator<Map.Entry<String, WamlReflectionFieldForm<Object, T>>> iterator;

    FieldIterator(T object, Iterator<Map.Entry<String, WamlReflectionFieldForm<Object, T>>> iterator) {
      this.object = object;
      this.iterator = iterator;
    }

    @Override
    public boolean hasNext() {
      return this.iterator.hasNext();
    }

    @Override
    public Map.Entry<String, Object> next() {
      final Map.Entry<String, WamlReflectionFieldForm<Object, T>> fieldEntry = this.iterator.next();
      final String key = fieldEntry.getKey();
      final WamlReflectionFieldForm<Object, T> fieldForm = fieldEntry.getValue();
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

final class WamlReflectionFieldForm<V, B> implements WamlFieldForm<String, V, B> {

  final Field field;
  final WamlForm<V> valueForm;

  WamlReflectionFieldForm(Field field, WamlForm<V> valueForm) {
    this.field = field;
    this.valueForm = valueForm;
  }

  @Override
  public WamlForm<String> keyForm() {
    return WamlJava.keyForm();
  }

  @Override
  public WamlForm<V> valueForm() {
    return this.valueForm;
  }

  @Override
  public B updateField(B builder, String key, @Nullable V value) throws WamlException {
    try {
      this.field.set(builder, value);
    } catch (IllegalAccessException cause) {
      throw new WamlException(Notation.of("unable to set field ")
                                      .append(this.field.getName())
                                      .append(" of class ")
                                      .append(this.field.getDeclaringClass().getName())
                                      .append(" to value ")
                                      .appendSource(value)
                                      .toString(), cause);
    }
    return builder;
  }

}
