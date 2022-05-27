// Copyright 2015-2022 Swim.inc
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
import {Property, ComponentFlags, Component} from "@swim/component";
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
import type {WarpDownlink} from "./WarpDownlink";
import {WarpHost} from "../"; // forward import

/** @internal */
export class WarpDownlinkModel extends Component {
  constructor(hostUri: Uri, nodeUri: Uri, laneUri: Uri,
              prio: number, rate: number, body: Value) {
    super();
    this.hostUri = hostUri;
    this.nodeUri = nodeUri;
    this.laneUri = laneUri;
    this.prio = prio;
    this.rate = rate;
    this.body = body;
    this.views = Arrays.empty;
  }

  readonly hostUri: Uri;

  readonly nodeUri: Uri;

  readonly laneUri: Uri;

  readonly prio: number;

  readonly rate: number;

  readonly body: Value;

  readonly views: ReadonlyArray<WarpDownlink>;

  keepLinked(): boolean {
    const views = this.views;
    for (let i = 0, n = views.length; i < n; i += 1) {
      if (views[i]!.relinks) {
        return true;
      }
    }
    return false;
  }

  keepSynced(): boolean {
    const views = this.views;
    for (let i = 0, n = views.length; i < n; i += 1) {
      if (this.views[i]!.syncs) {
        return true;
      }
    }
    return false;
  }

  @Property({valueType: Boolean, value: true, inherits: true})
  readonly online!: Property<this, boolean>;

  get connected(): boolean {
    return (this.flags & WarpDownlinkModel.ConnectedFlag) !== 0;
  }

  /** @internal */
  setConnected(connected: boolean): void {
    if (connected && (this.flags & WarpDownlinkModel.ConnectedFlag) === 0) {
      this.setFlags(this.flags | WarpDownlinkModel.ConnectedFlag);
      this.willConnect();
      this.onConnect();
      this.didConnect();
    } else if (!connected && (this.flags & WarpDownlinkModel.ConnectedFlag) !== 0) {
      this.setFlags(this.flags & ~WarpDownlinkModel.ConnectedFlag);
      this.willDisconnect();
      this.onDisconnect();
      this.didDisconnect();
    }
  }

  protected willConnect(): void {
    // hook
  }

  protected onConnect(): void {
    const views = this.views;
    for (let i = 0, n = views.length; i < n; i += 1) {
      views[i]!.hostDidConnect();
    }
  }

  protected didConnect(): void {
    if (this.keepSynced()) {
      this.sync();
    } else {
      this.link();
    }
  }

  protected willDisconnect(): void {
    this.setFlags(this.flags & ~WarpDownlinkModel.DownlinkMask);
  }

  protected onDisconnect(): void {
    const views = this.views;
    for (let i = 0, n = views.length; i < n; i += 1) {
      const view = views[i]!;
      view.hostDidDisconnect();
    }
  }

  protected didDisconnect(): void {
    if (!this.keepLinked()) {
      this.close();
    }
  }

  get linked(): boolean {
    return (this.flags & WarpDownlinkModel.LinkedFlag) !== 0;
  }

  get synced(): boolean {
    return (this.flags & WarpDownlinkModel.SyncedFlag) !== 0;
  }

  get authenticated(): boolean {
    return (this.flags & WarpHost.AuthenticatedFlag) !== 0;
  }

  /** @internal */
  setAuthenticated(authenticated: boolean): void {
    if (authenticated !== ((this.flags & WarpHost.AuthenticatedFlag) !== 0)) {
      if (authenticated) {
        this.setFlags(this.flags | WarpHost.AuthenticatedFlag);
      } else {
        this.setFlags(this.flags & ~WarpHost.AuthenticatedFlag);
      }
      this.willSetAuthenticated(authenticated);
      this.onSetAuthenticated(authenticated);
      this.didSetAuthenticated(authenticated);
    }
  }

  protected willSetAuthenticated(authenticated: boolean): void {
    // hook
  }

  protected onSetAuthenticated(authenticated: boolean): void {
    // hook
  }

  protected didSetAuthenticated(authenticated: boolean): void {
    // hook
  }

  get deauthenticated(): boolean {
    return (this.flags & WarpHost.AuthenticatedFlag) !== 0;
  }

  /** @internal */
  setDeauthenticated(deauthenticated: boolean): void {
    if (deauthenticated !== ((this.flags & WarpHost.DeauthenticatedFlag) !== 0)) {
      if (deauthenticated) {
        this.setFlags(this.flags | WarpHost.DeauthenticatedFlag);
      } else {
        this.setFlags(this.flags & ~WarpHost.DeauthenticatedFlag);
      }
      this.willSetDeauthenticated(deauthenticated);
      this.onSetDeauthenticated(deauthenticated);
      this.didSetDeauthenticated(deauthenticated);
    }
  }

  protected willSetDeauthenticated(deauthenticated: boolean): void {
    // hook
  }

  protected onSetDeauthenticated(deauthenticated: boolean): void {
    // hook
  }

  protected didSetDeauthenticated(deauthenticated: boolean): void {
    // hook
  }

  @Property({valueType: Value, value: Value.absent(), inherits: true})
  readonly session!: Property<this, Value, AnyValue>;

  addDownlink(view: WarpDownlink): void {
    (this as Mutable<this>).views = Arrays.inserted(view, this.views);
  }

  removeDownlink(view: WarpDownlink): void {
    const oldViews = this.views;
    const newViews = Arrays.removed(view, oldViews);
    if (oldViews !== newViews) {
      (this as Mutable<this>).views = newViews;
      if (newViews.length === 0) {
        const unlinkDelay = this.unlinkDelay.value;
        if (unlinkDelay < 0) {
          this.unlink();
        } else {
          setTimeout(this.doUnlink.bind(this), unlinkDelay);
        }
      }
      view.close();
    }
  }

  sync(): void {
    const host = this.getSuper(WarpHost);
    if (host !== null) {
      const nodeUri = host.unresolve(this.nodeUri);
      const request = new SyncRequest(nodeUri, this.laneUri, this.prio, this.rate, this.body);
      this.onSyncRequest(request);
      host.push(request);
    }
  }

  link(): void {
    const host = this.getSuper(WarpHost);
    if (host !== null) {
      const nodeUri = host.unresolve(this.nodeUri);
      const request = new LinkRequest(nodeUri, this.laneUri, this.prio, this.rate, this.body);
      this.onLinkRequest(request);
      host.push(request);
    }
  }

  unlink(): void {
    this.setFlags(this.flags & ~WarpDownlinkModel.DownlinkMask | WarpDownlinkModel.UnlinkingFlag);
    const host = this.getSuper(WarpHost);
    if (host !== null) {
      host.unlinkDownlink(this);
    }
  }

  protected doUnlink(): void {
    if (this.views.length === 0) {
      this.unlink();
    }
  }

  @Property({valueType: Number, value: 0, inherits: true})
  readonly unlinkDelay!: Property<this, number>;

  command(body: AnyValue): void {
    const host = this.getSuper(WarpHost);
    if (host !== null) {
      body = Value.fromAny(body);
      this.onCommandMessage(body);
      host.command(this.nodeUri, this.laneUri, body);
    }
  }

  onEventMessage(message: EventMessage, host: WarpHost): void {
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
    this.setFlags(this.flags | WarpDownlinkModel.LinkingFlag);
    const views = this.views;
    for (let i = 0, n = views.length; i < n; i += 1) {
      views[i]!.onLinkRequest(request);
    }
  }

  onLinkedResponse(response: LinkedResponse, host: WarpHost): void {
    this.setFlags(this.flags & ~WarpDownlinkModel.LinkingFlag | WarpDownlinkModel.LinkedFlag);
    const views = this.views;
    for (let i = 0, n = views.length; i < n; i += 1) {
      views[i]!.onLinkedResponse(response);
    }
  }

  onSyncRequest(request: SyncRequest): void {
    this.setFlags(this.flags | WarpDownlinkModel.SyncingFlag);
    const views = this.views;
    for (let i = 0, n = views.length; i < n; i += 1) {
      views[i]!.onSyncRequest(request);
    }
  }

  onSyncedResponse(response: SyncedResponse, host: WarpHost): void {
    this.setFlags(this.flags & ~WarpDownlinkModel.SyncingFlag | WarpDownlinkModel.SyncedFlag);
    const views = this.views;
    for (let i = 0, n = views.length; i < n; i += 1) {
      views[i]!.onSyncedResponse(response);
    }
  }

  onUnlinkRequest(request: UnlinkRequest, host: WarpHost): void {
    this.setFlags(this.flags & ~(WarpDownlinkModel.LinkingFlag | WarpDownlinkModel.SyncingFlag) | WarpDownlinkModel.UnlinkingFlag);
    const views = this.views;
    for (let i = 0, n = views.length; i < n; i += 1) {
      views[i]!.onUnlinkRequest(request);
    }
  }

  onUnlinkedResponse(response: UnlinkedResponse, host: WarpHost): void {
    this.setFlags(this.flags & ~WarpDownlinkModel.UnlinkingFlag);
    const views = this.views;
    if (views.length === 0 || (this.flags & WarpDownlinkModel.DownlinkMask) !== 0) {
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

  hostDidFail(error: unknown, host: WarpHost): void {
    const views = this.views;
    for (let i = 0, n = views.length; i < n; i += 1) {
      views[i]!.hostDidFail(error);
    }
  }

  close(): void {
    this.remove();
  }

  protected override onUnmount(): void {
    super.onUnmount();
    const views = this.views;
    (this as Mutable<this>).views = Arrays.empty;
    for (let i = 0, n = views.length; i < n; i += 1) {
      views[i]!.close();
    }
  }

  /** @internal */
  static readonly ConnectedFlag: ComponentFlags = 1 << (Component.FlagShift + 0);
  /** @internal */
  static readonly AuthenticatedFlag: ComponentFlags = 1 << (Component.FlagShift + 1);
  /** @internal */
  static readonly DeauthenticatedFlag: ComponentFlags = 1 << (Component.FlagShift + 2);
  /** @internal */
  static readonly LinkingFlag: ComponentFlags = 1 << (Component.FlagShift + 3);
  /** @internal */
  static readonly LinkedFlag: ComponentFlags = 1 << (Component.FlagShift + 4);
  /** @internal */
  static readonly SyncingFlag: ComponentFlags = 1 << (Component.FlagShift + 5);
  /** @internal */
  static readonly SyncedFlag: ComponentFlags = 1 << (Component.FlagShift + 6);
  /** @internal */
  static readonly UnlinkingFlag: ComponentFlags = 1 << (Component.FlagShift + 7);

  /** @internal */
  static readonly DownlinkMask: ComponentFlags = WarpDownlinkModel.LinkingFlag
                                               | WarpDownlinkModel.LinkedFlag
                                               | WarpDownlinkModel.SyncingFlag
                                               | WarpDownlinkModel.SyncedFlag
                                               | WarpDownlinkModel.UnlinkingFlag;

  /** @internal */
  static override readonly FlagShift: number = Component.FlagShift + 8;
  /** @internal */
  static override readonly FlagMask: ComponentFlags = (1 << WarpDownlinkModel.FlagShift) - 1;
}
