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
import java.lang.reflect.Type;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.waml.Waml;
import swim.waml.WamlFormat;
import swim.waml.WamlReflections;

/**
 * Annotates a method that marshals instances of the enclosing class into
 * values of some WAML-encodable marshal type. Any WAML-encodable type can
 * be used as a marshal type, including primitives, strings, collections,
 * enums, and POJOs. The marshal type is inferred from the return type of
 * the annotated method.
 * <p>
 * The presence of a {@code @WamlMarshal} method declares that a derived
 * WAML writer for the enclosing class should first invoke the annotated
 * method to marshal an instance of the enclosing class into a value of
 * the marshal type, and then write the marshalled value as WAML.
 *
 * <h2>Requirements</h2>
 * <p>
 * The annotated method must conform to the following criteria:
 * <ul>
 *   <li>the method is open to reflection
 *   <li>the method is non-{@code static} and has no parameters, or
 *   <li>the method is {@code static} and has a single parameter
 *       whose type is assignable from the enclosing class type
 *   <li>the return type is assignable to the marshal type
 * </ul>
 *
 * <h2>Example</h2>
 * <p>
 * Consider a {@code DateTime} class that should be encodable to WAML string
 * literals. This can be supported implementing a {@code @WamlMarshal} method
 * that converts {@code DateTime} instances into {@code String} values,
 * which are themselves encodable to WAML string literals.
 *
 * <pre>public class DateTime {
 *  &#64;WamlMarshal
 *  public String toString() {
 *     // ...
 *  }
 *}</pre>
 * <p>
 * {@link WamlFormat#get(Type) WamlFormat.get(DateTime.class)} will return
 * a {@code WamlFormat} that serializes {@code DateTime} instances to WAML.
 * Any WAML context that expects to write {@code DateTime} instances will
 * implicitly use this {@code WamlFormat}. {@link Waml#toString(Object)
 * Waml.toString(dateTime)} can be used to explicitly serialize
 * {@code DateTime} instances to WAML.
 *
 * @see WamlReflections
 */
@Public
@Since("5.0")
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.ANNOTATION_TYPE})
@WamlAnnotation
public @interface WamlMarshal {

}
