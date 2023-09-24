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

package swim.term;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.Iterator;
import java.util.Objects;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.collections.UniformMap;
import swim.util.Assume;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class ReflectionTerms implements TermProvider, WriteSource {

  final TermRegistry registry;
  final int priority;

  private ReflectionTerms(TermRegistry registry, int priority) {
    this.registry = registry;
    this.priority = priority;
  }

  @Override
  public int priority() {
    return this.priority;
  }

  @Override
  public @Nullable TermForm<?> resolveTermForm(Type type) throws TermProviderException {
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

    return ReflectionTerms.reflectionForm(this.registry, classType);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("ReflectionTerms", "provider")
            .appendArgument(this.registry);
    if (this.priority != GENERIC_PRIORITY) {
      notation.appendArgument(this.priority);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  public static ReflectionTerms provider(TermRegistry registry, int priority) {
    return new ReflectionTerms(registry, priority);
  }

  public static ReflectionTerms provider(TermRegistry registry) {
    return new ReflectionTerms(registry, GENERIC_PRIORITY);
  }

  public static <T> TermForm<T> reflectionForm(TermRegistry registry, Class<?> classType) throws TermProviderException {
    final UniformMap<String, ReflectionTermMember> members = new UniformMap<String, ReflectionTermMember>();
    ReflectionTerms.reflectFields(registry, classType, members);
    return new ReflectionTermForm<T>(classType, members);
  }

  static void reflectFields(TermRegistry registry, @Nullable Class<?> classType, UniformMap<String, ReflectionTermMember> members) throws TermProviderException {
    if (classType == null) {
      return;
    }
    ReflectionTerms.reflectFields(registry, classType.getSuperclass(), members);
    final Field[] fields = classType.getDeclaredFields();
    for (int i = 0; i < fields.length; i += 1) {
      ReflectionTerms.reflectField(registry, fields[i], members);
    }
  }

  static void reflectField(TermRegistry registry, Field field, UniformMap<String, ReflectionTermMember> members) throws TermProviderException {
    final int modifiers = field.getModifiers();
    if ((modifiers & (Modifier.STATIC | Modifier.TRANSIENT)) != 0) {
      return;
    }
    if ((modifiers & (Modifier.FINAL | Modifier.PRIVATE | Modifier.PROTECTED)) != 0 || modifiers == 0) {
      field.setAccessible(true);
    }

    final TermForm<Object> termForm;
    try {
      termForm = registry.getTermForm(field.getGenericType());
    } catch (TermProviderException cause) {
      throw new TermProviderException("unsupported type " + field.getGenericType()
                                    + " for field " + field.getName()
                                    + " of class " + field.getDeclaringClass().getName(), cause);
    }

    final TermProperty propertyAnnotation = field.getAnnotation(TermProperty.class);
    String propertyName = propertyAnnotation != null ? propertyAnnotation.value() : null;
    if (propertyName == null || propertyName.length() == 0) {
      propertyName = field.getName();
    }
    members.put(propertyName, new ReflectionTermMember(termForm, field));
  }

}

final class ReflectionTermForm<T> implements TermForm<T>, WriteSource {

  final Class<?> classType;
  final UniformMap<String, ReflectionTermMember> members;

  ReflectionTermForm(Class<?> classType, UniformMap<String, ReflectionTermMember> members) {
    this.classType = classType;
    this.members = members;
  }

  @Override
  public Term intoTerm(@Nullable T value) {
    return new ReflectionTerm<T>(this, value);
  }

  @Override
  public @Nullable T fromTerm(Term term) {
    if (term.isValidObject()) {
      final Object object = term.objectValue();
      if (this.classType.isInstance(object)) {
        return Assume.conforms(object);
      }
    }
    return null;
  }

  @Override
  public @Nullable T initializer() {
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("ReflectionTerms", "reflectionForm")
            .appendArgument(this.classType)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

}

final class ReflectionTermMember {

  final TermForm<Object> form;
  final Field field;

  ReflectionTermMember(TermForm<Object> form, Field field) {
    this.form = form;
    this.field = field;
  }

}

final class ReflectionTerm<T> implements Term, WriteSource {

  final ReflectionTermForm<T> form;
  final @Nullable T object;

  ReflectionTerm(ReflectionTermForm<T> form, @Nullable T object) {
    this.form = form;
    this.object = object;
  }

  @Override
  public @Nullable Term getChild(Evaluator evaluator, Term keyExpr) {
    if (this.object != null) {
      final Term keyTerm = keyExpr.evaluate(evaluator);
      final String key = keyTerm.isValidString() ? keyTerm.stringValue() : null;
      if (key != null) {
        try {
          final ReflectionTermMember member = this.form.members.get(key);
          if (member != null) {
            final Object value = member.field.get(this.object);
            return member.form.intoTerm(value);
          }
        } catch (ReflectiveOperationException | TermException cause) {
          // ignore
        }
      }
    }
    return Term.super.getChild(evaluator, keyExpr);
  }

  @Override
  public TermGenerator getChildren() {
    if (this.object != null) {
      return new ReflectionTerm.ChildGenerator(this.object, this.form.members.valueIterator());
    }
    return Term.super.getChildren();
  }

  @Override
  public Term eq(Term that) {
    if (that.isValidObject()) {
      return Term.of(Objects.equals(this.object, that.objectValue()));
    } else {
      return Term.super.eq(that);
    }
  }

  @Override
  public Term ne(Term that) {
    if (that.isValidObject()) {
      return Term.of(!Objects.equals(this.object, that.objectValue()));
    } else {
      return Term.super.ne(that);
    }
  }

  @Override
  public boolean isValidObject() {
    return this.object != null;
  }

  @Override
  public Object objectValue() {
    if (this.object != null) {
      return this.object;
    } else {
      throw new UnsupportedOperationException();
    }
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof ReflectionTerm<?> that) {
      return this.form.equals(that.form)
          && Objects.equals(this.object, that.object);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(ReflectionTerm.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HASH_SEED,
        this.form.hashCode()), Objects.hashCode(this.object)));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.appendSource(this.form);
    notation.beginInvoke("intoTerm")
            .appendArgument(this.object)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final class ChildGenerator implements TermGenerator {

    final Object object;
    final Iterator<ReflectionTermMember> members;

    ChildGenerator(Object object, Iterator<ReflectionTermMember> members) {
      this.object = object;
      this.members = members;
    }

    @Override
    public @Nullable Term evaluateNext(Evaluator evaluator) {
      do {
        if (!this.members.hasNext()) {
          return null;
        }
        final ReflectionTermMember member = this.members.next();
        try {
          final Object value = member.field.get(this.object);
          return member.form.intoTerm(value);
        } catch (ReflectiveOperationException | TermException cause) {
          continue;
        }
      } while (true);
    }

  }

}
