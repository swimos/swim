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

import {Map} from "@swim/util";
import {Value, Record} from "@swim/structure";
import {Outlet, MapOutlet, StreamletScope} from "@swim/streamlet";
import {MapValueFunction, MapFieldValuesFunction} from "@swim/streamlet";
import {WatchValueFunction, WatchFieldsFunction} from "@swim/streamlet";
import {RecordStreamlet} from "./RecordStreamlet";
import {RecordModel} from "./RecordModel";
import {RecordScope} from "./RecordScope";
import {Dataflow} from "./Dataflow";

export interface RecordOutlet extends Outlet<Record>, MapOutlet<Value, Value, Record>, StreamletScope<Value> {
  outlet(key: Value | string): Outlet<Value>;

  get(): Record;
  get(key: Value): Value;

  memoize(): MapOutlet<Value, Value, Record>;

  map<O2>(func: MapValueFunction<Record, O2>): Outlet<O2>;
  map<V2>(func: MapFieldValuesFunction<Value, Value, V2>): MapOutlet<Value, V2, Map<Value, V2>>;

  watch(func: WatchValueFunction<Record>): this;
  watch(func: WatchFieldsFunction<Value, Value>): this;
}

/** @hidden */
export const RecordOutlet = {
  is(object: unknown): object is RecordOutlet {
    if (typeof object === "object" && object !== null) {
      const outlet = object as RecordOutlet;
      return MapOutlet.is(outlet) && StreamletScope.is(outlet);
    }
    return false;
  },

  // Forward type declarations
  /** @hidden */
  Streamlet: void 0 as unknown as typeof RecordStreamlet, // defined by RecordStreamlet
  /** @hidden */
  Model: void 0 as unknown as typeof RecordModel, // defined by RecordModel
  /** @hidden */
  Scope: void 0 as unknown as typeof RecordScope, // defined by RecordScope
  /** @hidden */
  Dataflow: void 0 as unknown as typeof Dataflow, // defined by Dataflow
};
