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

import {Lazy, Arrays} from "@swim/util";
import {AnyUri, Uri} from "@swim/uri";
import {Item, Attr, AnyValue, Value, Record, Form} from "@swim/structure";
import type {
  EventMessage,
  LinkRequest,
  LinkedResponse,
  SyncRequest,
  SyncedResponse,
  UnlinkRequest,
  UnlinkedResponse,
} from "@swim/warp";
import type {Host} from "../host/Host";
import type {DownlinkOwner} from "./DownlinkOwner";
import type {DownlinkContext} from "./DownlinkContext";
import type {DownlinkModel} from "./DownlinkModel";

export type DownlinkType = "event" | "list" | "map" | "value";

export type DownlinkOnEvent = (body: Value, downlink: Downlink) => void;
export type DownlinkOnCommand = (body: Value, downlink: Downlink) => void;
export type DownlinkWillLink = (downlink: Downlink) => void;
export type DownlinkDidLink = (downlink: Downlink) => void;
export type DownlinkWillSync = (downlink: Downlink) => void;
export type DownlinkDidSync = (downlink: Downlink) => void;
export type DownlinkWillUnlink = (downlink: Downlink) => void;
export type DownlinkDidUnlink = (downlink: Downlink) => void;
export type DownlinkDidConnect = (downlink: Downlink) => void;
export type DownlinkDidDisconnect = (downlink: Downlink) => void;
export type DownlinkDidClose = (downlink: Downlink) => void;
export type DownlinkDidFail = (error: unknown, downlink: Downlink) => void;

export interface DownlinkObserver {
  onEvent?: DownlinkOnEvent;
  onCommand?: DownlinkOnCommand;
  willLink?: DownlinkWillLink;
  didLink?: DownlinkDidLink;
  willSync?: DownlinkWillSync;
  didSync?: DownlinkDidSync;
  willUnlink?: DownlinkWillUnlink;
  didUnlink?: DownlinkDidUnlink;
  didConnect?: DownlinkDidConnect;
  didDisconnect?: DownlinkDidDisconnect;
  didClose?: DownlinkDidClose;
  didFail?: DownlinkDidFail;
}

export interface DownlinkInit extends DownlinkObserver {
  hostUri?: AnyUri;
  nodeUri?: AnyUri;
  laneUri?: AnyUri;
  prio?: number;
  rate?: number;
  body?: AnyValue;
  type?: DownlinkType;
}

/** @hidden */
export const enum DownlinkFlags {
  KeepLinked = 1,
  KeepSynced = 2,
  KeepLinkedSynced = KeepLinked | KeepSynced,
}

export abstract class Downlink {
  constructor(context: DownlinkContext, owner: DownlinkOwner | null, init?: DownlinkInit,
              hostUri: Uri = Uri.empty(), nodeUri: Uri = Uri.empty(), laneUri: Uri = Uri.empty(),
              prio: number = 0, rate: number = 0, body: Value = Value.absent(),
              flags: number = 0, observers?: ReadonlyArray<DownlinkObserver> | DownlinkObserver) {
    let observer: DownlinkObserver | undefined;
    if (observers === void 0) {
      observers = Arrays.empty
    } else if (!Array.isArray(observers)) {
      observer = observers as DownlinkObserver;
      observers = [observer] as ReadonlyArray<DownlinkObserver>;
    }
    if (init !== void 0) {
      hostUri = init.hostUri !== void 0 ? Uri.fromAny(init.hostUri) : hostUri;
      nodeUri = init.nodeUri !== void 0 ? Uri.fromAny(init.nodeUri) : nodeUri;
      laneUri = init.laneUri !== void 0 ? Uri.fromAny(init.laneUri) : laneUri;
      prio = init.prio !== void 0 ? init.prio : prio;
      rate = init.rate !== void 0 ? init.rate : rate;
      body = init.body !== void 0 ? Value.fromAny(init.body) : body;
      observer = observer ?? {};
      observers = Arrays.inserted(observer, observers);
      observer.onEvent = init.onEvent ?? observer.onEvent;
      observer.onCommand = init.onCommand ?? observer.onCommand;
      observer.willLink = init.willLink ?? observer.willLink;
      observer.didLink = init.didLink ?? observer.didLink;
      observer.willSync = init.willSync ?? observer.willSync;
      observer.didSync = init.didSync ?? observer.didSync;
      observer.willUnlink = init.willUnlink ?? observer.willUnlink;
      observer.didUnlink = init.didUnlink ?? observer.didUnlink;
      observer.didConnect = init.didConnect ?? observer.didConnect;
      observer.didDisconnect = init.didDisconnect ?? observer.didDisconnect;
      observer.didClose = init.didClose ?? observer.didClose;
      observer.didFail = init.didFail ?? observer.didFail;
    }
    Object.defineProperty(this, "context", {
      value: context,
      enumerable: true,
    });
    Object.defineProperty(this, "owner", {
      value: owner,
      enumerable: true,
    });
    Object.defineProperty(this, "ownHostUri", {
      value: hostUri,
      enumerable: true,
    });
    Object.defineProperty(this, "ownNodeUri", {
      value: nodeUri,
      enumerable: true,
    });
    Object.defineProperty(this, "ownLaneUri", {
      value: laneUri,
      enumerable: true,
    });
    Object.defineProperty(this, "ownPrio", {
      value: prio,
      enumerable: true,
    });
    Object.defineProperty(this, "ownRate", {
      value: rate,
      enumerable: true,
    });
    Object.defineProperty(this, "ownBody", {
      value: body,
      enumerable: true,
    });
    Object.defineProperty(this, "flags", {
      value: flags,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "model", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "observers", {
      value: observers,
      enumerable: true,
      configurable: true,
    });
  }

  /** @hidden */
  readonly context!: DownlinkContext;

  /** @hidden */
  readonly owner!: DownlinkOwner | null;
  
  /** @hidden */
  readonly ownHostUri!: Uri;
  
  /** @hidden */
  readonly ownNodeUri!: Uri;
  
  /** @hidden */
  readonly ownLaneUri!: Uri;
  
  /** @hidden */
  readonly ownPrio!: number;
  
  /** @hidden */
  readonly ownRate!: number;
  
  /** @hidden */
  readonly ownBody!: Value;

  /** @hidden */
  readonly flags!: number;

  /** @hidden */
  readonly model!: DownlinkModel | null;

  /** @hidden */
  readonly observers!: ReadonlyArray<DownlinkObserver>;

  abstract readonly type: DownlinkType;

  protected abstract copy(context: DownlinkContext, owner: DownlinkOwner | null,
                          hostUri: Uri, nodeUri: Uri, laneUri: Uri, prio: number, rate: number,
                          body: Value, flags: number, observers: ReadonlyArray<DownlinkObserver>): Downlink;

  hostUri(): Uri;
  hostUri(hostUri: AnyUri): Downlink;
  hostUri(hostUri?: AnyUri): Uri | Downlink {
    if (hostUri === void 0) {
      return this.ownHostUri;
    } else {
      hostUri = Uri.fromAny(hostUri);
      return this.copy(this.context, this.owner, hostUri as Uri, this.ownNodeUri, this.ownLaneUri,
                       this.ownPrio, this.ownRate, this.ownBody, this.flags, this.observers);
    }
  }

  nodeUri(): Uri;
  nodeUri(nodeUri: AnyUri): Downlink;
  nodeUri(nodeUri?: AnyUri): Uri | Downlink {
    if (nodeUri === void 0) {
      return this.ownNodeUri;
    } else {
      nodeUri = Uri.fromAny(nodeUri);
      return this.copy(this.context, this.owner, this.ownHostUri, nodeUri as Uri, this.ownLaneUri,
                       this.ownPrio, this.ownRate, this.ownBody, this.flags, this.observers);
    }
  }

  laneUri(): Uri;
  laneUri(laneUri: AnyUri): Downlink;
  laneUri(laneUri?: AnyUri): Uri | Downlink {
    if (laneUri === void 0) {
      return this.ownLaneUri;
    } else {
      laneUri = Uri.fromAny(laneUri);
      return this.copy(this.context, this.owner, this.ownHostUri, this.ownNodeUri, laneUri as Uri,
                       this.ownPrio, this.ownRate, this.ownBody, this.flags, this.observers);
    }
  }

  prio(): number;
  prio(prio: number): Downlink;
  prio(prio?: number): number | Downlink {
    if (prio === void 0) {
      return this.ownPrio;
    } else {
      return this.copy(this.context, this.owner, this.ownHostUri, this.ownNodeUri, this.ownLaneUri,
                       prio, this.ownRate, this.ownBody, this.flags, this.observers);
    }
  }

  rate(): number;
  rate(rate: number): Downlink;
  rate(rate?: number): number | Downlink {
    if (rate === void 0) {
      return this.ownRate;
    } else {
      return this.copy(this.context, this.owner, this.ownHostUri, this.ownNodeUri, this.ownLaneUri,
                       this.ownPrio, rate, this.ownBody, this.flags, this.observers);
    }
  }

  body(): Value;
  body(body: AnyValue): Downlink;
  body(body?: AnyValue): Value | Downlink {
    if (body === void 0) {
      return this.ownBody;
    } else {
      body = Value.fromAny(body);
      return this.copy(this.context, this.owner, this.ownHostUri, this.ownNodeUri, this.ownLaneUri,
                       this.ownPrio, this.ownRate, body, this.flags, this.observers);
    }
  }

  keepLinked(): boolean;
  keepLinked(keepLinked: boolean): Downlink;
  keepLinked(keepLinked?: boolean): boolean | Downlink {
    if (keepLinked === void 0) {
      return (this.flags & DownlinkFlags.KeepLinked) !== 0;
    } else {
      const flags = keepLinked ? this.flags | DownlinkFlags.KeepLinked : this.flags & ~DownlinkFlags.KeepLinked;
      return this.copy(this.context, this.owner, this.ownHostUri, this.ownNodeUri, this.ownLaneUri,
                       this.ownPrio, this.ownRate, this.ownBody, flags, this.observers);
    }
  }

  keepSynced(): boolean;
  keepSynced(keepSynced: boolean): Downlink;
  keepSynced(keepSynced?: boolean): boolean | Downlink {
    if (keepSynced === void 0) {
      return (this.flags & DownlinkFlags.KeepSynced) !== 0;
    } else {
      const flags = keepSynced ? this.flags | DownlinkFlags.KeepSynced : this.flags & ~DownlinkFlags.KeepSynced;
      return this.copy(this.context, this.owner, this.ownHostUri, this.ownNodeUri, this.ownLaneUri,
                       this.ownPrio, this.ownRate, this.ownBody, flags, this.observers);
    }
  }

  observe(observer: DownlinkObserver): this {
    Object.defineProperty(this, "observers", {
      value: Arrays.inserted(observer, this.observers),
      enumerable: true,
      configurable: true,
    });
    return this;
  }

  unobserve(observer: unknown): this {
    const oldObservers = this.observers;
    const n = oldObservers.length;
    for (let i = 0; i < n; i += 1) {
      const oldObserver = oldObservers[i]! as {[key: string]: unknown};
      let found = oldObserver === observer; // check object identity
      if (!found) {
        for (const key in oldObserver) { // check property identity
          if (oldObserver[key] === observer) {
            found = true;
            break;
          }
        }
      }
      if (found) {
        if (n > 1) {
          const newObservers = new Array<DownlinkObserver>(n - 1);
          for (let j = 0; j < i; j += 1) {
            newObservers[j] = oldObservers[j]!;
          }
          for (let j = i + 1; j < n; j += 1) {
            newObservers[j - 1] = oldObservers[j]!;
          }
          Object.defineProperty(this, "observers", {
            value: newObservers,
            enumerable: true,
            configurable: true,
          });
        } else {
          Object.defineProperty(this, "observers", {
            value: Arrays.empty,
            enumerable: true,
            configurable: true,
          });
        }
        break;
      }
    }
    return this;
  }

  onEvent(onEvent: DownlinkOnEvent): this {
    return this.observe({onEvent});
  }

  onCommand(onCommand: DownlinkOnCommand): this {
    return this.observe({onCommand});
  }

  willLink(willLink: DownlinkWillLink): this {
    return this.observe({willLink});
  }

  didLink(didLink: DownlinkDidLink): this {
    return this.observe({didLink});
  }

  willSync(willSync: DownlinkWillSync): this {
    return this.observe({willSync});
  }

  didSync(didSync: DownlinkDidSync): this {
    return this.observe({didSync});
  }

  willUnlink(willUnlink: DownlinkWillUnlink): this {
    return this.observe({willUnlink});
  }

  didUnlink(didUnlink: DownlinkDidUnlink): this {
    return this.observe({didUnlink});
  }

  didConnect(didConnect: DownlinkDidConnect): this {
    return this.observe({didConnect});
  }

  didDisconnect(didDisconnect: DownlinkDidDisconnect): this {
    return this.observe({didDisconnect});
  }

  didClose(didClose: DownlinkDidClose): this {
    return this.observe({didClose});
  }

  didFail(didFail: DownlinkDidFail): this {
    return this.observe({didFail});
  }

  isConnected(): boolean {
    const model = this.model;
    return model !== null && model.isConnected();
  }

  isAuthenticated(): boolean {
    const model = this.model;
    return model !== null && model.isAuthenticated();
  }

  isLinked(): boolean {
    const model = this.model;
    return model !== null && model.isLinked();
  }

  isSynced(): boolean {
    const model = this.model;
    return model !== null && model.isSynced();
  }

  get session(): Value {
    const model = this.model;
    return model !== null ? model.session : Value.absent();
  }

  /** @hidden */
  onEventMessage(message: EventMessage): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.onEvent !== void 0) {
        observer.onEvent(message.body, this);
      }
    }
  }

  /** @hidden */
  onCommandMessage(body: Value): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.onCommand !== void 0) {
        observer.onCommand(body, this);
      }
    }
  }

  /** @hidden */
  onLinkRequest(request?: LinkRequest): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.willLink !== void 0) {
        observer.willLink(this);
      }
    }
  }

  /** @hidden */
  onLinkedResponse(response?: LinkedResponse): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.didLink !== void 0) {
        observer.didLink(this);
      }
    }
  }

  /** @hidden */
  onSyncRequest(request?: SyncRequest): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.willSync !== void 0) {
        observer.willSync(this);
      }
    }
  }

  /** @hidden */
  onSyncedResponse(response?: SyncedResponse): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.didSync !== void 0) {
        observer.didSync(this);
      }
    }
  }

  /** @hidden */
  onUnlinkRequest(request?: UnlinkRequest): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.willUnlink !== void 0) {
        observer.willUnlink(this);
      }
    }
  }

  /** @hidden */
  onUnlinkedResponse(response?: UnlinkedResponse): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.didUnlink !== void 0) {
        observer.didUnlink(this);
      }
    }
  }

  /** @hidden */
  hostDidConnect(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.didConnect !== void 0) {
        observer.didConnect(this);
      }
    }
  }

  /** @hidden */
  hostDidDisconnect(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.didDisconnect !== void 0) {
        observer.didDisconnect(this);
      }
    }
  }

  /** @hidden */
  hostDidFail(error: unknown): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.didFail !== void 0) {
        observer.didFail(error, this);
      }
    }
  }

  command(body: AnyValue): void {
    this.model!.command(body);
  }

  abstract open(): this;

  close(): void {
    const owner = this.owner;
    if (owner !== null) {
      owner.removeDownlink(this);
    }
    const model = this.model;
    if (model !== null) {
      model.removeDownlink(this);
    }
  }

  /** @hidden */
  openUp(host: Host): void {
    // nop
  }

  /** @hidden */
  closeUp(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.didClose !== void 0) {
        observer.didClose(this);
      }
    }
  }

  @Lazy
  static initForm(): Form<DownlinkInit | undefined> {
    return new DownlinkInitForm();
  }
}

/** @hidden */
class DownlinkInitForm extends Form<DownlinkInit | undefined> {
  declare readonly tag: string | undefined; // getter defined below to work around useDefineForClassFields lunacy

  override mold(init: DownlinkInit | undefined): Item {
    if (init !== void 0) {
      const header = Record.create();
      if (init.hostUri !== void 0) {
        header.slot("host", Uri.fromAny(init.hostUri).toString());
      }
      if (init.nodeUri !== void 0) {
        header.slot("node", Uri.fromAny(init.nodeUri).toString());
      }
      if (init.laneUri !== void 0) {
        header.slot("lane", Uri.fromAny(init.laneUri).toString());
      }
      if (init.prio !== void 0) {
        header.slot("prio", init.prio);
      }
      if (init.rate !== void 0) {
        header.slot("rate", init.rate);
      }
      if (init.body !== void 0) {
        header.slot("body", init.body);
      }
      if (init.type !== void 0) {
        header.slot("type", init.type);
      }
      return Record.of(Attr.of("link", header));
    } else {
      return Item.extant();
    }
  }

  override cast(item: Item): DownlinkInit | undefined {
    const value = item.toValue();
    const header = value.get("link");
    if (header.isDefined()) {
      const init = {} as DownlinkInit;
      const host = header.get("host");
      if (host.isDefined()) {
        init.hostUri = host.cast(Uri.form());
      }
      const node = header.get("node");
      if (node.isDefined()) {
        init.nodeUri = node.cast(Uri.form());
      }
      const lane = header.get("lane");
      if (lane.isDefined()) {
        init.laneUri = lane.cast(Uri.form());
      }
      const prio = header.get("prio");
      if (prio.isDefined()) {
        init.prio = prio.numberValue();
      }
      const rate = header.get("rate");
      if (rate.isDefined()) {
        init.rate = rate.numberValue();
      }
      const body = header.get("body");
      if (body.isDefined()) {
        init.body = body;
      }
      const type = header.get("type");
      if (type.isDefined()) {
        init.type = type.stringValue() as DownlinkType;
      }
      return init;
    }
    return void 0;
  }
}
Object.defineProperty(DownlinkInitForm.prototype, "tag", {
  get(this: DownlinkInitForm): string | undefined {
    return "link";
  },
  enumerable: true,
  configurable: true,
});
