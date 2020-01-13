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

import {AnyUri, Uri} from "@swim/uri";
import {Item, Attr, AnyValue, Value, Record, Form} from "@swim/structure";
import {
  EventMessage,
  LinkRequest,
  LinkedResponse,
  SyncRequest,
  SyncedResponse,
  UnlinkRequest,
  UnlinkedResponse,
} from "@swim/warp";
import {Host} from "../host/Host";
import {DownlinkOwner} from "./DownlinkOwner";
import {DownlinkContext} from "./DownlinkContext";
import {DownlinkModel} from "./DownlinkModel";

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
  /** @hidden */
  readonly _context: DownlinkContext;
  /** @hidden */
  readonly _owner: DownlinkOwner | undefined;
  /** @hidden */
  readonly _hostUri: Uri;
  /** @hidden */
  readonly _nodeUri: Uri;
  /** @hidden */
  readonly _laneUri: Uri;
  /** @hidden */
  readonly _prio: number;
  /** @hidden */
  readonly _rate: number;
  /** @hidden */
  readonly _body: Value;
  /** @hidden */
  readonly _flags: number;
  /** @hidden */
  _model: DownlinkModel | null;
  /** @hidden */
  _observers: ReadonlyArray<DownlinkObserver> | null;

  constructor(context: DownlinkContext, owner?: DownlinkOwner, init?: DownlinkInit,
              hostUri: Uri = Uri.empty(), nodeUri: Uri = Uri.empty(), laneUri: Uri = Uri.empty(),
              prio: number = 0, rate: number = 0, body: Value = Value.absent(),
              flags: number = 0, observers: ReadonlyArray<DownlinkObserver> | DownlinkObserver | null = null) {
    let observer: DownlinkObserver | undefined;
    if (!observers) {
      observers = [];
    } else if (!Array.isArray(observers)) {
      observer = observers as DownlinkObserver;
      observers = [observer];
    }
    if (init) {
      observer = observer || {};
      observers = observers ? observers.concat(observer) : [observer];
      hostUri = init.hostUri !== void 0 ? Uri.fromAny(init.hostUri) : hostUri;
      nodeUri = init.nodeUri !== void 0 ? Uri.fromAny(init.nodeUri) : nodeUri;
      laneUri = init.laneUri !== void 0 ? Uri.fromAny(init.laneUri) : laneUri;
      prio = init.prio !== void 0 ? init.prio : prio;
      rate = init.rate !== void 0 ? init.rate : rate;
      body = init.body !== void 0 ? Value.fromAny(init.body) : body;
      observer.onEvent = init.onEvent || observer.onEvent;
      observer.onCommand = init.onCommand || observer.onCommand;
      observer.willLink = init.willLink || observer.willLink;
      observer.didLink = init.didLink || observer.didLink;
      observer.willSync = init.willSync || observer.willSync;
      observer.didSync = init.didSync || observer.didSync;
      observer.willUnlink = init.willUnlink || observer.willUnlink;
      observer.didUnlink = init.didUnlink || observer.didUnlink;
      observer.didConnect = init.didConnect || observer.didConnect;
      observer.didDisconnect = init.didDisconnect || observer.didDisconnect;
      observer.didClose = init.didClose || observer.didClose;
      observer.didFail = init.didFail || observer.didFail;
    }
    this._context = context;
    this._owner = owner;
    this._hostUri = hostUri;
    this._nodeUri = nodeUri;
    this._laneUri = laneUri;
    this._prio = prio;
    this._rate = rate;
    this._body = body;
    this._flags = flags;
    this._model = null;
    this._observers = observers;
  }

  protected abstract copy(context: DownlinkContext, owner: DownlinkOwner | undefined,
                          hostUri: Uri, nodeUri: Uri, laneUri: Uri, prio: number, rate: number,
                          body: Value, flags: number, observers: ReadonlyArray<DownlinkObserver> | null): this;

  hostUri(): Uri;
  hostUri(hostUri: AnyUri): this;
  hostUri(hostUri?: AnyUri): Uri | this {
    if (hostUri === void 0) {
      return this._hostUri;
    } else {
      hostUri = Uri.fromAny(hostUri);
      return this.copy(this._context, this._owner, hostUri, this._nodeUri, this._laneUri,
                       this._prio, this._rate, this._body, this._flags, this._observers);
    }
  }

  nodeUri(): Uri;
  nodeUri(nodeUri: AnyUri): this;
  nodeUri(nodeUri?: AnyUri): Uri | this {
    if (nodeUri === void 0) {
      return this._nodeUri;
    } else {
      nodeUri = Uri.fromAny(nodeUri);
      return this.copy(this._context, this._owner, this._hostUri, nodeUri, this._laneUri,
                       this._prio, this._rate, this._body, this._flags, this._observers);
    }
  }

  laneUri(): Uri;
  laneUri(laneUri: AnyUri): this;
  laneUri(laneUri?: AnyUri): Uri | this {
    if (laneUri === void 0) {
      return this._laneUri;
    } else {
      laneUri = Uri.fromAny(laneUri);
      return this.copy(this._context, this._owner, this._hostUri, this._nodeUri, laneUri,
                       this._prio, this._rate, this._body, this._flags, this._observers);
    }
  }

  prio(): number;
  prio(prio: number ): this;
  prio(prio?: number): number | this {
    if (prio === void 0) {
      return this._prio;
    } else {
      return this.copy(this._context, this._owner, this._hostUri, this._nodeUri, this._laneUri,
                       prio, this._rate, this._body, this._flags, this._observers);
    }
  }

  rate(): number;
  rate(rate: number): this;
  rate(rate?: number): number | this {
    if (rate === void 0) {
      return this._rate;
    } else {
      return this.copy(this._context, this._owner, this._hostUri, this._nodeUri, this._laneUri,
                       this._prio, rate, this._body, this._flags, this._observers);
    }
  }

  body(): Value;
  body(body: AnyValue): this;
  body(body?: AnyValue): Value | this {
    if (body === void 0) {
      return this._body;
    } else {
      body = Value.fromAny(body);
      return this.copy(this._context, this._owner, this._hostUri, this._nodeUri, this._laneUri,
                       this._prio, this._rate, body, this._flags, this._observers);
    }
  }

  abstract type(): DownlinkType;

  keepLinked(): boolean;
  keepLinked(keepLinked: boolean): this;
  keepLinked(keepLinked?: boolean): boolean | this {
    if (keepLinked === void 0) {
      return (this._flags & DownlinkFlags.KeepLinked) !== 0;
    } else {
      const flags = keepLinked ? this._flags | DownlinkFlags.KeepLinked : this._flags & ~DownlinkFlags.KeepLinked;
      return this.copy(this._context, this._owner, this._hostUri, this._nodeUri, this._laneUri,
                       this._prio, this._rate, this._body, flags, this._observers);
    }
  }

  keepSynced(): boolean;
  keepSynced(keepSynced: boolean): this;
  keepSynced(keepSynced?: boolean): boolean | this {
    if (keepSynced === void 0) {
      return (this._flags & DownlinkFlags.KeepSynced) !== 0;
    } else {
      const flags = keepSynced ? this._flags | DownlinkFlags.KeepSynced : this._flags & ~DownlinkFlags.KeepSynced;
      return this.copy(this._context, this._owner, this._hostUri, this._nodeUri, this._laneUri,
                       this._prio, this._rate, this._body, flags, this._observers);
    }
  }

  observe(observer: DownlinkObserver): this {
    const oldObservers = this._observers;
    const n = oldObservers ? oldObservers.length : 0;
    const newObservers = new Array<DownlinkObserver>(n + 1);
    for (let i = 0; i < n; i += 1) {
      newObservers[i] = oldObservers![i];
    }
    newObservers[n] = observer;
    this._observers = newObservers;
    return this;
  }

  unobserve(observer: unknown): this {
    const oldObservers = this._observers;
    const n = oldObservers ? oldObservers.length : 0;
    for (let i = 0; i < n; i += 1) {
      const oldObserver = oldObservers![i] as {[key: string]: unknown};
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
            newObservers[j] = oldObservers![j];
          }
          for (let j = i + 1; j < n; j += 1) {
            newObservers[j - 1] = oldObservers![j];
          }
          this._observers = newObservers;
        } else {
          this._observers = null;
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
    return this._model ? this._model.isConnected() : false;
  }

  isAuthenticated(): boolean {
    return this._model ? this._model.isAuthenticated() : false;
  }

  isLinked(): boolean {
    return this._model ? this._model.isLinked() : false;
  }

  isSynced(): boolean {
    return this._model ? this._model.isSynced() : false;
  }

  session(): Value {
    return this._model ? this._model.session() : Value.absent();
  }

  /** @hidden */
  onEventMessage(message: EventMessage): void {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.onEvent) {
        observer.onEvent(message.body(), this);
      }
    }
  }

  /** @hidden */
  onCommandMessage(body: Value): void {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.onCommand) {
        observer.onCommand(body, this);
      }
    }
  }

  /** @hidden */
  onLinkRequest(request?: LinkRequest): void {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.willLink) {
        observer.willLink(this);
      }
    }
  }

  /** @hidden */
  onLinkedResponse(response?: LinkedResponse): void {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.didLink) {
        observer.didLink(this);
      }
    }
  }

  /** @hidden */
  onSyncRequest(request?: SyncRequest): void {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.willSync) {
        observer.willSync(this);
      }
    }
  }

  /** @hidden */
  onSyncedResponse(response?: SyncedResponse): void {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.didSync) {
        observer.didSync(this);
      }
    }
  }

  /** @hidden */
  onUnlinkRequest(request?: UnlinkRequest): void {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.willUnlink) {
        observer.willUnlink(this);
      }
    }
  }

  /** @hidden */
  onUnlinkedResponse(response?: UnlinkedResponse): void {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.didUnlink) {
        observer.didUnlink(this);
      }
    }
  }

  /** @hidden */
  hostDidConnect(): void {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.didConnect) {
        observer.didConnect(this);
      }
    }
  }

  /** @hidden */
  hostDidDisconnect(): void {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.didDisconnect) {
        observer.didDisconnect(this);
      }
    }
  }

  /** @hidden */
  hostDidFail(error: unknown): void {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.didFail) {
        observer.didFail(error, this);
      }
    }
  }

  command(body: AnyValue): void {
    this._model!.command(body);
  }

  abstract open(): this;

  close(): void {
    if (this._owner) {
      this._owner.removeDownlink(this);
    }
    if (this._model) {
      this._model.removeDownlink(this);
    }
  }

  /** @hidden */
  openUp(host: Host): void {
    // nop
  }

  /** @hidden */
  closeUp(): void {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.didClose) {
        observer.didClose(this);
      }
    }
  }

  private static _initForm: Form<DownlinkInit | undefined>;

  static initForm(): Form<DownlinkInit | undefined> {
    if (!Downlink._initForm) {
      Downlink._initForm = new DownlinkInitForm();
    }
    return Downlink._initForm;
  }
}

/** @hidden */
class DownlinkInitForm extends Form<DownlinkInit | undefined> {
  tag(): string;
  tag(tag: string | undefined): Form<DownlinkInit | undefined>;
  tag(tag?: string | undefined): string | Form<DownlinkInit | undefined> {
    if (arguments.length === 0) {
      return "link";
    } else if (tag !== void 0) {
      return super.tag(tag);
    } else {
      return this;
    }
  }

  mold(init: DownlinkInit | undefined): Item {
    if (init) {
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

  cast(item: Item): DownlinkInit | undefined {
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
