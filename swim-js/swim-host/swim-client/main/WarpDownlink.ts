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
import {Equals} from "@swim/util";
import {Objects} from "@swim/util";
import type {Observes} from "@swim/util";
import type {Observable} from "@swim/util";
import type {ObserverMethods} from "@swim/util";
import type {ObserverParameters} from "@swim/util";
import type {Observer} from "@swim/util";
import type {Consumer} from "@swim/util";
import type {Consumable} from "@swim/util";
import type {FastenerFlags} from "@swim/component";
import type {FastenerDescriptor} from "@swim/component";
import type {FastenerClass} from "@swim/component";
import {Fastener} from "@swim/component";
import type {ValueLike} from "@swim/structure";
import {Value} from "@swim/structure";
import type {UriLike} from "@swim/uri";
import {Uri} from "@swim/uri";
import type {EventMessage} from "@swim/warp";
import type {LinkRequest} from "@swim/warp";
import type {LinkedResponse} from "@swim/warp";
import type {SyncRequest} from "@swim/warp";
import type {SyncedResponse} from "@swim/warp";
import type {UnlinkRequest} from "@swim/warp";
import type {UnlinkedResponse} from "@swim/warp";
import type {WarpDownlinkContext} from "./WarpDownlinkContext";
import type {WarpDownlinkModel} from "./WarpDownlinkModel";

/** @public */
export interface WarpDownlinkDescriptor<R> extends FastenerDescriptor<R> {
  extends?: Proto<WarpDownlink<any>> | boolean | null;
  consumed?: boolean;
  hostUri?: UriLike | null;
  nodeUri?: UriLike | null;
  laneUri?: UriLike | null;
  prio?: number;
  rate?: number;
  body?: ValueLike | null;
  relinks?: boolean;
  syncs?: boolean;
}

/** @public */
export interface WarpDownlinkClass<F extends WarpDownlink<any> = WarpDownlink<any>> extends FastenerClass<F> {
  /** @internal */
  readonly RelinksFlag: FastenerFlags;
  /** @internal */
  readonly SyncsFlag: FastenerFlags;
  /** @internal */
  readonly ConsumingFlag: FastenerFlags;

  /** @internal @override */
  readonly FlagShift: number;
  /** @internal @override */
  readonly FlagMask: FastenerFlags;
}

/** @public */
export interface WarpDownlinkObserver<F extends WarpDownlink<any> = WarpDownlink<any>> extends Observer<F> {
  onEvent?(body: Value, downlink: F): void;

  onCommand?(body: Value, downlink: F): void;

  willLink?(downlink: F): void;

  didLink?(downlink: F): void;

  willSync?(downlink: F): void;

  didSync?(downlink: F): void;

  willUnlink?(downlink: F): void;

  didUnlink?(downlink: F): void;

  didConnect?(downlink: F): void;

  didDisconnect?(downlink: F): void;

  didClose?(downlink: F): void;

  didFail?(error: unknown, downlink: F): void;
}

/** @public */
export interface WarpDownlink<R = any, O = any, I extends any[] = [O]> extends Fastener<R, O, I>, Observable, Consumable {
  /** @override */
  get descriptorType(): Proto<WarpDownlinkDescriptor<R>>;

  /** @override */
  get fastenerType(): Proto<WarpDownlink<any>>;

  /** @override */
  readonly observerType?: Class<WarpDownlinkObserver<any>>;

  /** @protected */
  readonly consumed?: boolean; // optional prototype property

  /** @internal */
  readonly model: WarpDownlinkModel | null;

  /** @protected */
  initHostUri(): Uri | null;

  readonly hostUri: Uri | null;

  getHostUri(): Uri | null;

  setHostUri(hostUri: UriLike | null): this;

  /** @protected */
  initNodeUri(): Uri | null;

  readonly nodeUri: Uri | null;

  getNodeUri(): Uri | null;

  setNodeUri(nodeUri: UriLike | null): this;

  /** @protected */
  initLaneUri(): Uri | null;

  readonly laneUri: Uri | null;

  getLaneUri(): Uri | null;

  setLaneUri(laneUri: UriLike | null): this;

  /** @protected */
  initPrio(): number | undefined;

  readonly prio: number | undefined;

  getPrio(): number | undefined;

  setPrio(prio: number | undefined): this;

  /** @protected */
  initRate(): number | undefined;

  readonly rate: number | undefined;

  getRate(): number | undefined;

  setRate(rate: number | undefined): this;

  /** @protected */
  initBody(): Value | null;

  readonly body: Value | null;

  getBody(): Value | null;

  setBody(body: ValueLike | null): this;

  get relinks(): boolean;

  relink(relinks?: boolean): this;

  get syncs(): boolean;

  sync(syncs?: boolean): this;

  get opened(): boolean;

  get online(): boolean;

  get connected(): boolean;

  get authenticated(): boolean;

  get deauthenticated(): boolean;

  get linked(): boolean;

  get synced(): boolean;

  get session(): Value;

  command(body: ValueLike): void;

  /** @protected */
  onEvent(body: Value): void;

  /** @protected */
  onCommand(body: Value): void;

  /** @protected */
  willLink(): void;

  /** @protected */
  didLink(): void;

  /** @protected */
  willSync(): void;

  /** @protected */
  didSync(): void;

  /** @protected */
  willUnlink(): void;

  /** @protected */
  didUnlink(): void;

  /** @protected */
  didConnect(): void;

  /** @protected */
  didDisconnect(): void;

  /** @protected */
  didClose(): void;

  /** @protected */
  didFail(error: unknown): void;

  /** @internal */
  onEventMessage(message: EventMessage): void;

  /** @internal */
  onCommandMessage(body: Value): void;

  /** @internal */
  onLinkRequest(request?: LinkRequest): void;

  /** @internal */
  onLinkedResponse(response?: LinkedResponse): void;

  /** @internal */
  onSyncRequest(request?: SyncRequest): void;

  /** @internal */
  onSyncedResponse(response?: SyncedResponse): void;

  /** @internal */
  onUnlinkRequest(request?: UnlinkRequest): void;

  /** @internal */
  onUnlinkedResponse(response?: UnlinkedResponse): void;

  /** @internal */
  hostDidConnect(): void;

  /** @internal */
  hostDidDisconnect(): void;

  /** @internal */
  hostDidFail(error: unknown): void;

  /** @internal */
  readonly observers: ReadonlySet<Observes<this>> | null;

  /** @override */
  observe(observer: Observes<this>): void;

  /** @protected */
  willObserve(observer: Observes<this>): void;

  /** @protected */
  onObserve(observer: Observes<this>): void;

  /** @protected */
  didObserve(observer: Observes<this>): void;

  /** @override */
  unobserve(observer: Observes<this>): void;

  /** @protected */
  willUnobserve(observer: Observes<this>): void;

  /** @protected */
  onUnobserve(observer: Observes<this>): void;

  /** @protected */
  didUnobserve(observer: Observes<this>): void;

  callObservers<R, K extends keyof ObserverMethods<R>>(this: {readonly observerType?: Class<R>}, key: K, ...args: ObserverParameters<R, K>): void;

  /** @internal */
  readonly consumers: ReadonlySet<Consumer> | null;

  /** @override */
  consume(consumer: Consumer): void;

  /** @protected */
  willConsume(consumer: Consumer): void;

  /** @protected */
  onConsume(consumer: Consumer): void;

  /** @protected */
  didConsume(consumer: Consumer): void;

  /** @override */
  unconsume(consumer: Consumer): void;

  /** @protected */
  willUnconsume(consumer: Consumer): void;

  /** @protected */
  onUnconsume(consumer: Consumer): void;

  /** @protected */
  didUnconsume(consumer: Consumer): void;

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

  /** @abstract */
  open(): this;

  close(): void;

  /** @internal */
  reopen(): void;

  /** @override */
  recohere(t: number): void;

  /** @protected @override */
  onMount(): void;

  /** @protected @override */
  onUnmount(): void;
}

/** @public */
export const WarpDownlink = (<R, F extends WarpDownlink<any>>() => Fastener.extend<WarpDownlink<R>, WarpDownlinkClass<F>>("WarpDownlink", {
  get fastenerType(): Proto<WarpDownlink<any>> {
    return WarpDownlink;
  },

  initHostUri(): Uri | null {
    let hostUri: Uri | null | undefined = (Object.getPrototypeOf(this) as WarpDownlink<any>).hostUri;
    if (hostUri === void 0) {
      hostUri = null;
    }
    return hostUri;
  },

  getHostUri(): Uri | null {
    let hostUri = this.hostUri;
    if (hostUri === null && Objects.hasAllKeys<WarpDownlinkContext>(this.owner, "hostUri")) {
      hostUri = this.owner.hostUri.value;
    }
    return hostUri;
  },

  setHostUri(hostUri: UriLike | null): WarpDownlink<any> {
    if (hostUri !== null) {
      hostUri = Uri.fromLike(hostUri);
    }
    if (!Equals(this.hostUri, hostUri)) {
      (this as Mutable<typeof this>).hostUri = hostUri;
      this.reopen();
    }
    return this;
  },

  initNodeUri(): Uri | null {
    let nodeUri: Uri | null | undefined = (Object.getPrototypeOf(this) as WarpDownlink<any>).nodeUri;
    if (nodeUri === void 0) {
      nodeUri = null;
    }
    return nodeUri;
  },

  getNodeUri(): Uri | null {
    let nodeUri = this.nodeUri;
    if (nodeUri === null && Objects.hasAllKeys<WarpDownlinkContext>(this.owner, "nodeUri")) {
      nodeUri = this.owner.nodeUri.value;
    }
    return nodeUri;
  },

  setNodeUri(nodeUri: UriLike | null): WarpDownlink<any> {
    if (nodeUri !== null) {
      nodeUri = Uri.fromLike(nodeUri);
    }
    if (!Equals(this.nodeUri, nodeUri)) {
      (this as Mutable<typeof this>).nodeUri = nodeUri;
      this.reopen();
    }
    return this;
  },

  initLaneUri(): Uri | null {
    let laneUri: Uri | null | undefined = (Object.getPrototypeOf(this) as WarpDownlink<any>).laneUri;
    if (laneUri === void 0) {
      laneUri = null;
    }
    return laneUri;
  },

  getLaneUri(): Uri | null {
    let laneUri = this.laneUri;
    if (laneUri === null && Objects.hasAllKeys<WarpDownlinkContext>(this.owner, "laneUri")) {
      laneUri = this.owner.laneUri.value;
    }
    return laneUri;
  },

  setLaneUri(laneUri: UriLike | null): WarpDownlink<any> {
    if (laneUri !== null) {
      laneUri = Uri.fromLike(laneUri);
    }
    if (!Equals(this.laneUri, laneUri)) {
      (this as Mutable<typeof this>).laneUri = laneUri;
      this.reopen();
    }
    return this;
  },

  initPrio(): number | undefined {
    return (Object.getPrototypeOf(this) as WarpDownlink).prio;
  },

  getPrio(): number | undefined {
    return this.prio;
  },

  setPrio(prio: number | undefined): WarpDownlink<any> {
    if (this.prio !== prio) {
      (this as Mutable<typeof this>).prio = prio;
      this.reopen();
    }
    return this;
  },

  initRate(): number | undefined {
    return (Object.getPrototypeOf(this) as WarpDownlink).rate;
  },

  getRate(): number | undefined {
    return this.rate;
  },

  setRate(rate: number | undefined): WarpDownlink<any> {
    if (this.rate !== rate) {
      (this as Mutable<typeof this>).rate = rate;
      this.reopen();
    }
    return this;
  },

  initBody(): Value | null {
    let body = (Object.getPrototypeOf(this) as WarpDownlink<any>).body as Value | null | undefined;
    if (body === void 0) {
      body = null;
    }
    return body;
  },

  getBody(): Value | null {
    return this.body;
  },

  setBody(body: ValueLike | null): WarpDownlink<any> {
    if (body !== null) {
      body = Value.fromLike(body);
    }
    if (!Equals(this.body, body)) {
      (this as Mutable<typeof this>).body = body;
      this.reopen();
    }
    return this;
  },

  get relinks(): boolean {
    return (this.flags & WarpDownlink.RelinksFlag) !== 0;
  },

  relink(relinks?: boolean): typeof this {
    if (relinks === void 0) {
      relinks = true;
    }
    const flags = this.flags;
    if (relinks && (flags & WarpDownlink.RelinksFlag) === 0) {
      this.setFlags(flags | WarpDownlink.RelinksFlag);
    } else if (!relinks && (flags & WarpDownlink.RelinksFlag) !== 0) {
      this.setFlags(flags & ~WarpDownlink.RelinksFlag);
    }
    return this;
  },

  get syncs(): boolean {
    return (this.flags & WarpDownlink.SyncsFlag) !== 0;
  },

  sync(syncs?: boolean): typeof this {
    if (syncs === void 0) {
      syncs = true;
    }
    const flags = this.flags;
    if (syncs && (flags & WarpDownlink.SyncsFlag) === 0) {
      this.setFlags(flags | WarpDownlink.SyncsFlag);
    } else if (!syncs && (flags & WarpDownlink.SyncsFlag) !== 0) {
      this.setFlags(flags & ~WarpDownlink.SyncsFlag);
    }
    return this;
  },

  get opened(): boolean {
    return this.model !== null;
  },

  get online(): boolean {
    const model = this.model;
    return model !== null && model.online.value;
  },

  get connected(): boolean {
    const model = this.model;
    return model !== null && model.connected;
  },

  get authenticated(): boolean {
    const model = this.model;
    return model !== null && model.authenticated;
  },

  get deauthenticated(): boolean {
    const model = this.model;
    return model !== null && model.deauthenticated;
  },

  get linked(): boolean {
    const model = this.model;
    return model !== null && model.linked;
  },

  get synced(): boolean {
    const model = this.model;
    return model !== null && model.synced;
  },

  get session(): Value {
    const model = this.model;
    return model !== null ? model.session.value : Value.absent();
  },

  command(body: ValueLike): void {
    const model = this.model;
    if (model === null) {
      throw new Error("unopened downlink");
    }
    model.command(body);
  },

  onEvent(body: Value): void {
    // hook
  },

  onCommand(body: Value): void {
    // hook
  },

  willLink(): void {
    // hook
  },

  didLink(): void {
    // hook
  },

  willSync(): void {
    // hook
  },

  didSync(): void {
    // hook
  },

  willUnlink(): void {
    // hook
  },

  didUnlink(): void {
    // hook
  },

  didConnect(): void {
    // hook
  },

  didDisconnect(): void {
    // hook
  },

  didClose(): void {
    // hook
  },

  didFail(error: unknown): void {
    // hook
  },

  onEventMessage(message: EventMessage): void {
    this.onEvent(message.body);
    this.callObservers("onEvent", message.body, this);
  },

  onCommandMessage(body: Value): void {
    this.onCommand(body);
    this.callObservers("onCommand", body, this);
  },

  onLinkRequest(request?: LinkRequest): void {
    this.willLink();
    this.callObservers("willLink", this);
  },

  onLinkedResponse(response?: LinkedResponse): void {
    this.didLink();
    this.callObservers("didLink", this);
  },

  onSyncRequest(request?: SyncRequest): void {
    this.willSync();
    this.callObservers("willSync", this);
  },

  onSyncedResponse(response?: SyncedResponse): void {
    this.didSync();
    this.callObservers("didSync", this);
  },

  onUnlinkRequest(request?: UnlinkRequest): void {
    this.willUnlink();
    this.callObservers("willUnlink", this);
  },

  onUnlinkedResponse(response?: UnlinkedResponse): void {
    this.didUnlink();
    this.callObservers("didUnlink", this);
  },

  hostDidConnect(): void {
    this.didConnect();
    this.callObservers("didConnect", this);
  },

  hostDidDisconnect(): void {
    this.didDisconnect();
    this.callObservers("didDisconnect", this);
  },

  hostDidFail(error: unknown): void {
    this.didFail(error);
    this.callObservers("didFail", error, this);
  },

  observe(observer: Observes<typeof this>): void {
    let observers = this.observers as Set<Observes<typeof this>> | null;
    if (observers === null) {
      observers = new Set<Observes<typeof this>>();
      (this as Mutable<typeof this>).observers = observers;
    } else if (observers.has(observer)) {
      return;
    }
    this.willObserve(observer);
    observers.add(observer);
    this.onObserve(observer);
    this.didObserve(observer);
  },

  willObserve(observer: Observes<typeof this>): void {
    // hook
  },

  onObserve(observer: Observes<typeof this>): void {
    // hook
  },

  didObserve(observer: Observes<typeof this>): void {
    // hook
  },

  unobserve(observer: Observes<typeof this>): void {
    const observers = this.observers as Set<Observes<typeof this>> | null;
    if (observers === null || !observers.has(observer)) {
      return;
    }
    this.willUnobserve(observer);
    observers.delete(observer);
    this.onUnobserve(observer);
    this.didUnobserve(observer);
  },

  willUnobserve(observer: Observes<typeof this>): void {
    // hook
  },

  onUnobserve(observer: Observes<typeof this>): void {
    // hook
  },

  didUnobserve(observer: Observes<typeof this>): void {
    // hook
  },

  callObservers: function <R, K extends keyof ObserverMethods<R>>(this: {readonly observerType?: Class<R>}, key: K, ...args: ObserverParameters<R, K>): void {
    const observers = (this as WarpDownlink<any>).observers as ReadonlySet<ObserverMethods<R>> | null;
    if (observers === null) {
      return;
    }
    for (const observer of observers) {
      const method = observer[key];
      if (typeof method === "function") {
        method.call(observer, ...args);
      }
    }
  } as any,

  consume(consumer: Consumer): void {
    let consumers = this.consumers as Set<Consumer> | null;
    if (consumers === null) {
      consumers = new Set<Consumer>();
      (this as Mutable<typeof this>).consumers = consumers;
    } else if (consumers.has(consumer)) {
      return;
    }
    this.willConsume(consumer);
    consumers.add(consumer);
    this.onConsume(consumer);
    this.didConsume(consumer);
    if (consumers.size === 1 && this.mounted) {
      this.startConsuming();
    }
  },

  willConsume(consumer: Consumer): void {
    // hook
  },

  onConsume(consumer: Consumer): void {
    // hook
  },

  didConsume(consumer: Consumer): void {
    // hook
  },

  unconsume(consumer: Consumer): void {
    const consumers = this.consumers as Set<Consumer> | null;
    if (consumers === null || !consumers.has(consumer)) {
      return;
    }
    this.willUnconsume(consumer);
    consumers.delete(consumer);
    this.onUnconsume(consumer);
    this.didUnconsume(consumer);
    if (consumers.size === 0) {
      this.stopConsuming();
    }
  },

  willUnconsume(consumer: Consumer): void {
    // hook
  },

  onUnconsume(consumer: Consumer): void {
    // hook
  },

  didUnconsume(consumer: Consumer): void {
    // hook
  },

  get consuming(): boolean {
    return (this.flags & WarpDownlink.ConsumingFlag) !== 0;
  },

  startConsuming(): void {
    if ((this.flags & WarpDownlink.ConsumingFlag) !== 0) {
      return;
    }
    this.willStartConsuming();
    this.setFlags(this.flags | WarpDownlink.ConsumingFlag);
    this.onStartConsuming();
    this.didStartConsuming();
  },

  willStartConsuming(): void {
    // hook
  },

  onStartConsuming(): void {
    this.setCoherent(false);
    this.requireRecohere();
  },

  didStartConsuming(): void {
    // hook
  },

  stopConsuming(): void {
    if ((this.flags & WarpDownlink.ConsumingFlag) === 0) {
      return;
    }
    this.willStopConsuming();
    this.setFlags(this.flags & ~WarpDownlink.ConsumingFlag);
    this.onStopConsuming();
    this.didStopConsuming();
  },

  willStopConsuming(): void {
    // hook
  },

  onStopConsuming(): void {
    this.close();
  },

  didStopConsuming(): void {
    // hook
  },

  open(): typeof this {
    throw new Error("abstract");
  },

  close(): void {
    const model = this.model;
    if (model === null) {
      return;
    }
    (this as Mutable<typeof this>).model = null;
    model.removeDownlink(this);

    this.didClose();
    this.callObservers("didClose", this);
  },

  reopen(): void {
    this.close();
    if ((this.flags & WarpDownlink.ConsumingFlag) !== 0) {
      this.setCoherent(false);
      this.requireRecohere();
    }
  },

  recohere(t: number): void {
    this.setCoherentTime(t);
    this.setCoherent(true);
    if ((this.flags & WarpDownlink.ConsumingFlag) !== 0) {
      this.open();
    }
  },

  onMount(): void {
    super.onMount();
    if (this.consumers !== null && this.consumers.size !== 0) {
      this.startConsuming();
    }
  },

  onUnmount(): void {
    super.onUnmount();
    this.stopConsuming();
  },
},
{
  construct(downlink: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    downlink = super.construct(downlink, owner) as F;
    (downlink as Mutable<typeof downlink>).observers = null;
    (downlink as Mutable<typeof downlink>).consumers = null;
    (downlink as Mutable<typeof downlink>).hostUri = downlink.initHostUri();
    (downlink as Mutable<typeof downlink>).nodeUri = downlink.initNodeUri();
    (downlink as Mutable<typeof downlink>).laneUri = downlink.initLaneUri();
    (downlink as Mutable<typeof downlink>).prio = downlink.initPrio();
    (downlink as Mutable<typeof downlink>).rate = downlink.initRate();
    (downlink as Mutable<typeof downlink>).body = downlink.initBody();
    (downlink as Mutable<typeof downlink>).model = null;
    return downlink;
  },

  refine(downlinkClass: FastenerClass<WarpDownlink<any>>): void {
    super.refine(downlinkClass);
    const downlinkPrototype = downlinkClass.prototype;

    let flagsInit = downlinkPrototype.flagsInit;
    if (Object.prototype.hasOwnProperty.call(downlinkPrototype, "relinks")) {
      if (downlinkPrototype.relinks) {
        flagsInit |= WarpDownlink.RelinksFlag;
      } else {
        flagsInit &= ~WarpDownlink.RelinksFlag;
      }
      delete (downlinkPrototype as WarpDownlinkDescriptor<any>).relinks;
    }
    if (Object.prototype.hasOwnProperty.call(downlinkPrototype, "syncs")) {
      if (downlinkPrototype.syncs) {
        flagsInit |= WarpDownlink.SyncsFlag;
      } else {
        flagsInit &= ~WarpDownlink.SyncsFlag;
      }
      delete (downlinkPrototype as WarpDownlinkDescriptor<any>).syncs;
    }
    Object.defineProperty(downlinkPrototype, "flagsInit", {
      value: flagsInit,
      enumerable: true,
      configurable: true,
    });

    const hostUriDescriptor = Object.getOwnPropertyDescriptor(downlinkPrototype, "hostUri");
    if (hostUriDescriptor !== void 0 && "value" in hostUriDescriptor) {
      hostUriDescriptor.value = Uri.fromLike(hostUriDescriptor.value);
      Object.defineProperty(downlinkPrototype, "hostUri", hostUriDescriptor);
    }

    const nodeUriDescriptor = Object.getOwnPropertyDescriptor(downlinkPrototype, "nodeUri");
    if (nodeUriDescriptor !== void 0 && "value" in nodeUriDescriptor) {
      nodeUriDescriptor.value = Uri.fromLike(nodeUriDescriptor.value);
      Object.defineProperty(downlinkPrototype, "nodeUri", nodeUriDescriptor);
    }

    const laneUriDescriptor = Object.getOwnPropertyDescriptor(downlinkPrototype, "laneUri");
    if (laneUriDescriptor !== void 0 && "value" in laneUriDescriptor) {
      laneUriDescriptor.value = Uri.fromLike(laneUriDescriptor.value);
      Object.defineProperty(downlinkPrototype, "laneUri", laneUriDescriptor);
    }

    const bodyDescriptor = Object.getOwnPropertyDescriptor(downlinkPrototype, "body");
    if (bodyDescriptor !== void 0 && "value" in bodyDescriptor) {
      bodyDescriptor.value = Value.fromLike(bodyDescriptor.value);
      Object.defineProperty(downlinkPrototype, "body", bodyDescriptor);
    }
  },

  RelinksFlag: 1 << (Fastener.FlagShift + 0),
  SyncsFlag: 1 << (Fastener.FlagShift + 1),
  ConsumingFlag: 1 << (Fastener.FlagShift + 2),

  FlagShift: Fastener.FlagShift + 3,
  FlagMask: (1 << (Fastener.FlagShift + 3)) - 1,
}))();
