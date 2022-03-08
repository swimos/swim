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

import * as ws from "ws";
import type {Mutable} from "@swim/util";
import type {Uri} from "@swim/uri";
import {Envelope, CommandMessage, AuthRequest} from "@swim/warp";
import type {HostContext} from "./HostContext";
import type {HostOptions} from "./Host";
import {RemoteHost} from "./RemoteHost";

/** @internal */
export class WebSocketHost extends RemoteHost {
  constructor(context: HostContext, hostUri: Uri, options: HostOptions) {
    super(context, hostUri, options);
    this.socket = null;
  }

  /** @internal */
  readonly socket: WebSocket | null;

  override get connected(): boolean {
    return this.socket !== null && this.socket.readyState === this.socket.OPEN;
  }

  override open(): void {
    this.clearReconnect();
    let socket = this.socket;
    if (socket === null) {
      let WebSocketConstructor: typeof WebSocket;
      if (this.options.WebSocket !== void 0) {
        WebSocketConstructor = this.options.WebSocket;
      } else if (typeof WebSocket !== "undefined") {
        WebSocketConstructor = WebSocket;
      } else if (WebSocketHost.WebSocket !== null) {
        WebSocketConstructor = WebSocketHost.WebSocket;
      } else {
        throw new Error("Missing WebSocket implementation");
      }
      let hostUri = this.hostUri;
      const schemeName = hostUri.schemeName;
      if (schemeName === "warp" || schemeName === "swim") {
        hostUri = hostUri.withSchemeName("ws");
      } else if (schemeName === "warps" || schemeName === "swims") {
        hostUri = hostUri.withSchemeName("wss");
      }
      if (this.options.protocols !== void 0) {
        socket = new WebSocketConstructor(hostUri.toString(), this.options.protocols);
      } else {
        socket = new WebSocketConstructor(hostUri.toString());
      }
      (this as Mutable<this>).socket = socket;
      socket.onopen = this.onWebSocketOpen.bind(this);
      socket.onmessage = this.onWebSocketMessage.bind(this);
      socket.onclose = this.onWebSocketClose.bind(this);
      socket.onerror = this.onWebSocketError.bind(this);
    }
  }

  override close(): void {
    this.clearReconnect();
    this.clearIdle();
    if (this.socket !== null) {
      this.socket.close();
      if (!this.context.online) {
        this.onWebSocketClose(); // force close event
      }
    } else {
      super.close();
    }
  }

  override push(envelope: Envelope): void {
    if (this.connected) {
      this.clearIdle();
      const text = envelope.toRecon();
      this.socket!.send(text);
      this.watchIdle();
    } else if (envelope instanceof CommandMessage) {
      if (this.sendBuffer.length < this.sendBufferSize) {
        this.sendBuffer.push(envelope);
      } else {
        throw new Error("send buffer overflow");
      }
      this.open();
    }
  }

  protected onWebSocketOpen(): void {
    if (this.connected) {
      const credentials = this.credentials;
      if (credentials.isDefined()) {
        const request = new AuthRequest(credentials);
        this.push(request);
      }
      this.onConnect();
      let envelope;
      while ((envelope = this.sendBuffer.shift()) && this.connected) {
        this.push(envelope);
      }
      this.watchIdle();
    } else {
      this.close();
    }
  }

  protected onWebSocketMessage(message: MessageEvent<unknown>): void {
    const data = message.data;
    if (typeof data === "string") {
      const envelope = Envelope.parseRecon(data);
      if (envelope !== null) {
        this.onEnvelope(envelope);
      } else {
        this.onUnknownEnvelope(data);
      }
    }
  }

  protected onWebSocketClose(): void {
    const socket = this.socket;
    if (socket !== null) {
      socket.onopen = null;
      socket.onmessage = null;
      socket.onclose = null;
      socket.onerror = null;
      (this as Mutable<this>).socket = null;
    }
    this.onDisconnect();
    this.clearIdle();
    if (!this.idle) {
      if (this.context.online) {
        this.reconnect();
      }
    } else {
      this.close();
    }
  }

  protected onWebSocketError(): void {
    if (this.socket !== null) {
      this.socket.close();
      if (!this.context.online) {
        this.onWebSocketClose(); // force close event
      } else {
        this.onError();
      }
    }
  }

  /** @internal */
  static WebSocket: typeof WebSocket | null = null;
}
if (typeof WebSocket !== "undefined") {
  WebSocketHost.WebSocket = WebSocket;
} else if (typeof ws !== "undefined" && ws.WebSocket !== void 0) {
  WebSocketHost.WebSocket = ws.WebSocket as unknown as typeof WebSocket | null;
}
