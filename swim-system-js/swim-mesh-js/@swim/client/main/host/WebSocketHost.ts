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

import {Uri} from "@swim/uri";
import {Envelope, CommandMessage, AuthRequest} from "@swim/warp";
import {HostContext} from "./HostContext";
import {HostOptions} from "./Host";
import {RemoteHost} from "./RemoteHost";

/** @hidden */
export type WebSocketConstructor = {new(url: string, protocols?: string | string[]): WebSocket};

export interface WebSocketHostOptions extends HostOptions {
  protocols?: string | string[];
  WebSocket?: WebSocketConstructor;
}

/** @hidden */
export class WebSocketHost extends RemoteHost {
  /** @hidden */
  readonly _options: WebSocketHostOptions;
  /** @hidden */
  _socket: WebSocket | undefined;

  constructor(context: HostContext, hostUri: Uri, options: WebSocketHostOptions = {}) {
    super(context, hostUri, options);
  }

  get WebSocket(): WebSocketConstructor | undefined {
    return this._options.WebSocket
        || typeof WebSocket !== "undefined" && WebSocket
        || typeof require === "function" && require("ws") as WebSocketConstructor
        || void 0;
  }

  isConnected(): boolean {
    return this._socket !== void 0 ? this._socket.readyState === this._socket.OPEN : false;
  }

  open(): void {
    this.clearReconnect();
    if (this._socket === void 0) {
      const WebSocket = this.WebSocket;
      if (WebSocket === void 0) {
        throw new Error("WebSocket undefined");
      }
      let hostUri = this._hostUri;
      const schemeName = hostUri.schemeName();
      if (schemeName === "warp" || schemeName === "swim") {
        hostUri = hostUri.scheme("ws");
      } else if (schemeName === "warps" || schemeName === "swims") {
        hostUri = hostUri.scheme("wss");
      }
      if (this._options.protocols !== void 0) {
        this._socket = new WebSocket(hostUri.toString(), this._options.protocols);
      } else {
        this._socket = new WebSocket(hostUri.toString());
      }
      this._socket.onopen = this.onWebSocketOpen.bind(this);
      this._socket.onmessage = this.onWebSocketMessage.bind(this);
      this._socket.onclose = this.onWebSocketClose.bind(this);
      this._socket.onerror = this.onWebSocketError.bind(this);
    }
  }

  close(): void {
    this.clearReconnect();
    this.clearIdle();
    if (this._socket !== void 0) {
      this._socket.close();
      if (!this._context.isOnline()) {
        this.onWebSocketClose(); // force close event
      }
    } else {
      super.close();
    }
  }

  push(envelope: Envelope): void {
    if (this.isConnected()) {
      this.clearIdle();
      const text = envelope.toRecon();
      this._socket!.send(text);
      this.watchIdle();
    } else if (envelope instanceof CommandMessage) {
      if (this._sendBuffer.length < this.sendBufferSize()) {
        this._sendBuffer.push(envelope);
      } else {
        throw new Error("send buffer overflow");
      }
      this.open();
    }
  }

  protected onWebSocketOpen(): void {
    if (this.isConnected()) {
      const credentials = this.credentials();
      if (credentials.isDefined()) {
        const request = new AuthRequest(credentials);
        this.push(request);
      }
      this.onConnect();
      let envelope;
      while ((envelope = this._sendBuffer.shift()) && this.isConnected()) {
        this.push(envelope);
      }
      this.watchIdle();
    } else {
      this.close();
    }
  }

  protected onWebSocketMessage(message: MessageEvent): void {
    const data = message.data;
    if (typeof data === "string") {
      const envelope = Envelope.parseRecon(data);
      if (envelope !== void 0) {
        this.onEnvelope(envelope);
      } else {
        this.onUnknownEnvelope(data);
      }
    }
  }

  protected onWebSocketClose(): void {
    if (this._socket !== void 0) {
      this._socket.onopen = null;
      this._socket.onmessage = null;
      this._socket.onclose = null;
      this._socket.onerror = null;
      this._socket = void 0;
    }
    this.onDisconnect();
    this.clearIdle();
    if (!this.isIdle()) {
      if (this._context.isOnline()) {
        this.reconnect();
      }
    } else {
      this.close();
    }
  }

  protected onWebSocketError(): void {
    if (this._socket !== void 0) {
      this._socket.close();
      if (!this._context.isOnline()) {
        this.onWebSocketClose(); // force close event
      } else {
        this.onError();
      }
    }
  }
}
