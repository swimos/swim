// Copyright 2015-2024 Nstream, inc.
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

import * as WS from "ws";
import type {Mutable} from "@swim/util";
import type {ValueLike} from "@swim/structure";
import {Value} from "@swim/structure";
import type {Uri} from "@swim/uri";
import {Message} from "@swim/warp";
import {Signal} from "@swim/warp";
import {ConnectSignal} from "@swim/warp";
import {ConnectedSignal} from "@swim/warp";
import {DisconnectSignal} from "@swim/warp";
import {DisconnectedSignal} from "@swim/warp";
import {ErrorSignal} from "@swim/warp";
import {Envelope} from "@swim/warp";
import type {WarpWorkerOptions} from "./WarpWorker";

/** @internal */
export class WarpSocketHostWorker {
  constructor(hostUri: Uri, options: WarpWorkerOptions) {
    this.hostUri = hostUri;
    this.options = options;
    this.sendBuffer = [];

    this.channel = new MessageChannel();
    this.socket = null;

    this.onPortReceive = this.onPortReceive.bind(this);
    this.channel.port1.addEventListener("message", this.onPortReceive);
    this.channel.port1.start();
  }

  readonly hostUri: Uri;

  readonly options: WarpWorkerOptions;

  /** @internal */
  readonly channel: MessageChannel;

  get sendBufferSize(): number {
    const sendBufferSize = this.options.sendBufferSize;
    return sendBufferSize !== void 0 ? sendBufferSize : WarpSocketHostWorker.SendBufferSize;
  }

  /** @internal */
  readonly sendBuffer: Envelope[];

  protected onPortReceive(event: MessageEvent<ValueLike>): void {
    const value = Value.fromLike(event.data);
    const message = Message.fromValue(value);
    if (message !== null) {
      this.onReceiveMessage(message);
    } else {
      this.onReceiveUnknownMessage(value);
    }
  }

  protected onReceiveMessage(message: Message): void {
    if (message instanceof Signal) {
      this.onReceiveSignal(message);
    } else if (message instanceof Envelope) {
      this.onReceiveEnvelope(message);
    } else {
      this.onReceiveUnknownMessage(message);
    }
  }

  protected onReceiveEnvelope(envelope: Envelope): void {
    this.push(envelope);
  }

  protected onReceiveSignal(signal: Signal): void {
    if (signal instanceof ConnectSignal) {
      this.onConnectSignal(signal);
    } else if (signal instanceof DisconnectSignal) {
      this.onDisconnectSignal(signal);
    } else {
      this.onReceiveUnexpectedSignal(signal);
    }
  }

  protected onConnectSignal(request: ConnectSignal): void {
    this.connect();
  }

  protected onDisconnectSignal(request: DisconnectSignal): void {
    const socket = this.socket;
    if (socket === null) {
      return;
    }
    socket.onopen = null;
    socket.onmessage = null;
    socket.onclose = null;
    socket.onerror = null;
    (this as Mutable<this>).socket = null;
    socket.close();
    this.onDisconnect();
  }

  protected onReceiveUnexpectedSignal(signal: Signal): void {
    throw new Error("unexpected warp host signal: " + signal);
  }

  protected onReceiveUnknownMessage(message: Message | Value): void {
    throw new Error("unknown warp host message: " + message);
  }

  protected onReceiveUnknownEnvelope(envelope: Envelope | string): void {
    throw new Error("unknown warp host envelope: " + envelope);
  }

  /** @internal */
  readonly socket: WebSocket | null;

  get connected(): boolean {
    return this.socket !== null && this.socket.readyState === this.socket.OPEN;
  }

  connect(): void {
    let socket = this.socket;
    if (socket !== null) {
      return;
    }
    let WebSocketConstructor: typeof WebSocket;
    if (this.options.WebSocket !== void 0) {
      WebSocketConstructor = this.options.WebSocket;
    } else if (typeof WebSocket !== "undefined") {
      WebSocketConstructor = WebSocket;
    } else if (WarpSocketHostWorker.WebSocket !== null) {
      WebSocketConstructor = WarpSocketHostWorker.WebSocket;
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

  close(): void {
    if (this.socket === null) {
      return;
    }
    this.socket.close();
  }

  protected onConnect(): void {
    this.channel.port1.postMessage(ConnectedSignal.create(this.hostUri).toLike());
  }

  protected onDisconnect(): void {
    this.channel.port1.postMessage(DisconnectedSignal.create(this.hostUri).toLike());
  }

  protected onError(error?: unknown): void {
    this.channel.port1.postMessage(ErrorSignal.create(this.hostUri).toLike());
  }

  protected onEnvelope(envelope: Envelope): void {
    this.channel.port1.postMessage(envelope.toLike());
  }

  push(envelope: Envelope): void {
    if (this.connected) {
      const text = envelope.toRecon();
      this.socket!.send(text);
    } else {
      if (this.sendBuffer.length >= this.sendBufferSize) {
        throw new Error("send buffer overflow");
      }
      this.sendBuffer.push(envelope);
      this.connect();
    }
  }

  protected onWebSocketOpen(): void {
    this.onConnect();
    let envelope;
    while ((envelope = this.sendBuffer.shift()) && this.connected) {
      this.push(envelope);
    }
  }

  protected onWebSocketMessage(message: MessageEvent<unknown>): void {
    const data = message.data;
    if (typeof data === "string") {
      const envelope = Envelope.parseRecon(data);
      if (envelope !== null) {
        this.onEnvelope(envelope);
      } else {
        this.onReceiveUnknownEnvelope(data);
      }
    }
  }

  protected onWebSocketClose(): void {
    const socket = this.socket;
    if (socket === null) {
      return;
    }
    socket.onopen = null;
    socket.onmessage = null;
    socket.onclose = null;
    socket.onerror = null;
    (this as Mutable<this>).socket = null;
    this.onDisconnect();
  }

  protected onWebSocketError(): void {
    if (this.socket === null) {
      return;
    }
    this.onError();
    this.socket.close();
  }

  static readonly SendBufferSize: number = 1024;

  /** @internal */
  static WebSocket: typeof WebSocket | null = null;
}
if (typeof WebSocket !== "undefined") {
  WarpSocketHostWorker.WebSocket = WebSocket;
} else if (typeof WS !== "undefined" && WS.WebSocket !== void 0) {
  WarpSocketHostWorker.WebSocket = WS.WebSocket as unknown as typeof WebSocket | null;
}
