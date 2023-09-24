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

package swim.term;

import swim.annotations.Covariant;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * A conversion from {@code Term} instances to values of type {@code T}.
 *
 * @param <T> the type of values to convert from {@code Term} instances
 */
@Public
@Since("5.0")
@FunctionalInterface
public interface FromTerm<@Covariant T> {

  /**
   * Converts a given {@code term} to a value of type {@code T}.
   *
   * @param term the {@code Term} instance to convert to a value of type {@code T}
   * @return a value of type {@code T} extracted from the given {@code term}
   * @throws TermException if the conversion fails
   */
  @Nullable T fromTerm(Term term) throws TermException;

  /**
   * Returns a default representation of type {@code T}.
   *
   * @return a default value of type {@code T}
   * @throws TermException if no default value exists for type {@code T}
   */
  default @Nullable T initializer() throws TermException {
    return null;
  }

}
