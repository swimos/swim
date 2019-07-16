// Copyright 2015-2019 SWIM.AI inc.
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

import {BTree} from "@swim/collections";
import {AnyValue, Value} from "@swim/structure";
import {AnyUri, Uri} from "@swim/uri";
import {HostContext} from "./host/HostContext";
import {HostOptions, Host} from "./host/Host";
import {WebSocketHost} from "./host/WebSocketHost";
import {DownlinkModel} from "./downlink/DownlinkModel";
import {EventDownlinkInit, EventDownlink} from "./downlink/EventDownlink";
import {ListDownlinkInit, ListDownlink} from "./downlink/ListDownlink";
import {MapDownlinkInit, MapDownlink} from "./downlink/MapDownlink";
import {ValueDownlinkInit, ValueDownlink} from "./downlink/ValueDownlink";
import {SwimRef} from "./SwimRef";
import {
  SwimDidConnect,
  SwimDidAuthenticate,
  SwimDidDeauthenticate,
  SwimDidDisconnect,
  SwimDidFail,
  SwimObserver,
} from "./SwimObserver";
import {RefContext} from "./ref/RefContext";
import {BaseRef} from "./ref/BaseRef";
import {HostRef} from "./ref/HostRef";
import {NodeRef} from "./ref/NodeRef";
import {LaneRef} from "./ref/LaneRef";

export interface SwimClientOptions extends HostOptions {
  keepOnline?: boolean;
}

export class SwimClient implements HostContext, RefContext, SwimRef {
  /** @hidden */
  readonly _options: SwimClientOptions;
  /** @hidden */
  _hosts: BTree<Uri, Host>;
  /** @hidden */
  _downlinks: BTree<Uri, BTree<Uri, BTree<Uri, DownlinkModel>>>;
  /** @hidden */
  _downlinkCount: number;
  /** @hidden */
  _refs: BaseRef[];
  /** @hidden */
  _online: boolean;
  /** @hidden */
  _observers: ReadonlyArray<SwimObserver> | null;

  constructor(options: SwimClientOptions = {}) {
    this._options = options;
    this._hosts = new BTree();
    this._downlinks = new BTree();
    this._downlinkCount = 0;
    this._refs = [];
    this._online = true;
    this._observers = null;

    this.onOnline = this.onOnline.bind(this);
    this.onOffline = this.onOffline.bind(this);
    this.watchOnline(!!options.keepOnline);
  }

  isOnline(): boolean;
  isOnline(online: boolean): this;
  isOnline(online?: boolean): boolean | this {
    if (online === void 0) {
      return this._online;
    } else {
      if (this._online !== online) {
        this._online = online;
        this._hosts.forEach(function (hostUri, host) {
          if (online) {
            host.open();
          } else {
            host.close();
          }
        }, this);
      }
      return this;
    }
  }

  keepOnline(): boolean;
  keepOnline(keepOnline: boolean): this;
  keepOnline(keepOnline?: boolean): boolean | this {
    if (keepOnline === void 0) {
      return !!this._options.keepOnline;
    } else {
      if (this._options.keepOnline !== keepOnline) {
        this._options.keepOnline = keepOnline;
        this.watchOnline(keepOnline);
      }
      return this;
    }
  }

  protected watchOnline(keepOnline: boolean): void {
    if (typeof window === "object") {
      if (keepOnline) {
        window.addEventListener("online", this.onOnline);
        window.addEventListener("offline", this.onOffline);
      } else {
        window.removeEventListener("online", this.onOnline);
        window.removeEventListener("offline", this.onOffline);
      }
    }
  }

  protected onOnline(event: Event): void {
    this.isOnline(true);
  }

  protected onOffline(event: Event): void {
    this.isOnline(false);
  }

  /** @hidden */
  getHost(hostUri: AnyUri): Host | undefined {
    hostUri = Uri.fromAny(hostUri);
    return this._hosts.get(hostUri);
  }

  /** @hidden */
  openHost(hostUri: AnyUri): Host {
    hostUri = Uri.fromAny(hostUri);
    let host = this._hosts.get(hostUri);
    if (!host) {
      host = new WebSocketHost(this, hostUri, this._options);
      this._hosts.set(hostUri, host);
    }
    return host;
  }

  /** @hidden */
  closeHost(host: Host): void {
    if (this._hosts.get(host.hostUri())) {
      this._hosts.delete(host.hostUri());
      host.closeUp();
    }
  }

  /** @hidden */
  getDownlink(hostUri: Uri, nodeUri: Uri, laneUri: Uri): DownlinkModel | undefined {
    const hostDownlinks = this._downlinks.get(hostUri);
    if (hostDownlinks) {
      const nodeDownlinks = hostDownlinks.get(nodeUri);
      if (nodeDownlinks) {
        return nodeDownlinks.get(laneUri);
      }
    }
    return void 0;
  }

  /** @hidden */
  openDownlink(downlink: DownlinkModel): void {
    const hostUri = downlink.hostUri();
    const nodeUri = downlink.nodeUri();
    const laneUri = downlink.laneUri();
    let hostDownlinks = this._downlinks.get(hostUri);
    if (!hostDownlinks) {
      hostDownlinks = new BTree();
      this._downlinks.set(hostUri, hostDownlinks);
    }
    let nodeDownlinks = hostDownlinks.get(nodeUri);
    if (!nodeDownlinks) {
      nodeDownlinks = new BTree();
      hostDownlinks.set(nodeUri, nodeDownlinks);
    }
    if (nodeDownlinks.has(laneUri)) {
      throw new Error("duplicate downlink");
    }
    nodeDownlinks.set(laneUri, downlink);
    this._downlinkCount += 1;
    const host = this.openHost(hostUri);
    host.openDownlink(downlink);
  }

  /** @hidden */
  unlinkDownlink(downlink: DownlinkModel): void {
    const hostUri = downlink.hostUri();
    const host = this.getHost(hostUri);
    if (host) {
      host.unlinkDownlink(downlink);
    }
  }

  /** @hidden */
  closeDownlink(downlink: DownlinkModel): void {
    const hostUri = downlink.hostUri();
    const nodeUri = downlink.nodeUri();
    const laneUri = downlink.laneUri();
    const hostDownlinks = this._downlinks.get(hostUri);
    if (hostDownlinks) {
      const nodeDownlinks = hostDownlinks.get(nodeUri);
      if (nodeDownlinks) {
        if (nodeDownlinks.get(laneUri)) {
          this._downlinkCount -= 1;
          nodeDownlinks.delete(laneUri);
          if (nodeDownlinks.isEmpty()) {
            hostDownlinks.delete(nodeUri);
            if (hostDownlinks.isEmpty()) {
              this._downlinks.delete(hostUri);
            }
          }
          const host = this.getHost(hostUri);
          if (host) {
            host.closeDownlink(downlink);
          }
        }
      }
    }
  }

  downlink(init?: EventDownlinkInit): EventDownlink {
    return new EventDownlink(this, void 0, init);
  }

  downlinkList(init?: ListDownlinkInit<Value, AnyValue>): ListDownlink<Value, AnyValue>;
  downlinkList<V extends VU, VU = V>(init?: ListDownlinkInit<V, VU>): ListDownlink<V, VU>;
  downlinkList<V extends VU, VU = V>(init?: ListDownlinkInit<V, VU>): ListDownlink<V, VU> {
    return new ListDownlink(this, void 0, init);
  }

  downlinkMap(init?: MapDownlinkInit<Value, Value, AnyValue, AnyValue>): MapDownlink<Value, Value, AnyValue, AnyValue>;
  downlinkMap<K extends KU, V extends VU, KU = K, VU = V>(init?: MapDownlinkInit<K, V, KU, VU>): MapDownlink<K, V, KU, VU>;
  downlinkMap<K extends KU, V extends VU, KU = K, VU = V>(init?: MapDownlinkInit<K, V, KU, VU>): MapDownlink<K, V, KU, VU> {
    return new MapDownlink(this, void 0, init);
  }

  downlinkValue(init?: ValueDownlinkInit<Value, AnyValue>): ValueDownlink<Value, AnyValue>;
  downlinkValue<V extends VU, VU = V>(init?: ValueDownlinkInit<V, VU>): ValueDownlink<V, VU>;
  downlinkValue<V extends VU, VU = V>(init?: ValueDownlinkInit<V, VU>): ValueDownlink<V, VU> {
    return new ValueDownlink(this, void 0, init);
  }

  /** @hidden */
  openRef(ref: BaseRef): void {
    this._refs.push(ref);
  }

  /** @hidden */
  closeRef(ref: BaseRef): void {
    const index = this._refs.indexOf(ref);
    if (index >= 0) {
      this._refs.splice(index, 1);
      ref.closeUp();
    }
  }

  hostRef(hostUri: AnyUri): HostRef {
    hostUri = Uri.fromAny(hostUri);
    return new HostRef(this, hostUri);
  }

  nodeRef(hostUri: AnyUri, nodeUri: AnyUri): NodeRef;
  nodeRef(nodeUri: AnyUri): NodeRef;
  nodeRef(hostUri: AnyUri, nodeUri?: AnyUri): NodeRef {
    hostUri = Uri.fromAny(hostUri);
    if (nodeUri === void 0) {
      nodeUri = hostUri;
      hostUri = nodeUri.endpoint();
      nodeUri = hostUri.unresolve(nodeUri);
    } else {
      nodeUri = Uri.fromAny(nodeUri);
    }
    return new NodeRef(this, hostUri, nodeUri);
  }

  laneRef(hostUri: AnyUri, nodeUri: AnyUri, laneUri: AnyUri): LaneRef;
  laneRef(nodeUri: AnyUri, laneUri: AnyUri): LaneRef;
  laneRef(hostUri: AnyUri, nodeUri: AnyUri, laneUri?: AnyUri): LaneRef {
    hostUri = Uri.fromAny(hostUri);
    nodeUri = Uri.fromAny(nodeUri);
    if (laneUri === void 0) {
      laneUri = nodeUri;
      nodeUri = hostUri;
      hostUri = nodeUri.endpoint();
      nodeUri = hostUri.unresolve(nodeUri);
    } else {
      laneUri = Uri.fromAny(laneUri);
    }
    return new LaneRef(this, hostUri, nodeUri, laneUri);
  }

  authenticate(hostUri: AnyUri, credentials: AnyValue): void {
    hostUri = Uri.fromAny(hostUri);
    credentials = Value.fromAny(credentials);
    const host = this.openHost(hostUri);
    host.authenticate(credentials);
  }

  command(hostUri: AnyUri, nodeUri: AnyUri, laneUri: AnyUri, body: AnyValue): void;
  command(nodeUri: AnyUri, laneUri: AnyUri, body: AnyValue): void;
  command(hostUri: AnyUri, nodeUri: AnyUri, laneUri: AnyUri | AnyValue, body?: AnyValue): void {
    hostUri = Uri.fromAny(hostUri);
    nodeUri = Uri.fromAny(nodeUri);
    if (arguments.length === 3) {
      body = laneUri as Value;
      laneUri = nodeUri;
      nodeUri = hostUri;
      hostUri = nodeUri.endpoint();
      nodeUri = hostUri.unresolve(nodeUri);
    } else {
      laneUri = Uri.fromAny(laneUri as AnyUri);
    }
    body = Value.fromAny(body);
    const host = this.openHost(hostUri);
    host.command(nodeUri, laneUri, body);
  }

  close(): void {
    const refs = this._refs;
    this._refs = [];
    for (let i = 0; i < refs.length; i += 1) {
      refs[i].closeUp();
    }
    const downlinks = this._downlinks.clone();
    this._downlinks.clear();
    this._downlinkCount = 0;
    downlinks.forEach(function (hostUri: Uri, hostDownlinks: BTree<Uri, BTree<Uri, DownlinkModel>>): void {
      hostDownlinks.forEach(function (nodeUri: Uri, nodeDownlinks: BTree<Uri, DownlinkModel>): void {
        nodeDownlinks.forEach(function (laneUri: Uri, downlink: DownlinkModel): void {
          downlink.closeUp();
          const host = this.getHost(hostUri);
          if (host) {
            host.closeDownlink(downlink);
          }
        }, this);
      }, this);
    }, this);
    const hosts = this._hosts.clone();
    this._hosts.clear();
    hosts.forEach(function (hostUri: Uri, host: Host): void {
      host.closeUp();
    }, this);
  }

  observe(observer: SwimObserver): this {
    const oldObservers = this._observers;
    const n = oldObservers ? oldObservers.length : 0;
    const newObservers = new Array<SwimObserver>(n + 1);
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
          const newObservers = new Array<SwimObserver>(n - 1);
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

  didConnect(didConnect: SwimDidConnect): this {
    return this.observe({didConnect});
  }

  didAuthenticate(didAuthenticate: SwimDidAuthenticate): this {
    return this.observe({didAuthenticate});
  }

  didDeauthenticate(didDeauthenticate: SwimDidDeauthenticate): this {
    return this.observe({didDeauthenticate});
  }

  didDisconnect(didDisconnect: SwimDidDisconnect): this {
    return this.observe({didDisconnect});
  }

  didFail(didFail: SwimDidFail): this {
    return this.observe({didFail});
  }

  /** @hidden */
  hostDidConnect(host: Host): void {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.didConnect) {
        observer.didConnect(host, this);
      }
    }
    for (let i = 0; i < this._refs.length; i += 1) {
      const ref = this._refs[i];
      if (ref.hostUri().equals(host.hostUri())) {
        ref.hostDidConnect(host);
      }
    }
  }

  /** @hidden */
  hostDidAuthenticate(body: Value, host: Host): void {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.didAuthenticate) {
        observer.didAuthenticate(body, host, this);
      }
    }
    for (let i = 0; i < this._refs.length; i += 1) {
      const ref = this._refs[i];
      if (ref.hostUri().equals(host.hostUri())) {
        ref.hostDidAuthenticate(body, host);
      }
    }
  }

  /** @hidden */
  hostDidDeauthenticate(body: Value, host: Host): void {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.didDeauthenticate) {
        observer.didDeauthenticate(body, host, this);
      }
    }
    for (let i = 0; i < this._refs.length; i += 1) {
      const ref = this._refs[i];
      if (ref.hostUri().equals(host.hostUri())) {
        ref.hostDidDeauthenticate(body, host);
      }
    }
  }

  /** @hidden */
  hostDidDisconnect(host: Host): void {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.didDisconnect) {
        observer.didDisconnect(host, this);
      }
    }
    for (let i = 0; i < this._refs.length; i += 1) {
      const ref = this._refs[i];
      if (ref.hostUri().equals(host.hostUri())) {
        ref.hostDidDisconnect(host);
      }
    }
  }

  /** @hidden */
  hostDidFail(error: unknown, host: Host): void {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.didFail) {
        observer.didFail(error, host, this);
      }
    }
    for (let i = 0; i < this._refs.length; i += 1) {
      const ref = this._refs[i];
      if (ref.hostUri().equals(host.hostUri())) {
        ref.hostDidFail(error, host);
      }
    }
  }
}
