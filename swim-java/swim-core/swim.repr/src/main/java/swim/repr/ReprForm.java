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

package swim.repr;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.expr.Term;
import swim.expr.TermException;
import swim.expr.TermForm;

/**
 * A conversion between {@code Repr} instances and values of type {@code T}.
 *
 * @param <T> the type of values converted by this repr form
 *
 * @see ReprRegistry
 */
@Public
@Since("5.0")
public interface ReprForm<T> extends TermForm<T> {

  /**
   * Converts a given {@code value} to a {@code Repr} instance.
   *
   * @param value the value of type {@code T} to convert into
   *        a {@code Repr} instance
   * @return a {@code Repr} instance representing the given {@code value}
   * @throws ReprException if the conversion fails
   */
  Repr intoRepr(@Nullable T value) throws ReprException;

  /**
   * Converts a given {@code repr} to a value of type {@code T}.
   *
   * @param repr the {@code Repr} instance to convert into
   *        a value of type {@code T}
   * @return a value of type {@code T} extracted from the given {@code repr}
   * @throws ReprException if the conversion fails
   */
  @Nullable T fromRepr(Repr repr) throws ReprException;

  @Override
  default Term intoTerm(@Nullable T value) throws TermException {
    return this.intoRepr(value);
  }

  @Override
  default @Nullable T fromTerm(Term term) throws TermException {
    if (term instanceof Repr) {
      return this.fromRepr((Repr) term);
    } else {
      return null;
    }
  }

}
