// Copyright 2015-2021 Swim.inc
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

import {Mutable, Arrays} from "@swim/util";
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

/** @internal */
export abstract class DownlinkModel implements HostDownlink {
  constructor(context: DownlinkContext, hostUri: Uri, nodeUri: Uri, laneUri: Uri,
              prio: number = 0, rate: number = 0, body: Value = Value.absent()) {
    this.context = context;
    this.hostUri = hostUri;
    this.nodeUri = nodeUri;
    this.laneUri = laneUri;
    this.prio = prio;
    this.rate = rate;
    this.body = body;
    this.views = Arrays.empty;
    this.host = null;
    this.status = 0;
  }

  readonly context: DownlinkContext;

  readonly hostUri: Uri;

  readonly nodeUri: Uri;

  readonly laneUri: Uri;

  readonly prio: number;

  readonly rate: number;

  readonly body: Value;

  readonly views: ReadonlyArray<Downlink>;

  readonly host: Host | null;

  /** @internal */
  readonly status: number;

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

  get connected(): boolean {
    const host = this.host;
    return host !== null && host.connected;
  }

  get authenticated(): boolean {
    const host = this.host;
    return host !== null && host.authenticated;
  }

  get linked(): boolean {
    return (this.status & DownlinkModel.Linked) !== 0;
  }

  get synced(): boolean {
    return (this.status & DownlinkModel.Synced) !== 0;
  }

  get session(): Value {
    const host = this.host;
    return host !== null ? host.session : Value.absent();
  }

  addDownlink(view: Downlink): void {
    (this as Mutable<this>).views = Arrays.inserted(view, this.views);
  }

  removeDownlink(view: Downlink): void {
    const oldViews = this.views;
    const newViews = Arrays.removed(view, oldViews);
    if (oldViews !== newViews) {
      (this as Mutable<this>).views = newViews;
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
    (this as Mutable<this>).status |= DownlinkModel.Linking;
    const views = this.views;
    for (let i = 0, n = views.length; i < n; i += 1) {
      views[i]!.onLinkRequest(request);
    }
  }

  onLinkedResponse(response: LinkedResponse, host: Host): void {
    (this as Mutable<this>).status = this.status & ~DownlinkModel.Linking | DownlinkModel.Linked;
    const views = this.views;
    for (let i = 0, n = views.length; i < n; i += 1) {
      views[i]!.onLinkedResponse(response);
    }
  }

  onSyncRequest(request: SyncRequest): void {
    (this as Mutable<this>).status |= DownlinkModel.Syncing;
    const views = this.views;
    for (let i = 0, n = views.length; i < n; i += 1) {
      views[i]!.onSyncRequest(request);
    }
  }

  onSyncedResponse(response: SyncedResponse, host: Host): void {
    (this as Mutable<this>).status = this.status & ~DownlinkModel.Syncing | DownlinkModel.Synced;
    const views = this.views;
    for (let i = 0, n = views.length; i < n; i += 1) {
      views[i]!.onSyncedResponse(response);
    }
  }

  onUnlinkRequest(request: UnlinkRequest, host: Host): void {
    (this as Mutable<this>).status = this.status & ~(DownlinkModel.Linking | DownlinkModel.Syncing) | DownlinkModel.Unlinking;
    const views = this.views;
    for (let i = 0, n = views.length; i < n; i += 1) {
      views[i]!.onUnlinkRequest(request);
    }
  }

  onUnlinkedResponse(response: UnlinkedResponse, host: Host): void {
    (this as Mutable<this>).status &= ~DownlinkModel.Unlinking;
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
    (this as Mutable<this>).status = 0;
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
    (this as Mutable<this>).status = DownlinkModel.Unlinking;
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
    (this as Mutable<this>).host = host;
    const views = this.views;
    for (let i = 0, n = views.length; i < n; i += 1) {
      this.views[i]!.openUp(host);
    }
  }

  closeUp(): void {
    const views = this.views;
    (this as Mutable<this>).views = Arrays.empty;
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
