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

package swim.decl;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * Annotates a method that marshals instances of the enclosing class into
 * values of some encodable marshal type. Any type that is expected to be
 * encodable by common codecs can be used as a marshal type, including
 * primitives, strings, collections, enums, and POJOs. The marshal type
 * is inferred from the return type of the annotated method.
 * <p>
 * The presence of a {@code @Marshal} method declares that any {@code codec}
 * that supports encoding values of the marshal type {@code M} via
 * {@code codec.encode(M.class, value)} should also support encoding instances
 * of the enclosing class {@code T} via {@code codec.encode(T.class, value)}.
 * A derived encoder for the enclosing class should first invoke the annotated
 * method to marshal an instance of the enclosing class into a value of the
 * marshal type, and then encode the marshalled value.
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
 * Consider a {@code DateTime} class that should be encodable to any format
 * that can encode {@code String} values. Such a class can support encoding
 * to multiple formats—e.g. JSON, XML, CSV, and Avro—by implementing a
 * {@code @Marshal} method that converts {@code DateTime} instances into
 * {@code String} values.
 *
 * <pre>public class DateTime {
 *  &#64;Marshal
 *  public String toString() {
 *     // ...
 *  }
 *}</pre>
 */
@Public
@Since("5.0")
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.ANNOTATION_TYPE})
@DeclAnnotation
public @interface Marshal {

}
