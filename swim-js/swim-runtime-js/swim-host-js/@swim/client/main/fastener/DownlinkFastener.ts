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

import {Mutable, Class, Equals, Arrays, ConsumerType, Consumable, Consumer} from "@swim/util";
import {FastenerOwner, FastenerFlags, FastenerInit, FastenerClass, Fastener} from "@swim/fastener";
import {AnyValue, Value} from "@swim/structure";
import {AnyUri, Uri} from "@swim/uri";
import type {DownlinkObserver, Downlink} from "../downlink/Downlink";
import type {WarpRef} from "../ref/WarpRef";
import type {DownlinkFastenerContext} from "./DownlinkFastenerContext";

export interface DownlinkFastenerInit extends FastenerInit, DownlinkObserver {
  consumed?: boolean;

  hostUri?: AnyUri | (() => AnyUri | null);
  nodeUri?: AnyUri | (() => AnyUri | null);
  laneUri?: AnyUri | (() => AnyUri | null);
  prio?: number | (() => number | undefined);
  rate?: number | (() => number | undefined);
  body?: AnyValue | (() => AnyValue | null);

  willConsume?(conssumer: unknown): void;
  didConsume?(conssumer: unknown): void;
  willUnconsume?(conssumer: unknown): void;
  didUnconsume?(conssumer: unknown): void;
  willStartConsuming?(): void;
  didStartConsuming?(): void;
  willStopConsuming?(): void;
  didStopConsuming?(): void;

  initDownlink?(downlink: Downlink): Downlink;
}

export type DownlinkFastenerDescriptor<O = unknown, I = {}> = ThisType<DownlinkFastener<O> & I> & DownlinkFastenerInit & Partial<I>;

export interface DownlinkFastenerClass<F extends DownlinkFastener<any> = DownlinkFastener<any>> extends FastenerClass<F> {
  create(this: DownlinkFastenerClass<F>, owner: FastenerOwner<F>, fastenerName: string): F;

  construct(fastenerClass: DownlinkFastenerClass, fastener: F | null, owner: FastenerOwner<F>, fastenerName: string): F;

  extend(this: DownlinkFastenerClass<F>, classMembers?: {} | null): DownlinkFastenerClass<F>;

  define<O, I = {}>(descriptor: {extends: DownlinkFastenerClass | null} & DownlinkFastenerDescriptor<O, I>): DownlinkFastenerClass<DownlinkFastener<any> & I>;
  define<O>(descriptor: DownlinkFastenerDescriptor<O>): DownlinkFastenerClass<DownlinkFastener<any>>;

  <O, I = {}>(descriptor: {extends: DownlinkFastenerClass | null} & DownlinkFastenerDescriptor<O, I>): PropertyDecorator;
  <O>(descriptor: DownlinkFastenerDescriptor<O>): PropertyDecorator;

  /** @internal */
  readonly ConsumingFlag: FastenerFlags;
  /** @internal */
  readonly PendingFlag: FastenerFlags;
  /** @internal */
  readonly RelinkMask: FastenerFlags;

  /** @internal @override */
  readonly FlagShift: number;
  /** @internal @override */
  readonly FlagMask: FastenerFlags;
}

export interface DownlinkFastener<O = unknown> extends Fastener<O>, Consumable {
  /** @override */
  get familyType(): Class<DownlinkFastener<any>> | null;

  /** @override */
  readonly consumerType?: Class<Consumer>;

  /** @protected @override */
  onInherit(superFastener: Fastener): void;

  /** @internal */
  readonly ownHostUri: Uri | null;

  hostUri(): Uri | null;
  hostUri(hostUri: AnyUri | null): this;

  /** @internal */
  readonly ownNodeUri: Uri | null;

  nodeUri(): Uri | null;
  nodeUri(nodeUri: AnyUri | null): this;

  /** @internal */
  readonly ownLaneUri: Uri | null;

  laneUri(): Uri | null;
  laneUri(laneUri: AnyUri | null): this;

  /** @internal */
  readonly ownPrio: number | undefined;

  prio(): number | undefined;
  prio(prio: number | undefined): this;

  /** @internal */
  readonly ownRate: number | undefined;

  rate(): number | undefined;
  rate(rate: number | undefined): this;

  /** @internal */
  readonly ownBody: Value | null;

  body(): Value | null;
  body(body: AnyValue | null): this;

  /** @internal */
  readonly ownWarp: WarpRef | null;

  warp(): WarpRef | null;
  warp(warp: WarpRef | null): this;

  readonly downlink: Downlink | null;

  /** @internal */
  link(): void;

  /** @internal */
  unlink(): void;

  /** @internal */
  relink(): void;

  /** @internal @abstract*/
  createDownlink(warp: WarpRef): Downlink;

  /** @internal */
  bindDownlink(downlink: Downlink): Downlink;

  /** @override */
  recohere(t: number): void;

  /** @internal */
  readonly consumers: ReadonlyArray<ConsumerType<this>>;

  /** @override */
  consume(consumer: ConsumerType<this>): void

  /** @protected */
  willConsume(consumer: ConsumerType<this>): void;

  /** @protected */
  onConsume(consumer: ConsumerType<this>): void;

  /** @protected */
  didConsume(consumer: ConsumerType<this>): void;

  /** @override */
  unconsume(consumer: ConsumerType<this>): void

  /** @protected */
  willUnconsume(consumer: ConsumerType<this>): void;

  /** @protected */
  onUnconsume(consumer: ConsumerType<this>): void;

  /** @protected */
  didUnconsume(consumer: ConsumerType<this>): void;

  get consuming(): boolean;

  /** @internal */
  startConsuming(): void;

  /** @protected */
  willStartConsuming(): void;

  /** @protected */
  onStartConsuming(): void;

  /** @protected */
  didStartConsuming(): void;

  /** @internal */
  stopConsuming(): void;

  /** @protected */
  willStopConsuming(): void;

  /** @protected */
  onStopConsuming(): void;

  /** @protected */
  didStopConsuming(): void;

  /** @protected @override */
  onMount(): void;

  /** @protected @override */
  onUnmount(): void;

  /** @internal */
  initDownlink?(downlink: Downlink): Downlink;

  /** @internal */
  initHostUri?(): AnyUri | null;

  /** @internal */
  initNodeUri?(): AnyUri | null;

  /** @internal */
  initLaneUri?(): AnyUri | null;

  /** @internal */
  initPrio?(): number | undefined;

  /** @internal */
  initRate?(): number | undefined;

  /** @internal */
  initBody?(): AnyValue | null;

  /** @internal @protected */
  get consumed(): boolean | undefined; // optional prototype property
}

export const DownlinkFastener = (function (_super: typeof Fastener) {
  const DownlinkFastener = _super.extend() as DownlinkFastenerClass;

  Object.defineProperty(DownlinkFastener.prototype, "familyType", {
    get: function (this: DownlinkFastener): Class<DownlinkFastener<any>> | null {
      return DownlinkFastener;
    },
    configurable: true,
  });

  DownlinkFastener.prototype.onInherit = function (this: DownlinkFastener, superFastener: DownlinkFastener): void {
    // hook
  };

  DownlinkFastener.prototype.hostUri = function (this: DownlinkFastener<unknown>, hostUri?: AnyUri | null): Uri | null | typeof this {
    if (hostUri === void 0) {
      if (this.ownHostUri !== null) {
        return this.ownHostUri;
      } else {
        hostUri = this.initHostUri !== void 0 ? this.initHostUri() : null;
        if (hostUri !== null) {
          hostUri = Uri.fromAny(hostUri);
          (this as Mutable<typeof this>).ownHostUri = hostUri as Uri;
        }
        return hostUri as Uri | null;
      }
    } else {
      if (hostUri !== null) {
        hostUri = Uri.fromAny(hostUri);
      }
      if (!Equals(this.ownHostUri, hostUri)) {
        (this as Mutable<typeof this>).ownHostUri = hostUri as Uri | null;
        this.relink();
      }
      return this;
    }
  } as typeof DownlinkFastener.prototype.hostUri;

  DownlinkFastener.prototype.nodeUri = function (this: DownlinkFastener<unknown>, nodeUri?: AnyUri | null): Uri | null | typeof this {
    if (nodeUri === void 0) {
      if (this.ownNodeUri !== null) {
        return this.ownNodeUri;
      } else {
        nodeUri = this.initNodeUri !== void 0 ? this.initNodeUri() : null;
        if (nodeUri !== null) {
          nodeUri = Uri.fromAny(nodeUri);
          (this as Mutable<typeof this>).ownNodeUri = nodeUri as Uri;
        }
        return nodeUri as Uri | null;
      }
    } else {
      if (nodeUri !== null) {
        nodeUri = Uri.fromAny(nodeUri);
      }
      if (!Equals(this.ownNodeUri, nodeUri)) {
        (this as Mutable<typeof this>).ownNodeUri = nodeUri as Uri | null;
        this.relink();
      }
      return this;
    }
  } as typeof DownlinkFastener.prototype.nodeUri;

  DownlinkFastener.prototype.laneUri = function (this: DownlinkFastener<unknown>, laneUri?: AnyUri | null): Uri | null | typeof this {
    if (laneUri === void 0) {
      if (this.ownLaneUri !== null) {
        return this.ownLaneUri;
      } else {
        laneUri = this.initLaneUri !== void 0 ? this.initLaneUri() : null;
        if (laneUri !== null) {
          laneUri = Uri.fromAny(laneUri);
          (this as Mutable<typeof this>).ownLaneUri = laneUri as Uri;
        }
        return laneUri as Uri | null;
      }
    } else {
      if (laneUri !== null) {
        laneUri = Uri.fromAny(laneUri);
      }
      if (!Equals(this.ownLaneUri, laneUri)) {
        (this as Mutable<typeof this>).ownLaneUri = laneUri as Uri | null;
        this.relink();
      }
      return this;
    }
  } as typeof DownlinkFastener.prototype.laneUri;

  DownlinkFastener.prototype.prio = function (this: DownlinkFastener<unknown>, prio?: number | undefined): number | undefined | typeof this {
    if (arguments.length === 0) {
      if (this.ownPrio !== void 0) {
        return this.ownPrio;
      } else {
        prio = this.initPrio !== void 0 ? this.initPrio() : void 0;
        if (prio !== void 0) {
          (this as Mutable<typeof this>).ownPrio = prio;
        }
        return prio;
      }
    } else {
      if (this.ownPrio !== prio) {
        (this as Mutable<typeof this>).ownPrio = prio;
        this.relink();
      }
      return this;
    }
  } as typeof DownlinkFastener.prototype.prio;

  DownlinkFastener.prototype.rate = function (this: DownlinkFastener<unknown>, rate?: number | undefined): number | undefined | typeof this {
    if (arguments.length === 0) {
      if (this.ownRate !== void 0) {
        return this.ownRate;
      } else {
        rate = this.initRate !== void 0 ? this.initRate() : void 0;
        if (rate !== void 0) {
          (this as Mutable<typeof this>).ownRate = rate;
        }
        return rate;
      }
    } else {
      if (this.ownRate !== rate) {
        (this as Mutable<typeof this>).ownRate = rate;
        this.relink();
      }
      return this;
    }
  } as typeof DownlinkFastener.prototype.rate;

  DownlinkFastener.prototype.body = function (this: DownlinkFastener<unknown>, body?: AnyValue | null): Value | null | typeof this {
    if (body === void 0) {
      if (this.ownBody !== null) {
        return this.ownBody;
      } else {
        body = this.initBody !== void 0 ? this.initBody() : null;
        if (body !== null) {
          body = Value.fromAny(body);
          (this as Mutable<typeof this>).ownBody = body;
        }
        return body;
      }
    } else {
      if (body !== null) {
        body = Value.fromAny(body);
      }
      if (!Equals(this.ownBody, body)) {
        (this as Mutable<typeof this>).ownBody = body;
        this.relink();
      }
      return this;
    }
  } as typeof DownlinkFastener.prototype.body;

  DownlinkFastener.prototype.warp = function (this: DownlinkFastener<unknown>, warp?: WarpRef | null): WarpRef | null | typeof this {
    if (warp === void 0) {
      return this.ownWarp;
    } else {
      if (this.ownWarp !== warp) {
        (this as Mutable<typeof this>).ownWarp = warp;
        this.relink();
      }
      return this;
    }
  } as typeof DownlinkFastener.prototype.warp;

  DownlinkFastener.prototype.link = function (this: DownlinkFastener<DownlinkFastenerContext>): void {
    if (this.downlink === null) {
      let warp = this.ownWarp;
      if (warp === null) {
        warp = this.owner.warpRef.state;
      }
      if (warp === null) {
        warp = this.owner.warpProvider.service.client;
      }
      let downlink = this.createDownlink(warp);
      downlink = this.bindDownlink(downlink);
      if (this.initDownlink !== void 0) {
        downlink = this.initDownlink(downlink);
      }
      downlink = downlink.observe(this as DownlinkObserver);
      (this as Mutable<typeof this>).downlink = downlink.open();
      this.setFlags(this.flags & ~DownlinkFastener.PendingFlag);
    }
  };

  DownlinkFastener.prototype.unlink = function (this: DownlinkFastener<unknown>): void {
    const downlink = this.downlink;
    if (downlink !== null) {
      downlink.close();
      (this as Mutable<typeof this>).downlink = null;
      this.setFlags(this.flags | DownlinkFastener.PendingFlag);
    }
  };

  DownlinkFastener.prototype.relink = function (this: DownlinkFastener<unknown>): void {
    this.setFlags(this.flags | DownlinkFastener.PendingFlag);
    if ((this.flags & DownlinkFastener.ConsumingFlag) !== 0) {
      this.setCoherent(false);
      this.decohere();
    }
  };

  DownlinkFastener.prototype.bindDownlink = function (this: DownlinkFastener<unknown>, downlink: Downlink): Downlink {
    const hostUri = this.hostUri();
    if (hostUri !== null) {
      downlink = downlink.hostUri(hostUri);
    }
    const nodeUri = this.nodeUri();
    if (nodeUri !== null) {
      downlink = downlink.nodeUri(nodeUri);
    }
    const laneUri = this.laneUri();
    if (laneUri !== null) {
      downlink = downlink.laneUri(laneUri);
    }
    const prio = this.prio();
    if (prio !== void 0) {
      downlink = downlink.prio(prio);
    }
    const rate = this.rate();
    if (rate !== void 0) {
      downlink = downlink.rate(rate);
    }
    const body = this.body();
    if (body !== null) {
      downlink = downlink.body(body);
    }
    return downlink;
  };

  DownlinkFastener.prototype.recohere = function (this: DownlinkFastener<unknown>, t: number): void {
    this.setCoherent(true);
    if (this.downlink !== null && (this.flags & DownlinkFastener.RelinkMask) === DownlinkFastener.RelinkMask) {
      this.unlink();
      this.link();
    } else if (this.downlink === null && (this.flags & DownlinkFastener.ConsumingFlag) !== 0) {
      this.link();
    } else if (this.downlink !== null && (this.flags & DownlinkFastener.ConsumingFlag) === 0) {
      this.unlink();
    }
  };

  DownlinkFastener.prototype.consume = function (this: DownlinkFastener<unknown>, downlinkConsumer: ConsumerType<typeof this>): void {
    const oldConsumers = this.consumers;
    const newConsumerrss = Arrays.inserted(downlinkConsumer, oldConsumers);
    if (oldConsumers !== newConsumerrss) {
      this.willConsume(downlinkConsumer);
      (this as Mutable<typeof this>).consumers = newConsumerrss;
      this.onConsume(downlinkConsumer);
      this.didConsume(downlinkConsumer);
      if (oldConsumers.length === 0) {
        this.startConsuming();
      }
    }
  };

  DownlinkFastener.prototype.willConsume = function (this: DownlinkFastener<unknown>, downlinkConsumer: ConsumerType<typeof this>): void {
    // hook
  }

  DownlinkFastener.prototype.onConsume = function (this: DownlinkFastener<unknown>, downlinkConsumer: ConsumerType<typeof this>): void {
    // hook
  };

  DownlinkFastener.prototype.didConsume = function (this: DownlinkFastener<unknown>, downlinkConsumer: ConsumerType<typeof this>): void {
    // hook
  };

  DownlinkFastener.prototype.unconsume = function (this: DownlinkFastener<unknown>, downlinkConsumer: ConsumerType<typeof this>): void {
    const oldConsumers = this.consumers;
    const newConsumerrss = Arrays.removed(downlinkConsumer, oldConsumers);
    if (oldConsumers !== newConsumerrss) {
      this.willUnconsume(downlinkConsumer);
      (this as Mutable<typeof this>).consumers = newConsumerrss;
      this.onUnconsume(downlinkConsumer);
      this.didUnconsume(downlinkConsumer);
      if (newConsumerrss.length === 0) {
        this.stopConsuming();
      }
    }
  };

  DownlinkFastener.prototype.willUnconsume = function (this: DownlinkFastener<unknown>, downlinkConsumer: ConsumerType<typeof this>): void {
    // hook
  };

  DownlinkFastener.prototype.onUnconsume = function (this: DownlinkFastener<unknown>, downlinkConsumer: ConsumerType<typeof this>): void {
    // hook
  };

  DownlinkFastener.prototype.didUnconsume = function (this: DownlinkFastener<unknown>, downlinkConsumer: ConsumerType<typeof this>): void {
    // hook
  };

  Object.defineProperty(DownlinkFastener.prototype, "consuming", {
    get(this: DownlinkFastener<unknown>): boolean {
      return (this.flags & DownlinkFastener.ConsumingFlag) !== 0;
    },
    configurable: true,
  })

  DownlinkFastener.prototype.startConsuming = function (this: DownlinkFastener<unknown>): void {
    if ((this.flags & DownlinkFastener.ConsumingFlag) === 0) {
      this.willStartConsuming();
      this.setFlags(this.flags | DownlinkFastener.ConsumingFlag);
      this.onStartConsuming();
      this.didStartConsuming();
    }
  };

  DownlinkFastener.prototype.willStartConsuming = function (this: DownlinkFastener<unknown>): void {
    // hook
  };

  DownlinkFastener.prototype.onStartConsuming = function (this: DownlinkFastener<unknown>): void {
    this.setCoherent(false);
    this.decohere();
  };

  DownlinkFastener.prototype.didStartConsuming = function (this: DownlinkFastener<unknown>): void {
    // hook
  };

  DownlinkFastener.prototype.stopConsuming = function (this: DownlinkFastener<unknown>): void {
    if ((this.flags & DownlinkFastener.ConsumingFlag) !== 0) {
      this.willStopConsuming();
      this.setFlags(this.flags & ~DownlinkFastener.ConsumingFlag);
      this.onStopConsuming();
      this.didStopConsuming();
    }
  };

  DownlinkFastener.prototype.willStopConsuming = function (this: DownlinkFastener<unknown>): void {
    // hook
  };

  DownlinkFastener.prototype.onStopConsuming = function (this: DownlinkFastener<unknown>): void {
    this.setCoherent(false);
    this.decohere();
  };

  DownlinkFastener.prototype.didStopConsuming = function (this: DownlinkFastener<unknown>): void {
    // hook
  };

  DownlinkFastener.prototype.onMount = function (this: DownlinkFastener<unknown>): void {
    _super.prototype.onMount.call(this);
    if ((this.flags & DownlinkFastener.ConsumingFlag) !== 0) {
      this.setCoherent(false);
      this.decohere();
    }
  };

  DownlinkFastener.prototype.onUnmount = function (this: DownlinkFastener<unknown>): void {
    _super.prototype.onUnmount.call(this);
    this.unlink();
  };

  DownlinkFastener.construct = function <F extends DownlinkFastener<any>>(fastenerClass: DownlinkFastenerClass, fastener: F | null, owner: FastenerOwner<F>, fastenerName: string): F {
    fastener = _super.construct(fastenerClass, fastener, owner, fastenerName) as F;
    (fastener as Mutable<typeof fastener>).ownHostUri = null;
    (fastener as Mutable<typeof fastener>).ownNodeUri = null;
    (fastener as Mutable<typeof fastener>).ownLaneUri = null;
    (fastener as Mutable<typeof fastener>).ownPrio = void 0;
    (fastener as Mutable<typeof fastener>).ownRate = void 0;
    (fastener as Mutable<typeof fastener>).ownBody = null;
    (fastener as Mutable<typeof fastener>).ownWarp = null;
    (fastener as Mutable<typeof fastener>).downlink = null;
    (fastener as Mutable<typeof fastener>).consumers = Arrays.empty;
    return fastener;
  };

  DownlinkFastener.define = function <O>(descriptor: DownlinkFastenerDescriptor<O>): DownlinkFastenerClass<DownlinkFastener<any>> {
    let superClass = descriptor.extends as DownlinkFastenerClass | undefined;
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

    fastenerClass.construct = function (fastenerClass: DownlinkFastenerClass, fastener: DownlinkFastener<O> | null, owner: O, fastenerName: string): DownlinkFastener<O> {
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

  (DownlinkFastener as Mutable<typeof DownlinkFastener>).ConsumingFlag = 1 << (_super.FlagShift + 0);
  (DownlinkFastener as Mutable<typeof DownlinkFastener>).PendingFlag = 1 << (_super.FlagShift + 1);
  (DownlinkFastener as Mutable<typeof DownlinkFastener>).RelinkMask = DownlinkFastener.ConsumingFlag | DownlinkFastener.PendingFlag;

  (DownlinkFastener as Mutable<typeof DownlinkFastener>).FlagShift = _super.FlagShift + 2;
  (DownlinkFastener as Mutable<typeof DownlinkFastener>).FlagMask = (1 << DownlinkFastener.FlagShift) - 1;

  return DownlinkFastener;
})(Fastener);

