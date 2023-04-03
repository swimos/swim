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
 * A {@code TermForm} that converts identifiers to values of type {@code T}.
 *
 * @param <T> the type of values converted by this {@code IdentifierTermForm}
 */
@Public
@Since("5.0")
public interface IdentifierTermForm<T> extends TermForm<T> {

  @Override
  default IdentifierTermForm<? extends T> identifierForm() throws TermException {
    return this;
  }

  /**
   * Converts the given {@code identifier} string to a value of type {@code T}.
   * The provided {@code parser} can be used to vary the interpretation of
   * identifiers based on the particular expression language being parsed.
   *
   * @param identifier the identifier string to convert to a value
   *        of type {@code T}
   * @param parser the expression language for which identifiers
   *        should be interpreted
   * @return a value of type {@code T} representing the given
   *         {@code identifier} string
   * @throws TermException if unable to convert the given {@code identifier}
   *         string to a valid value of type {@code T}
   */
  @Nullable T identifierValue(String identifier, ExprParser parser) throws TermException;

}
