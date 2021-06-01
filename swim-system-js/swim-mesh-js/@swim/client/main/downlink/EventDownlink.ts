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
import type {AnyUri, Uri} from "@swim/uri";
import type {DownlinkContext} from "./DownlinkContext";
import type {DownlinkOwner} from "./DownlinkOwner";
import {DownlinkType, DownlinkObserver, DownlinkInit, DownlinkFlags, Downlink} from "./Downlink";
import {EventDownlinkModel} from "./EventDownlinkModel";

export interface EventDownlinkObserver extends DownlinkObserver {
}

export interface EventDownlinkInit extends EventDownlinkObserver, DownlinkInit {
}

export class EventDownlink extends Downlink {
  /** @hidden */
  constructor(context: DownlinkContext, owner: DownlinkOwner | null, init?: EventDownlinkInit,
              hostUri?: Uri, nodeUri?: Uri, laneUri?: Uri, prio?: number,
              rate?: number, body?: Value, flags: number = DownlinkFlags.KeepLinked,
              observers?: ReadonlyArray<EventDownlinkObserver> | EventDownlinkObserver) {
    super(context, owner, init, hostUri, nodeUri, laneUri, prio, rate, body, flags, observers);
  }

  /** @hidden */
  override readonly model!: EventDownlinkModel | null;

  /** @hidden */
  override readonly observers!: ReadonlyArray<EventDownlinkObserver>;

  override get type(): DownlinkType {
    return "event";
  }

  protected override copy(context: DownlinkContext, owner: DownlinkOwner | null,
                          hostUri: Uri, nodeUri: Uri, laneUri: Uri, prio: number, rate: number,
                          body: Value, flags: number, observers: ReadonlyArray<EventDownlinkObserver>): EventDownlink {
    return new EventDownlink(context, owner, void 0, hostUri, nodeUri, laneUri,
                             prio, rate, body, flags, observers);
  }

  override observe(observer: EventDownlinkObserver): this {
    return super.observe(observer);
  }

  override open(): this {
    const laneUri = this.ownLaneUri;
    if (laneUri.isEmpty()) {
      throw new Error("no lane");
    }
    let nodeUri = this.ownNodeUri;
    if (nodeUri.isEmpty()) {
      throw new Error("no node");
    }
    let hostUri = this.ownHostUri;
    if (hostUri.isEmpty()) {
      hostUri = nodeUri.endpoint();
      nodeUri = hostUri.unresolve(nodeUri);
    }
    let model = this.context.getDownlink(hostUri, nodeUri, laneUri);
    if (model !== void 0) {
      if (!(model instanceof EventDownlinkModel)) {
        throw new Error("downlink type mismatch");
      }
      model.addDownlink(this);
    } else {
      model = new EventDownlinkModel(this.context, hostUri, nodeUri, laneUri,
                                     this.ownPrio, this.ownRate, this.ownBody);
      model.addDownlink(this);
      this.context.openDownlink(model);
    }
    Object.defineProperty(this, "model", {
      value: model as EventDownlinkModel,
      enumerable: true,
      configurable: true,
    });
    if (this.owner !== null) {
      this.owner.addDownlink(this);
    }
    return this;
  }
}
export interface EventDownlink {
  hostUri(): Uri;
  hostUri(hostUri: AnyUri): EventDownlink;

  nodeUri(): Uri;
  nodeUri(nodeUri: AnyUri): EventDownlink;

  laneUri(): Uri;
  laneUri(laneUri: AnyUri): EventDownlink;

  prio(): number;
  prio(prio: number): EventDownlink;

  rate(): number;
  rate(rate: number): EventDownlink;

  body(): Value;
  body(body: AnyValue): EventDownlink;

  keepLinked(): boolean;
  keepLinked(keepLinked: boolean): EventDownlink;

  keepSynced(): boolean;
  keepSynced(keepSynced: boolean): EventDownlink;
}
