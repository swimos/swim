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

import {Value} from "@swim/structure";
import {Uri} from "@swim/uri";
import {DownlinkContext} from "./DownlinkContext";
import {DownlinkOwner} from "./DownlinkOwner";
import {DownlinkType, DownlinkObserver, DownlinkInit, DownlinkFlags, Downlink} from "./Downlink";
import {EventDownlinkModel} from "./EventDownlinkModel";

export interface EventDownlinkObserver extends DownlinkObserver {
}

export interface EventDownlinkInit extends EventDownlinkObserver, DownlinkInit {
}

export class EventDownlink extends Downlink {
  /** @hidden */
  _observers: ReadonlyArray<EventDownlinkObserver> | null;
  /** @hidden */
  _model: EventDownlinkModel | null;

  /** @hidden */
  constructor(context: DownlinkContext, owner?: DownlinkOwner, init?: EventDownlinkInit,
              hostUri?: Uri, nodeUri?: Uri, laneUri?: Uri, prio?: number,
              rate?: number, body?: Value, flags: number = DownlinkFlags.KeepLinked,
              observers?: ReadonlyArray<EventDownlinkObserver> | EventDownlinkObserver | null) {
    super(context, owner, init, hostUri, nodeUri, laneUri, prio, rate, body, flags, observers);
  }

  protected copy(context: DownlinkContext, owner: DownlinkOwner | undefined,
                 hostUri: Uri, nodeUri: Uri, laneUri: Uri, prio: number, rate: number,
                 body: Value, flags: number, observers: ReadonlyArray<EventDownlinkObserver> | null): this {
    return new EventDownlink(context, owner, void 0, hostUri, nodeUri, laneUri,
                             prio, rate, body, flags, observers) as this;
  }

  type(): DownlinkType {
    return "event";
  }

  observe(observer: EventDownlinkObserver): this {
    return super.observe(observer);
  }

  open(): this {
    const laneUri = this._laneUri;
    if (laneUri.isEmpty()) {
      throw new Error("no lane");
    }
    let nodeUri = this._nodeUri;
    if (nodeUri.isEmpty()) {
      throw new Error("no node");
    }
    let hostUri = this._hostUri;
    if (hostUri.isEmpty()) {
      hostUri = nodeUri.endpoint();
      nodeUri = hostUri.unresolve(nodeUri);
    }
    let model = this._context.getDownlink(hostUri, nodeUri, laneUri);
    if (model !== void 0) {
      if (!(model instanceof EventDownlinkModel)) {
        throw new Error("downlink type mismatch");
      }
      model.addDownlink(this);
    } else {
      model = new EventDownlinkModel(this._context, hostUri, nodeUri, laneUri,
                                     this._prio, this._rate, this._body);
      model.addDownlink(this);
      this._context.openDownlink(model);
    }
    this._model = model as EventDownlinkModel;
    if (this._owner !== void 0) {
      this._owner.addDownlink(this);
    }
    return this;
  }
}
