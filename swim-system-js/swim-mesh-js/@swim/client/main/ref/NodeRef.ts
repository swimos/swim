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

import type {Value, AnyValue} from "@swim/structure";
import {AnyUri, Uri} from "@swim/uri";
import {EventDownlinkInit, EventDownlink} from "../downlink/EventDownlink";
import {ListDownlinkInit, ListDownlink} from "../downlink/ListDownlink";
import {MapDownlinkInit, MapDownlink} from "../downlink/MapDownlink";
import {ValueDownlinkInit, ValueDownlink} from "../downlink/ValueDownlink";
import type {RefContext} from "./RefContext";
import {BaseRef} from "./BaseRef";
import {HostRef} from "./HostRef";
import {LaneRef} from "./LaneRef";

export class NodeRef extends BaseRef {
  constructor(context: RefContext, hostUri: Uri, nodeUri: Uri) {
    super(context);
    Object.defineProperty(this, "hostUri", {
      value: hostUri,
      enumerable: true,
    });
    Object.defineProperty(this, "nodeUri", {
      value: nodeUri,
      enumerable: true,
    });
  }

  declare readonly hostUri: Uri;

  declare readonly nodeUri: Uri;

  hostRef(hostUri: AnyUri): HostRef {
    hostUri = Uri.fromAny(hostUri);
    return new HostRef(this.context, hostUri as Uri);
  }

  nodeRef(nodeUri: AnyUri): NodeRef {
    nodeUri = Uri.fromAny(nodeUri);
    return new NodeRef(this.context, this.hostUri, nodeUri as Uri);
  }

  laneRef(laneUri: AnyUri): LaneRef {
    laneUri = Uri.fromAny(laneUri);
    return new LaneRef(this.context, this.hostUri, this.nodeUri, laneUri as Uri);
  }

  downlink(init?: EventDownlinkInit): EventDownlink {
    return new EventDownlink(this.context, this, init, this.hostUri, this.nodeUri);
  }

  downlinkList(init?: ListDownlinkInit<Value, AnyValue>): ListDownlink<Value, AnyValue>;
  downlinkList<V extends VU, VU = never>(init?: ListDownlinkInit<V, VU>): ListDownlink<V, VU>;
  downlinkList<V extends VU, VU = never>(init?: ListDownlinkInit<V, VU>): ListDownlink<V, VU> {
    return new ListDownlink(this.context, this, init, this.hostUri, this.nodeUri);
  }

  downlinkMap(init?: MapDownlinkInit<Value, Value, AnyValue, AnyValue>): MapDownlink<Value, Value, AnyValue, AnyValue>;
  downlinkMap<K extends KU, V extends VU, KU = never, VU = never>(init?: MapDownlinkInit<K, V, KU, VU>): MapDownlink<K, V, KU, VU>;
  downlinkMap<K extends KU, V extends VU, KU = never, VU = never>(init?: MapDownlinkInit<K, V, KU, VU>): MapDownlink<K, V, KU, VU> {
    return new MapDownlink(this.context, this, init, this.hostUri, this.nodeUri);
  }

  downlinkValue(init?: ValueDownlinkInit<Value, AnyValue>): ValueDownlink<Value, AnyValue>;
  downlinkValue<V extends VU, VU = never>(init?: ValueDownlinkInit<V, VU>): ValueDownlink<V, VU>;
  downlinkValue<V extends VU, VU = never>(init?: ValueDownlinkInit<V, VU>): ValueDownlink<V, VU> {
    return new ValueDownlink(this.context, this, init, this.hostUri, this.nodeUri);
  }

  command(laneUri: AnyUri, body: AnyValue): void {
    this.context.command(this.hostUri, this.nodeUri, laneUri, body);
  }
}
