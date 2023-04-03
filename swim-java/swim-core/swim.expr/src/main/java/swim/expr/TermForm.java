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
 * A conversion between {@code Term} instances and values of type {@code T}.
 *
 * @param <T> the type of values converted by this {@code TermForm}
 *
 * @see TermRegistry
 */
@Public
@Since("5.0")
public interface TermForm<T> {

  /**
   * Converts a given {@code value} to a {@code Term} instance.
   *
   * @param value the value of type {@code T} to convert into
   *        a {@code Term} instance
   * @return a {@code Term} instance representing the given {@code value}
   * @throws TermException if the conversion fails
   */
  Term intoTerm(@Nullable T value) throws TermException;

  /**
   * Converts a given {@code term} to a value of type {@code T}.
   *
   * @param term the {@code Term} instance to convert into
   *        a value of type {@code T}
   * @return a value of type {@code T} extracted from the given {@code term}
   * @throws TermException if the conversion fails
   */
  @Nullable T fromTerm(Term term) throws TermException;

  /**
   * Returns a {@code StringTermForm} for constructing values
   * of type {@code T} from character sequences.
   *
   * @return a {@code StringTermForm} that constructs values
   *         of type {@code T} from character sequences
   * @throws TermException if constructing values of type
   *         {@code T} from character sequences is not supported
   */
  default StringTermForm<?, ? extends T> stringForm() throws TermException {
    throw new TermFormException("string not supported");
  }

  /**
   * Returns a {@code NumberTermForm} for constructing values
   * of type {@code T} from numeric literals.
   *
   * @return a {@code NumberTermForm} that constructs values
   *         of type {@code T} from numeric literals
   * @throws TermException if constructing values of type
   *         {@code T} from numeric literals is not supported
   */
  default NumberTermForm<? extends T> numberForm() throws TermException {
    throw new TermFormException("number not supported");
  }

  /**
   * Returns an {@code IdentifierTermForm} for constructing values
   * of type {@code T} from identifier literals.
   *
   * @return an {@code IdentifierTermForm} that converts constructs
   *         values of type {@code T} from identifier literals
   * @throws TermException if constructing values of type
   *         {@code T} from identifier literals is not supported
   */
  default IdentifierTermForm<? extends T> identifierForm() throws TermException {
    throw new TermFormException("identifier not supported");
  }

}
