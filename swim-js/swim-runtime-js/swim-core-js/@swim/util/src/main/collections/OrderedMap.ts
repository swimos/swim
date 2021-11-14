// Copyright 2015-2021 Swim Inc.
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

import type {Map} from "./Map";

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
