// Copyright 2015-2021 Swim Inc.
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
import {AnyUri, Uri} from "@swim/uri";
import {Envelope} from "@swim/warp";
import {WarpClient} from "@swim/client";

export class MockServer {
  constructor(hostUri: AnyUri = "ws://localhost:5619", client: WarpClient = new WarpClient()) {
    Object.defineProperty(this, "hostUri", {
      value: Uri.fromAny(hostUri),
      enumerable: true,
    });
    Object.defineProperty(this, "client", {
      value: client,
      enumerable: true,
    });

    Object.defineProperty(this, "httpServer", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "wsServer", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "socket", {
      value: null,
      enumerable: true,
      configurable: true,
    });

    this.onOpen = this.onOpen.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onError = this.onError.bind(this);
  }

  readonly hostUri!: Uri;

  readonly client!: WarpClient;

  /** @hidden */
  readonly httpServer!: http.Server | null;

  /** @hidden */
  readonly wsServer!: ws.Server | null;

  /** @hidden */
  readonly socket!: ws | null;

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
      Object.defineProperty(this, "socket", {
        value: null,
        enumerable: true,
        configurable: true,
      });
    }
  }

  run<T>(callback: (server: MockServer, client: WarpClient,
                    resolve: (result?: T) => void,
                    reject: (reason?: unknown) => void) => void): Promise<T | void> {
    return new Promise((resolve: (result?: T) => void, reject: (reason?: unknown) => void): void => {
        const httpServer = http.createServer();
        Object.defineProperty(this, "httpServer", {
          value: httpServer,
          enumerable: true,
          configurable: true,
        });
        httpServer.listen(this.hostUri.portNumber, (): void => {
          try {
            const wsServer = new ws.Server({port: void 0, server: httpServer});
            Object.defineProperty(this, "wsServer", {
              value: wsServer,
              enumerable: true,
              configurable: true,
            });
            wsServer.on("connection", this.onOpen);
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
    this.client.close();
    const socket = this.socket;
    if (socket !== null) {
      socket.terminate();
      Object.defineProperty(this, "socket", {
        value: null,
        enumerable: true,
        configurable: true,
      });
    }
    const wsServer = this.wsServer;
    if (wsServer !== null) {
      wsServer.close();
      Object.defineProperty(this, "wsServer", {
        value: null,
        enumerable: true,
        configurable: true,
      });
    }
    const httpServer = this.httpServer;
    if (httpServer !== null) {
      return new Promise((resolve: () => void, reject: (reason: unknown) => void): void => {
        httpServer.close((): void => {
          Object.defineProperty(this, "httpServer", {
            value: null,
            enumerable: true,
            configurable: true,
          });
          resolve();
        });
      });
    } else {
      return Promise.resolve();
    }
  }

  onOpen(socket: ws): void {
    socket.onmessage = this.onMessage;
    socket.onclose = this.onClose;
    socket.onerror = this.onError;
    Object.defineProperty(this, "socket", {
      value: socket,
      enumerable: true,
      configurable: true,
    });
  }

  onMessage(message: { data: ws.Data; type: string; target: ws }): void {
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
      Object.defineProperty(this, "socket", {
        value: null,
        enumerable: true,
        configurable: true,
      });
    }
  }

  onError(): void {
    // stub
  }

  onEnvelope(envelope: Envelope): void {
    // stub
  }
}
