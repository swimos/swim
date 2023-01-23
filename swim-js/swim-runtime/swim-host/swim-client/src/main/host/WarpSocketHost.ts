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

import * as ws from "ws";
import type {Mutable} from "@swim/util";
import {Property} from "@swim/component";
import type {Uri} from "@swim/uri";
import {Envelope, CommandMessage} from "@swim/warp";
import {WarpHost} from "./WarpHost";

/** @internal */
export class WarpSocketHost extends WarpHost {
  constructor(hostUri: Uri) {
    super(hostUri);
    this.socket = null;
  }

  /** @internal */
  readonly socket: WebSocket | null;

  @Property<WarpSocketHost["wsConstructor"]>({
    value: typeof WebSocket !== "undefined" ? WebSocket : ws.WebSocket as typeof WebSocket,
    inherits: true,
    equalValues(newValue: typeof WebSocket, oldValue: typeof WebSocket): boolean {
      return newValue === oldValue;
    },
  })
  readonly wsConstructor!: Property<this, typeof WebSocket>;

  @Property({inherits: true})
  readonly wsProtocols!: Property<this, string[] | string | undefined>;

  override push(envelope: Envelope): void {
    if (this.connected) {
      this.idleTimer.cancel();
      const text = envelope.toRecon();
      this.socket!.send(text);
      this.idleTimer.watch();
    } else if (envelope instanceof CommandMessage) {
      if (this.sendBuffer.length < this.sendBufferSize.value) {
        this.sendBuffer.push(envelope);
      } else {
        throw new Error("send buffer overflow");
      }
      if (!this.connected && this.online.value) {
        this.connect();
      }
    }
  }

  override connect(): void {
    this.reconnectTimer.cancel();

    let socket = this.socket;
    if (socket === null) {
      let hostUri = this.hostUri;
      const schemeName = hostUri.schemeName;
      if (schemeName === "warp" || schemeName === "swim") {
        hostUri = hostUri.withSchemeName("ws");
      } else if (schemeName === "warps" || schemeName === "swims") {
        hostUri = hostUri.withSchemeName("wss");
      }

      const wsConstructor = this.wsConstructor.getValue();
      const wsProtocols = this.wsProtocols.value;
      if (wsProtocols !== void 0) {
        socket = new wsConstructor(hostUri.toString(), wsProtocols);
      } else {
        socket = new wsConstructor(hostUri.toString());
      }
      socket.onopen = this.onWebSocketOpen.bind(this);
      socket.onmessage = this.onWebSocketMessage.bind(this);
      socket.onclose = this.onWebSocketClose.bind(this);
      socket.onerror = this.onWebSocketError.bind(this);

      (this as Mutable<this>).socket = socket;
    }
  }

  override disconnect(): void {
    const socket = this.socket;
    if (socket !== null) {
      socket.onopen = null;
      socket.onmessage = null;
      socket.onclose = null;
      socket.onerror = null;
      (this as Mutable<this>).socket = null;
      socket.close();
    }
    this.setConnected(false);
  }

  protected onWebSocketOpen(): void {
    this.setConnected(true);
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
    if (this.connected) {
      this.setConnected(false);
    } else {
      this.idleTimer.cancel();
      if (!this.idle) {
        this.reconnect();
      } else {
        this.close();
      }
    }
  }

  protected onWebSocketError(): void {
    if (this.socket !== null) {
      this.socket.close();
      if (!this.online.value) {
        this.onWebSocketClose(); // force close event
      } else {
        this.didFail();
      }
    }
  }
}
