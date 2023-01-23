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

import {Mutable, Class, Objects} from "@swim/util";
import {Property, Timer, ComponentFlags, Component} from "@swim/component";
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
import {WarpDownlinkModel} from "../downlink/WarpDownlinkModel";
import type {WarpHostObserver} from "./WarpHostObserver";

/** @public */
export abstract class WarpHost extends Component {
  constructor(hostUri: Uri) {
    super();
    this.hostUri = hostUri;
    this.uriCache = new UriCache(hostUri);
    this.downlinks = {};
    this.downlinkCount = 0;
    this.sendBuffer = [];
  }

  override readonly observerType?: Class<WarpHostObserver>;

  readonly hostUri: Uri;

  /** @internal */
  readonly uriCache: UriCache;

  resolve(relative: AnyUri): Uri {
    return this.uriCache.resolve(relative);
  }

  unresolve(absolute: AnyUri): Uri {
    return this.uriCache.unresolve(absolute);
  }

  get connected(): boolean {
    return (this.flags & WarpHost.ConnectedFlag) !== 0;
  }

  /** @internal */
  setConnected(connected: boolean): void {
    if (connected && (this.flags & WarpHost.ConnectedFlag) === 0) {
      this.setFlags(this.flags | WarpHost.ConnectedFlag);
      this.willConnect();
      this.onConnect();
      this.didConnect();
    } else if (!connected && (this.flags & WarpHost.ConnectedFlag) !== 0) {
      this.setFlags(this.flags & ~WarpHost.ConnectedFlag);
      this.willDisconnect();
      this.onDisconnect();
      this.didDisconnect();
    }
  }

  protected willConnect(): void {
    this.reconnectTimer.reset();

    const credentials = this.credentials.value;
    if (credentials.isDefined()) {
      const request = new AuthRequest(credentials);
      this.push(request);
    }
  }

  protected onConnect(): void {
    this.callObservers("hostDidConnect", this);
    let child = this.firstChild;
    while (child !== null) {
      const next = child.nextSibling;
      if (child instanceof WarpDownlinkModel) {
        child.setConnected(true);
      }
      child = next;
    }
  }

  protected didConnect(): void {
    let envelope;
    while ((envelope = this.sendBuffer.shift()) && this.connected) {
      this.push(envelope);
    }

    this.idleTimer.watch();
  }

  protected willDisconnect(): void {
    // hook
  }

  protected onDisconnect(): void {
    this.callObservers("hostDidDisconnect", this);
    let child = this.firstChild;
    while (child !== null) {
      const next = child.nextSibling;
      if (child instanceof WarpDownlinkModel) {
        child.setConnected(false);
      }
      child = next;
    }
  }

  protected didDisconnect(): void {
    this.setAuthenticated(false);
    this.setDeauthenticated(false);
    this.session.setValue(Value.absent());

    this.idleTimer.cancel();
    if (!this.idle) {
      this.reconnect();
    } else {
      this.close();
    }
  }

  protected didFail(error?: unknown): void {
    this.callObservers("hostDidFail", error, this);
    let child = this.firstChild;
    while (child !== null) {
      const next = child.nextSibling;
      if (child instanceof WarpDownlinkModel) {
        child.hostDidFail(error, this);
      }
      child = next;
    }
  }

  protected reconnect(): void {
    if (this.online.value) {
      this.reconnectTimer.backoff();
    }
  }

  /** @internal */
  @Timer<WarpHost["reconnectTimer"]>({
    delay: 0,
    fire(): void {
      this.owner.connect();
    },
    backoff(): void {
      if (!this.scheduled) {
        let delay = this.delay;
        if (delay === 0) {
          delay = Math.floor(500 + 1000 * Math.random());
        } else {
          const maxDelay = this.owner.maxReconnectTimeout.value;
          delay = Math.min(Math.floor(1.8 * delay), maxDelay);
        }
        this.schedule(delay);
      }
    },
    reset(): void {
      this.cancel();
      this.setDelay(0);
    },
  })
  readonly reconnectTimer!: Timer<this> & {
    backoff(): void,
    reset(): void,
  };

  @Property({valueType: Number, value: 30 * 1000, inherits: true})
  readonly maxReconnectTimeout!: Property<this, number>;

  @Property({valueType: Boolean, value: true, inherits: true})
  readonly online!: Property<this, boolean>;

  /** @internal */
  abstract connect(): void;

  /** @internal */
  abstract disconnect(): void;

  /** @internal */
  close(): void {
    this.reconnectTimer.cancel();
    this.idleTimer.cancel();

    this.disconnect();
    this.remove();
  }

  @Property({valueType: Number, value: 0, inherits: true})
  readonly unlinkDelay!: Property<this, number>;

  get idle(): boolean {
    return this.sendBuffer.length === 0 && this.downlinkCount === 0;
  }

  /** @internal */
  @Timer<WarpHost["idleTimer"]>({
    delay: 1000,
    fire(): void {
      if (this.owner.connected && this.owner.idle) {
        this.owner.close();
      }
    },
    watch(): void {
      if (this.owner.connected && this.owner.idle) {
        this.debounce();
      }
    },
  })
  readonly idleTimer!: Timer<this> & {
    watch(): void,
  };

  @Property<WarpHost["idleTimeout"]>({
    valueType: Number,
    value: 1000,
    inherits: true,
    lazy: false,
    didSetValue(idleTimeout: number): void {
      this.owner.idleTimer.setDelay(idleTimeout);
    },
  })
  readonly idleTimeout!: Property<this, number>;

  @Property<WarpHost["credentials"]>({
    valueType: Value,
    value: Value.absent(),
    lazy: false,
    didSetValue(credentials: Value): void {
      if (this.owner.connected) {
        const request = new AuthRequest(credentials);
        this.owner.push(request);
      } else if (this.owner.online.value && credentials.isDefined()) {
        this.owner.connect();
      }
    },
  })
  readonly credentials!: Property<this, Value, AnyValue>

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
    let child = this.firstChild;
    while (child !== null) {
      const next = child.nextSibling;
      if (child instanceof WarpDownlinkModel) {
        child.setAuthenticated(authenticated);
      }
      child = next;
    }
  }

  protected didSetAuthenticated(authenticated: boolean): void {
    if (authenticated) {
      this.callObservers("hostDidAuthenticate", this.session.value, this);
    }
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
    let child = this.firstChild;
    while (child !== null) {
      const next = child.nextSibling;
      if (child instanceof WarpDownlinkModel) {
        child.setDeauthenticated(deauthenticated);
      }
      child = next;
    }
  }

  protected didSetDeauthenticated(deauthenticated: boolean): void {
    if (deauthenticated) {
      this.callObservers("hostDidDeauthenticate", this.session.value, this);
    }
  }

  authenticate(credentials: AnyValue): void {
    this.credentials.setValue(credentials);
  }

  @Property({valueType: Value, value: Value.absent()})
  readonly session!: Property<this, Value, AnyValue>;

  /** @internal */
  readonly downlinks: {
    [nodeUri: string]: {
      [laneUri: string]: WarpDownlinkModel | undefined,
    } | undefined,
  };

  /** @internal */
  readonly downlinkCount: number;

  /** @internal */
  getDownlink(nodeUri: Uri, laneUri: Uri): WarpDownlinkModel | null {
    nodeUri = this.resolve(nodeUri);
    const nodeDownlinks = this.downlinks[nodeUri.toString()];
    if (nodeDownlinks !== void 0) {
      const downlink = nodeDownlinks[laneUri.toString()];
      if (downlink !== void 0) {
        return downlink;
      }
    }
    return null;
  }

  /** @internal */
  openDownlink(downlink: WarpDownlinkModel): void {
    this.appendChild(downlink);
    if (!this.connected && this.online.value) {
      this.connect();
    }
  }

  /** @internal */
  unlinkDownlink(downlink: WarpDownlinkModel): void {
    if (this.connected) {
      const nodeUri = this.resolve(downlink.nodeUri);
      const laneUri = downlink.laneUri;
      const nodeDownlinks = this.downlinks[nodeUri.toString()];
      if (nodeDownlinks !== void 0 && nodeDownlinks[laneUri.toString()] !== void 0) {
        const request = new UnlinkRequest(this.unresolve(nodeUri), laneUri, Value.absent());
        downlink.onUnlinkRequest(request, this);
        this.push(request);
      }
    }
  }

  protected override willInsertChild(child: Component, target: Component | null): void {
    super.willInsertChild(child, target);
    if (child instanceof WarpDownlinkModel) {
      this.willInsertDownlink(child);
    }
  }

  protected override onInsertChild(child: Component, target: Component | null): void {
    super.onInsertChild(child, target);
    if (child instanceof WarpDownlinkModel) {
      this.onInsertDownlink(child);
    }
  }

  protected override didInsertChild(child: Component, target: Component | null): void {
    super.didInsertChild(child, target);
    if (child instanceof WarpDownlinkModel) {
      this.didInsertDownlink(child);
    }
  }

  /** @internal */
  protected willInsertDownlink(downlink: WarpDownlinkModel): void {
    this.idleTimer.cancel();
  }

  /** @internal */
  protected onInsertDownlink(downlink: WarpDownlinkModel): void {
    const nodeUri = this.resolve(downlink.nodeUri);
    const laneUri = downlink.laneUri;
    let nodeDownlinks = this.downlinks[nodeUri.toString()]!;
    if (nodeDownlinks === void 0) {
      nodeDownlinks = {};
      this.downlinks[nodeUri.toString()] = nodeDownlinks;
    }
    if (nodeDownlinks[laneUri.toString()] !== void 0) {
      throw new Error("duplicate downlink");
    }
    nodeDownlinks[laneUri.toString()] = downlink;
    (this as Mutable<this>).downlinkCount += 1;
  }

  /** @internal */
  protected didInsertDownlink(downlink: WarpDownlinkModel): void {
    downlink.setConnected(this.connected);
    downlink.setAuthenticated(this.authenticated);
    downlink.setDeauthenticated(this.deauthenticated);
  }

  protected override willRemoveChild(child: Component): void {
    super.willRemoveChild(child);
    if (child instanceof WarpDownlinkModel) {
      this.willRemoveDownlink(child);
    }
  }

  protected override onRemoveChild(child: Component): void {
    super.onRemoveChild(child);
    if (child instanceof WarpDownlinkModel) {
      this.onRemoveDownlink(child);
    }
  }

  protected override didRemoveChild(child: Component): void {
    if (child instanceof WarpDownlinkModel) {
      this.didRemoveDownlink(child);
    }
    super.didRemoveChild(child);
  }

  /** @internal */
  protected willRemoveDownlink(downlink: WarpDownlinkModel): void {
    // hook
  }

  /** @internal */
  protected onRemoveDownlink(downlink: WarpDownlinkModel): void {
    const nodeUri = this.resolve(downlink.nodeUri);
    const laneUri = downlink.laneUri;
    const nodeDownlinks = this.downlinks[nodeUri.toString()];
    if (nodeDownlinks !== void 0 && nodeDownlinks[laneUri.toString()] !== void 0) {
      (this as Mutable<this>).downlinkCount -= 1;
      delete nodeDownlinks[laneUri.toString()];
      if (Objects.isEmpty(nodeDownlinks)) {
        delete this.downlinks[nodeUri.toString()];
      }
      if (this.downlinkCount === 0) {
        this.idleTimer.watch();
      }
    }
  }

  /** @internal */
  protected didRemoveDownlink(downlink: WarpDownlinkModel): void {
    downlink.setConnected(false);
    downlink.setAuthenticated(false);
    downlink.setDeauthenticated(false);
  }

  @Property({valueType: Number, value: 1024, inherits: true})
  readonly sendBufferSize!: Property<this, number>;

  /** @internal */
  readonly sendBuffer: Envelope[];

  /** @internal */
  abstract push(envelope: Envelope): void;

  command(nodeUri: AnyUri, laneUri: AnyUri, body: AnyValue): void {
    nodeUri = Uri.fromAny(nodeUri);
    nodeUri = this.resolve(nodeUri);
    laneUri = Uri.fromAny(laneUri);
    body = Value.fromAny(body);
    const message = new CommandMessage(this.unresolve(nodeUri), laneUri, body);
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
    const nodeDownlinks = this.downlinks[nodeUri.toString()];
    if (nodeDownlinks !== void 0) {
      const downlink = nodeDownlinks[laneUri.toString()];
      if (downlink !== void 0) {
        const resolvedMessage = message.withNode(nodeUri);
        downlink.onEventMessage(resolvedMessage, this);
      }
    }
  }

  protected onCommandMessage(message: CommandMessage): void {
    // nop
  }

  protected onLinkRequest(request: LinkRequest): void {
    // nop
  }

  protected onLinkedResponse(response: LinkedResponse): void {
    const nodeUri = this.resolve(response.node);
    const laneUri = response.lane;
    const nodeDownlinks = this.downlinks[nodeUri.toString()];
    if (nodeDownlinks !== void 0) {
      const downlink = nodeDownlinks[laneUri.toString()];
      if (downlink !== void 0) {
        const resolvedResponse = response.withNode(nodeUri);
        downlink.onLinkedResponse(resolvedResponse, this);
      }
    }
  }

  protected onSyncRequest(request: SyncRequest): void {
    // nop
  }

  protected onSyncedResponse(response: SyncedResponse): void {
    const nodeUri = this.resolve(response.node);
    const laneUri = response.lane;
    const nodeDownlinks = this.downlinks[nodeUri.toString()];
    if (nodeDownlinks !== void 0) {
      const downlink = nodeDownlinks[laneUri.toString()];
      if (downlink !== void 0) {
        const resolvedResponse = response.withNode(nodeUri);
        downlink.onSyncedResponse(resolvedResponse, this);
      }
    }
  }

  protected onUnlinkRequest(request: UnlinkRequest): void {
    // nop
  }

  protected onUnlinkedResponse(response: UnlinkedResponse): void {
    const nodeUri = this.resolve(response.node);
    const laneUri = response.lane;
    const nodeDownlinks = this.downlinks[nodeUri.toString()];
    if (nodeDownlinks !== void 0) {
      const downlink = nodeDownlinks[laneUri.toString()];
      if (downlink !== void 0) {
        const resolvedResponse = response.withNode(nodeUri);
        downlink.onUnlinkedResponse(resolvedResponse, this);
      }
    }
  }

  protected onAuthRequest(request: AuthRequest): void {
    // nop
  }

  protected onAuthedResponse(response: AuthedResponse): void {
    this.session.setValue(response.body);
    this.setDeauthenticated(false);
    this.setAuthenticated(true);
  }

  protected onDeauthRequest(request: DeauthRequest): void {
    // nop
  }

  protected onDeauthedResponse(response: DeauthedResponse): void {
    this.session.setValue(response.body);
    this.setAuthenticated(false);
    this.setDeauthenticated(true);
  }

  protected onUnknownEnvelope(envelope: Envelope | string): void {
    // nop
  }

  /** @internal */
  static readonly ConnectedFlag: ComponentFlags = 1 << (Component.FlagShift + 0);
  /** @internal */
  static readonly AuthenticatedFlag: ComponentFlags = 1 << (Component.FlagShift + 1);
  /** @internal */
  static readonly DeauthenticatedFlag: ComponentFlags = 1 << (Component.FlagShift + 2);

  /** @internal */
  static override readonly FlagShift: number = Component.FlagShift + 3;
  /** @internal */
  static override readonly FlagMask: ComponentFlags = (1 << WarpHost.FlagShift) - 1;
}
