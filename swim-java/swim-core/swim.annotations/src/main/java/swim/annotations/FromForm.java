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

package swim.annotations;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotates a deserialization conversion method that generically defines
 * deserialization of the enclosing class in terms of a conversion from some
 * other deserializable type {@code X}, called the <em>interchange type</em>.
 * The annotated method must accept a single argument of the interchange type
 * {@code X}, and return an instance of the enclosing class {@code T}.
 * The interchange type {@code X} can be any Java type expected to be
 * supported by common serialization formats, such as primitive values,
 * strings, collections, etc..
 * <p>
 * The presence of a {@code @FromForm}-annotated method indicates that any
 * given serialization format that supports parsing values of the interchange
 * type {@code X} should also support parsing instances of the enclosing class
 * {@code T} via conversion by the annotated method. Specifically,
 * any serialization {@code format} that supports parsing values of type
 * {@code X} via {@code format.parse(X.class, input)} should also support
 * parsing instances of {@code T} via {@code format.parse(T.class, input)}
 * by first parsing a value of the interchange type {@code X}, and then
 * converting the parsed interchange value to an instance of the enclosing
 * class by invoking the annotated method.
 *
 * <h2>Example</h2>
 * <p>
 * Consider the example of a {@code DateTime} class that should support
 * deserialization from date-time-formatted strings. Such a class can support
 * deserialization from many different formats—e.g. JSON, XML, CSV, and Avro—by
 * defining a single {@code @FromForm}-annotated conversion method that takes a
 * {@code String} argument, and returns a {@code DateTime} instance.
 * <pre>public class DateTime {
 *  &#64;FromForm
 *  public static DateTime parse(String s) {
 *     // ...
 *  }
 * }</pre>
 */
@Public
@Since("5.0")
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface FromForm {

  /**
   * Returns an array of media types for which parsing of the enclosing class
   * by means of conversion by the annotated method should be supported.
   * Returns an empty array if parsing of the enclosing class should not be
   * restricted to a specific set of media types.
   *
   * @return a restricted set of media types for which parsing of the enclosing
   *         class should be supported.
   */
  String[] mediaTypes() default {};

}
