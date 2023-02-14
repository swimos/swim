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

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.Collections;
import java.util.Iterator;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parse;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.collections.HashTrieMap;
import swim.collections.HashTrieSet;
import swim.expr.Term;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class WamlUnions implements WamlProvider, ToSource {

  final WamlCodec codec;
  final int priority;

  private WamlUnions(WamlCodec codec, int priority) {
    this.codec = codec;
    this.priority = priority;
  }

  @Override
  public int priority() {
    return this.priority;
  }

  @Override
  public @Nullable WamlForm<?> resolveWamlForm(Type javaType) {
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

    return WamlUnions.unionForm(this.codec, javaClass);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlUnions", "provider");
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

  public static WamlUnions provider(WamlCodec codec, int priority) {
    return new WamlUnions(codec, priority);
  }

  public static WamlUnions provider(WamlCodec codec) {
    return new WamlUnions(codec, GENERIC_PRIORITY);
  }

  public static <T> WamlForm<T> unionForm(WamlCodec codec, @Nullable Class<?> unionClass, Class<?>[] variantClasses) {
    HashTrieMap<String, WamlForm<? extends T>> tagForms = HashTrieMap.empty();
    HashTrieMap<Class<?>, WamlForm<? extends T>> classForms = HashTrieMap.empty();
    for (int i = 0; i < variantClasses.length; i += 1) {
      final Class<?> variantClass = variantClasses[i];
      final WamlTag tagAnnotation = variantClass.getAnnotation(WamlTag.class);
      String tag = tagAnnotation != null ? tagAnnotation.value() : null;
      if (tag == null || tag.length() == 0) {
        tag = variantClass.getSimpleName();
      }
      WamlForm<? extends T> classForm;
      if (unionClass == variantClass) {
        HashTrieSet<Class<?>> creating = CREATING.get();
        if (creating == null) {
          creating = HashTrieSet.empty();
        }
        CREATING.set(creating.added(unionClass));
        try {
          classForm = codec.forType(variantClass);
        } finally {
          CREATING.set(creating);
        }
      } else {
        classForm = codec.forType(variantClass);
      }
      if (classForm != null) {
        final WamlForm<? extends T> taggedForm = classForm.taggedForm(tag);
        if (taggedForm != null) {
          classForm = taggedForm;
        }
        tagForms = tagForms.updated(tag, classForm);
        classForms = classForms.updated(variantClass, classForm);
      }
    }
    return new WamlUnionForm<T>(codec, unionClass, tagForms, classForms);
  }

  public static <T> @Nullable WamlForm<T> unionForm(WamlCodec codec, Class<?> javaClass) {
    final WamlUnion unionAnnotation = javaClass.getAnnotation(WamlUnion.class);
    if (unionAnnotation != null) {
      // Prevent recursive creation.
      final HashTrieSet<Class<?>> creating = CREATING.get();
      if (creating == null || !creating.contains(javaClass)) {
        final Class<?>[] variantClasses = unionAnnotation.value();
        if (variantClasses != null && variantClasses.length != 0) {
          return WamlUnions.unionForm(codec, javaClass, variantClasses);
        }
      }
    }
    return null;
  }

  private static final ThreadLocal<HashTrieSet<Class<?>>> CREATING = new ThreadLocal<HashTrieSet<Class<?>>>();

}

class WamlUnionForm<T> implements WamlForm<T>, ToSource {

  final WamlCodec codec;
  @Nullable Class<?> unionClass;
  final HashTrieMap<String, WamlForm<? extends T>> tagForms;
  final HashTrieMap<Class<?>, WamlForm<? extends T>> classForms;

  WamlUnionForm(WamlCodec codec, @Nullable Class<?> unionClass,
                HashTrieMap<String, WamlForm<? extends T>> tagForms,
                HashTrieMap<Class<?>, WamlForm<? extends T>> classForms) {
    this.codec = codec;
    this.unionClass = unionClass;
    this.tagForms = tagForms;
    this.classForms = classForms;
  }

  @Override
  public @Nullable WamlAttrForm<?, ? extends T> getAttrForm(String name) {
    final WamlForm<? extends T> classForm = this.tagForms.get(name);
    if (classForm != null) {
      return classForm.getAttrForm(name);
    } else {
      return null;
    }
  }

  @Override
  public Parse<T> parse(Input input, WamlParser parser) {
    return parser.parseExpr(input, this);
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable T value, WamlWriter writer) {
    if (value != null) {
      Class<?> valueClass = value.getClass();
      do {
        final WamlForm<? extends T> classForm = this.classForms.get(valueClass);
        if (classForm != null) {
          return Assume.<WamlForm<T>>conforms(classForm).write(output, value, writer);
        } else {
          valueClass = valueClass.getSuperclass();
        }
      } while (valueClass != null);
      return Write.error(new WriteException("Unsupported value: " + value));
    } else {
      return writer.writeUnit(output, this, Collections.emptyIterator());
    }
  }

  @Override
  public Term intoTerm(@Nullable T value) {
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
    notation.beginInvoke("WamlUnions", "polymorphicForm")
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
