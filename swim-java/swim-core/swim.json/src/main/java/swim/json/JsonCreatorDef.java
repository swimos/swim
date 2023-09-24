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
import java.lang.reflect.Executable;
import java.lang.reflect.Parameter;
import java.util.Map;
import swim.annotations.Nullable;
import swim.collections.HashTrieMap;
import swim.collections.UniformMap;
import swim.decl.Property;
import swim.json.decl.JsonProperty;
import swim.util.Notation;
import swim.util.WriteMarkup;

final class JsonCreatorDef<T> implements WriteMarkup {

  final JsonClassDef<T> classDef;
  final Executable executable;
  final UniformMap<String, JsonPropertyDef<T>> parameterDefs;

  JsonCreatorDef(JsonClassDef<T> classDef, Executable executable) {
    this.classDef = classDef;
    this.executable = executable;
    this.parameterDefs = UniformMap.of();
  }

  void reflectParameters() throws JsonProviderException {
    final Parameter[] parameters = this.executable.getParameters();
    for (int i = 0; i < parameters.length; i += 1) {
      this.reflectParameter(parameters[i], i);
    }
  }

  JsonPropertyDef<T> reflectParameter(Parameter parameter, int parameterIndex) throws JsonProviderException {
    final HashTrieMap<Class<?>, Annotation> annotationMap = Json.resolveAnnotations(parameter);

    Annotation propertyAnnotation;
    final String propertyName;
    if ((propertyAnnotation = annotationMap.get(JsonProperty.class)) != null) {
      propertyName = ((JsonProperty) propertyAnnotation).value();
    } else if ((propertyAnnotation = annotationMap.get(Property.class)) != null) {
      propertyName = ((Property) propertyAnnotation).value();
    } else {
      throw new JsonProviderException("missing @Property annotation for parameter " + parameterIndex
                                    + " of " + this.executable);
    }
    if (propertyName.length() == 0) {
      throw new JsonProviderException("missing property name for parameter " + parameterIndex
                                    + " of " + this.executable);
    } else if (this.parameterDefs.containsKey(propertyName)) {
      throw new JsonProviderException(Notation.of("duplicate property name ").appendSource(propertyName)
                                              .append(" for parameter ").append(parameterIndex)
                                              .append(" of ").append(this.executable)
                                              .toString());
    }

    final JsonPropertyDef<T> propertyDef = this.classDef.getOrCreatePropertyDef(propertyName);
    propertyDef.creatorParameter = parameter;
    propertyDef.creatorParameterIndex = parameterIndex;
    this.parameterDefs.put(propertyName, propertyDef);
    return propertyDef;
  }

  UniformMap<String, JsonFieldFormat<?, Object[]>> toArgumnetFormats() throws JsonProviderException {
    final UniformMap<String, JsonFieldFormat<?, Object[]>> argumentFormats = UniformMap.of();
    for (Map.Entry<String, JsonPropertyDef<T>> entry : this.parameterDefs) {
      argumentFormats.put(entry.getKey(), entry.getValue().toCreatorFormat());
    }
    return argumentFormats;
  }

  UniformMap<String, JsonFieldFormat<?, Object[]>> toFlattenedArgumentFormats() throws JsonProviderException {
    final UniformMap<String, JsonFieldFormat<?, Object[]>> flattenedArgumentFormats = UniformMap.of();
    for (JsonPropertyDef<T> propertyDef : this.parameterDefs.values()) {
      if (propertyDef.ignore || propertyDef.annex || !propertyDef.flatten) {
        continue;
      }
      final UniformMap<String, JsonFieldFormat<?, Object[]>> nestedArgumentFormats =
          propertyDef.toFlattenedCreatorFormats();
      if (nestedArgumentFormats == null) {
        continue;
      }
      flattenedArgumentFormats.putAll(nestedArgumentFormats);
    }
    return flattenedArgumentFormats;
  }

  @Nullable JsonFieldFormat<?, Object[]> toAnnexArgumentFormat() throws JsonProviderException {
    JsonFieldFormat<?, Object[]> annexArgumentFormat = null;
    for (JsonPropertyDef<T> propertyDef : this.parameterDefs.values()) {
      if (!propertyDef.annex) {
        continue;
      } else if (annexArgumentFormat != null) {
        throw new JsonProviderException(Notation.of("duplicate annex property ")
                                                .appendSource(propertyDef.name)
                                                .append(" for class ")
                                                .append(this.classDef.classType.getName())
                                                .toString());
      }
      annexArgumentFormat = propertyDef.toCreatorFormat();
    }
    return annexArgumentFormat;
  }

  @Override
  public void writeMarkup(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginObject("JsonCreatorDef")
            .appendField("className", this.classDef.classType.getName())
            .appendField("executable", this.executable);
    if (!this.parameterDefs.isEmpty()) {
      notation.appendKey("parameterDefs")
              .beginValue()
              .beginObject();
      for (Map.Entry<String, JsonPropertyDef<T>> entry : this.parameterDefs) {
        notation.appendKey(entry.getKey())
                .beginValue();
        entry.getValue().writeMarkup(notation);
        notation.endValue();
      }
      notation.endObject()
              .endValue();
    }
    notation.endObject();
  }

  @Override
  public String toString() {
    return WriteMarkup.toString(this);
  }

}
