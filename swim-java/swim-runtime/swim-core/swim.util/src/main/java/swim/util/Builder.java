// Copyright 2015-2024 Nstream, inc.
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

package swim.util;

import java.util.Collection;

/**
 * Type that accumulates input values of type {@code I}, and binds an output
 * result of type {@code O}.
 */
public interface Builder<I, O> {

  /**
   * Adds a single input value to this builder, returning {@code true} if the
   * state of the builder changed.
   */
  boolean add(I input);

  /**
   * Adds multiple input values to this builder, returning {@code true} if the
   * state of the builder changed.
   */
  boolean addAll(Collection<? extends I> inputs);

  /**
   * Returns the output result of this builder.
   */
  O bind();

}
