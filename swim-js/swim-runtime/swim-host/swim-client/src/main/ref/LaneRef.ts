// Copyright 2015-2021 Swim.inc
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
import {NodeRef} from "./NodeRef";

/** @public */
export class LaneRef extends BaseRef {
  constructor(context: RefContext, hostUri: Uri, nodeUri: Uri, laneUri: Uri) {
    super(context);
    this.hostUri = hostUri;
    this.nodeUri = nodeUri;
    this.laneUri = laneUri;
  }

  override readonly hostUri: Uri;

  readonly nodeUri: Uri;

  readonly laneUri: Uri;

  override hostRef(hostUri: AnyUri): HostRef {
    hostUri = Uri.fromAny(hostUri);
    return new HostRef(this.context, hostUri);
  }

  override nodeRef(nodeUri: AnyUri): NodeRef {
    nodeUri = Uri.fromAny(nodeUri);
    return new NodeRef(this.context, this.hostUri, nodeUri);
  }

  override laneRef(laneUri: AnyUri): LaneRef {
    laneUri = Uri.fromAny(laneUri);
    return new LaneRef(this.context, this.hostUri, this.nodeUri, laneUri);
  }

  override downlink(init?: EventDownlinkInit): EventDownlink {
    return new EventDownlink(this.context, this, init, this.hostUri, this.nodeUri, this.laneUri);
  }

  override downlinkList(init?: ListDownlinkInit<Value, AnyValue>): ListDownlink<Value, AnyValue>;
  override downlinkList<V extends VU, VU = never>(init?: ListDownlinkInit<V, VU>): ListDownlink<V, VU>;
  override downlinkList<V extends VU, VU = never>(init?: ListDownlinkInit<V, VU>): ListDownlink<V, VU> {
    return new ListDownlink(this.context, this, init, this.hostUri, this.nodeUri, this.laneUri);
  }

  override downlinkMap(init?: MapDownlinkInit<Value, Value, AnyValue, AnyValue>): MapDownlink<Value, Value, AnyValue, AnyValue>;
  override downlinkMap<K extends KU, V extends VU, KU = never, VU = never>(init?: MapDownlinkInit<K, V, KU, VU>): MapDownlink<K, V, KU, VU>;
  override downlinkMap<K extends KU, V extends VU, KU = never, VU = never>(init?: MapDownlinkInit<K, V, KU, VU>): MapDownlink<K, V, KU, VU> {
    return new MapDownlink(this.context, this, init, this.hostUri, this.nodeUri, this.laneUri);
  }

  override downlinkValue(init?: ValueDownlinkInit<Value, AnyValue>): ValueDownlink<Value, AnyValue>;
  override downlinkValue<V extends VU, VU = never>(init?: ValueDownlinkInit<V, VU>): ValueDownlink<V, VU>;
  override downlinkValue<V extends VU, VU = never>(init?: ValueDownlinkInit<V, VU>): ValueDownlink<V, VU> {
    return new ValueDownlink(this.context, this, init, this.hostUri, this.nodeUri, this.laneUri);
  }

  command(body: AnyValue): void {
    this.context.command(this.hostUri, this.nodeUri, this.laneUri, body);
  }
}
