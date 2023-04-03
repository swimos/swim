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

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.Iterator;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Output;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.collections.HashTrieMap;
import swim.collections.HashTrieSet;
import swim.expr.Term;
import swim.expr.TermException;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class JsonUnions implements JsonProvider, ToSource {

  final JsonCodec codec;
  final int priority;

  private JsonUnions(JsonCodec codec, int priority) {
    this.codec = codec;
    this.priority = priority;
  }

  @Override
  public int priority() {
    return this.priority;
  }

  @Override
  public @Nullable JsonForm<?> resolveJsonForm(Type javaType) throws JsonFormException {
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

    return JsonUnions.unionForm(this.codec, javaClass);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonUnions", "provider");
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

  public static JsonUnions provider(JsonCodec codec, int priority) {
    return new JsonUnions(codec, priority);
  }

  public static JsonUnions provider(JsonCodec codec) {
    return new JsonUnions(codec, GENERIC_PRIORITY);
  }

  public static <T> JsonForm<T> unionForm(JsonCodec codec, @Nullable Class<?> unionClass, Class<?>... variantClasses) throws JsonFormException {
    HashTrieMap<String, JsonForm<? extends T>> tagForms = HashTrieMap.empty();
    HashTrieMap<Class<?>, JsonForm<? extends T>> classForms = HashTrieMap.empty();
    for (int i = 0; i < variantClasses.length; i += 1) {
      final Class<?> variantClass = variantClasses[i];
      final JsonTag tagAnnotation = variantClass.getAnnotation(JsonTag.class);
      String tag = tagAnnotation != null ? tagAnnotation.value() : null;
      if (tag == null || tag.length() == 0) {
        tag = variantClass.getSimpleName();
      }
      JsonForm<? extends T> classForm;
      if (unionClass == variantClass) {
        HashTrieSet<Class<?>> creating = CREATING.get();
        if (creating == null) {
          creating = HashTrieSet.empty();
        }
        CREATING.set(creating.added(unionClass));
        try {
          classForm = codec.getJsonForm(variantClass);
        } finally {
          CREATING.set(creating);
        }
      } else {
        classForm = codec.getJsonForm(variantClass);
      }
      if (classForm != null) {
        try {
          classForm = classForm.taggedForm(tag);
        } catch (JsonException cause) {
          // Permit unions with untagged types.
        }
        tagForms = tagForms.updated(tag, classForm);
        classForms = classForms.updated(variantClass, classForm);
      }
    }
    return new JsonUnionForm<T>(codec, unionClass, tagForms, classForms);
  }

  public static <T> @Nullable JsonForm<T> unionForm(JsonCodec codec, Class<?> javaClass) throws JsonFormException {
    final JsonUnion unionAnnotation = javaClass.getAnnotation(JsonUnion.class);
    if (unionAnnotation != null) {
      // Prevent recursive creation.
      final HashTrieSet<Class<?>> creating = CREATING.get();
      if (creating == null || !creating.contains(javaClass)) {
        final Class<?>[] variantClasses = unionAnnotation.value();
        if (variantClasses != null && variantClasses.length != 0) {
          return JsonUnions.unionForm(codec, javaClass, variantClasses);
        }
      }
    }
    return null;
  }

  private static final ThreadLocal<HashTrieSet<Class<?>>> CREATING = new ThreadLocal<HashTrieSet<Class<?>>>();

}

class JsonUnionForm<T> implements JsonFieldForm<String, Object, Object>, JsonObjectForm<String, Object, Object, T>, ToSource {

  final JsonCodec codec;
  @Nullable Class<?> unionClass;
  final HashTrieMap<String, JsonForm<? extends T>> tagForms;
  final HashTrieMap<Class<?>, JsonForm<? extends T>> classForms;

  JsonUnionForm(JsonCodec codec, @Nullable Class<?> unionClass,
                HashTrieMap<String, JsonForm<? extends T>> tagForms,
                HashTrieMap<Class<?>, JsonForm<? extends T>> classForms) {
    this.codec = codec;
    this.tagForms = tagForms;
    this.classForms = classForms;
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
  public Object updateField(Object builder, String key, @Nullable Object value) {
    return builder; // ignore
  }

  @Override
  public <T2> @Nullable JsonObjectForm<String, Object, Object, T2> refineForm(JsonObjectForm<String, Object, Object, T2> form, String key, @Nullable Object value) {
    if ("type".equals(key)) {
      final JsonForm<T2> classForm = Assume.conformsNullable(this.tagForms.get(value));
      if (classForm != null) {
        return Assume.conforms(classForm);
      }
    }
    return null;
  }

  @Override
  public JsonFieldForm<String, Object, Object> getFieldForm(String key) throws JsonException {
    if ("type".equals(key)) {
      return this;
    } else {
      return JsonObjectForm.super.getFieldForm(key);
    }
  }

  @SuppressWarnings("NullAway")
  @Override
  public Object objectBuilder() {
    return null;
  }

  @Override
  public @Nullable T buildObject(Object builder) {
    return Assume.conforms(builder);
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable T value, JsonWriter writer) {
    if (value != null) {
      Class<?> valueClass = value.getClass();
      do {
        final JsonForm<? extends T> classForm = this.classForms.get(valueClass);
        if (classForm != null) {
          return Assume.<JsonForm<T>>conforms(classForm).write(output, value, writer);
        } else {
          valueClass = valueClass.getSuperclass();
        }
      } while (valueClass != null);
      return Write.error(new WriteException("unsupported value: " + value));
    } else {
      return writer.writeNull(output);
    }
  }

  @Override
  public Term intoTerm(@Nullable T value) throws TermException {
    return Term.from(value);
  }

  @Override
  public @Nullable T fromTerm(Term term) {
    if (term.isValidObject()) {
      final Object object = term.objectValue();
      Class<?> objectClass = object != null ? object.getClass() : null;
      while (objectClass != null) {
        if (this.classForms.containsKey(objectClass)) {
          return Assume.conforms(object);
        }
        objectClass = objectClass.getSuperclass();
      }
    }
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonUnions", "unionForm")
            .appendArgument(this.codec);
    if (this.unionClass != null) {
      notation.appendArgument(this.unionClass);
    } else {
      notation.appendArgument(null);
    }
    final Iterator<Class<?>> variantClasses = this.classForms.keyIterator();
    while (variantClasses.hasNext()) {
      notation.appendArgument(variantClasses.next());
    }
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
