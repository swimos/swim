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

import {BTree} from "@swim/collections";
import {AnyValue, Value} from "@swim/structure";
import {AnyUri, Uri, UriCache} from "@swim/uri";
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
import type {HostDownlink} from "./HostDownlink";
import type {HostContext} from "./HostContext";
import {HostOptions, Host} from "./Host";

/** @hidden */
export abstract class RemoteHost extends Host {
  constructor(context: HostContext, hostUri: Uri, options: HostOptions = {}) {
    super();
    Object.defineProperty(this, "context", {
      value: context,
      enumerable: true,
    });
    Object.defineProperty(this, "hostUri", {
      value: hostUri,
      enumerable: true,
    });
    Object.defineProperty(this, "options", {
      value: options,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "authenticated", {
      value: false,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "session", {
      value: Value.absent(),
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "sendBuffer", {
      value: [],
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
    Object.defineProperty(this, "uriCache", {
      value: new UriCache(hostUri),
      enumerable: true,
      configurable: true,
    });
    this.reconnectTimer = 0;
    this.reconnectTimeout = 0;
    this.idleTimer = 0;
  }

  /** @hidden */
  declare readonly context: HostContext;

  declare readonly hostUri: Uri;

  declare readonly options: HostOptions;

  get credentials(): Value {
    return this.options.credentials ?? Value.absent();
  }

  get unlinkDelay(): number {
    return this.options.unlinkDelay ?? RemoteHost.UnlinkDelay;
  }

  get maxReconnectTimeout(): number {
    return this.options.maxReconnectTimeout ?? RemoteHost.MaxReconnectTimeout;
  }

  get idleTimeout(): number {
    return this.options.idleTimeout ?? RemoteHost.IdleTimeout;
  }

  get sendBufferSize(): number {
    return this.options.sendBufferSize ?? RemoteHost.SendBufferSize;
  }

  abstract isConnected(): boolean;

  /** @hidden */
  declare readonly authenticated: boolean;

  isAuthenticated(): boolean {
    return this.authenticated;
  }

  declare readonly session: Value;

  /** @hidden */
  declare readonly sendBuffer: Envelope[];

  /** @hidden */
  declare readonly downlinks: BTree<Uri, BTree<Uri, HostDownlink>>;

  /** @hidden */
  declare readonly downlinkCount: number;

  isIdle(): boolean {
    return this.sendBuffer.length === 0 && this.downlinkCount === 0;
  }

  /** @hidden */
  declare readonly uriCache: UriCache;

  resolve(relative: AnyUri): Uri {
    return this.uriCache.resolve(relative);
  }

  unresolve(absolute: AnyUri): Uri {
    return this.uriCache.unresolve(absolute);
  }

  authenticate(credentials: AnyValue): void {
    credentials = Value.fromAny(credentials);
    if (!credentials.equals(this.options.credentials)) {
      this.options.credentials = credentials;
      if (this.isConnected()) {
        const request = new AuthRequest(credentials);
        this.push(request);
      } else {
        this.open();
      }
    }
  }

  openDownlink(downlink: HostDownlink): void {
    this.clearIdle();
    const nodeUri = this.resolve(downlink.nodeUri);
    const laneUri = downlink.laneUri;
    if (this.downlinkCount === 0) {
      this.open();
    }
    let nodeDownlinks = this.downlinks.get(nodeUri);
    if (nodeDownlinks === void 0) {
      nodeDownlinks = new BTree();
      this.downlinks.set(nodeUri, nodeDownlinks);
    }
    if (nodeDownlinks.get(laneUri) !== void 0) {
      throw new Error("duplicate downlink");
    }
    nodeDownlinks.set(laneUri, downlink);
    Object.defineProperty(this, "downlinkCount", {
      value: this.downlinkCount + 1,
      enumerable: true,
      configurable: true,
    });
    downlink.openUp(this);
    if (this.isConnected()) {
      downlink.hostDidConnect(this);
    }
  }

  unlinkDownlink(downlink: HostDownlink): void {
    const nodeUri = this.resolve(downlink.nodeUri);
    const laneUri = downlink.laneUri;
    const nodeDownlinks = this.downlinks.get(nodeUri);
    if (nodeDownlinks !== void 0 && nodeDownlinks.get(laneUri) && this.isConnected()) {
      const request = new UnlinkRequest(this.unresolve(nodeUri), laneUri, Value.absent());
      downlink.onUnlinkRequest(request, this);
      this.push(request);
    }
  }

  closeDownlink(downlink: HostDownlink): void {
    const nodeUri = this.resolve(downlink.nodeUri);
    const laneUri = downlink.laneUri;
    const nodeDownlinks = this.downlinks.get(nodeUri);
    if (nodeDownlinks !== void 0) {
      if (nodeDownlinks.get(laneUri)) {
        Object.defineProperty(this, "downlinkCount", {
          value: this.downlinkCount - 1,
          enumerable: true,
          configurable: true,
        });
        nodeDownlinks.delete(laneUri);
        if (nodeDownlinks.isEmpty()) {
          this.downlinks.delete(nodeUri);
        }
        if (this.downlinkCount === 0) {
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
    const message = new CommandMessage(this.unresolve(nodeUri), laneUri as Uri, body);
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
    const nodeUri = this.resolve(message.node);
    const laneUri = message.lane;
    const nodeDownlinks = this.downlinks.get(nodeUri);
    if (nodeDownlinks !== void 0) {
      const downlink = nodeDownlinks.get(laneUri);
      if (downlink !== void 0) {
        const resolvedMessage = message.withNode(nodeUri);
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
    const nodeUri = this.resolve(response.node);
    const laneUri = response.lane;
    const nodeDownlinks = this.downlinks.get(nodeUri);
    if (nodeDownlinks !== void 0) {
      const downlink = nodeDownlinks.get(laneUri);
      if (downlink !== void 0) {
        const resolvedResponse = response.withNode(nodeUri);
        downlink.onLinkedResponse(resolvedResponse, this);
      }
    }
  }

  protected onSyncRequest(request: SyncRequest): void {
    // TODO: client agents
  }

  protected onSyncedResponse(response: SyncedResponse): void {
    const nodeUri = this.resolve(response.node);
    const laneUri = response.lane;
    const nodeDownlinks = this.downlinks.get(nodeUri);
    if (nodeDownlinks !== void 0) {
      const downlink = nodeDownlinks.get(laneUri);
      if (downlink !== void 0) {
        const resolvedResponse = response.withNode(nodeUri);
        downlink.onSyncedResponse(resolvedResponse, this);
      }
    }
  }

  protected onUnlinkRequest(request: UnlinkRequest): void {
    // TODO: client agents
  }

  protected onUnlinkedResponse(response: UnlinkedResponse): void {
    const nodeUri = this.resolve(response.node);
    const laneUri = response.lane;
    const nodeDownlinks = this.downlinks.get(nodeUri);
    if (nodeDownlinks !== void 0) {
      const downlink = nodeDownlinks.get(laneUri);
      if (downlink !== void 0) {
        const resolvedResponse = response.withNode(nodeUri);
        downlink.onUnlinkedResponse(resolvedResponse, this);
      }
    }
  }

  protected onAuthRequest(request: AuthRequest): void {
    // TODO: client agents
  }

  protected onAuthedResponse(response: AuthedResponse): void {
    Object.defineProperty(this, "authenticated", {
      value: true,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "session", {
      value: response.body,
      enumerable: true,
      configurable: true,
    });
    this.context.hostDidAuthenticate(response.body, this);
  }

  protected onDeauthRequest(request: DeauthRequest): void {
    // TODO: client agents
  }

  protected onDeauthedResponse(response: DeauthedResponse): void {
    Object.defineProperty(this, "authenticated", {
      value: false,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "session", {
      value: Value.absent(),
      enumerable: true,
      configurable: true,
    });
    this.context.hostDidDeauthenticate(response.body, this);
  }

  protected onUnknownEnvelope(envelope: Envelope | string): void {
    // nop
  }

  /** @hidden */
  reconnectTimer: number;

  /** @hidden */
  reconnectTimeout: number;

  /** @hidden */
  idleTimer: number;

  protected onConnect(): void {
    this.reconnectTimeout = 0;
    this.context.hostDidConnect(this);
    this.downlinks.forEach(function (nodeUri: Uri, nodeDownlinks: BTree<Uri, HostDownlink>): void {
      nodeDownlinks.forEach(function (laneUri: Uri, downlink: HostDownlink): void {
        downlink.hostDidConnect(this);
      }, this);
    }, this);
  }

  protected onDisconnect(): void {
    Object.defineProperty(this, "authenticated", {
      value: false,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "session", {
      value: Value.absent(),
      enumerable: true,
      configurable: true,
    });
    this.context.hostDidDisconnect(this);
    this.downlinks.forEach(function (nodeUri: Uri, nodeDownlinks: BTree<Uri, HostDownlink>): void {
      nodeDownlinks.forEach(function (laneUri: Uri, downlink: HostDownlink): void {
        downlink.hostDidDisconnect(this);
      }, this);
    }, this);
  }

  protected onError(error?: unknown): void {
    this.context.hostDidFail(error, this);
    this.downlinks.forEach(function (nodeUri: Uri, nodeDownlinks: BTree<Uri, HostDownlink>): void {
      nodeDownlinks.forEach(function (laneUri: Uri, downlink: HostDownlink): void {
        downlink.hostDidFail(error, this);
      }, this);
    }, this);
  }

  protected reconnect(): void {
    if (this.reconnectTimer === 0) {
      if (this.reconnectTimeout === 0) {
        this.reconnectTimeout = Math.floor(500 + 1000 * Math.random());
      } else {
        this.reconnectTimeout = Math.min(Math.floor(1.8 * this.reconnectTimeout), this.maxReconnectTimeout);
      }
      this.reconnectTimer = setTimeout(this.open.bind(this), this.reconnectTimeout) as any;
    }
  }

  protected clearReconnect(): void {
    if (this.reconnectTimer !== 0) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = 0;
    }
  }

  protected watchIdle(): void {
    if (this.idleTimer === 0 && this.isConnected() && this.isIdle()) {
      this.idleTimer = setTimeout(this.checkIdle.bind(this), this.idleTimeout) as any;
    }
  }

  protected clearIdle(): void {
    if (this.idleTimer !== 0) {
      clearTimeout(this.idleTimer);
      this.idleTimer = 0;
    }
  }

  protected checkIdle(): void {
    if (this.isConnected() && this.isIdle()) {
      this.close();
    }
  }

  abstract open(): void;

  close(): void {
    this.context.closeHost(this);
  }

  closeUp(): void {
    this.downlinks.forEach(function (nodeUri: Uri, nodeDownlinks: BTree<Uri, HostDownlink>): void {
      nodeDownlinks.forEach(function (laneUri: Uri, downlink: HostDownlink): void {
        downlink.closeUp(this);
      }, this);
    }, this);
  }

  abstract push(envelope: Envelope): void;

  static readonly UnlinkDelay: number = 0;
  static readonly MaxReconnectTimeout: number = 30000;
  static readonly IdleTimeout: number = 1000;
  static readonly SendBufferSize: number = 1024;
}
