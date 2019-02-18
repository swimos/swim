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

import {AnyValue, Value} from "@swim/structure";
import {EventDownlinkInit, EventDownlink} from "./downlink/EventDownlink";
import {ListDownlinkInit, ListDownlink} from "./downlink/ListDownlink";
import {MapDownlinkInit, MapDownlink} from "./downlink/MapDownlink";
import {ValueDownlinkInit, ValueDownlink} from "./downlink/ValueDownlink";

export interface SwimRef {
  downlink(init?: EventDownlinkInit): EventDownlink;

  downlinkList(init?: ListDownlinkInit<Value, AnyValue>): ListDownlink<Value, AnyValue>;
  downlinkList<V extends VU, VU = V>(init?: ListDownlinkInit<V, VU>): ListDownlink<V, VU>;

  downlinkMap(init?: MapDownlinkInit<Value, Value, AnyValue, AnyValue>): MapDownlink<Value, Value, AnyValue, AnyValue>;
  downlinkMap<K extends KU, V extends VU, KU = K, VU = V>(init?: MapDownlinkInit<K, V, KU, VU>): MapDownlink<K, V, KU, VU>;

  downlinkValue(init?: ValueDownlinkInit<Value, AnyValue>): ValueDownlink<Value, AnyValue>;
  downlinkValue<V extends VU, VU = V>(init?: ValueDownlinkInit<V, VU>): ValueDownlink<V, VU>;
}
