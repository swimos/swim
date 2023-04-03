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

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * Annotates a deserialization conversion method that defines WAML
 * deserialization of the enclosing class in terms of a conversion from some
 * other WAML-deserializable type {@code X}, called the <em>interchange type</em>.
 * The annotated method must accept a single argument of the interchange type
 * {@code X}, and return an instance of the enclosing class {@code T}.
 * The interchange type {@code X} can be any Java type that supports
 * deserialization from WAML, such as primitive values, strings, collections,
 * other WAML-deserializable types, etc..
 * <p>
 * The presence of a {@code @FromWaml}-annotated method indicates that a
 * {@link WamlForm WamlForm&lt;T&gt;} should be derived that parses instances of
 * the enclosing class {@code T} by first parsing a value of the interchange
 * type {@code X}, and then converting the parsed interchange value to an
 * instance of the enclosing class by invoking the annotated method.
 *
 * <h2>Example</h2>
 * <p>
 * Consider the example of a {@code DateTime} class that should support
 * deserialization from WAML string literals. Defining a {@code @FromWaml}-annotated
 * conversion method that takes a {@code String} argument, and returns a
 * {@code DateTime} instance, enables such support.
 * <pre>public class DateTime {
 *  &#64;FromWaml
 *  public static DateTime parse(String s) {
 *     // ...
 *  }
 * }</pre>
 * <p>
 * {@code DateTime} instance can then be parsed from any context in which
 * a {@code DateTime} instance is known to be required, such as in
 * {@code DateTime}-typed properties of WAML-deserializable objects,
 * as {@code <DateTime>} type parameters to generic collections,
 * or by explicit parsing via {@code Waml.parse(DateTime.class, input)}.
 *
 * @see WamlConversions
 */
@Public
@Since("5.0")
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface FromWaml {

}
