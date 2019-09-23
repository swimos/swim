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

package swim.dataflow.graph.windows;

/**
 * Operation for folding keyed, windowed streams.
 *
 * @param <K> The type of the keys.
 * @param <T> The type of the values.
 * @param <W> The type of the windows.
 * @param <U> The result type.
 */
@FunctionalInterface
public interface KeyedWindowFoldFunction<K, T, W, U> {

  U apply(K key, W window, U state, T data);

}
