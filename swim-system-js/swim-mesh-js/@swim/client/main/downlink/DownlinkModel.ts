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

import {Uri} from "@swim/uri";
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
import {HostDownlink} from "../host/HostDownlink";
import {Host} from "../host/Host";
import {DownlinkContext} from "./DownlinkContext";
import {DownlinkType, Downlink} from "./Downlink";

const LINKING = 1;
const LINKED = 2;
const SYNCING = 4;
const SYNCED = 8;
const UNLINKING = 16;

/** @hidden */
export abstract class DownlinkModel implements HostDownlink {
   /** @hidden */
  readonly _context: DownlinkContext;
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
  _views: Downlink[];
  /** @hidden */
  _host: Host | null;
  /** @hidden */
  _status: number;

  constructor(context: DownlinkContext, hostUri: Uri, nodeUri: Uri, laneUri: Uri,
              prio: number = 0, rate: number = 0, body: Value = Value.absent()) {
    this._context = context;
    this._hostUri = hostUri;
    this._nodeUri = nodeUri;
    this._laneUri = laneUri;
    this._prio = prio;
    this._rate = rate;
    this._body = body;
    this._views = [];
    this._host = null;
    this._status = 0;
  }

  hostUri(): Uri {
    return this._hostUri;
  }

  nodeUri(): Uri {
    return this._nodeUri;
  }

  laneUri(): Uri {
    return this._laneUri;
  }

  prio(): number {
    return this._prio;
  }

  rate(): number {
    return this._rate;
  }

  body(): Value {
    return this._body;
  }

  abstract type(): DownlinkType;

  keepLinked(): boolean {
    for (let i = 0; i < this._views.length; i += 1) {
      if (this._views[i].keepLinked()) {
        return true;
      }
    }
    return false;
  }

  keepSynced(): boolean {
    for (let i = 0; i < this._views.length; i += 1) {
      if (this._views[i].keepSynced()) {
        return true;
      }
    }
    return false;
  }

  unlinkDelay(): number {
    return this._host ? this._host.unlinkDelay() : 0;
  }

  isConnected(): boolean {
    return !!(this._host && this._host.isConnected());
  }

  isAuthenticated(): boolean {
    return !!(this._host && this._host.isAuthenticated());
  }

  isLinked(): boolean {
    return (this._status & LINKED) !== 0;
  }

  isSynced(): boolean {
    return (this._status & SYNCED) !== 0;
  }

  session(): Value {
    return this._host ? this._host.session() : Value.absent();
  }

  addDownlink(view: Downlink): void {
    this._views.push(view);
  }

  removeDownlink(view: Downlink): void {
    for (let i = 0; i < this._views.length; i += 1) {
      if (this._views[i] === view) {
        this._views.splice(i, 1);
        view.closeUp();
      }
    }
    if (this._views.length === 0) {
      const unlinkDelay = this.unlinkDelay();
      if (unlinkDelay < 0) {
        this.unlink();
      } else {
        setTimeout(this.doUnlink.bind(this), unlinkDelay);
      }
    }
  }

  onEventMessage(message: EventMessage, host: Host): void {
    for (let i = 0; i < this._views.length; i += 1) {
      this._views[i].onEventMessage(message);
    }
  }

  onCommandMessage(body: Value): void {
    for (let i = 0; i < this._views.length; i += 1) {
      this._views[i].onCommandMessage(body);
    }
  }

  onLinkRequest(request: LinkRequest): void {
    this._status |= LINKING;
    for (let i = 0; i < this._views.length; i += 1) {
      this._views[i].onLinkRequest(request);
    }
  }

  onLinkedResponse(response: LinkedResponse, host: Host): void {
    this._status = this._status & ~LINKING | LINKED;
    for (let i = 0; i < this._views.length; i += 1) {
      this._views[i].onLinkedResponse(response);
    }
  }

  onSyncRequest(request: SyncRequest): void {
    this._status |= SYNCING;
    for (let i = 0; i < this._views.length; i += 1) {
      this._views[i].onSyncRequest(request);
    }
  }

  onSyncedResponse(response: SyncedResponse, host: Host): void {
    this._status = this._status & ~SYNCING | SYNCED;
    for (let i = 0; i < this._views.length; i += 1) {
      this._views[i].onSyncedResponse(response);
    }
  }

  onUnlinkRequest(request: UnlinkRequest, host: Host): void {
    this._status = this._status & ~(LINKING | SYNCING) | UNLINKING;
    for (let i = 0; i < this._views.length; i += 1) {
      this._views[i].onUnlinkRequest(request);
    }
  }

  onUnlinkedResponse(response: UnlinkedResponse, host: Host): void {
    this._status &= ~UNLINKING;
    if (this._views.length === 0 || this._status !== 0) {
      for (let i = 0; i < this._views.length; i += 1) {
        this._views[i].onUnlinkedResponse(response);
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
    for (let i = 0; i < this._views.length; i += 1) {
      this._views[i].hostDidConnect();
    }
    if (this.keepSynced()) {
      this.sync();
    } else {
      this.link();
    }
  }

  hostDidDisconnect(host: Host): void {
    this._status = 0;
    let keepLinked = false;
    for (let i = 0; i < this._views.length; i += 1) {
      const view = this._views[i];
      view.hostDidDisconnect();
      keepLinked = keepLinked || view.keepLinked();
    }
    if (!keepLinked) {
      this.close();
    }
  }

  hostDidFail(error: unknown, host: Host): void {
    for (let i = 0; i < this._views.length; i += 1) {
      this._views[i].hostDidFail(error);
    }
  }

  command(body: AnyValue): void {
    body = Value.fromAny(body);
    this.onCommandMessage(body);
    this._host!.command(this._nodeUri, this._laneUri, body);
  }

  sync(): void {
    const nodeUri = this._host!.unresolve(this._nodeUri);
    const request = SyncRequest.of(nodeUri, this._laneUri, this._prio, this._rate, this._body);
    this.onSyncRequest(request);
    this._host!.push(request);
  }

  link(): void {
    const nodeUri = this._host!.unresolve(this._nodeUri);
    const request = LinkRequest.of(nodeUri, this._laneUri, this._prio, this._rate, this._body);
    this.onLinkRequest(request);
    this._host!.push(request);
  }

  unlink(): void {
    this._status = UNLINKING;
    this._context.unlinkDownlink(this);
  }

  protected doUnlink(): void {
    if (this._views.length === 0) {
      this.unlink();
    }
  }

  close(): void {
    this._context.closeDownlink(this);
  }

  openUp(host: Host): void {
    this._host = host;
    for (let i = 0; i < this._views.length; i += 1) {
      this._views[i].openUp(host);
    }
  }

  closeUp(): void {
    const views = this._views;
    this._views = [];
    for (let i = 0; i < views.length; i += 1) {
      views[i].closeUp();
    }
  }
}
