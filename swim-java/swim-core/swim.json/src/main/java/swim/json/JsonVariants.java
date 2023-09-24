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

import java.lang.annotation.Annotation;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.Iterator;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Output;
import swim.codec.Write;
import swim.collections.HashTrieMap;
import swim.collections.HashTrieSet;
import swim.decl.FilterMode;
import swim.decl.SubType;
import swim.decl.SubTypes;
import swim.decl.TypeInfo;
import swim.decl.TypeName;
import swim.json.decl.JsonSubType;
import swim.json.decl.JsonSubTypes;
import swim.json.decl.JsonTypeInfo;
import swim.json.decl.JsonTypeName;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class JsonVariants implements JsonProvider, WriteSource {

  final JsonMetaCodec metaCodec;
  final int priority;

  private JsonVariants(JsonMetaCodec metaCodec, int priority) {
    this.metaCodec = metaCodec;
    this.priority = priority;
  }

  @Override
  public int priority() {
    return this.priority;
  }

  @Override
  public @Nullable JsonFormat<?> resolveJsonFormat(Type type) throws JsonProviderException {
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

    return JsonVariants.variantFormat(this.metaCodec, classType);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonVariants", "provider")
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

  public static JsonVariants provider(JsonMetaCodec metaCodec, int priority) {
    return new JsonVariants(metaCodec, priority);
  }

  public static JsonVariants provider(JsonMetaCodec metaCodec) {
    return new JsonVariants(metaCodec, GENERIC_PRIORITY);
  }

  @SuppressWarnings("unchecked")
  public static <T> JsonFormat<T> variantFormat(String typeKey, JsonVariant<? extends T>... variants) throws JsonProviderException {
    HashTrieMap<String, JsonVariant<? extends T>> namedVariants = HashTrieMap.empty();
    HashTrieMap<Class<?>, JsonVariant<? extends T>> classVariants = HashTrieMap.empty();
    for (int i = 0; i < variants.length; i += 1) {
      final JsonVariant<? extends T> variant = variants[i];
      if (variant.typeName != null) {
        namedVariants = namedVariants.updated(variant.typeName, variant);
      }
      classVariants = classVariants.updated(variant.classType, variant);
    }
    return new JsonVariantFormat<T>(typeKey, namedVariants, classVariants);
  }

  public static <T> @Nullable JsonFormat<T> variantFormat(JsonMetaCodec metaCodec, Class<?> classType) throws JsonProviderException {
    final HashTrieSet<Class<?>> resolving = RESOLVING.get();
    if (resolving != null && resolving.contains(classType)) {
      // Defer re-entrant resolution of the base class to lower priority providers.
      return null;
    }

    final HashTrieMap<Class<?>, Annotation> annotationMap = Json.resolveAnnotations(classType);
    Annotation typeInfoAnnotation;
    String typeKey;
    if ((typeInfoAnnotation = annotationMap.get(JsonTypeInfo.class)) != null) {
      typeKey = ((JsonTypeInfo) typeInfoAnnotation).key();
    } else if ((typeInfoAnnotation = annotationMap.get(TypeInfo.class)) != null) {
      typeKey = "";
    } else {
      return null;
    }
    if (typeKey.length() == 0) {
      typeKey = "type";
    }

    Annotation subTypesAnnotation;
    final JsonVariant<? extends T>[] variants;
    if ((subTypesAnnotation = annotationMap.get(JsonSubTypes.class)) != null) {
      final JsonSubType[] subTypes = ((JsonSubTypes) subTypesAnnotation).value();
      variants = Assume.conforms(new JsonVariant<?>[subTypes.length]);
      for (int i = 0; i < subTypes.length; i += 1) {
        final JsonSubType subType = subTypes[i];
        variants[i] = JsonVariants.resolveVariant(metaCodec, typeKey, subType.name(), subType.value(), classType);
      }
    } else if ((subTypesAnnotation = annotationMap.get(SubTypes.class)) != null) {
      final SubType[] subTypes = ((SubTypes) subTypesAnnotation).value();
      variants = Assume.conforms(new JsonVariant<?>[subTypes.length]);
      for (int i = 0; i < subTypes.length; i += 1) {
        final SubType subType = subTypes[i];
        variants[i] = JsonVariants.resolveVariant(metaCodec, typeKey, subType.name(), subType.value(), classType);
      }
    } else {
      variants = Assume.conforms(new JsonVariant<?>[0]);
    }

    return JsonVariants.variantFormat(typeKey, variants);
  }

  static <T> JsonVariant<T> resolveVariant(JsonMetaCodec metaCodec, String typeKey, String typeName,
                                           Class<?> classType, Class<?> baseClass) throws JsonProviderException {
    final HashTrieMap<Class<?>, Annotation> annotationMap = Json.resolveAnnotations(classType);
    if (typeName.length() == 0) {
      Annotation typeNameAnnotation;
      if ((typeNameAnnotation = annotationMap.get(JsonTypeName.class)) != null) {
        typeName = ((JsonTypeName) typeNameAnnotation).value();
      } else if ((typeNameAnnotation = annotationMap.get(TypeName.class)) != null) {
        typeName = ((TypeName) typeNameAnnotation).value();
      }
    }
    if (typeName.length() == 0) {
      typeName = classType.getSimpleName();
    }

    final JsonFormat<T> classFormat;
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
        classFormat = metaCodec.getJsonFormat(baseClass);
      } finally {
        RESOLVING.set(resolving);
      }
    } else {
      // Resolve the subclass format.
      classFormat = metaCodec.getJsonFormat(classType);
    }

    final JsonParser<T> classParser = classFormat.parser();
    JsonWriter<T> classWriter = classFormat.writer();
    if (classWriter instanceof JsonObjectWriter<?, ?>) {
      final JsonFieldWriter<String, T> typeFieldWriter = JsonFieldWriter.forValue(typeKey, JsonLang.keyFormat(),
                                                                                  typeName, JsonLang.stringFormat(),
                                                                                  FilterMode.DEFAULT);
      classWriter = JsonObjectWriter.prefixer(typeName, typeFieldWriter, Assume.conforms(classWriter));
    }

    return JsonVariant.of(typeName, classType, classParser, classWriter);
  }

  static final ThreadLocal<HashTrieSet<Class<?>>> RESOLVING = new ThreadLocal<HashTrieSet<Class<?>>>();

}

final class JsonVariantFormat<T> implements JsonFormat<T>, JsonObjectParser<Object, JsonVariantBuilder<T>, T>, WriteSource {

  String typeKey;
  final HashTrieMap<String, JsonVariant<? extends T>> namedVariants;
  final HashTrieMap<Class<?>, JsonVariant<? extends T>> classVariants;

  JsonVariantFormat(String typeKey, HashTrieMap<String, JsonVariant<? extends T>> namedVariants,
                    HashTrieMap<Class<?>, JsonVariant<? extends T>> classVariants) {
    this.typeKey = typeKey;
    this.namedVariants = namedVariants;
    this.classVariants = classVariants;
  }

  @Override
  public @Nullable String typeName() {
    return null;
  }

  @Override
  public JsonVariantBuilder<T> objectBuilder() {
    return new JsonVariantBuilder<T>(this);
  }

  @Override
  public JsonFieldParser<?, JsonVariantBuilder<T>> getFieldParser(JsonVariantBuilder<T> builder, String key) throws JsonException {
    if (this.typeKey.equals(key)) {
      return Assume.conforms(JsonVariantTypeFieldParser.INSTANCE);
    }
    return builder.getFieldParser(key);
  }

  @Override
  public @Nullable T buildObject(JsonVariantBuilder<T> builder) throws JsonException {
    return builder.buildObject();
  }

  @Override
  public @Nullable T initializer() {
    return null;
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable T object, JsonWriterOptions options) {
    if (object == null) {
      return this.writeNull(output);
    }
    Class<?> objectClass = object.getClass();
    do {
      final JsonVariant<? extends T> variant = this.classVariants.get(objectClass);
      if (variant != null) {
        return variant.writer.write(output, Assume.conforms(object), options);
      }
      objectClass = objectClass.getSuperclass();
    } while (objectClass != null);
    return Write.error(new JsonException("unsupported object: " + object));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonVariants", "variantFormat")
            .appendArgument(this.typeKey);
    final Iterator<JsonVariant<? extends T>> variants = this.classVariants.valueIterator();
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

final class JsonVariantBuilder<T> {

  final JsonVariantFormat<T> format;
  @Nullable JsonObjectParser<Object, Object, T> parser;
  @Nullable Object builder;

  JsonVariantBuilder(JsonVariantFormat<T> format) {
    this.format = format;
    this.parser = null;
    this.builder = null;
  }

  JsonFieldParser<?, JsonVariantBuilder<T>> getFieldParser(String key) throws JsonException {
    if (this.parser != null) {
      return new JsonVariantFieldParser<>(this.parser.getFieldParser(Assume.nonNull(this.builder), key));
    }
    throw new JsonException(Notation.of("unsupported key: ")
                                    .appendSource(key)
                                    .toString());
  }

  @Nullable T buildObject() throws JsonException {
    if (this.parser != null) {
      return this.parser.buildObject(Assume.nonNull(this.builder));
    }
    return null;
  }

}

final class JsonVariantTypeFieldParser<T> implements JsonFieldParser<String, JsonVariantBuilder<T>> {

  @Override
  public JsonParser<String> valueParser() {
    return JsonLang.stringFormat();
  }

  @Override
  public JsonVariantBuilder<T> updatedValue(JsonVariantBuilder<T> builder, @Nullable String value) throws JsonException {
    final JsonVariant<T> variant = Assume.conformsNullable(builder.format.namedVariants.get(value));
    final JsonParser<T> variantParser = variant != null ? variant.parser : null;
    if (variantParser == null || !(variantParser instanceof JsonObjectParser<?, ?, ?>)) {
      throw new JsonException(Notation.of("unsupported type name: ")
                                      .appendSource(value)
                                      .toString());
    }
    builder.parser = Assume.conforms(variantParser);
    builder.builder = builder.parser.objectBuilder();
    //builder.builder = builder.parser.updateValue(builder.builder, key, value);
    return builder;
  }

  static final JsonVariantTypeFieldParser<Object> INSTANCE = new JsonVariantTypeFieldParser<Object>();

}

final class JsonVariantFieldParser<V, T> implements JsonFieldParser<V, JsonVariantBuilder<T>> {

  final JsonFieldParser<V, Object> fieldParser;

  JsonVariantFieldParser(JsonFieldParser<V, Object> fieldParser) {
    this.fieldParser = fieldParser;
  }

  @Override
  public JsonParser<V> valueParser() {
    return this.fieldParser.valueParser();
  }

  @Override
  public JsonVariantBuilder<T> updatedValue(JsonVariantBuilder<T> builder, @Nullable V value) throws JsonException {
    builder.builder = this.fieldParser.updatedValue(Assume.nonNull(builder.builder), value);
    return builder;
  }

}
