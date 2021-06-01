// Copyright 2015-2021 Swim inc.
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

import type {Map} from "@swim/util";
import type {Outlet} from "./Outlet";
import type {OutletCombinators} from "./OutletCombinators";
import type {MapOutlet} from "./MapOutlet";
import type {FilterFieldsFunction} from "./function";
import type {MapValueFunction, MapFieldValuesFunction} from "./function";
import type {WatchValueFunction, WatchFieldsFunction} from "./function";
import {MemoizeMapCombinator} from "./"; // forward import
import {FilterFieldsCombinator} from "./"; // forward import
import {MapValueCombinator} from "./"; // forward import
import {MapFieldValuesCombinator} from "./"; // forward import
import {ReduceFieldsCombinator} from "./"; // forward import
import {WatchValueCombinator} from "./"; // forward import
import {WatchFieldsCombinator} from "./"; // forward import

export interface MapOutletCombinators<K, V, O> extends OutletCombinators<O> {
  memoize(): MapOutlet<K, V, O>;

  filter(func: FilterFieldsFunction<K, V>): MapOutlet<K, V, Map<K, V>>;

  map<O2>(func: MapValueFunction<O, O2>): Outlet<O2>;
  map<V2>(func: MapFieldValuesFunction<K, V, V2>): MapOutlet<K, V2, Map<K, V2>>;

  reduce<U>(identity: U, accumulator: (result: U, element: V) => U, combiner: (result: U, result2: U) => U): Outlet<U>;

  watch(func: WatchValueFunction<O>): this;
  watch(func: WatchFieldsFunction<K, V>): this;
}

export const MapOutletCombinators = {} as {
  define<K, V, O>(prototype: MapOutletCombinators<K, V, O>): void;

  /** @hidden */
  memoize<K, V, O>(this: MapOutlet<K, V, O>): MapOutlet<K, V, O>;

  /** @hidden */
  filter<K, V, O>(this: MapOutlet<K, V, O>, func: FilterFieldsFunction<K, V>): MapOutlet<K, V, Map<K, V>>;

  /** @hidden */
  map<K, V, O, O2>(this: MapOutlet<K, V, O>, func: MapValueFunction<O, O2>): Outlet<O2>;
  /** @hidden */
  map<K, V, O, V2>(this: MapOutlet<K, V, O>, func: MapFieldValuesFunction<K, V, V2>): MapOutlet<K, V2, Map<K, V2>>;

  /** @hidden */
  reduce<K, V, O, U>(this: MapOutlet<K, V, O>, identity: U, accumulator: (result: U, element: V) => U, combiner: (result: U, result2: U) => U): Outlet<U>;

  /** @hidden */
  watch<K, V, O>(this: MapOutlet<K, V, O>, func: WatchValueFunction<O>): MapOutlet<K, V, O>;
  /** @hidden */
  watch<K, V, O>(this: MapOutlet<K, V, O>, func: WatchFieldsFunction<K, V>): MapOutlet<K, V, O>;
};

MapOutletCombinators.define = function <K, V, O>(prototype: MapOutlet<K, V, O>): void {
  if (!Object.prototype.hasOwnProperty.call(prototype, "memoize")) {
    prototype.memoize = MapOutletCombinators.memoize;
  }
  if (!Object.prototype.hasOwnProperty.call(prototype, "filterr")) {
    prototype.filter = MapOutletCombinators.filter;
  }
  if (!Object.prototype.hasOwnProperty.call(prototype, "map")) {
    prototype.map = MapOutletCombinators.map;
  }
  if (!Object.prototype.hasOwnProperty.call(prototype, "reduce")) {
    prototype.reduce = MapOutletCombinators.reduce;
  }
  if (!Object.prototype.hasOwnProperty.call(prototype, "watch")) {
    prototype.watch = MapOutletCombinators.watch;
  }
};

MapOutletCombinators.memoize = function <K, V, O>(this: MapOutlet<K, V, O>): MapOutlet<K, V, O> {
  const combinator = new MemoizeMapCombinator<K, V, O>();
  combinator.bindInput(this);
  return combinator;
};

MapOutletCombinators.filter = function <K, V, O>(this: MapOutlet<K, V, O>, func: FilterFieldsFunction<K, V>): MapOutlet<K, V, Map<K, V>> {
  const combinator = new FilterFieldsCombinator<K, V, O>(func);
  combinator.bindInput(this);
  return combinator;
};

MapOutletCombinators.map = function <K, V, O, V2>(this: MapOutlet<K, V, O>, func: MapValueFunction<O, V2> | MapFieldValuesFunction<K, V, V2>): Outlet<V2> | MapOutlet<K, V2, Map<K, V2>> {
  if (func.length === 1) {
    const combinator = new MapValueCombinator<O, V2>(func as MapValueFunction<O, V2>);
    combinator.bindInput(this);
    return combinator;
  } else {
    const combinator = new MapFieldValuesCombinator<K, V, V2, O>(func as MapFieldValuesFunction<K, V, V2>);
    combinator.bindInput(this);
    return combinator;
  }
} as typeof MapOutletCombinators.map;

MapOutletCombinators.reduce = function <K, V, O, U>(this: MapOutlet<K, V, O>, identity: U, accumulator: (result: U, element: V) => U, combiner: (result: U, result2: U) => U): Outlet<U> {
  const combinator = new ReduceFieldsCombinator<K, V, O, U>(identity, accumulator, combiner);
  combinator.bindInput(this);
  return combinator;
};

MapOutletCombinators.watch = function <K, V, O>(this: MapOutlet<K, V, O>, func: WatchValueFunction<O> | WatchFieldsFunction<K, V>): MapOutlet<K, V, O> {
  if (func.length === 1) {
    const combinator = new WatchValueCombinator<O>(func as WatchValueFunction<O>);
    combinator.bindInput(this);
    return this;
  } else {
    const combinator = new WatchFieldsCombinator<K, V, O>(func as WatchFieldsFunction<K, V>);
    combinator.bindInput(this);
    return this;
  }
};
