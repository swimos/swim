// Copyright 2015-2023 Swim.inc
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

import * as ws from "ws";
import {Class, Lazy} from "@swim/util";
import {Affinity, Property, Component} from "@swim/component";
import {AnyValue, Value} from "@swim/structure";
import {AnyUri, Uri} from "@swim/uri";
import webworker from "@swim/client/webworker";
import type {WarpDownlinkModel} from "../downlink/WarpDownlinkModel";
import {WarpHost} from "../host/WarpHost";
import {WarpSocketHost} from "../host/WarpSocketHost";
import {WarpWorkerHost} from "../host/WarpWorkerHost";
import type {WarpRef} from "./WarpRef";
import type {WarpClientObserver} from "./WarpClientObserver";
import {WarpScope} from "./WarpScope";

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

  override readonly observerType?: Class<WarpClientObserver>;

  override command(hostUri: AnyUri, nodeUri: AnyUri, laneUri: AnyUri, body: AnyValue): void;
  override command(nodeUri: AnyUri, laneUri: AnyUri, body: AnyValue): void;
  override command(laneUri: AnyUri, body: AnyValue): void;
  override command(body: AnyValue): void;
  override command(hostUri: AnyUri | AnyValue, nodeUri?: AnyUri | AnyValue, laneUri?: AnyUri | AnyValue, body?: AnyValue): void {
    if (nodeUri === void 0) {
      body = Value.fromAny(hostUri as AnyValue);
      laneUri = this.laneUri.getValue();
      nodeUri = this.nodeUri.getValue();
      hostUri = this.hostUri.value;
    } else if (laneUri === void 0) {
      body = Value.fromAny(nodeUri as AnyValue);
      laneUri = Uri.fromAny(hostUri as AnyUri);
      nodeUri = this.nodeUri.getValue();
      hostUri = this.hostUri.value;
    } else if (body === void 0) {
      body = Value.fromAny(laneUri as AnyValue);
      laneUri = Uri.fromAny(nodeUri as AnyUri);
      nodeUri = Uri.fromAny(hostUri as AnyUri);
      hostUri = this.hostUri.value;
    } else {
      body = Value.fromAny(body);
      laneUri = Uri.fromAny(laneUri as AnyUri);
      nodeUri = Uri.fromAny(nodeUri as AnyUri);
      hostUri = Uri.fromAny(hostUri as AnyUri);
    }
    if (hostUri === null) {
      hostUri = nodeUri.endpoint();
      nodeUri = hostUri.unresolve(nodeUri);
    }
    const host = this.openHost(hostUri);
    host.command(nodeUri, laneUri, body);
  }

  override authenticate(hostUri: AnyUri, credentials: AnyValue): void;
  override authenticate(credentials: AnyValue): void;
  override authenticate(hostUri: AnyUri | AnyValue, credentials?: AnyValue): void {
    if (credentials === void 0) {
      credentials = Value.fromAny(hostUri as AnyValue);
      hostUri = this.hostUri.getValue();
    } else {
      credentials = Value.fromAny(credentials);
      hostUri = Uri.fromAny(hostUri as AnyUri);
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

  getHost(hostUri: AnyUri): WarpHost | null {
    hostUri = Uri.fromAny(hostUri);
    return this.getChild(hostUri.toString(), WarpHost);
  }

  openHost(hostUri: AnyUri): WarpHost {
    hostUri = Uri.fromAny(hostUri);
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

  closeHost(hostUri: AnyUri): WarpHost | null {
    hostUri = Uri.fromAny(hostUri);
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

  @Property<WarpClient["wsConstructor"]>({
    value: typeof WebSocket !== "undefined" ? WebSocket : ws.WebSocket as typeof WebSocket,
    equalValues(newValue: typeof WebSocket, oldValue: typeof WebSocket): boolean {
      return newValue === oldValue;
    },
  })
  readonly wsConstructor!: Property<this, typeof WebSocket>;

  @Property({})
  readonly wsProtocols!: Property<this, string[] | string | undefined>;

  @Property<WarpClient["workerUrl"]>({
    valueType: String,
    initValue(): string | undefined {
      if (webworker !== void 0 && typeof Blob !== "undefined") {
        const webworkerBlob = new Blob([webworker], {type: "text/javascript"});
        return URL.createObjectURL(webworkerBlob);
      } else {
        return void 0;
      }
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

  @Property<WarpClient["warpRef"]>({
    extends: WarpScope.getFastenerClass("warpRef"),
    inherits: false,
    initValue(): WarpRef {
      return this.owner;
    },
  })
  override readonly warpRef!: Property<this, WarpRef> & WarpScope["warpRef"];

  @Property<WarpClient["online"]>({
    extends: WarpScope.getFastenerClass("online"),
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
    this.online.setValue(true, Affinity.Intrinsic);
  }

  /** @internal */
  protected onOffline(event: Event): void {
    this.online.setValue(false, Affinity.Intrinsic);
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
