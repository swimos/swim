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

/**
 * Type that implements a partial or total order over type `T`.
 */
export interface Comparable<T> {
  /**
   * Returns the relative order if `this` and `that`. Returns `-1` if `this`
   * orders before `that`; returns `1` if `this` orders after `that`; returns
   * `0` if `this` and `that` are equivalent; and returns `NaN` if `this` is
   * not comparable to `that`.
   */
  compareTo(that: T): number;
}
