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

import type {Iterator, Map} from "@swim/util";
import {Outlet} from "./Outlet";
import type {KeyEffect} from "./KeyEffect";
import type {MapOutletCombinators} from "./MapOutletCombinators";
import type {FilterFieldsFunction} from "./function";
import type {MapValueFunction, MapFieldValuesFunction} from "./function";
import type {WatchValueFunction, WatchFieldsFunction} from "./function";

/**
 * Output connector from a [[Streamlet]] for a key-value map state.
 * @public
 */
export interface MapOutlet<K, V, O> extends Outlet<O>, MapOutletCombinators<K, V, O> {
  /**
   * Returns `true` if the current state of this `MapOutlet` contains the given
   * `key`; otherwise returns `false`.
   */
  has(key: K): boolean;

  /**
   * Returns the current state of this `Outlet`.
   */
  get(): O | undefined;

  /**
   * Returns the value assocaited with the given `key` in the current state of
   * this `MapOutlet`, if defined; otherwise returns `undefined`.
   */
  get(key: K): V | undefined;

  /**
   * Returns an `Iterator` over the keys in the current state of this `MapOutlet`.
   */
  keyIterator(): Iterator<K>;

  /**
   * Returns an `Outlet` that updates when the specified `key` updates.
   */
  outlet(key: K): Outlet<V>;

  /**
   * Marks this `MapOutlet` as needing an `effect` applied to a given `key`.
   * Decohering an individual key decoheres the entire state of the `Outlet`.
   * But only the decoherent keys need to be updated in order to recohere the
   * overall state of the `Outlet`.
   */
  decohereInputKey(key: K, effect: KeyEffect): void;

  /**
   * Updates the state of an individual `key` in this `MapOutlet` to make it
   * consistent with the target `version`. The `MapOutlet` only needs to
   * update if its current `version` differs from the target `version`.
   * To update the state of a key, the `MapOutlet` first invokes
   * [[Streamlet.recohere]] on its attached streamlets. Then, for each
   * dependent output, it invokes [[MapInlet.recohereOutputKey]], if the
   * dependent output is a [[MapInlet]], or it invokes [[Inlet.recohere]],
   * if the dependent output is not a `MapInlet`.
   */
  recohereInputKey(key: K, version: number): void;

  memoize(): MapOutlet<K, V, O>;

  filter(func: FilterFieldsFunction<K, V>): MapOutlet<K, V, Map<K, V>>;

  map<O2>(func: MapValueFunction<O, O2>): Outlet<O2>;
  map<V2>(func: MapFieldValuesFunction<K, V, V2>): MapOutlet<K, V2, Map<K, V2>>;

  reduce<U>(identity: U, accumulator: (result: U, element: V) => U, combiner: (result: U, result2: U) => U): Outlet<U>;

  watch(func: WatchValueFunction<O>): this;
  watch(func: WatchFieldsFunction<K, V>): this;
}

/** @public */
export const MapOutlet = (function () {
  const MapOutlet = {} as {
    is<K, V, I>(object: unknown): object is MapOutlet<K, V, I>;
  };

  MapOutlet.is = function <K, V, I>(object: unknown): object is MapOutlet<K, V, I> {
    if (typeof object === "object" && object !== null) {
      const outlet = object as MapOutlet<K, V, I>;
      return Outlet.is(outlet)
          && typeof outlet.keyIterator === "function"
          && typeof outlet.outlet === "function";
    }
    return false;
  };

  return MapOutlet;
})();
