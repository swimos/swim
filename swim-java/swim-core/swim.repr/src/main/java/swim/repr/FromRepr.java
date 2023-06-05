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

import swim.annotations.Covariant;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.term.FromTerm;
import swim.term.Term;
import swim.term.TermException;

/**
 * A conversion from {@code Repr} instances to values of type {@code T}.
 *
 * @param <T> the type of values to convert from {@code Repr} instances
 */
@Public
@Since("5.0")
public interface FromRepr<@Covariant T> extends FromTerm<T> {

  /**
   * Converts a given {@code repr} to a value of type {@code T}.
   *
   * @param repr the {@code Repr} instance to convert to a value of type {@code T}
   * @return a value of type {@code T} extracted from the given {@code repr}
   * @throws ReprException if the conversion fails
   */
  @Nullable T fromRepr(Repr repr) throws ReprException;

  @Override
  default @Nullable T fromTerm(Term term) throws TermException {
    if (!(term instanceof Repr)) {
      return null;
    }
    return this.fromRepr((Repr) term);
  }

  /**
   * Returns a default representation of type {@code T}.
   *
   * @return a default value of type {@code T}
   * @throws ReprException if no default value exists for type {@code T}
   */
  @Override
  @Nullable T initializer() throws ReprException;

}
