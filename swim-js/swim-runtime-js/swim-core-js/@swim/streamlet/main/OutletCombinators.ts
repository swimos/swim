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

import type {Outlet} from "./Outlet";
import type {MapValueFunction, WatchValueFunction} from "./function";
import {MemoizeValueCombinator} from "./"; // forward import
import {MapValueCombinator} from "./"; // forward import
import {WatchValueCombinator} from "./"; // forward import

export interface OutletCombinators<O> {
  memoize(): Outlet<O>;

  map<O2>(func: MapValueFunction<O, O2>): Outlet<O2>;

  watch(func: WatchValueFunction<O>): this;
}

export const OutletCombinators = {} as {
  define<O>(prototype: OutletCombinators<O>): void;

  /** @hidden */
  memoize<O>(this: Outlet<O>): Outlet<O>;

  /** @hidden */
  map<O, O2>(this: Outlet<O>, func: MapValueFunction<O, O2>): Outlet<O2>;

  /** @hidden */
  watch<O>(this: Outlet<O>, func: WatchValueFunction<O>): Outlet<O>;
};

OutletCombinators.define = function <O>(prototype: Outlet<O>): void {
  if (!Object.prototype.hasOwnProperty.call(prototype, "memoize")) {
    prototype.memoize = OutletCombinators.memoize;
  }
  if (!Object.prototype.hasOwnProperty.call(prototype, "map")) {
    prototype.map = OutletCombinators.map;
  }
  if (!Object.prototype.hasOwnProperty.call(prototype, "watch")) {
    prototype.watch = OutletCombinators.watch;
  }
};

OutletCombinators.memoize = function <O>(this: Outlet<O>): Outlet<O> {
  const combinator = new MemoizeValueCombinator<O>();
  combinator.bindInput(this);
  return combinator;
};

OutletCombinators.map = function <O, O2>(this: Outlet<O>, func: MapValueFunction<O, O2>): Outlet<O2> {
  const combinator = new MapValueCombinator<O, O2>(func);
  combinator.bindInput(this);
  return combinator;
};

OutletCombinators.watch = function <O>(this: Outlet<O>, func: WatchValueFunction<O>): Outlet<O> {
  const combinator = new WatchValueCombinator<O>(func);
  combinator.bindInput(this);
  return this;
};
