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
import java.lang.reflect.Executable;
import java.lang.reflect.Parameter;
import java.util.Map;
import swim.annotations.Nullable;
import swim.collections.HashTrieMap;
import swim.collections.UniformMap;
import swim.decl.Property;
import swim.util.Notation;
import swim.util.WriteMarkup;
import swim.waml.decl.WamlProperty;

final class WamlCreatorDef<T> implements WriteMarkup {

  final WamlClassDef<T> classDef;
  final Executable executable;
  final UniformMap<String, WamlPropertyDef<T>> parameterDefs;

  WamlCreatorDef(WamlClassDef<T> classDef, Executable executable) {
    this.classDef = classDef;
    this.executable = executable;
    this.parameterDefs = UniformMap.of();
  }

  void reflectParameters() throws WamlProviderException {
    final Parameter[] parameters = this.executable.getParameters();
    for (int i = 0; i < parameters.length; i += 1) {
      this.reflectParameter(parameters[i], i);
    }
  }

  WamlPropertyDef<T> reflectParameter(Parameter parameter, int parameterIndex) throws WamlProviderException {
    final HashTrieMap<Class<?>, Annotation> annotationMap = Waml.resolveAnnotations(parameter);

    Annotation propertyAnnotation;
    final String propertyName;
    if ((propertyAnnotation = annotationMap.get(WamlProperty.class)) != null) {
      propertyName = ((WamlProperty) propertyAnnotation).value();
    } else if ((propertyAnnotation = annotationMap.get(Property.class)) != null) {
      propertyName = ((Property) propertyAnnotation).value();
    } else {
      throw new WamlProviderException("missing @Property annotation for parameter " + parameterIndex
                                    + " of " + this.executable);
    }
    if (propertyName.length() == 0) {
      throw new WamlProviderException("missing property name for parameter " + parameterIndex
                                    + " of " + this.executable);
    } else if (this.parameterDefs.containsKey(propertyName)) {
      throw new WamlProviderException(Notation.of("duplicate property name ").appendSource(propertyName)
                                              .append(" for parameter ").append(parameterIndex)
                                              .append(" of ").append(this.executable)
                                              .toString());
    }

    final WamlPropertyDef<T> propertyDef = this.classDef.getOrCreatePropertyDef(propertyName);
    propertyDef.creatorParameter = parameter;
    propertyDef.creatorParameterIndex = parameterIndex;
    this.parameterDefs.put(propertyName, propertyDef);
    return propertyDef;
  }

  UniformMap<String, WamlFieldFormat<?, Object[]>> toArgumnetFormats() throws WamlProviderException {
    final UniformMap<String, WamlFieldFormat<?, Object[]>> argumentFormats = UniformMap.of();
    for (Map.Entry<String, WamlPropertyDef<T>> entry : this.parameterDefs) {
      argumentFormats.put(entry.getKey(), entry.getValue().toCreatorFormat());
    }
    return argumentFormats;
  }

  UniformMap<String, WamlFieldFormat<?, Object[]>> toFlattenedArgumentFormats() throws WamlProviderException {
    final UniformMap<String, WamlFieldFormat<?, Object[]>> flattenedArgumentFormats = UniformMap.of();
    for (WamlPropertyDef<T> propertyDef : this.parameterDefs.values()) {
      if (propertyDef.ignore || propertyDef.annex || !propertyDef.flatten) {
        continue;
      }
      final UniformMap<String, WamlFieldFormat<?, Object[]>> nestedArgumentFormats =
          propertyDef.toFlattenedCreatorFormats();
      if (nestedArgumentFormats == null) {
        continue;
      }
      flattenedArgumentFormats.putAll(nestedArgumentFormats);
    }
    return flattenedArgumentFormats;
  }

  @Nullable WamlFieldFormat<?, Object[]> toAnnexArgumentFormat() throws WamlProviderException {
    WamlFieldFormat<?, Object[]> annexArgumentFormat = null;
    for (WamlPropertyDef<T> propertyDef : this.parameterDefs.values()) {
      if (!propertyDef.annex) {
        continue;
      } else if (annexArgumentFormat != null) {
        throw new WamlProviderException(Notation.of("duplicate annex property ")
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
    notation.beginObject("WamlCreatorDef")
            .appendField("className", this.classDef.classType.getName())
            .appendField("executable", this.executable);
    if (!this.parameterDefs.isEmpty()) {
      notation.appendKey("parameterDefs")
              .beginValue()
              .beginObject();
      for (Map.Entry<String, WamlPropertyDef<T>> entry : this.parameterDefs) {
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
