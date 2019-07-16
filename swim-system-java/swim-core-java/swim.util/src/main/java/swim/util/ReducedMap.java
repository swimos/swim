// Copyright 2015-2019 SWIM.AI inc.
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

/**
 * An {@link OrderedMap} that memoizes partial combinations of sub-elements to
 * support efficient, incremental reduction of continuously mutating datasets.
 */
public interface ReducedMap<K, V, U> extends OrderedMap<K, V> {
  /**
   * Returns the reduction of this {@code ReducedMap}, combining all contained
   * elements with the given {@code accumulator} and {@code combiner} functions,
   * recomputing only what has changed since the last invocation of {@code
   * reduced}.  Stores partial computations to accelerate repeated reduction
   * of continuously mutating datasets.
   */
  U reduced(U identity, CombinerFunction<? super V, U> accumulator, CombinerFunction<U, U> combiner);
}
