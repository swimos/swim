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

import {Arrays} from "@swim/util";
import type {Uri} from "@swim/uri";
import {AnyValue, Value} from "@swim/structure";
import {
  EventMessage,
  LinkRequest,
  LinkedResponse,
  SyncRequest,
  SyncedResponse,
  UnlinkRequest,
  UnlinkedResponse,
} from "@swim/warp";
import type {HostDownlink} from "../host/HostDownlink";
import type {Host} from "../host/Host";
import type {DownlinkContext} from "./DownlinkContext";
import type {DownlinkType, Downlink} from "./Downlink";

/** @hidden */
export abstract class DownlinkModel implements HostDownlink {
  constructor(context: DownlinkContext, hostUri: Uri, nodeUri: Uri, laneUri: Uri,
              prio: number = 0, rate: number = 0, body: Value = Value.absent()) {
    Object.defineProperty(this, "context", {
      value: context,
      enumerable: true,
    });
    Object.defineProperty(this, "hostUri", {
      value: hostUri,
      enumerable: true,
    });
    Object.defineProperty(this, "nodeUri", {
      value: nodeUri,
      enumerable: true,
    });
    Object.defineProperty(this, "laneUri", {
      value: laneUri,
      enumerable: true,
    });
    Object.defineProperty(this, "prio", {
      value: prio,
      enumerable: true,
    });
    Object.defineProperty(this, "rate", {
      value: rate,
      enumerable: true,
    });
    Object.defineProperty(this, "body", {
      value: body,
      enumerable: true,
    });
    Object.defineProperty(this, "views", {
      value: Arrays.empty,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "host", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "status", {
      value: 0,
      enumerable: true,
      configurable: true,
    });
  }

  readonly context!: DownlinkContext;

  readonly hostUri!: Uri;

  readonly nodeUri!: Uri;

  readonly laneUri!: Uri;

  readonly prio!: number;

  readonly rate!: number;

  readonly body!: Value;

  readonly views!: ReadonlyArray<Downlink>;

  readonly host!: Host | null;

  /** @hidden */
  readonly status!: number;

  abstract readonly type: DownlinkType;

  keepLinked(): boolean {
    const views = this.views;
    for (let i = 0, n = views.length; i < n; i += 1) {
      if (views[i]!.keepLinked()) {
        return true;
      }
    }
    return false;
  }

  keepSynced(): boolean {
    const views = this.views;
    for (let i = 0, n = views.length; i < n; i += 1) {
      if (this.views[i]!.keepSynced()) {
        return true;
      }
    }
    return false;
  }

  get unlinkDelay(): number {
    const host = this.host;
    return host !== null ? host.unlinkDelay : 0;
  }

  isConnected(): boolean {
    const host = this.host;
    return host !== null ? host.isConnected() : false;
  }

  isAuthenticated(): boolean {
    const host = this.host;
    return host !== null ? host.isAuthenticated() : false;
  }

  isLinked(): boolean {
    return (this.status & DownlinkModel.Linked) !== 0;
  }

  isSynced(): boolean {
    return (this.status & DownlinkModel.Synced) !== 0;
  }

  get session(): Value {
    const host = this.host;
    return host !== null ? host.session : Value.absent();
  }

  addDownlink(view: Downlink): void {
    Object.defineProperty(this, "views", {
      value: Arrays.inserted(view, this.views),
      enumerable: true,
      configurable: true,
    });
  }

  removeDownlink(view: Downlink): void {
    const oldViews = this.views;
    const newViews = Arrays.removed(view, oldViews);
    if (oldViews !== newViews) {
      Object.defineProperty(this, "views", {
        value: newViews,
        enumerable: true,
        configurable: true,
      });
      view.closeUp();
      if (newViews.length === 0) {
        const unlinkDelay = this.unlinkDelay;
        if (unlinkDelay < 0) {
          this.unlink();
        } else {
          setTimeout(this.doUnlink.bind(this), unlinkDelay);
        }
      }
    }
  }

  onEventMessage(message: EventMessage, host: Host): void {
    const views = this.views;
    for (let i = 0, n = views.length; i < n; i += 1) {
      views[i]!.onEventMessage(message);
    }
  }

  onCommandMessage(body: Value): void {
    const views = this.views;
    for (let i = 0, n = views.length; i < n; i += 1) {
      views[i]!.onCommandMessage(body);
    }
  }

  onLinkRequest(request: LinkRequest): void {
    Object.defineProperty(this, "status", {
      value: this.status | DownlinkModel.Linking,
      enumerable: true,
      configurable: true,
    });
    const views = this.views;
    for (let i = 0, n = views.length; i < n; i += 1) {
      views[i]!.onLinkRequest(request);
    }
  }

  onLinkedResponse(response: LinkedResponse, host: Host): void {
    Object.defineProperty(this, "status", {
      value: this.status & ~DownlinkModel.Linking | DownlinkModel.Linked,
      enumerable: true,
      configurable: true,
    });
    const views = this.views;
    for (let i = 0, n = views.length; i < n; i += 1) {
      views[i]!.onLinkedResponse(response);
    }
  }

  onSyncRequest(request: SyncRequest): void {
    Object.defineProperty(this, "status", {
      value: this.status | DownlinkModel.Syncing,
      enumerable: true,
      configurable: true,
    });
    const views = this.views;
    for (let i = 0, n = views.length; i < n; i += 1) {
      views[i]!.onSyncRequest(request);
    }
  }

  onSyncedResponse(response: SyncedResponse, host: Host): void {
    Object.defineProperty(this, "status", {
      value: this.status & ~DownlinkModel.Syncing | DownlinkModel.Synced,
      enumerable: true,
      configurable: true,
    });
    const views = this.views;
    for (let i = 0, n = views.length; i < n; i += 1) {
      views[i]!.onSyncedResponse(response);
    }
  }

  onUnlinkRequest(request: UnlinkRequest, host: Host): void {
    Object.defineProperty(this, "status", {
      value: this.status & ~(DownlinkModel.Linking | DownlinkModel.Syncing) | DownlinkModel.Unlinking,
      enumerable: true,
      configurable: true,
    });
    const views = this.views;
    for (let i = 0, n = views.length; i < n; i += 1) {
      views[i]!.onUnlinkRequest(request);
    }
  }

  onUnlinkedResponse(response: UnlinkedResponse, host: Host): void {
    Object.defineProperty(this, "status", {
      value: this.status & ~DownlinkModel.Unlinking,
      enumerable: true,
      configurable: true,
    });
    const views = this.views;
    if (views.length === 0 || this.status !== 0) {
      for (let i = 0, n = views.length; i < n; i += 1) {
        views[i]!.onUnlinkedResponse(response);
      }
      this.close();
    } else { // concurrently relinked
      if (this.keepSynced()) {
        this.sync();
      } else {
        this.link();
      }
    }
  }

  hostDidConnect(host: Host): void {
    const views = this.views;
    for (let i = 0, n = views.length; i < n; i += 1) {
      views[i]!.hostDidConnect();
    }
    if (this.keepSynced()) {
      this.sync();
    } else {
      this.link();
    }
  }

  hostDidDisconnect(host: Host): void {
    Object.defineProperty(this, "status", {
      value: 0,
      enumerable: true,
      configurable: true,
    });
    let keepLinked = false;
    const views = this.views;
    for (let i = 0, n = views.length; i < n; i += 1) {
      const view = views[i]!;
      view.hostDidDisconnect();
      keepLinked = keepLinked || view.keepLinked();
    }
    if (!keepLinked) {
      this.close();
    }
  }

  hostDidFail(error: unknown, host: Host): void {
    const views = this.views;
    for (let i = 0, n = views.length; i < n; i += 1) {
      views[i]!.hostDidFail(error);
    }
  }

  command(body: AnyValue): void {
    body = Value.fromAny(body);
    this.onCommandMessage(body);
    this.host!.command(this.nodeUri, this.laneUri, body);
  }

  sync(): void {
    const nodeUri = this.host!.unresolve(this.nodeUri);
    const request = new SyncRequest(nodeUri, this.laneUri, this.prio, this.rate, this.body);
    this.onSyncRequest(request);
    this.host!.push(request);
  }

  link(): void {
    const nodeUri = this.host!.unresolve(this.nodeUri);
    const request = new LinkRequest(nodeUri, this.laneUri, this.prio, this.rate, this.body);
    this.onLinkRequest(request);
    this.host!.push(request);
  }

  unlink(): void {
    Object.defineProperty(this, "status", {
      value: DownlinkModel.Unlinking,
      enumerable: true,
      configurable: true,
    });
    this.context.unlinkDownlink(this);
  }

  protected doUnlink(): void {
    if (this.views.length === 0) {
      this.unlink();
    }
  }

  close(): void {
    this.context.closeDownlink(this);
  }

  openUp(host: Host): void {
    Object.defineProperty(this, "host", {
      value: host,
      enumerable: true,
      configurable: true,
    });
    const views = this.views;
    for (let i = 0, n = views.length; i < n; i += 1) {
      this.views[i]!.openUp(host);
    }
  }

  closeUp(): void {
    const views = this.views;
    Object.defineProperty(this, "views", {
      value: Arrays.empty,
      enumerable: true,
      configurable: true,
    });
    for (let i = 0, n = views.length; i < n; i += 1) {
      views[i]!.closeUp();
    }
  }

  static readonly Linking: number = 1 << 0;
  static readonly Linked: number = 1 << 1;
  static readonly Syncing: number = 1 << 2;
  static readonly Synced: number = 1 << 3;
  static readonly Unlinking: number = 1 << 4;
}
