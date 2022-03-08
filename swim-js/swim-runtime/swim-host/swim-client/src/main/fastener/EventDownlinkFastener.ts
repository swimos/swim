// Copyright 2015-2022 Swim.inc
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
import type {FastenerOwner} from "@swim/component";
import {Value} from "@swim/structure";
import {Uri} from "@swim/uri";
import type {DownlinkObserver} from "../downlink/Downlink";
import type {EventDownlink} from "../downlink/EventDownlink";
import type {WarpRef} from "../ref/WarpRef";
import {DownlinkFastenerInit, DownlinkFastenerClass, DownlinkFastener} from "./DownlinkFastener";

/** @beta */
export interface EventDownlinkFastenerInit extends DownlinkFastenerInit, DownlinkObserver {
  extends?: {prototype: EventDownlinkFastener<any>} | string | boolean | null;

  initDownlink?(downlink: EventDownlink): EventDownlink;
}

/** @beta */
export type EventDownlinkFastenerDescriptor<O = unknown, I = {}> = ThisType<EventDownlinkFastener<O> & I> & EventDownlinkFastenerInit & Partial<I>;

/** @beta */
export interface EventDownlinkFastenerClass<F extends EventDownlinkFastener<any> = EventDownlinkFastener<any>> extends DownlinkFastenerClass<F> {
}

/** @beta */
export interface EventDownlinkFastenerFactory<F extends EventDownlinkFastener<any> = EventDownlinkFastener<any>> extends EventDownlinkFastenerClass<F> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): EventDownlinkFastenerFactory<F> & I;

  define<O>(className: string, descriptor: EventDownlinkFastenerDescriptor<O>): EventDownlinkFastenerFactory<EventDownlinkFastener<any>>;
  define<O, I = {}>(className: string, descriptor: {implements: unknown} & EventDownlinkFastenerDescriptor<O, I>): EventDownlinkFastenerFactory<EventDownlinkFastener<any> & I>;

  <O>(descriptor: EventDownlinkFastenerDescriptor<O>): PropertyDecorator;
  <O, I = {}>(descriptor: {implements: unknown} & EventDownlinkFastenerDescriptor<O, I>): PropertyDecorator;
}

/** @beta */
export interface EventDownlinkFastener<O = unknown> extends DownlinkFastener<O> {
  /** @override */
  readonly downlink: EventDownlink | null;

  /** @internal @override */
  createDownlink(warp: WarpRef): EventDownlink;

  /** @internal @override */
  bindDownlink(downlink: EventDownlink): EventDownlink;

  /** @internal */
  initDownlink?(downlink: EventDownlink): EventDownlink;
}

/** @beta */
export const EventDownlinkFastener = (function (_super: typeof DownlinkFastener) {
  const EventDownlinkFastener: EventDownlinkFastenerFactory = _super.extend("EventDownlinkFastener");

  EventDownlinkFastener.prototype.createDownlink = function <V, VU>(this: EventDownlinkFastener<unknown>, warp: WarpRef): EventDownlink {
    return warp.downlink();
  };

  EventDownlinkFastener.construct = function <F extends EventDownlinkFastener<any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>): F {
    fastener = _super.construct(fastenerClass, fastener, owner) as F;
    return fastener;
  };

  EventDownlinkFastener.define = function <O>(className: string, descriptor: EventDownlinkFastenerDescriptor<O>): EventDownlinkFastenerFactory<EventDownlinkFastener<any>> {
    let superClass = descriptor.extends as EventDownlinkFastenerFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    let hostUri = descriptor.hostUri;
    let nodeUri = descriptor.nodeUri;
    let laneUri = descriptor.laneUri;
    let prio = descriptor.prio;
    let rate = descriptor.rate;
    let body = descriptor.body;
    delete descriptor.extends;
    delete descriptor.implements;
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

    const fastenerClass = superClass.extend(className, descriptor);

    fastenerClass.construct = function (fastenerClass: {prototype: EventDownlinkFastener<any>}, fastener: EventDownlinkFastener<O> | null, owner: O): EventDownlinkFastener<O> {
      fastener = superClass!.construct(fastenerClass, fastener, owner);
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
