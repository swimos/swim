// Copyright 2015-2020 Swim inc.
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
import type {Inoutlet} from "./Inoutlet";
import type {MapInlet} from "./MapInlet";
import type {MapOutlet} from "./MapOutlet";
import type {MapValueFunction, MapFieldValuesFunction} from "./function";
import type {WatchValueFunction, WatchFieldsFunction} from "./function";

export interface MapInoutlet<K, VI, VO, I, O> extends Inoutlet<I, O>, MapInlet<K, VI, I>, MapOutlet<K, VO, O> {
  /**
   * Returns the current state of this `Outlet`.
   */
  get(): O | undefined;

  /**
   * Returns the value assocaited with the given `key` in the current state of
   * this `MapOutlet`, if defined; otherwise returns `null`.
   */
  get(key: K): VO | undefined;

  memoize(): MapOutlet<K, VO, O>;

  map<O2>(func: MapValueFunction<O, O2>): Outlet<O2>;
  map<V2>(func: MapFieldValuesFunction<K, VO, V2>): MapOutlet<K, V2, Map<K, V2>>;

  watch(func: WatchValueFunction<O>): this;
  watch(func: WatchFieldsFunction<K, VO>): this;
}
