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
import swim.util.Assume;
import swim.util.Notation;
import swim.util.Result;
import swim.util.ToMarkup;
import swim.waml.decl.WamlAlias;
import swim.waml.decl.WamlAnnex;
import swim.waml.decl.WamlFlatten;
import swim.waml.decl.WamlIgnore;
import swim.waml.decl.WamlInclude;
import swim.waml.decl.WamlMerge;

final class WamlPropertyDef<T> implements ToMarkup {

  final WamlClassDef<T> classDef;
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

  @Nullable WamlFormat<?> valueFormat;
  @Nullable WamlFieldParser<?, T> fieldParser;
  @Nullable WamlFieldWriter<?, T> fieldWriter;
  @Nullable WamlFieldFormat<?, T> fieldFormat;
  @Nullable UniformMap<String, WamlFieldFormat<?, T>> flattenedFieldFormats;

  @Nullable WamlFieldFormat<?, Object[]> creatorFormat;
  @Nullable UniformMap<String, WamlFieldFormat<?, Object[]>> flattenedCreatorFormats;

  WamlPropertyDef(WamlClassDef<T> classDef, String name) {
    this.classDef = classDef;
    this.name = name;
    this.aliases = HashTrieSet.empty();
    this.includeFilter = WamlClassDef.INCLUDE_DEFAULT;
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
    if ((aliasAnnotation = annotationMap.get(WamlAlias.class)) != null) {
      aliases = ((WamlAlias) aliasAnnotation).value();
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
    if ((includeAnnotation = annotationMap.get(WamlInclude.class)) != null) {
      includeFilter = ((WamlInclude) includeAnnotation).value();
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
    if ((ignoreAnnotation = annotationMap.get(WamlIgnore.class)) != null) {
      ignore = ((WamlIgnore) ignoreAnnotation).value();
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
    if ((mergeAnnotation = annotationMap.get(WamlMerge.class)) != null) {
      merge = ((WamlMerge) mergeAnnotation).value();
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
    if ((annexAnnotation = annotationMap.get(WamlAnnex.class)) != null) {
      annex = ((WamlAnnex) annexAnnotation).value();
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
    if ((flattenAnnotation = annotationMap.get(WamlFlatten.class)) != null) {
      flatten = ((WamlFlatten) flattenAnnotation).enabled();
      flattenPrefix = ((WamlFlatten) flattenAnnotation).prefix();
      flattenSuffix = ((WamlFlatten) flattenAnnotation).suffix();
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

  @Nullable WamlFormat<?> toValueFormat() throws WamlProviderException {
    if (this.valueFormat == null) {
      if (this.formatMethod == null) {
        return null;
      } else if ((this.formatMethod.getModifiers() & Modifier.STATIC) == 0) {
        throw new WamlProviderException(Notation.of("non-static @WamlPropertyFormat method ")
                                                .append(this.formatMethod.getName())
                                                .append(" for property ")
                                                .appendSource(this.name)
                                                .append(" of class ")
                                                .append(this.classDef.classType.getName())
                                                .toString());
      } else if (!WamlFormat.class.isAssignableFrom(this.formatMethod.getReturnType())) {
        throw new WamlProviderException(Notation.of("return type of @WamlPropertyFormat method ")
                                                .append(this.formatMethod.getName())
                                                .append(" for property ")
                                                .appendSource(this.name)
                                                .append(" of class ")
                                                .append(this.classDef.classType.getName())
                                                .append(" must be assignable to WamlFormat")
                                                .toString());
      }

      if (this.formatMethod.getParameterCount() > 1) {
        throw new WamlProviderException(Notation.of("unsupported parameters for @WamlPropertyFormat method ")
                                                .append(this.formatMethod.getName())
                                                .append(" for property ")
                                                .appendSource(this.name)
                                                .append(" of class ")
                                                .append(this.classDef.classType.getName())
                                                .toString());
      } else if (this.formatMethod.getParameterCount() == 1) {
        if (!this.formatMethod.getParameterTypes()[0].isAssignableFrom(WamlMetaCodec.class)) {
          throw new WamlProviderException(Notation.of("parameter type of @WamlPropertyFormat method ")
                                                  .append(this.formatMethod.getName())
                                                  .append(" for property ")
                                                  .appendSource(this.name)
                                                  .append(" of class ")
                                                  .append(this.classDef.classType.getName())
                                                  .append(" must be assignable from WamlMetaCodec")
                                                  .toString());
        }
        try {
          this.valueFormat = (WamlFormat<?>) this.formatMethod.invoke(null, this.classDef.metaCodec);
        } catch (Throwable cause) {
          Result.throwFatal(cause);
          throw new WamlProviderException(cause);
        }
      }
      try {
        this.valueFormat = (WamlFormat<?>) this.formatMethod.invoke(null);
      } catch (Throwable cause) {
        Result.throwFatal(cause);
        throw new WamlProviderException(cause);
      }
    }
    return this.valueFormat;
  }

  @Nullable WamlFieldParser<?, T> toFieldParser() throws WamlProviderException {
    if (this.fieldParser == null) {
      if (this.updaterMethod != null) {
        WamlParser<?> valueParser = this.toValueFormat();
        if (valueParser == null) {
          valueParser = this.classDef.metaCodec.getWamlFormat(this.updaterMethod.getGenericParameterTypes()[0]);
        }
        this.fieldParser = WamlFieldParser.forUpdater(this.updaterMethod, valueParser);
      } else if (this.setterMethod != null) {
        WamlParser<?> valueParser = this.toValueFormat();
        if (valueParser == null) {
          valueParser = this.classDef.metaCodec.getWamlFormat(this.setterMethod.getGenericParameterTypes()[0]);
        }
        this.fieldParser = WamlFieldParser.forSetter(this.setterMethod, valueParser);
      } else if (this.field != null && (this.field.getModifiers() & Modifier.FINAL) == 0) {
        WamlParser<?> valueParser = this.toValueFormat();
        if (valueParser == null) {
          valueParser = this.classDef.metaCodec.getWamlFormat(this.field.getGenericType());
        }
        this.fieldParser = WamlFieldParser.forField(this.field, valueParser);
      }
    }
    return this.fieldParser;
  }

  @Nullable WamlFieldWriter<?, T> toFieldWriter() throws WamlProviderException {
    if (this.fieldWriter == null) {
      if (this.getterMethod != null) {
        WamlWriter<?> valueWriter = this.toValueFormat();
        if (valueWriter == null) {
          valueWriter = this.classDef.metaCodec.getWamlFormat(this.getterMethod.getGenericReturnType());
        }
        this.fieldWriter = WamlFieldWriter.forGetter(this.name, WamlLang.keyFormat(),
                                                     this.getterMethod, valueWriter,
                                                     this.includeFilter);
      } else if (this.field != null) {
        WamlWriter<?> valueWriter = this.toValueFormat();
        if (valueWriter == null) {
          valueWriter = this.classDef.metaCodec.getWamlFormat(this.field.getGenericType());
        }
        this.fieldWriter = WamlFieldWriter.forField(this.name, WamlLang.keyFormat(),
                                                    this.field, valueWriter,
                                                    this.includeFilter);
      }
    }
    return this.fieldWriter;
  }

  @Nullable WamlFieldFormat<?, T> toFieldFormat() throws WamlProviderException {
    if (this.fieldFormat == null) {
      final WamlFieldParser<?, T> fieldParser;
      final WamlFieldWriter<?, T> fieldWriter;
      if ((fieldParser = this.toFieldParser()) != null
          && (fieldWriter = this.toFieldWriter()) != null) {
        WamlFormat<?> valueFormat = this.toValueFormat();
        if (valueFormat == null && fieldParser.valueParser() instanceof WamlFormat<?> fieldValueFormat) {
          valueFormat = fieldValueFormat;
        } else if (valueFormat == null && fieldWriter.valueWriter() instanceof WamlFormat<?> fieldValueFormat) {
          valueFormat = fieldValueFormat;
        }
        if (valueFormat != null) {
          if (this.merge) {
            this.fieldFormat = WamlFieldFormat.merging(Assume.conforms(valueFormat),
                                                       Assume.conforms(fieldParser),
                                                       Assume.conforms(fieldWriter));
          } else {
            this.fieldFormat = WamlFieldFormat.combining(Assume.conforms(valueFormat),
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
  @Nullable UniformMap<String, WamlFieldFormat<?, T>> toFlattenedFieldFormats() throws WamlProviderException {
    final WamlFieldFormat<?, T> fieldFormat;
    if (this.flattenedFieldFormats == null && this.flatten
        && (fieldFormat = this.toFieldFormat()) != null
        && fieldFormat.valueFormat() instanceof WamlObjectFormat<?, ?, ?> valueFormat) {
      this.flattenedFieldFormats = UniformMap.of();
      final Iterator<? extends WamlFieldFormat<?, ?>> nestedFieldFormats;
      try {
        nestedFieldFormats = valueFormat.getDeclaredFieldFormats();
      } catch (WamlException cause) {
        throw new WamlProviderException(Notation.of("unable to flatten property ")
                                                .appendSource(this.name)
                                                .append(" of class ")
                                                .append(this.classDef.classType.getName())
                                                .toString(), cause);
      }
      while (nestedFieldFormats.hasNext()) {
        final WamlFieldFormat<?, ?> nestedFieldFormat = nestedFieldFormats.next();
        final String key = this.flattenKey(nestedFieldFormat.key());
        this.flattenedFieldFormats.put(key, fieldFormat.flattened(key, Assume.conforms(nestedFieldFormat),
                                                                  FilterMode.DEFINED));
      }
    }
    return this.flattenedFieldFormats;
  }

  WamlFieldFormat<?, Object[]> toCreatorFormat() throws WamlProviderException {
    if (this.creatorFormat == null) {
      final Parameter creatorParameter = this.creatorParameter;
      if (creatorParameter == null) {
        throw new WamlProviderException(Notation.of("missing creator parameter for property ")
                                                .appendSource(this.name)
                                                .append(" of class ")
                                                .append(this.classDef.classType.getName())
                                                .toString());
      }
      WamlFormat<?> valueFormat = this.toValueFormat();
      if (valueFormat == null) {
        valueFormat = this.classDef.metaCodec.getWamlFormat(creatorParameter.getParameterizedType());
      }
      this.creatorFormat = WamlFieldFormat.forIndex(this.name, WamlLang.keyFormat(),
                                                     this.creatorParameterIndex, valueFormat,
                                                     FilterMode.DEFAULT);
    }
    return this.creatorFormat;
  }

  @SuppressWarnings("checkstyle:RequireThis") // false positive
  @Nullable UniformMap<String, WamlFieldFormat<?, Object[]>> toFlattenedCreatorFormats() throws WamlProviderException {
    final WamlFieldFormat<?, Object[]> creatorFormat;
    if (this.flattenedCreatorFormats == null && this.flatten
        && (creatorFormat = this.toCreatorFormat()) != null
        && creatorFormat.valueFormat() instanceof WamlObjectFormat<?, ?, ?> valueFormat) {
      this.flattenedCreatorFormats = UniformMap.of();
      final Iterator<? extends WamlFieldFormat<?, ?>> nestedFieldFormats;
      try {
        nestedFieldFormats = valueFormat.getDeclaredFieldFormats();
      } catch (WamlException cause) {
        throw new WamlProviderException(Notation.of("unable to flatten property ")
                                                .appendSource(this.name)
                                                .append(" of class ")
                                                .append(this.classDef.classType.getName())
                                                .toString(), cause);
      }
      while (nestedFieldFormats.hasNext()) {
        final WamlFieldFormat<?, ?> nestedFieldFormat = nestedFieldFormats.next();
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
    notation.beginObject("WamlPropertyDef")
            .appendField("className", this.classDef.classType.getName())
            .appendField("name", this.name);
    if (!this.aliases.isEmpty()) {
      notation.appendField("aliases", this.aliases);
    }
    if (this.includeFilter != WamlClassDef.INCLUDE_DEFAULT) {
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
    return this.toMarkup();
  }

}
