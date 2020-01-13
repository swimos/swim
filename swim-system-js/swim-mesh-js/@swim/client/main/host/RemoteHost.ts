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

import {BTree} from "@swim/collections";
import {AnyUri, Uri, UriCache} from "@swim/uri";
import {AnyValue, Value} from "@swim/structure";
import {
  Envelope,
  EventMessage,
  CommandMessage,
  LinkRequest,
  LinkedResponse,
  SyncRequest,
  SyncedResponse,
  UnlinkRequest,
  UnlinkedResponse,
  AuthRequest,
  AuthedResponse,
  DeauthRequest,
  DeauthedResponse,
} from "@swim/warp";
import {HostDownlink} from "./HostDownlink";
import {HostContext} from "./HostContext";
import {HostOptions, Host} from "./Host";

const UNLINK_DELAY = 0;
const MAX_RECONNECT_TIMEOUT = 30000;
const IDLE_TIMEOUT = 1000;
const SEND_BUFFER_SIZE = 1024;

/** @hidden */
export abstract class RemoteHost extends Host {
  /** @hidden */
  readonly _context: HostContext;
  /** @hidden */
  readonly _hostUri: Uri;
  /** @hidden */
  readonly _options: HostOptions;
  /** @hidden */
  _downlinks: BTree<Uri, BTree<Uri, HostDownlink>>;
  /** @hidden */
  _downlinkCount: number;
  /** @hidden */
  _authenticated: boolean;
  /** @hidden */
  _session: Value;
  /** @hidden */
  _uriCache: UriCache;
  /** @hidden */
  _sendBuffer: Envelope[];
  /** @hidden */
  _reconnectTimer: number;
  /** @hidden */
  _reconnectTimeout: number;
  /** @hidden */
  _idleTimer: number;

  constructor(context: HostContext, hostUri: Uri, options: HostOptions = {}) {
    super();
    this._context = context;
    this._hostUri = hostUri;
    this._options = options;
    this._downlinks = new BTree();
    this._downlinkCount = 0;
    this._authenticated = false;
    this._session = Value.absent();
    this._uriCache = new UriCache(hostUri);
    this._sendBuffer = [];
    this._reconnectTimer = 0;
    this._reconnectTimeout = 0;
    this._idleTimer = 0;
  }

  hostUri(): Uri {
    return this._hostUri;
  }

  credentials(): Value {
    return this._options.credentials || Value.absent();
  }

  unlinkDelay(): number {
    const unlinkDelay = this._options.unlinkDelay;
    return typeof unlinkDelay === "number" ? unlinkDelay : UNLINK_DELAY;
  }

  maxReconnectTimeout(): number {
    return this._options.maxReconnectTimeout || MAX_RECONNECT_TIMEOUT;
  }

  idleTimeout(): number {
    return this._options.idleTimeout || IDLE_TIMEOUT;
  }

  sendBufferSize(): number {
    return this._options.sendBufferSize || SEND_BUFFER_SIZE;
  }

  abstract isConnected(): boolean;

  isAuthenticated(): boolean {
    return this._authenticated;
  }

  session(): Value {
    return this._session;
  }

  isIdle(): boolean {
    return !this._sendBuffer.length && !this._downlinkCount;
  }

  resolve(relative: AnyUri): Uri {
    return this._uriCache.resolve(relative);
  }

  unresolve(absolute: AnyUri): Uri {
    return this._uriCache.unresolve(absolute);
  }

  authenticate(credentials: AnyValue): void {
    credentials = Value.fromAny(credentials);
    if (!credentials.equals(this._options.credentials)) {
      this._options.credentials = credentials;
      if (this.isConnected()) {
        const request = AuthRequest.of(credentials);
        this.push(request);
      } else {
        this.open();
      }
    }
  }

  openDownlink(downlink: HostDownlink): void {
    this.clearIdle();
    const nodeUri = this.resolve(downlink.nodeUri());
    const laneUri = downlink.laneUri();
    if (!this._downlinkCount) {
      this.open();
    }
    let nodeDownlinks = this._downlinks.get(nodeUri);
    if (!nodeDownlinks) {
      nodeDownlinks = new BTree();
      this._downlinks.set(nodeUri, nodeDownlinks);
    }
    if (nodeDownlinks.get(laneUri)) {
      throw new Error("duplicate downlink");
    }
    nodeDownlinks.set(laneUri, downlink);
    this._downlinkCount += 1;
    downlink.openUp(this);
    if (this.isConnected()) {
      downlink.hostDidConnect(this);
    }
  }

  unlinkDownlink(downlink: HostDownlink): void {
    const nodeUri = this.resolve(downlink.nodeUri());
    const laneUri = downlink.laneUri();
    const nodeDownlinks = this._downlinks.get(nodeUri);
    if (nodeDownlinks && nodeDownlinks.get(laneUri) && this.isConnected()) {
      const request = UnlinkRequest.of(this.unresolve(nodeUri), laneUri);
      downlink.onUnlinkRequest(request, this);
      this.push(request);
    }
  }

  closeDownlink(downlink: HostDownlink): void {
    const nodeUri = this.resolve(downlink.nodeUri());
    const laneUri = downlink.laneUri();
    const nodeDownlinks = this._downlinks.get(nodeUri);
    if (nodeDownlinks) {
      if (nodeDownlinks.get(laneUri)) {
        this._downlinkCount -= 1;
        nodeDownlinks.delete(laneUri);
        if (nodeDownlinks.isEmpty()) {
          this._downlinks.delete(nodeUri);
        }
        if (!this._downlinkCount) {
          this.watchIdle();
        }
        downlink.closeUp(this);
      }
    }
  }

  command(nodeUri: AnyUri, laneUri: AnyUri, body: AnyValue): void {
    nodeUri = Uri.fromAny(nodeUri);
    nodeUri = this.resolve(nodeUri);
    laneUri = Uri.fromAny(laneUri);
    body = Value.fromAny(body);
    const message = CommandMessage.of(this.unresolve(nodeUri), laneUri, body);
    this.push(message);
  }

  protected onEnvelope(envelope: Envelope): void {
    if (envelope instanceof EventMessage) {
      this.onEventMessage(envelope);
    } else if (envelope instanceof CommandMessage) {
      this.onCommandMessage(envelope);
    } else if (envelope instanceof LinkRequest) {
      this.onLinkRequest(envelope);
    } else if (envelope instanceof LinkedResponse) {
      this.onLinkedResponse(envelope);
    } else if (envelope instanceof SyncRequest) {
      this.onSyncRequest(envelope);
    } else if (envelope instanceof SyncedResponse) {
      this.onSyncedResponse(envelope);
    } else if (envelope instanceof UnlinkRequest) {
      this.onUnlinkRequest(envelope);
    } else if (envelope instanceof UnlinkedResponse) {
      this.onUnlinkedResponse(envelope);
    } else if (envelope instanceof AuthRequest) {
      this.onAuthRequest(envelope);
    } else if (envelope instanceof AuthedResponse) {
      this.onAuthedResponse(envelope);
    } else if (envelope instanceof DeauthRequest) {
      this.onDeauthRequest(envelope);
    } else if (envelope instanceof DeauthedResponse) {
      this.onDeauthedResponse(envelope);
    } else {
      this.onUnknownEnvelope(envelope);
    }
  }

  protected onEventMessage(message: EventMessage): void {
    const nodeUri = this.resolve(message.node());
    const laneUri = message.lane();
    const nodeDownlinks = this._downlinks.get(nodeUri);
    if (nodeDownlinks) {
      const downlink = nodeDownlinks.get(laneUri);
      if (downlink) {
        const resolvedMessage = message.node(nodeUri);
        downlink.onEventMessage(resolvedMessage, this);
      }
    }
  }

  protected onCommandMessage(message: CommandMessage): void {
    // TODO: client agents
  }

  protected onLinkRequest(request: LinkRequest): void {
    // TODO: client agents
  }

  protected onLinkedResponse(response: LinkedResponse): void {
    const nodeUri = this.resolve(response.node());
    const laneUri = response.lane();
    const nodeDownlinks = this._downlinks.get(nodeUri);
    if (nodeDownlinks) {
      const downlink = nodeDownlinks.get(laneUri);
      if (downlink) {
        const resolvedResponse = response.node(nodeUri);
        downlink.onLinkedResponse(resolvedResponse, this);
      }
    }
  }

  protected onSyncRequest(request: SyncRequest): void {
    // TODO: client agents
  }

  protected onSyncedResponse(response: SyncedResponse): void {
    const nodeUri = this.resolve(response.node());
    const laneUri = response.lane();
    const nodeDownlinks = this._downlinks.get(nodeUri);
    if (nodeDownlinks) {
      const downlink = nodeDownlinks.get(laneUri);
      if (downlink) {
        const resolvedResponse = response.node(nodeUri);
        downlink.onSyncedResponse(resolvedResponse, this);
      }
    }
  }

  protected onUnlinkRequest(request: UnlinkRequest): void {
    // TODO: client agents
  }

  protected onUnlinkedResponse(response: UnlinkedResponse): void {
    const nodeUri = this.resolve(response.node());
    const laneUri = response.lane();
    const nodeDownlinks = this._downlinks.get(nodeUri);
    if (nodeDownlinks) {
      const downlink = nodeDownlinks.get(laneUri);
      if (downlink) {
        const resolvedResponse = response.node(nodeUri);
        downlink.onUnlinkedResponse(resolvedResponse, this);
      }
    }
  }

  protected onAuthRequest(request: AuthRequest): void {
    // TODO: client agents
  }

  protected onAuthedResponse(response: AuthedResponse): void {
    this._authenticated = true;
    this._session = response.body();
    this._context.hostDidAuthenticate(response.body(), this);
  }

  protected onDeauthRequest(request: DeauthRequest): void {
    // TODO: client agents
  }

  protected onDeauthedResponse(response: DeauthedResponse): void {
    this._authenticated = false;
    this._session = Value.absent();
    this._context.hostDidDeauthenticate(response.body(), this);
  }

  protected onUnknownEnvelope(envelope: Envelope | string): void {
    // nop
  }

  protected onConnect(): void {
    this._reconnectTimeout = 0;
    this._context.hostDidConnect(this);
    this._downlinks.forEach(function (nodeUri: Uri, nodeDownlinks: BTree<Uri, HostDownlink>): void {
      nodeDownlinks.forEach(function (laneUri: Uri, downlink: HostDownlink): void {
        downlink.hostDidConnect(this);
      }, this);
    }, this);
  }

  protected onDisconnect(): void {
    this._authenticated = false;
    this._session = Value.absent();
    this._context.hostDidDisconnect(this);
    this._downlinks.forEach(function (nodeUri: Uri, nodeDownlinks: BTree<Uri, HostDownlink>): void {
      nodeDownlinks.forEach(function (laneUri: Uri, downlink: HostDownlink): void {
        downlink.hostDidDisconnect(this);
      }, this);
    }, this);
  }

  protected onError(error?: unknown): void {
    this._context.hostDidFail(error, this);
    this._downlinks.forEach(function (nodeUri: Uri, nodeDownlinks: BTree<Uri, HostDownlink>): void {
      nodeDownlinks.forEach(function (laneUri: Uri, downlink: HostDownlink): void {
        downlink.hostDidFail(error, this);
      }, this);
    }, this);
  }

  protected reconnect(): void {
    if (!this._reconnectTimer) {
      if (!this._reconnectTimeout) {
        this._reconnectTimeout = Math.floor(500 + 1000 * Math.random());
      } else {
        this._reconnectTimeout = Math.min(Math.floor(1.8 * this._reconnectTimeout), this.maxReconnectTimeout());
      }
      this._reconnectTimer = setTimeout(this.open.bind(this), this._reconnectTimeout) as any;
    }
  }

  protected clearReconnect(): void {
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = 0;
    }
  }

  protected watchIdle(): void {
    if (!this._idleTimer && this.isConnected() && this.isIdle()) {
      this._idleTimer = setTimeout(this.checkIdle.bind(this), this.idleTimeout()) as any;
    }
  }

  protected clearIdle(): void {
    if (this._idleTimer) {
      clearTimeout(this._idleTimer);
      this._idleTimer = 0;
    }
  }

  protected checkIdle(): void {
    if (this.isConnected() && this.isIdle()) {
      this.close();
    }
  }

  abstract open(): void;

  close(): void {
    this._context.closeHost(this);
  }

  closeUp(): void {
    this._downlinks.forEach(function (nodeUri: Uri, nodeDownlinks: BTree<Uri, HostDownlink>): void {
      nodeDownlinks.forEach(function (laneUri: Uri, downlink: HostDownlink): void {
        downlink.closeUp(this);
      }, this);
    }, this);
  }

  abstract push(envelope: Envelope): void;
}
