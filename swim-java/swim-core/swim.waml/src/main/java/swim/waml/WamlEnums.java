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

import java.lang.annotation.Annotation;
import java.lang.invoke.MethodHandles;
import java.lang.invoke.VarHandle;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.collections.HashTrieMap;
import swim.decl.Initializer;
import swim.decl.TypeName;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.ToSource;
import swim.waml.decl.WamlInitializer;
import swim.waml.decl.WamlTypeName;

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
  public @Nullable WamlFormat<?> resolveWamlFormat(Type type) throws WamlProviderException {
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

    if (Enum.class.isAssignableFrom(classType)) {
      return WamlEnums.enumFormat(Assume.conforms(classType));
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

  static final WamlEnums PROVIDER = new WamlEnums(GENERIC_PRIORITY);

  public static WamlEnums provider(int priority) {
    if (priority == GENERIC_PRIORITY) {
      return PROVIDER;
    }
    return new WamlEnums(priority);
  }

  public static WamlEnums provider() {
    return PROVIDER;
  }

  public static <T extends Enum<T>> WamlFormat<T> enumFormat(Class<T> enumClass) throws WamlProviderException {
    final HashTrieMap<Class<?>, Annotation> classAnnotationMap = Waml.resolveAnnotations(enumClass);
    String typeName = null;
    HashTrieMap<String, T> constants = HashTrieMap.empty();
    HashTrieMap<T, String> identifiers = HashTrieMap.empty();
    T initializer = null;

    Annotation typeNameAnnotation;
    if ((typeNameAnnotation = classAnnotationMap.get(WamlTypeName.class)) != null) {
      typeName = ((WamlTypeName) typeNameAnnotation).value();
    } else if ((typeNameAnnotation = classAnnotationMap.get(TypeName.class)) != null) {
      typeName = ((TypeName) typeNameAnnotation).value();
    }
    if (typeName == null) {
      typeName = "enum";
    } else if (typeName.length() == 0) {
      typeName = null;
    }

    final T[] enumConstants = enumClass.getEnumConstants();
    for (int i = 0; i < enumConstants.length; i += 1) {
      final T constant = enumConstants[i];
      String identifier = constant.name();

      final Field field;
      try {
        field = enumClass.getDeclaredField(identifier);
      } catch (NoSuchFieldException cause) {
        throw new WamlProviderException("missing enum constant field: " + identifier, cause);
      }

      final HashTrieMap<Class<?>, Annotation> fieldAnnotationMap = Waml.resolveAnnotations(field);
      Annotation fieldNameAnnotation;
      if ((fieldNameAnnotation = fieldAnnotationMap.get(WamlTypeName.class)) != null) {
        identifier = ((WamlTypeName) fieldNameAnnotation).value();
      } else if ((fieldNameAnnotation = fieldAnnotationMap.get(TypeName.class)) != null) {
        identifier = ((TypeName) fieldNameAnnotation).value();
      }

      constants = constants.updated(identifier, constant);
      identifiers = identifiers.updated(constant, identifier);
    }

    final Field[] fields = enumClass.getDeclaredFields();
    for (int i = 0; i < fields.length; i += 1) {
      final Field field = fields[i];
      if ((field.getModifiers() & Modifier.STATIC) == 0) {
        continue;
      }
      final HashTrieMap<Class<?>, Annotation> fieldAnnotationMap = Waml.resolveAnnotations(field);

      Annotation initializerAnnotation;
      if ((initializerAnnotation = fieldAnnotationMap.get(WamlInitializer.class)) != null
          || (initializerAnnotation = fieldAnnotationMap.get(Initializer.class)) != null) {
        MethodHandles.Lookup lookup = MethodHandles.lookup();
        try {
          lookup = MethodHandles.privateLookupIn(field.getDeclaringClass(), lookup);
        } catch (IllegalAccessException | SecurityException cause) {
          // Proceed with the original lookup object.
        }
        final VarHandle fieldHandle;
        try {
          fieldHandle = lookup.unreflectVarHandle(field);
        } catch (IllegalAccessException cause) {
          throw new WamlProviderException("inaccessible initializer field " + field, cause);
        }
        initializer = (T) fieldHandle.get();
      }
    }

    return new WamlEnumFormat<T>(enumClass, typeName, constants, identifiers, initializer);
  }

}

final class WamlEnumFormat<T extends Enum<T>> implements WamlFormat<T>, WamlStringParser<StringBuilder, T>, WamlStringWriter<T>, ToSource {

  final Class<T> enumClass;
  final @Nullable String typeName;
  final HashTrieMap<String, T> constants;
  final HashTrieMap<T, String> identifiers;
  final @Nullable T initializer;

  WamlEnumFormat(Class<T> enumClass, @Nullable String typeName, HashTrieMap<String, T> constants,
                 HashTrieMap<T, String> identifiers, @Nullable T initializer) {
    this.enumClass = enumClass;
    this.typeName = typeName;
    this.constants = constants;
    this.identifiers = identifiers;
    this.initializer = initializer;
  }

  @Override
  public @Nullable String typeName() {
    return this.typeName;
  }

  @Override
  public StringBuilder stringBuilder(@Nullable Object attrs) {
    return new StringBuilder();
  }

  @Override
  public StringBuilder appendCodePoint(StringBuilder builder, int c) {
    return builder.appendCodePoint(c);
  }

  @Override
  public @Nullable T buildString(@Nullable Object attrs, StringBuilder builder) {
    return this.constants.get(builder.toString());
  }

  @Override
  public @Nullable String intoString(@Nullable T value) {
    return this.identifiers.get(value);
  }

  @Override
  public @Nullable T initializer(@Nullable Object attrs) {
    return this.initializer;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlEnums", "enumFormat")
            .appendArgument(this.enumClass)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
