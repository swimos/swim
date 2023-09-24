// Copyright 2015-2023 Nstream, inc.
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

import type {Mutable} from "@swim/util";
import type {Class} from "@swim/util";
import type {Proto} from "@swim/util";
import type {Fastener} from "@swim/component";
import {Value} from "@swim/structure";
import {WarpDownlinkContext} from "./WarpDownlinkContext";
import type {WarpDownlinkDescriptor} from "./WarpDownlink";
import type {WarpDownlinkClass} from "./WarpDownlink";
import type {WarpDownlinkObserver} from "./WarpDownlink";
import {WarpDownlink} from "./WarpDownlink";
import {EventDownlinkModel} from "./EventDownlinkModel";

/** @public */
export interface EventDownlinkDescriptor<R> extends WarpDownlinkDescriptor<R> {
  extends?: Proto<EventDownlink<any, any, any>> | boolean | null;
}

/** @public */
export interface EventDownlinkClass<F extends EventDownlink<any, any, any> = EventDownlink<any, any, any>> extends WarpDownlinkClass<F> {
}

/** @public */
export interface EventDownlinkObserver<F extends EventDownlink<any, any, any> = EventDownlink<any, any, any>> extends WarpDownlinkObserver<F> {
}

/** @public */
export interface EventDownlink<R = any, O = any, I extends any[] = [O]> extends WarpDownlink<R, O, I> {
  /** @override */
  get descriptorType(): Proto<EventDownlinkDescriptor<R>>;

  /** @override */
  readonly observerType?: Class<EventDownlinkObserver>;

  /** @internal @override */
  readonly model: EventDownlinkModel | null;

  /** @override */
  open(): this;
}

/** @public */
export const EventDownlink = (<R, F extends EventDownlink<any, any, any>>() => WarpDownlink.extend<EventDownlink<R>, EventDownlinkClass<F>>("EventDownlink", {
  relinks: true,

  open(): typeof this {
    if (this.model !== null) {
      return this;
    }
    const laneUri = this.getLaneUri();
    if (laneUri === null) {
      throw new Error("no laneUri");
    }
    let nodeUri = this.getNodeUri();
    if (nodeUri === null) {
      throw new Error("no nodeUri");
    }
    let hostUri = this.getHostUri();
    if (hostUri === null) {
      hostUri = nodeUri.endpoint();
      nodeUri = hostUri.unresolve(nodeUri);
    }
    let prio = this.getPrio();
    if (prio === void 0) {
      prio = 0;
    }
    let rate = this.getRate();
    if (rate === void 0) {
      rate = 0;
    }
    let body = this.getBody();
    if (body === null) {
      body = Value.absent();
    }
    const owner = this.owner;
    if (!WarpDownlinkContext[Symbol.hasInstance](owner)) {
      throw new Error("no downlink context");
    }
    let model = owner.getDownlink(hostUri, nodeUri, laneUri);
    if (model !== null) {
      if (!(model instanceof EventDownlinkModel)) {
        throw new Error("downlink type mismatch");
      }
      model.addDownlink(this);
    } else {
      model = new EventDownlinkModel(hostUri, nodeUri, laneUri, prio, rate, body);
      model.addDownlink(this);
      owner.openDownlink(model);
    }
    (this as Mutable<typeof this>).model = model as EventDownlinkModel;
    return this;
  },
},
{
  construct(downlink: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    downlink = super.construct(downlink, owner) as F;
    return downlink;
  },
}))();
