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
import java.lang.reflect.Field;
import java.lang.reflect.Member;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.Parameter;
import java.util.Iterator;
import swim.annotations.Nullable;
import swim.collections.HashTrieMap;
import swim.collections.HashTrieSet;
import swim.collections.UniformMap;
import swim.decl.Alias;
import swim.decl.Annex;
import swim.decl.FilterMode;
import swim.decl.Flatten;
import swim.decl.Ignore;
import swim.decl.Include;
import swim.decl.Merge;
import swim.json.decl.JsonAlias;
import swim.json.decl.JsonAnnex;
import swim.json.decl.JsonFlatten;
import swim.json.decl.JsonIgnore;
import swim.json.decl.JsonInclude;
import swim.json.decl.JsonMerge;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.Result;
import swim.util.WriteMarkup;

final class JsonPropertyDef<T> implements WriteMarkup {

  final JsonClassDef<T> classDef;
  final String name;
  HashTrieSet<String> aliases;
  FilterMode includeFilter;
  boolean ignore;
  boolean merge;
  boolean annex;

  boolean flatten;
  @Nullable String flattenPrefix;
  @Nullable String flattenSuffix;

  @Nullable Field field;
  @Nullable Method getterMethod;
  @Nullable Method updaterMethod;
  @Nullable Method setterMethod;
  @Nullable Method formatMethod;

  @Nullable Parameter creatorParameter;
  int creatorParameterIndex;

  @Nullable JsonFormat<?> valueFormat;
  @Nullable JsonFieldParser<?, T> fieldParser;
  @Nullable JsonFieldWriter<?, T> fieldWriter;
  @Nullable JsonFieldFormat<?, T> fieldFormat;
  @Nullable UniformMap<String, JsonFieldFormat<?, T>> flattenedFieldFormats;

  @Nullable JsonFieldFormat<?, Object[]> creatorFormat;
  @Nullable UniformMap<String, JsonFieldFormat<?, Object[]>> flattenedCreatorFormats;

  JsonPropertyDef(JsonClassDef<T> classDef, String name) {
    this.classDef = classDef;
    this.name = name;
    this.aliases = HashTrieSet.empty();
    this.includeFilter = JsonClassDef.INCLUDE_DEFAULT;
    this.ignore = false;
    this.merge = false;
    this.annex = false;

    this.flatten = false;
    this.flattenPrefix = null;
    this.flattenSuffix = null;

    this.field = null;
    this.getterMethod = null;
    this.updaterMethod = null;
    this.setterMethod = null;
    this.formatMethod = null;

    this.creatorParameter = null;
    this.creatorParameterIndex = -1;

    this.valueFormat = null;
    this.fieldParser = null;
    this.fieldWriter = null;
    this.fieldFormat = null;
    this.flattenedFieldFormats = null;

    this.creatorFormat = null;
    this.flattenedCreatorFormats = null;
  }

  void reflectInstanceField(Field field, HashTrieMap<Class<?>, Annotation> annotationMap) {
    this.reflectAlias(field, annotationMap);
    this.reflectInclude(field, annotationMap);
    this.reflectIgnore(field, annotationMap);
    this.reflectMerge(field, annotationMap);
    this.reflectAnnex(field, annotationMap);
    this.reflectFlatten(field, annotationMap);
  }

  void reflectInstanceMethod(Method method, HashTrieMap<Class<?>, Annotation> annotationMap) {
    this.reflectAlias(method, annotationMap);
    this.reflectInclude(method, annotationMap);
    this.reflectIgnore(method, annotationMap);
    this.reflectMerge(method, annotationMap);
    this.reflectAnnex(method, annotationMap);
    this.reflectFlatten(method, annotationMap);
  }

  void reflectAlias(Member member, HashTrieMap<Class<?>, Annotation> annotationMap) {
    Annotation aliasAnnotation;
    final String[] aliases;
    if ((aliasAnnotation = annotationMap.get(JsonAlias.class)) != null) {
      aliases = ((JsonAlias) aliasAnnotation).value();
    } else if ((aliasAnnotation = annotationMap.get(Alias.class)) != null) {
      aliases = ((Alias) aliasAnnotation).value();
    } else {
      return;
    }

    for (int i = 0; i < aliases.length; i += 1) {
      this.aliases = this.aliases.added(aliases[i]);
    }
  }

  void reflectInclude(Member member, HashTrieMap<Class<?>, Annotation> annotationMap) {
    Annotation includeAnnotation;
    FilterMode includeFilter;
    if ((includeAnnotation = annotationMap.get(JsonInclude.class)) != null) {
      includeFilter = ((JsonInclude) includeAnnotation).value();
    } else if ((includeAnnotation = annotationMap.get(Include.class)) != null) {
      includeFilter = ((Include) includeAnnotation).value();
    } else {
      return;
    }

    if (includeFilter == FilterMode.INHERIT) {
      includeFilter = this.includeFilter;
    }

    this.includeFilter = includeFilter;
  }

  void reflectIgnore(Member member, HashTrieMap<Class<?>, Annotation> annotationMap) {
    Annotation ignoreAnnotation;
    final boolean ignore;
    if ((ignoreAnnotation = annotationMap.get(JsonIgnore.class)) != null) {
      ignore = ((JsonIgnore) ignoreAnnotation).value();
    } else if ((ignoreAnnotation = annotationMap.get(Ignore.class)) != null) {
      ignore = ((Ignore) ignoreAnnotation).value();
    } else {
      return;
    }

    this.ignore = ignore;
  }

  void reflectMerge(Member member, HashTrieMap<Class<?>, Annotation> annotationMap) {
    Annotation mergeAnnotation;
    final boolean merge;
    if ((mergeAnnotation = annotationMap.get(JsonMerge.class)) != null) {
      merge = ((JsonMerge) mergeAnnotation).value();
    } else if ((mergeAnnotation = annotationMap.get(Merge.class)) != null) {
      merge = ((Merge) mergeAnnotation).value();
    } else {
      return;
    }

    this.merge = merge;
  }

  void reflectAnnex(Member member, HashTrieMap<Class<?>, Annotation> annotationMap) {
    Annotation annexAnnotation;
    final boolean annex;
    if ((annexAnnotation = annotationMap.get(JsonAnnex.class)) != null) {
      annex = ((JsonAnnex) annexAnnotation).value();
    } else if ((annexAnnotation = annotationMap.get(Annex.class)) != null) {
      annex = ((Annex) annexAnnotation).value();
    } else {
      return;
    }

    this.annex = annex;
  }

  void reflectFlatten(Member member, HashTrieMap<Class<?>, Annotation> annotationMap) {
    Annotation flattenAnnotation;
    final boolean flatten;
    final String flattenPrefix;
    final String flattenSuffix;
    if ((flattenAnnotation = annotationMap.get(JsonFlatten.class)) != null) {
      flatten = ((JsonFlatten) flattenAnnotation).enabled();
      flattenPrefix = ((JsonFlatten) flattenAnnotation).prefix();
      flattenSuffix = ((JsonFlatten) flattenAnnotation).suffix();
    } else if ((flattenAnnotation = annotationMap.get(Flatten.class)) != null) {
      flatten = ((Flatten) flattenAnnotation).enabled();
      flattenPrefix = ((Flatten) flattenAnnotation).prefix();
      flattenSuffix = ((Flatten) flattenAnnotation).suffix();
    } else {
      return;
    }

    this.flatten = flatten;
    this.flattenPrefix = flattenPrefix.length() != 0 ? flattenPrefix : null;
    this.flattenSuffix = flattenSuffix.length() != 0 ? flattenSuffix : null;
  }

  @Nullable JsonFormat<?> toValueFormat() throws JsonProviderException {
    if (this.valueFormat == null) {
      if (this.formatMethod == null) {
        return null;
      } else if ((this.formatMethod.getModifiers() & Modifier.STATIC) == 0) {
        throw new JsonProviderException(Notation.of("non-static @JsonPropertyFormat method ")
                                                .append(this.formatMethod.getName())
                                                .append(" for property ")
                                                .appendSource(this.name)
                                                .append(" of class ")
                                                .append(this.classDef.classType.getName())
                                                .toString());
      } else if (!JsonFormat.class.isAssignableFrom(this.formatMethod.getReturnType())) {
        throw new JsonProviderException(Notation.of("return type of @JsonPropertyFormat method ")
                                                .append(this.formatMethod.getName())
                                                .append(" for property ")
                                                .appendSource(this.name)
                                                .append(" of class ")
                                                .append(this.classDef.classType.getName())
                                                .append(" must be assignable to JsonFormat")
                                                .toString());
      }

      if (this.formatMethod.getParameterCount() > 1) {
        throw new JsonProviderException(Notation.of("unsupported parameters for @JsonPropertyFormat method ")
                                                .append(this.formatMethod.getName())
                                                .append(" for property ")
                                                .appendSource(this.name)
                                                .append(" of class ")
                                                .append(this.classDef.classType.getName())
                                                .toString());
      } else if (this.formatMethod.getParameterCount() == 1) {
        if (!this.formatMethod.getParameterTypes()[0].isAssignableFrom(JsonMetaCodec.class)) {
          throw new JsonProviderException(Notation.of("parameter type of @JsonPropertyFormat method ")
                                                  .append(this.formatMethod.getName())
                                                  .append(" for property ")
                                                  .appendSource(this.name)
                                                  .append(" of class ")
                                                  .append(this.classDef.classType.getName())
                                                  .append(" must be assignable from JsonMetaCodec")
                                                  .toString());
        }
        try {
          this.valueFormat = (JsonFormat<?>) this.formatMethod.invoke(null, this.classDef.metaCodec);
        } catch (Throwable cause) {
          Result.throwFatal(cause);
          throw new JsonProviderException(cause);
        }
      }
      try {
        this.valueFormat = (JsonFormat<?>) this.formatMethod.invoke(null);
      } catch (Throwable cause) {
        Result.throwFatal(cause);
        throw new JsonProviderException(cause);
      }
    }
    return this.valueFormat;
  }

  @Nullable JsonFieldParser<?, T> toFieldParser() throws JsonProviderException {
    if (this.fieldParser == null) {
      if (this.updaterMethod != null) {
        JsonParser<?> valueParser = this.toValueFormat();
        if (valueParser == null) {
          valueParser = this.classDef.metaCodec.getJsonFormat(this.updaterMethod.getGenericParameterTypes()[0]);
        }
        this.fieldParser = JsonFieldParser.forUpdater(this.updaterMethod, valueParser);
      } else if (this.setterMethod != null) {
        JsonParser<?> valueParser = this.toValueFormat();
        if (valueParser == null) {
          valueParser = this.classDef.metaCodec.getJsonFormat(this.setterMethod.getGenericParameterTypes()[0]);
        }
        this.fieldParser = JsonFieldParser.forSetter(this.setterMethod, valueParser);
      } else if (this.field != null && (this.field.getModifiers() & Modifier.FINAL) == 0) {
        JsonParser<?> valueParser = this.toValueFormat();
        if (valueParser == null) {
          valueParser = this.classDef.metaCodec.getJsonFormat(this.field.getGenericType());
        }
        this.fieldParser = JsonFieldParser.forField(this.field, valueParser);
      }
    }
    return this.fieldParser;
  }

  @Nullable JsonFieldWriter<?, T> toFieldWriter() throws JsonProviderException {
    if (this.fieldWriter == null) {
      if (this.getterMethod != null) {
        JsonWriter<?> valueWriter = this.toValueFormat();
        if (valueWriter == null) {
          valueWriter = this.classDef.metaCodec.getJsonFormat(this.getterMethod.getGenericReturnType());
        }
        this.fieldWriter = JsonFieldWriter.forGetter(this.name, JsonLang.keyFormat(),
                                                     this.getterMethod, valueWriter,
                                                     this.includeFilter);
      } else if (this.field != null) {
        JsonWriter<?> valueWriter = this.toValueFormat();
        if (valueWriter == null) {
          valueWriter = this.classDef.metaCodec.getJsonFormat(this.field.getGenericType());
        }
        this.fieldWriter = JsonFieldWriter.forField(this.name, JsonLang.keyFormat(),
                                                    this.field, valueWriter,
                                                    this.includeFilter);
      }
    }
    return this.fieldWriter;
  }

  @Nullable JsonFieldFormat<?, T> toFieldFormat() throws JsonProviderException {
    if (this.fieldFormat == null) {
      final JsonFieldParser<?, T> fieldParser;
      final JsonFieldWriter<?, T> fieldWriter;
      if ((fieldParser = this.toFieldParser()) != null
          && (fieldWriter = this.toFieldWriter()) != null) {
        JsonFormat<?> valueFormat = this.toValueFormat();
        if (valueFormat == null && fieldParser.valueParser() instanceof JsonFormat<?> fieldValueFormat) {
          valueFormat = fieldValueFormat;
        } else if (valueFormat == null && fieldWriter.valueWriter() instanceof JsonFormat<?> fieldValueFormat) {
          valueFormat = fieldValueFormat;
        }
        if (valueFormat != null) {
          if (this.merge) {
            this.fieldFormat = JsonFieldFormat.merging(Assume.conforms(valueFormat),
                                                       Assume.conforms(fieldParser),
                                                       Assume.conforms(fieldWriter));
          } else {
            this.fieldFormat = JsonFieldFormat.combining(Assume.conforms(valueFormat),
                                                         Assume.conforms(fieldParser),
                                                         Assume.conforms(fieldWriter));
          }
        }
      }
    }
    return this.fieldFormat;
  }

  String flattenKey(String key) {
    if (this.flattenPrefix == null && this.flattenSuffix == null) {
      return key;
    }

    int keyLength = key.length();
    if (this.flattenPrefix != null) {
      keyLength += this.flattenPrefix.length();
    }
    if (this.flattenSuffix != null) {
      keyLength += this.flattenSuffix.length();
    }

    final StringBuilder keyBuilder = new StringBuilder(keyLength);
    if (this.flattenPrefix != null) {
      keyBuilder.append(this.flattenPrefix);
    }
    keyBuilder.append(key);
    if (this.flattenSuffix != null) {
      keyBuilder.append(this.flattenSuffix);
    }
    return keyBuilder.toString();
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  @Nullable UniformMap<String, JsonFieldFormat<?, T>> toFlattenedFieldFormats() throws JsonProviderException {
    final JsonFieldFormat<?, T> fieldFormat;
    if (this.flattenedFieldFormats == null && this.flatten
        && (fieldFormat = this.toFieldFormat()) != null
        && fieldFormat.valueFormat() instanceof JsonObjectFormat<?, ?, ?> valueFormat) {
      this.flattenedFieldFormats = UniformMap.of();
      final Iterator<? extends JsonFieldFormat<?, ?>> nestedFieldFormats;
      try {
        nestedFieldFormats = valueFormat.getDeclaredFieldFormats();
      } catch (JsonException cause) {
        throw new JsonProviderException(Notation.of("unable to flatten property ")
                                                .appendSource(this.name)
                                                .append(" of class ")
                                                .append(this.classDef.classType.getName())
                                                .toString(), cause);
      }
      while (nestedFieldFormats.hasNext()) {
        final JsonFieldFormat<?, ?> nestedFieldFormat = nestedFieldFormats.next();
        final String key = this.flattenKey(nestedFieldFormat.key());
        this.flattenedFieldFormats.put(key, fieldFormat.flattened(key, Assume.conforms(nestedFieldFormat),
                                                                  FilterMode.DEFINED));
      }
    }
    return this.flattenedFieldFormats;
  }

  JsonFieldFormat<?, Object[]> toCreatorFormat() throws JsonProviderException {
    if (this.creatorFormat == null) {
      final Parameter creatorParameter = this.creatorParameter;
      if (creatorParameter == null) {
        throw new JsonProviderException(Notation.of("missing creator parameter for property ")
                                                .appendSource(this.name)
                                                .append(" of class ")
                                                .append(this.classDef.classType.getName())
                                                .toString());
      }
      JsonFormat<?> valueFormat = this.toValueFormat();
      if (valueFormat == null) {
        valueFormat = this.classDef.metaCodec.getJsonFormat(creatorParameter.getParameterizedType());
      }
      this.creatorFormat = JsonFieldFormat.forIndex(this.name, JsonLang.keyFormat(),
                                                     this.creatorParameterIndex, valueFormat,
                                                     FilterMode.DEFAULT);
    }
    return this.creatorFormat;
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  @Nullable UniformMap<String, JsonFieldFormat<?, Object[]>> toFlattenedCreatorFormats() throws JsonProviderException {
    final JsonFieldFormat<?, Object[]> creatorFormat;
    if (this.flattenedCreatorFormats == null && this.flatten
        && (creatorFormat = this.toCreatorFormat()) != null
        && creatorFormat.valueFormat() instanceof JsonObjectFormat<?, ?, ?> valueFormat) {
      this.flattenedCreatorFormats = UniformMap.of();
      final Iterator<? extends JsonFieldFormat<?, ?>> nestedFieldFormats;
      try {
        nestedFieldFormats = valueFormat.getDeclaredFieldFormats();
      } catch (JsonException cause) {
        throw new JsonProviderException(Notation.of("unable to flatten property ")
                                                .appendSource(this.name)
                                                .append(" of class ")
                                                .append(this.classDef.classType.getName())
                                                .toString(), cause);
      }
      while (nestedFieldFormats.hasNext()) {
        final JsonFieldFormat<?, ?> nestedFieldFormat = nestedFieldFormats.next();
        final String key = this.flattenKey(nestedFieldFormat.key());
        this.flattenedCreatorFormats.put(key, creatorFormat.flattened(key, Assume.conforms(nestedFieldFormat),
                                                                        FilterMode.DEFINED));
      }
    }
    return this.flattenedCreatorFormats;
  }

  @Override
  public void writeMarkup(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginObject("JsonPropertyDef")
            .appendField("className", this.classDef.classType.getName())
            .appendField("name", this.name);
    if (!this.aliases.isEmpty()) {
      notation.appendField("aliases", this.aliases);
    }
    if (this.includeFilter != JsonClassDef.INCLUDE_DEFAULT) {
      notation.appendField("includeFilter", this.includeFilter);
    }
    if (this.ignore) {
      notation.appendField("ignore", true);
    }
    if (this.merge) {
      notation.appendField("merge", true);
    }

    if (this.flatten) {
      notation.appendField("flatten", true);
    }
    if (this.flattenPrefix != null) {
      notation.appendField("flattenPrefix", this.flattenPrefix);
    }
    if (this.flattenSuffix != null) {
      notation.appendField("flattenSuffix", this.flattenSuffix);
    }

    if (this.field != null) {
      notation.appendField("field", this.field);
    }
    if (this.getterMethod != null) {
      notation.appendField("getterMethod", this.getterMethod);
    }
    if (this.updaterMethod != null) {
      notation.appendField("updaterMethod", this.updaterMethod);
    }
    if (this.setterMethod != null) {
      notation.appendField("setterMethod", this.setterMethod);
    }
    if (this.formatMethod != null) {
      notation.appendField("formatMethod", this.formatMethod);
    }

    if (this.creatorParameter != null) {
      notation.appendField("creatorParameter", this.creatorParameter);
    }
    if (this.creatorParameterIndex >= 0) {
      notation.appendField("creatorParameterIndex", this.creatorParameterIndex);
    }
    notation.endObject();
  }

  @Override
  public String toString() {
    return WriteMarkup.toString(this);
  }

}
