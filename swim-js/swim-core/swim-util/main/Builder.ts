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

/**
 * Type that accumulates input values of type `I`,
 * and builds an output result of type `O`.
 * @public
 */
export interface Builder<I, O> {
  /**
   * Adds one or more input values to this builder.
   */
  push(...inputs: I[]): void;

  /**
   * Returns the output result of this builder.
   */
  build(): O;
}

/**
 * Type that accumulates pairs of input values,
 * and builds an output result of type `O`.
 * @public
 */
export interface PairBuilder<K, V, O> {
  /**
   * Adds an input pair to this builder, returning `true` if the state of the
   * builder changed.
   */
  add(key: K, value: V): void;

  /**
   * Returns the output result of this builder.
   */
  build(): O;
}
