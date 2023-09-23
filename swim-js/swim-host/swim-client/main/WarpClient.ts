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

import * as WS from "ws";
import type {Class} from "@swim/util";
import {Lazy} from "@swim/util";
import type {Observer} from "@swim/util";
import {Property} from "@swim/component";
import type {Component} from "@swim/component";
import type {ValueLike} from "@swim/structure";
import {Value} from "@swim/structure";
import type {UriLike} from "@swim/uri";
import {Uri} from "@swim/uri";
import webworker from "@swim/client/webworker";
import type {WarpDownlinkModel} from "./WarpDownlinkModel";
import {WarpHost} from "./WarpHost";
import {WarpSocketHost} from "./WarpSocketHost";
import {WarpWorkerHost} from "./WarpWorkerHost";
import type {WarpRef} from "./WarpRef";
import {WarpScope} from "./WarpScope";

/** @public */
export interface WarpClientObserver<C extends WarpClient = WarpClient> extends Observer {
  clientDidConnect?(host: WarpHost, client: C): void;

  clientDidAuthenticate?(body: Value, host: WarpHost, client: C): void;

  clientDidDeauthenticate?(body: Value, host: WarpHost, client: C): void;

  clientDidDisconnect?(host: WarpHost, client: C): void;

  clientDidFail?(error: unknown, host: WarpHost, client: C): void;
}

/** @public */
export class WarpClient extends WarpScope {
  constructor() {
    super();
    this.hostUri.setInherits(false);
    this.nodeUri.setInherits(false);
    this.laneUri.setInherits(false);
    this.onOnline = this.onOnline.bind(this);
    this.onOffline = this.onOffline.bind(this);
  }

  declare readonly observerType?: Class<WarpClientObserver>;

  override command(hostUri: UriLike, nodeUri: UriLike, laneUri: UriLike, body: ValueLike): void;
  override command(nodeUri: UriLike, laneUri: UriLike, body: ValueLike): void;
  override command(laneUri: UriLike, body: ValueLike): void;
  override command(body: ValueLike): void;
  override command(hostUri: UriLike | ValueLike, nodeUri?: UriLike | ValueLike, laneUri?: UriLike | ValueLike, body?: ValueLike): void {
    if (nodeUri === void 0) {
      body = Value.fromLike(hostUri as ValueLike);
      laneUri = this.laneUri.getValue();
      nodeUri = this.nodeUri.getValue();
      hostUri = this.hostUri.value;
    } else if (laneUri === void 0) {
      body = Value.fromLike(nodeUri as ValueLike);
      laneUri = Uri.fromLike(hostUri as UriLike);
      nodeUri = this.nodeUri.getValue();
      hostUri = this.hostUri.value;
    } else if (body === void 0) {
      body = Value.fromLike(laneUri as ValueLike);
      laneUri = Uri.fromLike(nodeUri as UriLike);
      nodeUri = Uri.fromLike(hostUri as UriLike);
      hostUri = this.hostUri.value;
    } else {
      body = Value.fromLike(body);
      laneUri = Uri.fromLike(laneUri as UriLike);
      nodeUri = Uri.fromLike(nodeUri as UriLike);
      hostUri = Uri.fromLike(hostUri as UriLike);
    }
    if (hostUri === null) {
      hostUri = nodeUri.endpoint();
      nodeUri = hostUri.unresolve(nodeUri);
    }
    const host = this.openHost(hostUri);
    host.command(nodeUri, laneUri, body);
  }

  override authenticate(hostUri: UriLike, credentials: ValueLike): void;
  override authenticate(credentials: ValueLike): void;
  override authenticate(hostUri: UriLike | ValueLike, credentials?: ValueLike): void {
    if (credentials === void 0) {
      credentials = Value.fromLike(hostUri as ValueLike);
      hostUri = this.hostUri.getValue();
    } else {
      credentials = Value.fromLike(credentials);
      hostUri = Uri.fromLike(hostUri as UriLike);
    }
    const host = this.openHost(hostUri);
    host.authenticate(credentials);
  }

  /** @internal */
  override getDownlink(hostUri: Uri, nodeUri: Uri, laneUri: Uri): WarpDownlinkModel | null {
    const host = this.getHost(hostUri);
    if (host !== null) {
      return host.getDownlink(nodeUri, laneUri);
    }
    return null;
  }

  /** @internal */
  override openDownlink(downlink: WarpDownlinkModel): void {
    const host = this.openHost(downlink.hostUri);
    host.openDownlink(downlink);
  }

  getHost(hostUri: UriLike): WarpHost | null {
    hostUri = Uri.fromLike(hostUri);
    return this.getChild(hostUri.toString(), WarpHost);
  }

  openHost(hostUri: UriLike): WarpHost {
    hostUri = Uri.fromLike(hostUri);
    let host = this.getChild(hostUri.toString(), WarpHost);
    if (host === null) {
      host = this.createHost(hostUri);
      this.setChild(hostUri.toString(), host);
    }
    return host;
  }

  protected createHost(hostUri: Uri): WarpHost {
    let host: WarpHost | null = null;
    try {
      const workerUrl = this.workerUrl.value;
      if (workerUrl !== void 0) {
        const worker = new Worker(workerUrl, {
          name: hostUri.toString(),
          type: "classic",
          credentials: "same-origin",
        });
        host = new WarpWorkerHost(hostUri, worker);
      }
    } catch (error) {
      // swallow
    }
    if (host === null) {
      host = new WarpSocketHost(hostUri);
    }
    return host;
  }

  closeHost(hostUri: UriLike): WarpHost | null {
    hostUri = Uri.fromLike(hostUri);
    const host = this.getChild(hostUri.toString(), WarpHost);
    if (host !== null) {
      this.removeChild(host);
    }
    return host;
  }

  @Property({valueType: Number, value: 1024})
  readonly sendBufferSize!: Property<this, number>;

  @Property({valueType: Number, value: 30 * 1000})
  readonly maxReconnectTimeout!: Property<this, number>;

  @Property({valueType: Number, value: 1000})
  readonly idleTimeout!: Property<this, number>;

  @Property({valueType: Number, value: 0})
  readonly unlinkDelay!: Property<this, number>;

  @Property({
    value: typeof WebSocket !== "undefined" ? WebSocket : WS.WebSocket as typeof WebSocket,
    equalValues(newValue: typeof WebSocket, oldValue: typeof WebSocket): boolean {
      return newValue === oldValue;
    },
  })
  readonly wsConstructor!: Property<this, typeof WebSocket>;

  @Property({})
  readonly wsProtocols!: Property<this, readonly string[] | string | undefined>;

  @Property({
    valueType: String,
    initValue(): string | undefined {
      if (webworker === void 0 || typeof Blob === "undefined") {
        return void 0;
      }
      const webworkerBlob = new Blob([webworker], {type: "text/javascript"});
      return URL.createObjectURL(webworkerBlob);
    },
  })
  readonly workerUrl!: Property<this, string | undefined>;

  /** @internal */
  hostDidConnect(host: WarpHost): void {
    this.callObservers("clientDidConnect", host, this);
  }

  /** @internal */
  hostDidAuthenticate(body: Value, host: WarpHost): void {
    this.callObservers("clientDidAuthenticate", body, host, this);
  }

  /** @internal */
  hostDidDeauthenticate(body: Value, host: WarpHost): void {
    this.callObservers("clientDidDeauthenticate", body, host, this);
  }

  /** @internal */
  hostDidDisconnect(host: WarpHost): void {
    this.callObservers("clientDidDisconnect", host, this);
  }

  /** @internal */
  hostDidFail(error: unknown, host: WarpHost): void {
    this.callObservers("clientDidFail", error, host, this);
  }

  protected override onInsertChild(child: Component, target: Component | null): void {
    super.onInsertChild(child, target);
    if (child instanceof WarpHost) {
      this.onInsertHost(child);
    }
  }

  /** @internal */
  protected onInsertHost(host: WarpHost): void {
    host.observe(this);
  }

  protected override onRemoveChild(child: Component): void {
    super.onRemoveChild(child);
    if (child instanceof WarpHost) {
      this.onRemoveHost(child);
    }
  }

  /** @internal */
  protected onRemoveHost(host: WarpHost): void {
    host.unobserve(this);
  }

  @Property({
    extends: true,
    inherits: false,
    initValue(): WarpRef {
      return this.owner;
    },
  })
  override readonly warpRef!: Property<this, WarpRef>;

  @Property({
    extends: true,
    inherits: false,
    initValue(): boolean {
      return typeof navigator === "object" ? navigator.onLine : true;
    },
    didSetValue(online: boolean): void {
      let child = this.owner.firstChild;
      while (child !== null) {
        const next = child.nextSibling;
        if (child instanceof WarpHost) {
          child.online.recohere(performance.now());
          if (online) {
            child.connect();
          } else {
            child.disconnect();
          }
        }
        child = next;
      }
    },
  })
  override readonly online!: Property<this, boolean> & WarpScope["online"];

  /** @internal */
  protected onOnline(event: Event): void {
    this.online.setIntrinsic(true);
  }

  /** @internal */
  protected onOffline(event: Event): void {
    this.online.setIntrinsic(false);
  }

  protected override onMount(): void {
    super.onMount();
    if (typeof window === "object") {
      window.addEventListener("online", this.onOnline);
      window.addEventListener("offline", this.onOffline);
    }
  }

  protected override onUnmount(): void {
    super.onUnmount();
    if (typeof window === "object") {
      window.removeEventListener("online", this.onOnline);
      window.removeEventListener("offline", this.onOffline);
    }
  }

  @Lazy
  static global(): WarpClient {
    const client = new WarpClient();
    client.mount();
    return client;
  }
}
