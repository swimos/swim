// Copyright 2015-2020 SWIM.AI inc.
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

import {Iterator, Map} from "@swim/util";
import {Outlet} from "./Outlet";
import {KeyEffect} from "./KeyEffect";
import {FilterFieldsFunction} from "./function";
import {MapValueFunction, MapFieldValuesFunction} from "./function";
import {WatchValueFunction, WatchFieldsFunction} from "./function";
import {MemoizeMapCombinator} from "./combinator/MemoizeMapCombinator";
import {FilterFieldsCombinator} from "./combinator/FilterFieldsCombinator";
import {MapFieldValuesCombinator} from "./combinator/MapFieldValuesCombinator";
import {ReduceFieldsCombinator} from "./combinator/ReduceFieldsCombinator";
import {WatchFieldsCombinator} from "./combinator/WatchFieldsCombinator";

/**
 * Output connector from a [[Streamlet]] for a key-value map state.
 */
export interface MapOutlet<K, V, O> extends Outlet<O> {
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
   * Invalidating an individual key invalidates the entire state of the
   * `Outlet`.  But only the invalidated keys need to be updated in order to
   * reconcile the overall state of the `Outlet`.
   */
  invalidateInputKey(key: K, effect: KeyEffect): void;

  /**
   * Reconciles the state of an individual `key` in this `MapOutlet`, if the
   * version of this `MapOutlet`'s state differs from the target `version`.
   * To reconcile the state of a key, the `MapOutlet` first invokes
   * [[Streamlet.reconcile]] on its attached streamlets.  Then, for each
   * dependent output, it invokes [[MapInlet.reconcileOutputKey]], if the
   * dependent output is a [[MapInlet]], or it invokes [[Inlet.reconcile]],
   * if the dependent output is not a `MapInlet`.
   */
  reconcileInputKey(key: K, version: number): void;

  memoize(): MapOutlet<K, V, O>;

  filter(func: FilterFieldsFunction<K, V>): MapOutlet<K, V, Map<K, V>>;

  map<O2>(func: MapValueFunction<O, O2>): Outlet<O2>;
  map<V2>(func: MapFieldValuesFunction<K, V, V2>): MapOutlet<K, V2, Map<K, V2>>;

  reduce<U>(identity: U, accumulator: (result: U, element: V) => U, combiner: (result: U, result2: U) => U): Outlet<U>;

  watch(func: WatchValueFunction<O>): this;
  watch(func: WatchFieldsFunction<K, V>): this;
}

/** @hidden */
export const MapOutlet = {
  is<K, V, I>(object: unknown): object is MapOutlet<K, V, I> {
    if (typeof object === "object" && object) {
      const outlet = object as MapOutlet<K, V, I>;
      return Outlet.is(outlet)
          && typeof outlet.keyIterator === "function"
          && typeof outlet.outlet === "function";
    }
    return false;
  },

  // Forward type declarations
  /** @hidden */
  MemoizeMapCombinator: void 0 as unknown as typeof MemoizeMapCombinator, // defined by MemoizeMapCombinator
  /** @hidden */
  FilterFieldsCombinator: void 0 as unknown as typeof FilterFieldsCombinator, // defined by FilterFieldsCombinator
  /** @hidden */
  MapFieldValuesCombinator: void 0 as unknown as typeof MapFieldValuesCombinator, // defined by MapFieldValuesCombinator
  /** @hidden */
  ReduceFieldsCombinator: void 0 as unknown as typeof ReduceFieldsCombinator, // defined by ReduceFieldsCombinator
  /** @hidden */
  WatchFieldsCombinator: void 0 as unknown as typeof WatchFieldsCombinator, // defined by WatchFieldsCombinator
};
