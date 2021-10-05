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

import type {Mutable} from "@swim/util";
import type {FastenerOwner} from "@swim/fastener";
import {Value} from "@swim/structure";
import {Uri} from "@swim/uri";
import type {DownlinkObserver} from "../downlink/Downlink";
import type {EventDownlink} from "../downlink/EventDownlink";
import type {WarpRef} from "../ref/WarpRef";
import {DownlinkFastenerInit, DownlinkFastenerClass, DownlinkFastener} from "./DownlinkFastener";

export interface EventDownlinkFastenerInit extends DownlinkFastenerInit, DownlinkObserver {
  initDownlink?(downlink: EventDownlink): EventDownlink;
}

export type EventDownlinkFastenerDescriptor<O = unknown, I = {}> = ThisType<EventDownlinkFastener<O> & I> & EventDownlinkFastenerInit & Partial<I>;

export interface EventDownlinkFastenerClass<F extends EventDownlinkFastener<any> = EventDownlinkFastener<any>> extends DownlinkFastenerClass<F> {
  create(this: EventDownlinkFastenerClass<F>, owner: FastenerOwner<F>, fastenerName: string): F;

  construct(fastenerClass: EventDownlinkFastenerClass, fastener: F | null, owner: FastenerOwner<F>, fastenerName: string): F;

  extend(this: EventDownlinkFastenerClass<F>, classMembers?: {} | null): EventDownlinkFastenerClass<F>;

  define<O, I = {}>(descriptor: {extends: EventDownlinkFastenerClass | null} & EventDownlinkFastenerDescriptor<O, I>): EventDownlinkFastenerClass<EventDownlinkFastener<any> & I>;
  define<O>(descriptor: EventDownlinkFastenerDescriptor<O>): EventDownlinkFastenerClass<EventDownlinkFastener<any>>;

  <O, I = {}>(descriptor: {extends: EventDownlinkFastenerClass | null} & EventDownlinkFastenerDescriptor<O, I>): PropertyDecorator;
  <O>(descriptor: EventDownlinkFastenerDescriptor<O>): PropertyDecorator;
}

export interface EventDownlinkFastener<O = unknown> extends DownlinkFastener<O> {
  /** @override */
  readonly downlink: EventDownlink | null;

  /** @interna @override */
  createDownlink(warp: WarpRef): EventDownlink;

  /** @internal @override */
  bindDownlink(downlink: EventDownlink): EventDownlink;

  /** @internal */
  initDownlink?(downlink: EventDownlink): EventDownlink;
}

export const EventDownlinkFastener = (function (_super: typeof DownlinkFastener) {
  const EventDownlinkFastener = _super.extend() as EventDownlinkFastenerClass;

  EventDownlinkFastener.prototype.createDownlink = function <V, VU>(this: EventDownlinkFastener<unknown>, warp: WarpRef): EventDownlink {
    return warp.downlink();
  };

  EventDownlinkFastener.construct = function <F extends EventDownlinkFastener<any>>(fastenerClass: EventDownlinkFastenerClass, fastener: F | null, owner: FastenerOwner<F>, fastenerName: string): F {
    fastener = _super.construct(fastenerClass, fastener, owner, fastenerName) as F;
    return fastener;
  };

  EventDownlinkFastener.define = function <O>(descriptor: EventDownlinkFastenerDescriptor<O>): EventDownlinkFastenerClass<EventDownlinkFastener<any>> {
    let superClass = descriptor.extends as EventDownlinkFastenerClass | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    let hostUri = descriptor.hostUri;
    let nodeUri = descriptor.nodeUri;
    let laneUri = descriptor.laneUri;
    let prio = descriptor.prio;
    let rate = descriptor.rate;
    let body = descriptor.body;
    delete descriptor.extends;
    delete descriptor.affinity;
    delete descriptor.inherits;
    delete descriptor.hostUri;
    delete descriptor.nodeUri;
    delete descriptor.laneUri;
    delete descriptor.prio;
    delete descriptor.rate;
    delete descriptor.body;

    if (superClass === void 0 || superClass === null) {
      superClass = this;
    }

    const fastenerClass = superClass.extend(descriptor);

    fastenerClass.construct = function (fastenerClass: EventDownlinkFastenerClass, fastener: EventDownlinkFastener<O> | null, owner: O, fastenerName: string): EventDownlinkFastener<O> {
      fastener = superClass!.construct(fastenerClass, fastener, owner, fastenerName);
      if (affinity !== void 0) {
        fastener.initAffinity(affinity);
      }
      if (inherits !== void 0) {
        fastener.initInherits(inherits);
      }
      if (hostUri !== void 0) {
        (fastener as Mutable<typeof fastener>).ownHostUri = hostUri as Uri;
      }
      if (nodeUri !== void 0) {
        (fastener as Mutable<typeof fastener>).ownNodeUri = nodeUri as Uri;
      }
      if (laneUri !== void 0) {
        (fastener as Mutable<typeof fastener>).ownLaneUri = laneUri as Uri;
      }
      if (prio !== void 0) {
        (fastener as Mutable<typeof fastener>).ownPrio = prio as number;
      }
      if (rate !== void 0) {
        (fastener as Mutable<typeof fastener>).ownRate = rate as number;
      }
      if (body !== void 0) {
        (fastener as Mutable<typeof fastener>).ownBody = body as Value;
      }
      return fastener;
    };

    if (typeof hostUri === "function") {
      fastenerClass.prototype.initHostUri = hostUri;
      hostUri = void 0;
    } else if (hostUri !== void 0) {
      hostUri = Uri.fromAny(hostUri);
    }
    if (typeof nodeUri === "function") {
      fastenerClass.prototype.initNodeUri = nodeUri;
      nodeUri = void 0;
    } else if (nodeUri !== void 0) {
      nodeUri = Uri.fromAny(nodeUri);
    }
    if (typeof laneUri === "function") {
      fastenerClass.prototype.initLaneUri = laneUri;
      laneUri = void 0;
    } else if (laneUri !== void 0) {
      laneUri = Uri.fromAny(laneUri);
    }
    if (typeof prio === "function") {
      fastenerClass.prototype.initPrio = prio;
      prio = void 0;
    }
    if (typeof rate === "function") {
      fastenerClass.prototype.initRate = rate;
      rate = void 0;
    }
    if (typeof body === "function") {
      fastenerClass.prototype.initBody = body;
      body = void 0;
    } else if (body !== void 0) {
      body = Value.fromAny(body);
    }

    return fastenerClass;
  };

  return EventDownlinkFastener;
})(DownlinkFastener);
