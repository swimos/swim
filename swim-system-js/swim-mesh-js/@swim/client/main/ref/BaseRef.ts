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

import {AnyValue, Value} from "@swim/structure";
import {AnyUri, Uri} from "@swim/uri";
import {Host} from "../host/Host";
import {DownlinkOwner} from "../downlink/DownlinkOwner";
import {Downlink} from "../downlink/Downlink";
import {EventDownlinkInit, EventDownlink} from "../downlink/EventDownlink";
import {ListDownlinkInit, ListDownlink} from "../downlink/ListDownlink";
import {MapDownlinkInit, MapDownlink} from "../downlink/MapDownlink";
import {ValueDownlinkInit, ValueDownlink} from "../downlink/ValueDownlink";
import {RefContext} from "./RefContext";
import {HostRef} from "./HostRef";
import {NodeRef} from "./NodeRef";
import {LaneRef} from "./LaneRef";
import {WarpRef} from "../WarpRef";
import {
  WarpDidConnect,
  WarpDidAuthenticate,
  WarpDidDeauthenticate,
  WarpDidDisconnect,
  WarpDidFail,
  WarpObserver,
} from "../WarpObserver";

export abstract class BaseRef implements DownlinkOwner, WarpRef {
  /** @hidden */
  readonly _context: RefContext;
  /** @hidden */
  _host: Host | undefined;
  /** @hidden */
  _downlinks: Downlink[];
  /** @hidden */
  _downlinkCount: number;
  /** @hidden */
  _observers: ReadonlyArray<WarpObserver> | null;

  constructor(context: RefContext) {
    this._context = context;
    this._host = void 0;
    this._downlinks = [];
    this._observers = null;
  }

  abstract hostUri(): Uri;

  isConnected(): boolean {
    return this._host !== void 0 ? this._host.isConnected() : false;
  }

  isAuthenticated(): boolean {
    return this._host !== void 0 ? this._host.isAuthenticated() : false;
  }

  session(): Value {
    return this._host !== void 0 ? this._host.session() : Value.absent();
  }

  authenticate(credentials: AnyValue): void {
    this._context.authenticate(this.hostUri(), credentials);
  }

  abstract downlink(init?: EventDownlinkInit): EventDownlink;

  abstract downlinkList(init?: ListDownlinkInit<Value, AnyValue>): ListDownlink<Value, AnyValue>;
  abstract downlinkList<V extends VU, VU = V>(init?: ListDownlinkInit<V, VU>): ListDownlink<V, VU>;

  abstract downlinkMap(init?: MapDownlinkInit<Value, Value, AnyValue, AnyValue>): MapDownlink<Value, Value, AnyValue, AnyValue>;
  abstract downlinkMap<K extends KU, V extends VU, KU = K, VU = V>(init?: MapDownlinkInit<K, V, KU, VU>): MapDownlink<K, V, KU, VU>;

  abstract downlinkValue(init?: ValueDownlinkInit<Value, AnyValue>): ValueDownlink<Value, AnyValue>;
  abstract downlinkValue<V extends VU, VU = V>(init?: ValueDownlinkInit<V, VU>): ValueDownlink<V, VU>;

  abstract hostRef(hostUri: AnyUri): HostRef;

  abstract nodeRef(hostUri: AnyUri, nodeUri: AnyUri): NodeRef;
  abstract nodeRef(nodeUri: AnyUri): NodeRef;

  abstract laneRef(hostUri: AnyUri, nodeUri: AnyUri, laneUri: AnyUri): LaneRef;
  abstract laneRef(nodeUri: AnyUri, laneUri: AnyUri): LaneRef;

  /** @hidden */
  addDownlink(downlink: Downlink): void {
    if (this._downlinks.length === 0) {
      this.open();
    }
    this._downlinks.push(downlink);
  }

  /** @hidden */
  removeDownlink(downlink: Downlink): void {
    const i = this._downlinks.indexOf(downlink);
    if (i >= 0) {
      this._downlinks.splice(i, 1);
      if (this._downlinks.length === 0) {
        this.close();
      }
    }
  }

  open(): void {
    this._context.openRef(this);
  }

  close(): void {
    this._context.closeRef(this);
  }

  /** @hidden */
  closeUp(): void {
    const downlinks = this._downlinks;
    this._downlinks = [];
    for (let i = 0, n = downlinks.length; i < n; i += 1) {
      downlinks[i].close();
    }
  }

  observe(observer: WarpObserver): this {
    const oldObservers = this._observers;
    const n = oldObservers !== null ? oldObservers.length : 0;
    const newObservers = new Array<WarpObserver>(n + 1);
    for (let i = 0; i < n; i += 1) {
      newObservers[i] = oldObservers![i];
    }
    newObservers[n] = observer;
    this._observers = newObservers;
    return this;
  }

  unobserve(observer: unknown): this {
    const oldObservers = this._observers;
    const n = oldObservers !== null ? oldObservers.length : 0;
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
          const newObservers = new Array<WarpObserver>(n - 1);
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
    this._host = host;
    const observers = this._observers;
    const n = observers !== null ? observers.length : 0;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.didConnect !== void 0) {
        observer.didConnect(host, this);
      }
    }
  }

  /** @hidden */
  hostDidAuthenticate(body: Value, host: Host): void {
    const observers = this._observers;
    const n = observers !== null ? observers.length : 0;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.didAuthenticate !== void 0) {
        observer.didAuthenticate(body, host, this);
      }
    }
  }

  /** @hidden */
  hostDidDeauthenticate(body: Value, host: Host): void {
    const observers = this._observers;
    const n = observers !== null ? observers.length : 0;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.didDeauthenticate !== void 0) {
        observer.didDeauthenticate(body, host, this);
      }
    }
  }

  /** @hidden */
  hostDidDisconnect(host: Host): void {
    this._host = void 0;
    const observers = this._observers;
    const n = observers !== null ? observers.length : 0;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.didDisconnect !== void 0) {
        observer.didDisconnect(host, this);
      }
    }
  }

  /** @hidden */
  hostDidFail(error: unknown, host: Host): void {
    const observers = this._observers;
    const n = observers !== null ? observers.length : 0;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.didFail !== void 0) {
        observer.didFail(error, host, this);
      }
    }
  }
}
