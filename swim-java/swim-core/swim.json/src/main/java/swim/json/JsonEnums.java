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

import java.lang.reflect.Field;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Output;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.collections.HashTrieMap;
import swim.expr.Term;
import swim.expr.TermException;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class JsonEnums implements JsonProvider, ToSource {

  final int priority;

  private JsonEnums(int priority) {
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

    if (Enum.class.isAssignableFrom(javaClass)) {
      return JsonEnums.enumForm(Assume.conforms(javaClass));
    }

    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonEnums", "provider");
    if (this.priority != GENERIC_PRIORITY) {
      notation.appendArgument(this.priority);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  private static final JsonEnums PROVIDER = new JsonEnums(GENERIC_PRIORITY);

  public static JsonEnums provider(int priority) {
    if (priority == GENERIC_PRIORITY) {
      return PROVIDER;
    } else {
      return new JsonEnums(priority);
    }
  }

  public static JsonEnums provider() {
    return PROVIDER;
  }

  public static <E extends Enum<E>> JsonStringForm<?, E> enumForm(Class<E> enumClass) throws JsonFormException {
    HashTrieMap<String, E> constants = HashTrieMap.empty();
    HashTrieMap<E, String> identifiers = HashTrieMap.empty();
    final E[] enumConstants = enumClass.getEnumConstants();
    for (int i = 0; i < enumConstants.length; i += 1) {
      final E constant = enumConstants[i];
      String identifier = constant.name();
      try {
        final Field field = enumClass.getDeclaredField(identifier);
        final JsonTag tagAnnotation = field.getAnnotation(JsonTag.class);
        if (tagAnnotation != null) {
          final String tag = tagAnnotation.value();
          if (tag != null && tag.length() != 0) {
            identifier = tag;
          }
        }
      } catch (NoSuchFieldException cause) {
        throw new JsonFormException("missing enum constant field: " + identifier, cause);
      }
      constants = constants.updated(identifier, constant);
      identifiers = identifiers.updated(constant, identifier);
    }
    return new JsonEnumForm<E>(enumClass, constants, identifiers);
  }

}

final class JsonEnumForm<E extends Enum<E>> implements JsonStringForm<StringBuilder, E>, ToSource {

  final Class<E> enumClass;
  final HashTrieMap<String, E> constants;
  final HashTrieMap<E, String> identifiers;

  JsonEnumForm(Class<E> enumClass, HashTrieMap<String, E> constants,
               HashTrieMap<E, String> identifiers) {
    this.enumClass = enumClass;
    this.constants = constants;
    this.identifiers = identifiers;
  }

  @Override
  public StringBuilder stringBuilder() {
    return new StringBuilder();
  }

  @Override
  public StringBuilder appendCodePoint(StringBuilder builder, int c) {
    return builder.appendCodePoint(c);
  }

  @Override
  public @Nullable E buildString(StringBuilder builder) {
    return this.constants.get(builder.toString());
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable E value, JsonWriter writer) {
    if (value != null) {
      final String identifier = this.identifiers.get(value);
      if (identifier != null) {
        return writer.writeString(output, identifier);
      } else {
        return Write.error(new WriteException("unsupported value: " + value));
      }
    } else {
      return writer.writeNull(output);
    }
  }

  @Override
  public Term intoTerm(@Nullable E value) throws TermException {
    return Term.from(value);
  }

  @Override
  public @Nullable E fromTerm(Term term) {
    return term.objectValue(this.enumClass);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonEnums", "enumForm")
            .appendArgument(this.enumClass)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
