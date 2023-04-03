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

package swim.expr;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * A {@code TermForm} that converts strings to values of type {@code T}.
 *
 * @param <B> the type of builder to use when constructing strings
 *        from character sequences
 * @param <T> the type of values converted by this {@code StringTermForm}
 */
@Public
@Since("5.0")
public interface StringTermForm<B, T> extends TermForm<T> {

  @Override
  default StringTermForm<?, ? extends T> stringForm() throws TermException {
    return this;
  }

  /**
   * Returns a new builder to which Unicode code points can be
   * {@linkplain #appendCodePoint(Object, int) accumulated} for later
   * {@linkplain #buildString(Object) conversion} to a value of type {@code T}.
   *
   * @return a new builder for accumulating Unicode code points
   *         for later conversion to a value of type {@code T}
   * @throws TermException if unable to construct a new builder
   */
  B stringBuilder() throws TermException;

  /**
   * Appends a Unicode code point {@code c} to the given {@code builder}.
   * This method invalidates the caller's reference to the passed-in
   * {@code builder}. The returned reference to a potentially different
   * builder should replace the caller's own reference to the passed-in
   * {@code builder}.
   *
   * @param builder the builder to which the Unicode code point {@code c}
   *        should be appended
   * @param c the Unicode code point to append to the given {@code builder}
   * @return an updated builder reference
   * @throws TermException if unable to append the Unicode code point {@code c}
   *         to the given {@code builder}
   */
  B appendCodePoint(B builder, int c) throws TermException;

  /**
   * Builds a value of type {@code T} from the given {@code builder}.
   *
   * @param builder the builder to convert to a value of type {@code T}
   * @return a value of type {@code T} representing the sequence of Unicode
   *         code points appended to the given {@code builder}
   * @throws TermException if unable to convert the given {@code builder}
   *         to a valid value of type {@code T}
   */
  @Nullable T buildString(B builder) throws TermException;

}
