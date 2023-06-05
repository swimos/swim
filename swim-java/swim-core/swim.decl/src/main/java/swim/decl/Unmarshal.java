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
 * Annotates a method that unmarshals values of some decodable marshal type
 * into instances of the enclosing class. Any type that is expected to be
 * decodable by common codecs can be used as a marshal type, including
 * primitives, strings, collections, enums, and POJOs. The marshal type
 * is inferred from the argument type of the annotated method.
 * <p>
 * The presence of an {@code @Unmarshal} method declares that any {@code codec}
 * that supports decoding values of the marshal type {@code M} via
 * {@code codec.decode(M.class, input)} should also support decoding instances
 * of the enclosing class {@code T} via {@code codec.decode(T.class, input)}.
 * A derived decoder for the enclosing class should first decode a value of
 * the marshal type, and then invoke the annotated method to unmarshal the
 * decoded value to an instance of the enclosing class.
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
 * Consider a {@code DateTime} class that should be decodable from any format
 * that can decode {@code String} values. Such a class can support decoding
 * from multiple formats—e.g. JSON, XML, CSV, and Avro—by implementing an
 * {@code @Unmarshal} method that converts {@code String} values to
 * {@code DateTime} instances.
 *
 * <pre>public class DateTime {
 *  &#64;Unmarshal
 *  public static DateTime parse(String s) {
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
public @interface Unmarshal {

}
