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
 * A {@code TermForm} that converts numbers to values of type {@code T}.
 *
 * @param <T> the type of values converted by this {@code NumberTermForm}
 */
@Public
@Since("5.0")
public interface NumberTermForm<T> extends TermForm<T> {

  @Override
  default NumberTermForm<? extends T> numberForm() throws TermException {
    return this;
  }

  /**
   * Converts the given {@code integer} to a value of type {@code T}.
   *
   * @param integer the integer to convert to a value of type {@code T}
   * @return a value of type {@code T} representing the given {@code integer}
   * @throws TermException if unable to convert the given {@code integer}
   *         to a valid value of type {@code T}
   */
  @Nullable T integerValue(long integer) throws TermException;

  /**
   * Converts the given {@code integer} to a value of type {@code T}, where
   * {@code integer} was parsed from an {@code k}-digit hexadecimal literal.
   *
   * @param integer the integer to convert to a value of type {@code T}
   * @param k the number of digits in the hexadecimal literal from which
   *        {@code integer} was parsed
   * @return a value of type {@code T} representing the given {@code integer}
   * @throws TermException if unable to convert the given {@code integer}
   *         to a valid value of type {@code T}
   */
  @Nullable T hexadecimalValue(long integer, int k) throws TermException;

  /**
   * Converts the given {@code integer} string to a value of type {@code T}.
   *
   * @param integer the base-10 string to convert to a value of type {@code T}
   * @return a value of type {@code T} representing the given
   *         {@code integer} string
   * @throws TermException if unable to convert the given {@code integer}
   *         string to a valid value of type {@code T}
   */
  @Nullable T bigIntegerValue(String integer) throws TermException;

  /**
   * Converts the given {@code decimal} string to a value of type {@code T}.
   *
   * @param decimal the decimal string to convert to a value of type {@code T}
   * @return a value of type {@code T} representing the given
   *         {@code decimal} string
   * @throws TermException if unable to convert the given {@code decimal}
   *         string to a valid value of type {@code T}
   */
  @Nullable T decimalValue(String decimal) throws TermException;

}
