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

package swim.waml.decl;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.waml.WamlFormat;
import swim.waml.WamlMetaCodec;
import swim.waml.WamlReflections;

/**
 * Defines WAML transcoding for a property in terms of a {@link WamlFormat}
 * returned by the annotated method. The presence of {@code @WamlPropertyFormat(name)}
 * declares that the {@code WamlFormat} returned by the annotated method should
 * be used when transcoding a value of the named property to WAML.
 * <p>
 * An annotated method defines a {@code WamlFormat} for a property
 * of the enclosing class if it meets the following criteria:
 * <ul>
 *   <li>the {@code @WamlPropertyFormat(name)} annotation
 *       has a valid property name as its argument
 *   <li>the method is {@code static} and open to reflection
 *   <li>the method has no parameters, or
 *   <li>the method has one parameter of type {@link WamlMetaCodec}
 *   <li>the return type is assignable to {@code WamlFormat<T>},
 *       where {@code T} is the type of the named property
 * </ul>
 *
 * @see WamlReflections
 */
@Public
@Since("5.0")
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.ANNOTATION_TYPE})
@WamlAnnotation
public @interface WamlPropertyFormat {

  /**
   * Returns the name of the property for which the {@code WamlFormat}
   * returned by the annotated method should apply.
   *
   * @return the name of a property of the enclosing class
   */
  String value();

}
