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

import * as http from "http";
import * as ws from "ws";
import type {Mutable} from "@swim/util";
import {AnyUri, Uri} from "@swim/uri";
import {Envelope} from "@swim/warp";
import {WarpClient} from "@swim/client";

export class MockServer {
  constructor(hostUri: Uri, client: WarpClient) {
    this.hostUri = hostUri;
    this.client = client;

    this.httpServer = null;
    this.wsServer = null;
    this.socket = null;

    this.onOpen = this.onOpen.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onError = this.onError.bind(this);
  }

  readonly hostUri: Uri;

  readonly client: WarpClient;

  /** @internal */
  readonly httpServer: http.Server | null;

  /** @internal */
  readonly wsServer: ws.WebSocketServer | null;

  /** @internal */
  readonly socket: ws.WebSocket | null;

  resolve(relative: AnyUri): Uri {
    relative = Uri.fromAny(relative);
    return this.hostUri.resolve(relative);
  }

  send(data: unknown): void {
    if (data instanceof Envelope) {
      data = data.toRecon();
    }
    this.socket!.send(data);
  }

  close(): void {
    const socket = this.socket;
    if (socket !== null) {
      socket.close();
      (this as Mutable<this>).socket = null;
    }
  }

  run<T>(callback: (server: MockServer, client: WarpClient,
                    resolve: (result?: T) => void,
                    reject: (reason?: unknown) => void) => void): Promise<T | void> {
    return new Promise((resolve: (result?: T) => void, reject: (reason?: unknown) => void): void => {
      const httpServer = http.createServer();
      (this as Mutable<this>).httpServer = httpServer;
      httpServer.listen(this.hostUri.portNumber, (): void => {
        try {
          const wsServer = new ws.WebSocketServer({port: void 0, server: httpServer});
          (this as Mutable<this>).wsServer = wsServer;
          wsServer.on("connection", this.onOpen);
          this.client.mount();
          callback(this, this.client, resolve, reject);
        } catch (error) {
          reject(error);
        }
      });
    })
    .then(this.runSuccess.bind(this), this.runFailure.bind(this));
  }

  protected runSuccess<T>(result: T): Promise<T> {
    return this.stop().then(function (): T {
      return result;
    });
  }

  protected runFailure(reason: unknown): Promise<void> {
    return this.stop().then(function (): never {
      throw reason;
    });
  }

  stop(): Promise<void> {
    this.client.unmount();
    const socket = this.socket;
    if (socket !== null) {
      socket.terminate();
      (this as Mutable<this>).socket = null;
    }
    const wsServer = this.wsServer;
    if (wsServer !== null) {
      wsServer.close();
      (this as Mutable<this>).wsServer = null;
    }
    const httpServer = this.httpServer;
    if (httpServer !== null) {
      return new Promise((resolve: () => void, reject: (reason: unknown) => void): void => {
        httpServer.close((): void => {
          (this as Mutable<this>).httpServer = null;
          resolve();
        });
      });
    } else {
      return Promise.resolve();
    }
  }

  onOpen(socket: ws.WebSocket): void {
    socket.onmessage = this.onMessage;
    socket.onclose = this.onClose;
    socket.onerror = this.onError;
    (this as Mutable<this>).socket = socket;
  }

  onMessage(message: { data: ws.Data; type: string; target: ws.WebSocket }): void {
    const data = message.data;
    if (typeof data === "string") {
      const envelope = Envelope.parseRecon(data);
      this.onEnvelope(envelope!);
    }
  }

  onClose(): void {
    const socket = this.socket;
    if (socket !== null) {
      socket.onopen = void 0 as any;
      socket.onmessage = void 0 as any;
      socket.onclose = void 0 as any;
      socket.onerror = void 0 as any;
      (this as Mutable<this>).socket = null;
    }
  }

  onError(): void {
    // hook
  }

  onEnvelope(envelope: Envelope): void {
    // hook
  }

  static create(hostUri?: AnyUri, client?: WarpClient): MockServer {
    if (hostUri === void 0) {
      hostUri = "ws://localhost:5619";
    }
    hostUri = Uri.fromAny(hostUri);
    if (client === void 0) {
      client = new WarpClient();
    }
    return new MockServer(hostUri, client);
  }
}
