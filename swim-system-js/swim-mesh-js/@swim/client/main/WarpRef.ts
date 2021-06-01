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

import type {AnyValue, Value} from "@swim/structure";
import type {AnyUri} from "@swim/uri";
import type {EventDownlinkInit, EventDownlink} from "./downlink/EventDownlink";
import type {ListDownlinkInit, ListDownlink} from "./downlink/ListDownlink";
import type {MapDownlinkInit, MapDownlink} from "./downlink/MapDownlink";
import type {ValueDownlinkInit, ValueDownlink} from "./downlink/ValueDownlink";
import type {HostRef} from "./ref/HostRef";
import type {NodeRef} from "./ref/NodeRef";
import type {LaneRef} from "./ref/LaneRef";
import type {
  WarpDidConnect,
  WarpDidAuthenticate,
  WarpDidDeauthenticate,
  WarpDidDisconnect,
  WarpDidFail,
  WarpObserver,
} from "./WarpObserver";

export interface WarpRef {
  downlink(init?: EventDownlinkInit): EventDownlink;

  downlinkList(init?: ListDownlinkInit<Value, AnyValue>): ListDownlink<Value, AnyValue>;
  downlinkList<V extends VU, VU = never>(init?: ListDownlinkInit<V, VU>): ListDownlink<V, VU>;

  downlinkMap(init?: MapDownlinkInit<Value, Value, AnyValue, AnyValue>): MapDownlink<Value, Value, AnyValue, AnyValue>;
  downlinkMap<K extends KU, V extends VU, KU = never, VU = never>(init?: MapDownlinkInit<K, V, KU, VU>): MapDownlink<K, V, KU, VU>;

  downlinkValue(init?: ValueDownlinkInit<Value, AnyValue>): ValueDownlink<Value, AnyValue>;
  downlinkValue<V extends VU, VU = never>(init?: ValueDownlinkInit<V, VU>): ValueDownlink<V, VU>;

  hostRef(hostUri: AnyUri): HostRef;

  nodeRef(hostUri: AnyUri, nodeUri: AnyUri): NodeRef;
  nodeRef(nodeUri: AnyUri): NodeRef;

  laneRef(hostUri: AnyUri, nodeUri: AnyUri, laneUri: AnyUri): LaneRef;
  laneRef(nodeUri: AnyUri, laneUri: AnyUri): LaneRef;

  observe(observer: WarpObserver): this;
  unobserve(observer: unknown): this;

  didConnect(didConnect: WarpDidConnect): this;
  didAuthenticate(didAuthenticate: WarpDidAuthenticate): this;
  didDeauthenticate(didDeauthenticate: WarpDidDeauthenticate): this;
  didDisconnect(didDisconnect: WarpDidDisconnect): this;
  didFail(didFail: WarpDidFail): this;
}
