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

package swim.repr;

import swim.annotations.Contravariant;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.term.IntoTerm;
import swim.term.Term;
import swim.term.TermException;

/**
 * A conversion into {@code Repr} instances from values of type {@code T}.
 *
 * @param <T> the type of values to convert into {@code Repr} instances
 */
@Public
@Since("5.0")
public interface IntoRepr<@Contravariant T> extends IntoTerm<T> {

  /**
   * Converts a given {@code value} to a {@code Repr} instance.
   *
   * @param value the value of type {@code T} to convert into a {@code Repr} instance
   * @return a {@code Repr} instance representing the given {@code value}
   * @throws ReprException if the conversion fails
   */
  Repr intoRepr(@Nullable T value) throws ReprException;

  @Override
  default Term intoTerm(@Nullable T value) throws TermException {
    return this.intoRepr(value);
  }

}
