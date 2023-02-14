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

import java.lang.reflect.Field;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.Collections;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Output;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.collections.HashTrieMap;
import swim.expr.Term;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class WamlEnums implements WamlProvider, ToSource {

  final int priority;

  private WamlEnums(int priority) {
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
    if (Enum.class.isAssignableFrom(javaClass)) {
      return WamlEnums.enumForm(Assume.conforms(javaClass));
    }
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlEnums", "provider");
    if (this.priority != GENERIC_PRIORITY) {
      notation.appendArgument(this.priority);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  private static final WamlEnums PROVIDER = new WamlEnums(GENERIC_PRIORITY);

  public static WamlEnums provider(int priority) {
    if (priority == GENERIC_PRIORITY) {
      return PROVIDER;
    } else {
      return new WamlEnums(priority);
    }
  }

  public static WamlEnums provider() {
    return PROVIDER;
  }

  public static <E extends Enum<E>> WamlStringForm<?, E> enumForm(Class<E> enumClass) {
    HashTrieMap<String, E> constants = HashTrieMap.empty();
    HashTrieMap<E, String> identifiers = HashTrieMap.empty();
    final E[] enumConstants = enumClass.getEnumConstants();
    for (int i = 0; i < enumConstants.length; i += 1) {
      final E constant = enumConstants[i];
      String identifier = constant.name();
      try {
        final Field field = enumClass.getDeclaredField(identifier);
        final WamlKey keyAnnotation = field.getAnnotation(WamlKey.class);
        if (keyAnnotation != null) {
          final String key = keyAnnotation.value();
          if (key != null && key.length() != 0) {
            identifier = keyAnnotation.value();
          }
        }
      } catch (NoSuchFieldException cause) {
        // ignore
      }
      constants = constants.updated(identifier, constant);
      identifiers = identifiers.updated(constant, identifier);
    }
    return new WamlEnumForm<E>(enumClass, constants, identifiers);
  }

}

final class WamlEnumForm<E extends Enum<E>> implements WamlStringForm<StringBuilder, E>, ToSource {

  final Class<E> enumClass;
  final HashTrieMap<String, E> constants;
  final HashTrieMap<E, String> identifiers;

  WamlEnumForm(Class<E> enumClass, HashTrieMap<String, E> constants,
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
  public Write<?> write(Output<?> output, @Nullable E value, WamlWriter writer) {
    if (value != null) {
      final String identifier = this.identifiers.get(value);
      if (identifier != null) {
        return writer.writeString(output, this, identifier, Collections.emptyIterator());
      } else {
        return Write.error(new WriteException("Unsupported value: " + value));
      }
    } else {
      return writer.writeUnit(output, this, Collections.emptyIterator());
    }
  }

  @Override
  public Term intoTerm(@Nullable E value) {
    return Term.from(value);
  }

  @Override
  public @Nullable E fromTerm(Term term) {
    return term.objectValue(this.enumClass);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlEnums", "enumForm")
            .appendArgument(this.enumClass)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
