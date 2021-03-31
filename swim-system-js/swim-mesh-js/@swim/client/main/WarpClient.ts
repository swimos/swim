// Copyright 2015-2020 Swim inc.
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

import {Arrays} from "@swim/util";
import {BTree} from "@swim/collections";
import {AnyValue, Value} from "@swim/structure";
import {AnyUri, Uri} from "@swim/uri";
import type {HostContext} from "./host/HostContext";
import type {HostOptions, Host} from "./host/Host";
import {WebSocketHost} from "./host/WebSocketHost";
import type {DownlinkModel} from "./downlink/DownlinkModel";
import {EventDownlinkInit, EventDownlink} from "./downlink/EventDownlink";
import {ListDownlinkInit, ListDownlink} from "./downlink/ListDownlink";
import {MapDownlinkInit, MapDownlink} from "./downlink/MapDownlink";
import {ValueDownlinkInit, ValueDownlink} from "./downlink/ValueDownlink";
import type {WarpRef} from "./WarpRef";
import type {
  WarpDidConnect,
  WarpDidAuthenticate,
  WarpDidDeauthenticate,
  WarpDidDisconnect,
  WarpDidFail,
  WarpObserver,
} from "./WarpObserver";
import type {RefContext} from "./ref/RefContext";
import type {BaseRef} from "./ref/BaseRef";
import {HostRef} from "./ref/HostRef";
import {NodeRef} from "./ref/NodeRef";
import {LaneRef} from "./ref/LaneRef";

export interface WarpClientOptions extends HostOptions {
  keepOnline?: boolean;
}

export class WarpClient implements HostContext, RefContext, WarpRef {
  constructor(options: WarpClientOptions = {}) {
    if (options.keepOnline === void 0) {
      options.keepOnline = true;
    }
    Object.defineProperty(this, "options", {
      value: options,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "hosts", {
      value: new BTree(),
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "downlinks", {
      value: new BTree(),
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "downlinkCount", {
      value: 0,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "refs", {
      value: [],
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "online", {
      value: true,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "observers", {
      value: Arrays.empty,
      enumerable: true,
      configurable: true,
    });

    this.onOnline = this.onOnline.bind(this);
    this.onOffline = this.onOffline.bind(this);
    this.watchOnline(!!options.keepOnline);
  }

  /** @hidden */
  declare readonly options: WarpClientOptions;

  /** @hidden */
  declare readonly hosts: BTree<Uri, Host>;

  /** @hidden */
  declare readonly downlinks: BTree<Uri, BTree<Uri, BTree<Uri, DownlinkModel>>>;

  /** @hidden */
  declare readonly downlinkCount: number;

  /** @hidden */
  declare readonly refs: BaseRef[];

  /** @hidden */
  declare readonly online: boolean;

  /** @hidden */
  declare readonly observers: ReadonlyArray<WarpObserver>;

  isOnline(): boolean;
  isOnline(online: boolean): this;
  isOnline(online?: boolean): boolean | this {
    if (online === void 0) {
      return this.online;
    } else {
      if (this.online !== online) {
        Object.defineProperty(this, "online", {
          value: online,
          enumerable: true,
          configurable: true,
        });
        if (online) {
          this.hosts.forEach(function (hostUri: Uri, host: Host): void {
            host.open();
          }, this);
        }
      }
      return this;
    }
  }

  keepOnline(): boolean;
  keepOnline(keepOnline: boolean): this;
  keepOnline(keepOnline?: boolean): boolean | this {
    if (keepOnline === void 0) {
      return !!this.options.keepOnline;
    } else {
      if (this.options.keepOnline !== keepOnline) {
        this.options.keepOnline = keepOnline;
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
    return this.hosts.get(hostUri as Uri);
  }

  /** @hidden */
  openHost(hostUri: AnyUri): Host {
    hostUri = Uri.fromAny(hostUri);
    let host = this.hosts.get(hostUri as Uri);
    if (host === void 0) {
      host = new WebSocketHost(this, hostUri as Uri, this.options);
      this.hosts.set(hostUri as Uri, host);
    }
    return host;
  }

  /** @hidden */
  closeHost(host: Host): void {
    if (this.hosts.get(host.hostUri) !== void 0) {
      this.hosts.delete(host.hostUri);
      host.closeUp();
    }
  }

  /** @hidden */
  getDownlink(hostUri: Uri, nodeUri: Uri, laneUri: Uri): DownlinkModel | undefined {
    const hostDownlinks = this.downlinks.get(hostUri);
    if (hostDownlinks !== void 0) {
      const nodeDownlinks = hostDownlinks.get(nodeUri);
      if (nodeDownlinks !== void 0) {
        return nodeDownlinks.get(laneUri);
      }
    }
    return void 0;
  }

  /** @hidden */
  openDownlink(downlink: DownlinkModel): void {
    const hostUri = downlink.hostUri;
    const nodeUri = downlink.nodeUri;
    const laneUri = downlink.laneUri;
    let hostDownlinks = this.downlinks.get(hostUri);
    if (hostDownlinks === void 0) {
      hostDownlinks = new BTree();
      this.downlinks.set(hostUri, hostDownlinks);
    }
    let nodeDownlinks = hostDownlinks.get(nodeUri);
    if (nodeDownlinks === void 0) {
      nodeDownlinks = new BTree();
      hostDownlinks.set(nodeUri, nodeDownlinks);
    }
    if (nodeDownlinks.has(laneUri)) {
      throw new Error("duplicate downlink");
    }
    nodeDownlinks.set(laneUri, downlink);
    Object.defineProperty(this, "downlinkCount", {
      value: this.downlinkCount + 1,
      enumerable: true,
      configurable: true,
    });
    const host = this.openHost(hostUri);
    host.openDownlink(downlink);
  }

  /** @hidden */
  unlinkDownlink(downlink: DownlinkModel): void {
    const hostUri = downlink.hostUri;
    const host = this.getHost(hostUri);
    if (host !== void 0) {
      host.unlinkDownlink(downlink);
    }
  }

  /** @hidden */
  closeDownlink(downlink: DownlinkModel): void {
    const hostUri = downlink.hostUri;
    const nodeUri = downlink.nodeUri;
    const laneUri = downlink.laneUri;
    const hostDownlinks = this.downlinks.get(hostUri);
    if (hostDownlinks !== void 0) {
      const nodeDownlinks = hostDownlinks.get(nodeUri);
      if (nodeDownlinks !== void 0) {
        if (nodeDownlinks.get(laneUri)) {
          Object.defineProperty(this, "downlinkCount", {
            value: this.downlinkCount - 1,
            enumerable: true,
            configurable: true,
          });
          nodeDownlinks.delete(laneUri);
          if (nodeDownlinks.isEmpty()) {
            hostDownlinks.delete(nodeUri);
            if (hostDownlinks.isEmpty()) {
              this.downlinks.delete(hostUri);
            }
          }
          const host = this.getHost(hostUri);
          if (host !== void 0) {
            host.closeDownlink(downlink);
          }
        }
      }
    }
  }

  downlink(init?: EventDownlinkInit): EventDownlink {
    return new EventDownlink(this, null, init);
  }

  downlinkList(init?: ListDownlinkInit<Value, AnyValue>): ListDownlink<Value, AnyValue>;
  downlinkList<V extends VU, VU = never>(init?: ListDownlinkInit<V, VU>): ListDownlink<V, VU>;
  downlinkList<V extends VU, VU = never>(init?: ListDownlinkInit<V, VU>): ListDownlink<V, VU> {
    return new ListDownlink(this, null, init);
  }

  downlinkMap(init?: MapDownlinkInit<Value, Value, AnyValue, AnyValue>): MapDownlink<Value, Value, AnyValue, AnyValue>;
  downlinkMap<K extends KU, V extends VU, KU = never, VU = never>(init?: MapDownlinkInit<K, V, KU, VU>): MapDownlink<K, V, KU, VU>;
  downlinkMap<K extends KU, V extends VU, KU = never, VU = never>(init?: MapDownlinkInit<K, V, KU, VU>): MapDownlink<K, V, KU, VU> {
    return new MapDownlink(this, null, init);
  }

  downlinkValue(init?: ValueDownlinkInit<Value, AnyValue>): ValueDownlink<Value, AnyValue>;
  downlinkValue<V extends VU, VU = never>(init?: ValueDownlinkInit<V, VU>): ValueDownlink<V, VU>;
  downlinkValue<V extends VU, VU = never>(init?: ValueDownlinkInit<V, VU>): ValueDownlink<V, VU> {
    return new ValueDownlink(this, null, init);
  }

  /** @hidden */
  openRef(ref: BaseRef): void {
    this.refs.push(ref);
  }

  /** @hidden */
  closeRef(ref: BaseRef): void {
    const refs = this.refs;
    const index = refs.indexOf(ref);
    if (index >= 0) {
      refs.splice(index, 1);
      ref.closeUp();
    }
  }

  hostRef(hostUri: AnyUri): HostRef {
    hostUri = Uri.fromAny(hostUri);
    return new HostRef(this, hostUri as Uri);
  }

  nodeRef(hostUri: AnyUri, nodeUri: AnyUri): NodeRef;
  nodeRef(nodeUri: AnyUri): NodeRef;
  nodeRef(hostUri: AnyUri, nodeUri?: AnyUri): NodeRef {
    hostUri = Uri.fromAny(hostUri);
    if (nodeUri === void 0) {
      nodeUri = hostUri;
      hostUri = (nodeUri as Uri).endpoint();
      nodeUri = (hostUri as Uri).unresolve(nodeUri);
    } else {
      nodeUri = Uri.fromAny(nodeUri);
    }
    return new NodeRef(this, hostUri as Uri, nodeUri as Uri);
  }

  laneRef(hostUri: AnyUri, nodeUri: AnyUri, laneUri: AnyUri): LaneRef;
  laneRef(nodeUri: AnyUri, laneUri: AnyUri): LaneRef;
  laneRef(hostUri: AnyUri, nodeUri: AnyUri, laneUri?: AnyUri): LaneRef {
    hostUri = Uri.fromAny(hostUri);
    nodeUri = Uri.fromAny(nodeUri);
    if (laneUri === void 0) {
      laneUri = nodeUri;
      nodeUri = hostUri;
      hostUri = (nodeUri as Uri).endpoint();
      nodeUri = (hostUri as Uri).unresolve(nodeUri);
    } else {
      laneUri = Uri.fromAny(laneUri);
    }
    return new LaneRef(this, hostUri as Uri, nodeUri as Uri, laneUri as Uri);
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
      hostUri = (nodeUri as Uri).endpoint();
      nodeUri = (hostUri as Uri).unresolve(nodeUri);
    } else {
      laneUri = Uri.fromAny(laneUri as AnyUri);
    }
    body = Value.fromAny(body);
    const host = this.openHost(hostUri);
    host.command(nodeUri, laneUri, body);
  }

  close(): void {
    const refs = this.refs;
    Object.defineProperty(this, "refs", {
      value: [],
      enumerable: true,
      configurable: true,
    });
    for (let i = 0; i < refs.length; i += 1) {
      refs[i]!.closeUp();
    }
    const downlinks = this.downlinks.clone();
    this.downlinks.clear();
    Object.defineProperty(this, "downlinkCount", {
      value: 0,
      enumerable: true,
      configurable: true,
    });
    downlinks.forEach(function (hostUri: Uri, hostDownlinks: BTree<Uri, BTree<Uri, DownlinkModel>>): void {
      hostDownlinks.forEach(function (nodeUri: Uri, nodeDownlinks: BTree<Uri, DownlinkModel>): void {
        nodeDownlinks.forEach(function (laneUri: Uri, downlink: DownlinkModel): void {
          downlink.closeUp();
          const host = this.getHost(hostUri);
          if (host !== void 0) {
            host.closeDownlink(downlink);
          }
        }, this);
      }, this);
    }, this);
    const hosts = this.hosts.clone();
    this.hosts.clear();
    hosts.forEach(function (hostUri: Uri, host: Host): void {
      host.closeUp();
    }, this);
  }

  observe(observer: WarpObserver): this {
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
          const newObservers = new Array<WarpObserver>(n - 1);
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

  didConnect(didConnect: WarpDidConnect): this {
    return this.observe({didConnect});
  }

  didAuthenticate(didAuthenticate: WarpDidAuthenticate): this {
    return this.observe({didAuthenticate});
  }

  didDeauthenticate(didDeauthenticate: WarpDidDeauthenticate): this {
    return this.observe({didDeauthenticate});
  }

  didDisconnect(didDisconnect: WarpDidDisconnect): this {
    return this.observe({didDisconnect});
  }

  didFail(didFail: WarpDidFail): this {
    return this.observe({didFail});
  }

  /** @hidden */
  hostDidConnect(host: Host): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.didConnect !== void 0) {
        observer.didConnect(host, this);
      }
    }
    const refs = this.refs;
    for (let i = 0, n = refs.length; i < n; i += 1) {
      const ref = refs[i]!;
      if (ref.hostUri.equals(host.hostUri)) {
        ref.hostDidConnect(host);
      }
    }
  }

  /** @hidden */
  hostDidAuthenticate(body: Value, host: Host): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.didAuthenticate !== void 0) {
        observer.didAuthenticate(body, host, this);
      }
    }
    const refs = this.refs;
    for (let i = 0, n = refs.length; i < n; i += 1) {
      const ref = refs[i]!;
      if (ref.hostUri.equals(host.hostUri)) {
        ref.hostDidAuthenticate(body, host);
      }
    }
  }

  /** @hidden */
  hostDidDeauthenticate(body: Value, host: Host): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.didDeauthenticate !== void 0) {
        observer.didDeauthenticate(body, host, this);
      }
    }
    const refs = this.refs;
    for (let i = 0, n = refs.length; i < n; i += 1) {
      const ref = refs[i]!;
      if (ref.hostUri.equals(host.hostUri)) {
        ref.hostDidDeauthenticate(body, host);
      }
    }
  }

  /** @hidden */
  hostDidDisconnect(host: Host): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.didDisconnect !== void 0) {
        observer.didDisconnect(host, this);
      }
    }
    const refs = this.refs;
    for (let i = 0, n = refs.length; i < n; i += 1) {
      const ref = refs[i]!;
      if (ref.hostUri.equals(host.hostUri)) {
        ref.hostDidDisconnect(host);
      }
    }
  }

  /** @hidden */
  hostDidFail(error: unknown, host: Host): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.didFail !== void 0) {
        observer.didFail(error, host, this);
      }
    }
    const refs = this.refs;
    for (let i = 0, n = refs.length; i < n; i += 1) {
      const ref = refs[i]!;
      if (ref.hostUri.equals(host.hostUri)) {
        ref.hostDidFail(error, host);
      }
    }
  }
}
