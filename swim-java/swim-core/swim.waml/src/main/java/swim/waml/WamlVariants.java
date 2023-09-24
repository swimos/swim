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

package swim.waml;

import java.lang.annotation.Annotation;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.Iterator;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parse;
import swim.codec.Write;
import swim.collections.HashTrieMap;
import swim.collections.HashTrieSet;
import swim.decl.FilterMode;
import swim.decl.SubType;
import swim.decl.SubTypes;
import swim.decl.TypeInfo;
import swim.decl.TypeName;
import swim.repr.Attrs;
import swim.repr.Repr;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.WriteSource;
import swim.waml.decl.WamlSubType;
import swim.waml.decl.WamlSubTypes;
import swim.waml.decl.WamlTypeInfo;
import swim.waml.decl.WamlTypeName;

@Public
@Since("5.0")
public final class WamlVariants implements WamlProvider, WriteSource {

  final WamlMetaCodec metaCodec;
  final int priority;

  private WamlVariants(WamlMetaCodec metaCodec, int priority) {
    this.metaCodec = metaCodec;
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

    return WamlVariants.variantFormat(this.metaCodec, classType);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlVariants", "provider")
            .appendArgument(this.metaCodec);
    if (this.priority != GENERIC_PRIORITY) {
      notation.appendArgument(this.priority);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  public static WamlVariants provider(WamlMetaCodec metaCodec, int priority) {
    return new WamlVariants(metaCodec, priority);
  }

  public static WamlVariants provider(WamlMetaCodec metaCodec) {
    return new WamlVariants(metaCodec, GENERIC_PRIORITY);
  }

  @SuppressWarnings("unchecked")
  public static <T> WamlFormat<T> variantFormat(WamlVariant<? extends T>... variants) throws WamlProviderException {
    HashTrieMap<String, WamlVariant<? extends T>> namedVariants = HashTrieMap.empty();
    HashTrieMap<Class<?>, WamlVariant<? extends T>> classVariants = HashTrieMap.empty();
    for (int i = 0; i < variants.length; i += 1) {
      final WamlVariant<? extends T> variant = variants[i];
      if (variant.typeName != null) {
        namedVariants = namedVariants.updated(variant.typeName, variant);
      }
      classVariants = classVariants.updated(variant.classType, variant);
    }
    return new WamlVariantFormat<T>(namedVariants, classVariants);
  }

  public static <T> @Nullable WamlFormat<T> variantFormat(WamlMetaCodec metaCodec, Class<?> classType) throws WamlProviderException {
    final HashTrieSet<Class<?>> resolving = RESOLVING.get();
    if (resolving != null && resolving.contains(classType)) {
      // Defer re-entrant resolution of the base class to lower priority providers.
      return null;
    }

    final HashTrieMap<Class<?>, Annotation> annotationMap = Waml.resolveAnnotations(classType);
    Annotation typeInfoAnnotation;
    String typeKey;
    if ((typeInfoAnnotation = annotationMap.get(WamlTypeInfo.class)) != null) {
      typeKey = ((WamlTypeInfo) typeInfoAnnotation).key();
    } else if ((typeInfoAnnotation = annotationMap.get(TypeInfo.class)) != null) {
      typeKey = "";
    } else {
      return null;
    }
    if (typeKey.length() == 0) {
      typeKey = null;
    }

    Annotation subTypesAnnotation;
    final WamlVariant<? extends T>[] variants;
    if ((subTypesAnnotation = annotationMap.get(WamlSubTypes.class)) != null) {
      final WamlSubType[] subTypes = ((WamlSubTypes) subTypesAnnotation).value();
      variants = Assume.conforms(new WamlVariant<?>[subTypes.length]);
      for (int i = 0; i < subTypes.length; i += 1) {
        final WamlSubType subType = subTypes[i];
        variants[i] = WamlVariants.resolveVariant(metaCodec, subType.name(), subType.value(), classType);
      }
    } else if ((subTypesAnnotation = annotationMap.get(SubTypes.class)) != null) {
      final SubType[] subTypes = ((SubTypes) subTypesAnnotation).value();
      variants = Assume.conforms(new WamlVariant<?>[subTypes.length]);
      for (int i = 0; i < subTypes.length; i += 1) {
        final SubType subType = subTypes[i];
        variants[i] = WamlVariants.resolveVariant(metaCodec, subType.name(), subType.value(), classType);
      }
    } else {
      variants = Assume.conforms(new WamlVariant<?>[0]);
    }

    return WamlVariants.variantFormat(variants);
  }

  static <T> WamlVariant<T> resolveVariant(WamlMetaCodec metaCodec, String typeName,
                                           Class<?> classType, Class<?> baseClass) throws WamlProviderException {
    final HashTrieMap<Class<?>, Annotation> annotationMap = Waml.resolveAnnotations(classType);
    if (typeName.length() == 0) {
      Annotation typeNameAnnotation;
      if ((typeNameAnnotation = annotationMap.get(WamlTypeName.class)) != null) {
        typeName = ((WamlTypeName) typeNameAnnotation).value();
      } else if ((typeNameAnnotation = annotationMap.get(TypeName.class)) != null) {
        typeName = ((TypeName) typeNameAnnotation).value();
      }
    }
    if (typeName.length() == 0) {
      typeName = classType.getSimpleName();
    }

    final WamlFormat<T> classFormat;
    if (classType == baseClass) {
      // Resolve the base class format using the next highest priority provider.
      HashTrieSet<Class<?>> resolving = RESOLVING.get();
      if (resolving == null) {
        resolving = HashTrieSet.empty();
      }
      // Add the base class to the resolving set to prevent infinite recursion.
      RESOLVING.set(resolving.added(baseClass));
      try {
        // Resolve the concrete base class format.
        classFormat = metaCodec.getWamlFormat(baseClass);
      } finally {
        RESOLVING.set(resolving);
      }
    } else {
      // Resolve the subclass format.
      classFormat = metaCodec.getWamlFormat(classType);
    }

    return WamlVariant.of(typeName, classType, classFormat, classFormat);
  }

  static final ThreadLocal<HashTrieSet<Class<?>>> RESOLVING = new ThreadLocal<HashTrieSet<Class<?>>>();

}

final class WamlVariantFormat<T> implements WamlFormat<T>, WriteSource {

  final HashTrieMap<String, WamlVariant<? extends T>> namedVariants;
  final HashTrieMap<Class<?>, WamlVariant<? extends T>> classVariants;

  WamlVariantFormat(HashTrieMap<String, WamlVariant<? extends T>> namedVariants,
                    HashTrieMap<Class<?>, WamlVariant<? extends T>> classVariants) {
    this.namedVariants = namedVariants;
    this.classVariants = classVariants;
  }

  @Override
  public @Nullable String typeName() {
    return null;
  }

  @Override
  public WamlParser<T> withAttrs(@Nullable Object attrs) throws WamlException {
    if (attrs instanceof Attrs attributes && !attributes.isEmpty()) {
      final String name = attributes.keyIterator().next();
      final WamlVariant<? extends T> variant = this.namedVariants.get(name);
      if (variant != null) {
        return Assume.covariant(variant.parser.withAttrs(attributes.removed(name)));
      }
    }
    return this;
  }

  @Override
  public @Nullable Object getAttrs(@Nullable T object) throws WamlException {
    if (object == null) {
      return null;
    }
    Class<?> objectClass = object.getClass();
    do {
      final WamlVariant<T> variant = Assume.conformsNullable(this.classVariants.get(objectClass));
      if (variant != null) {
        Object attrs = variant.writer.getAttrs(object);
        if (attrs == null || attrs instanceof Attrs) {
          String typeName = variant.typeName;
          if (typeName == null) {
            typeName = variant.writer.typeName();
          }
          if (typeName != null) {
            final Attrs attributes = Attrs.of(typeName, Repr.unit());
            if (attrs != null) {
              attributes.putAll((Attrs) attrs);
            }
            attrs = attributes;
          }
        }
        return attrs;
      }
      objectClass = objectClass.getSuperclass();
    } while (objectClass != null);
    throw new WamlException("unsupported object: " + object);
  }

  @Override
  public boolean filter(@Nullable T object, FilterMode filterMode) throws WamlException {
    if (object == null) {
      return false;
    }
    Class<?> objectClass = object.getClass();
    do {
      final WamlVariant<T> variant = Assume.conformsNullable(this.classVariants.get(objectClass));
      if (variant != null) {
        return variant.writer.filter(object, filterMode);
      }
      objectClass = objectClass.getSuperclass();
    } while (objectClass != null);
    throw new WamlException("unsupported object: " + object);
  }

  @Override
  public @Nullable T initializer(@Nullable Object attrs) {
    return null;
  }

  @Override
  public Parse<T> parse(Input input, WamlParserOptions options) {
    return this.parseValue(input, options);
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable Object attrs,
                        @Nullable T object, WamlWriterOptions options) {
    if (object == null) {
      return this.writeUnit(output);
    }
    Class<?> objectClass = object.getClass();
    do {
      final WamlVariant<T> variant = Assume.conformsNullable(this.classVariants.get(objectClass));
      if (variant != null) {
        return variant.writer.write(output, attrs, object, options);
      }
      objectClass = objectClass.getSuperclass();
    } while (objectClass != null);
    return Write.error(new WamlException("unsupported object: " + object));
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable T object, WamlWriterOptions options) {
    if (object == null) {
      return this.writeUnit(output);
    }
    Class<?> objectClass = object.getClass();
    do {
      final WamlVariant<T> variant = Assume.conformsNullable(this.classVariants.get(objectClass));
      if (variant != null) {
        Object attrs;
        try {
          attrs = variant.writer.getAttrs(object);
        } catch (WamlException cause) {
          return Write.error(cause);
        }
        if (attrs == null || attrs instanceof Attrs) {
          String typeName = variant.typeName;
          if (typeName == null) {
            typeName = variant.writer.typeName();
          }
          if (typeName != null) {
            final Attrs attributes = Attrs.of(typeName, Repr.unit());
            if (attrs != null) {
              attributes.putAll((Attrs) attrs);
            }
            attrs = attributes;
          }
        }
        return variant.writer.write(output, attrs, object, options);
      }
      objectClass = objectClass.getSuperclass();
    } while (objectClass != null);
    return Write.error(new WamlException("unsupported object: " + object));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlVariants", "variantFormat");
    final Iterator<WamlVariant<? extends T>> variants = this.classVariants.valueIterator();
    while (variants.hasNext()) {
      notation.appendArgument(variants.next());
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

}
