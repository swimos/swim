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

/** @public */
export interface OrderedMap<K = unknown, V = unknown> extends Map<K, V> {
  getEntry(index: number): [K, V] | undefined;

  firstKey(): K | undefined;

  firstValue(): V | undefined;

  firstEntry(): [K, V] | undefined;

  lastKey(): K | undefined;

  lastValue(): V | undefined;

  lastEntry(): [K, V] | undefined;

  nextKey(key: K): K | undefined;

  nextValue(key: K): V | undefined;

  nextEntry(key: K): [K, V] | undefined;

  previousKey(key: K): K | undefined;

  previousValue(key: K): V | undefined;

  previousEntry(key: K): [K, V] | undefined;
}

/**
 * An [[OrderedMap]] that memoizes partial combinations of sub-elements to
 * support efficient, incremental reduction of continuously mutating datasets.
 * @public
 */
export interface ReducedMap<K, V, U> extends OrderedMap<K, V> {
  /**
   * Returns the reduction of this `ReducedMap`, combining all contained
   * elements with the given `accumulator` and `combiner` functions,
   * recomputing only what has changed since the last invocation of `reduced`.
   * Stores partial computations to accelerate repeated reduction of
   * continuously mutating datasets.
   */
  reduced(identity: U, accumulator: (result: U, element: V) => U,
          combiner: (result: U, result2: U) => U): U;
}
