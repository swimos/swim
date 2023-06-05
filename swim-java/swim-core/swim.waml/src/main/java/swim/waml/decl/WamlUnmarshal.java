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

package swim.waml.decl;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.reflect.Type;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.waml.Waml;
import swim.waml.WamlFormat;
import swim.waml.WamlReflections;

/**
 * Annotates a method that unmarshals values of some WAML-decodable marshal
 * type into instances of the enclosing class. Any WAML-decodable type can
 * be used as a marshal type, including primitives, strings, collections,
 * enums, and POJOs. The marshal type is inferred from the argument type
 * of the annotated method.
 * <p>
 * The presence of a {@code WamlUnmarshal} method declares that a derived
 * WAML parser for the enclosing class should first parse a value of the
 * marshal type from WAML, and then invoke the annotated method to
 * unmarshal the parsed value to an instance of the enclosing class.
 *
 * <h2>Requirements</h2>
 * <p>
 * The annotated method must conform to the following criteria:
 * <ul>
 *   <li>the method is {@code static} and open to reflection
 *   <li>the method has a single parameter whose type is assignable
 *       from the marshal type
 *   <li>the return type is assignable to the enclosing class type
 * </ul>
 *
 * <h2>Example</h2>
 * <p>
 * Consider a {@code DateTime} class that should be decodable from WAML string
 * literals. This can be supported by implementing a {@code @WamlUnmarshal}
 * method that converts {@code String} values, which are themselves decodable
 * from WAML string literals, to {@code DateTime} instances.
 *
 * <pre>public class DateTime {
 *  &#64;WamlUnmarshal
 *  public static DateTime parse(String s) {
 *     // ...
 *  }
 *}</pre>
 * <p>
 * {@link WamlFormat#get(Type) WamlFormat.get(DateTime.class)} will return
 * a {@code WamlFormat} that deserializes {@code DateTime} instances from WAML.
 * Any WAML context that expects to parse {@code DateTime} instances will
 * implicitly use this {@code WamlFormat}. {@link Waml#parse(Type,String)
 * Waml.parse(DateTime.class, input)} can be used to explicitly deserialize
 * {@code DateTime} instances from WAML.
 *
 * @see WamlReflections
 */
@Public
@Since("5.0")
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.ANNOTATION_TYPE})
@WamlAnnotation
public @interface WamlUnmarshal {

}
