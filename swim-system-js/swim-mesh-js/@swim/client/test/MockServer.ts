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

import {AnyUri, Uri} from "@swim/uri";
import {Envelope} from "@swim/warp";
import {WarpClient} from "@swim/client";
import * as http from "http";
import * as ws from "ws";

export class MockServer {
  readonly _hostUri: Uri;
  client: WarpClient;
  httpServer: http.Server | undefined;
  wsServer: ws.Server | undefined;
  socket: ws | undefined;

  constructor(hostUri: AnyUri = "ws://localhost:5619", client: WarpClient = new WarpClient()) {
    hostUri = Uri.fromAny(hostUri);
    this._hostUri = hostUri;
    this.client = client;

    this.onOpen = this.onOpen.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onError = this.onError.bind(this);
  }

  hostUri(): Uri {
    return this._hostUri;
  }

  resolve(relative: AnyUri): Uri {
    relative = Uri.fromAny(relative);
    return this._hostUri.resolve(relative);
  }

  send(data: unknown): void {
    if (data instanceof Envelope) {
      data = data.toRecon();
    }
    this.socket!.send(data);
  }

  close(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = void 0;
    }
  }

  run<T>(callback: (server: MockServer, client: WarpClient,
                    resolve: (result?: T) => void,
                    reject: (reason?: unknown) => void) => void): Promise<T> {
    return new Promise((resolve: (result?: T) => void, reject: (reason?: unknown) => void): void => {
      this.httpServer = http.createServer();
      this.httpServer.listen(this._hostUri.portNumber(), () => {
        try {
          this.wsServer = new ws.Server({port: void 0, server: this.httpServer});
          this.wsServer.on("connection", this.onOpen);
          callback(this, this.client, resolve, reject);
        } catch (error) {
          reject(error);
        }
      });
    }).then(this.runSuccess.bind(this), this.runFailure.bind(this));
  }

  protected runSuccess<T>(result: T): Promise<T> {
    return this.stop().then(() => result);
  }

  protected runFailure(): Promise<void> {
    return this.stop();
  }

  stop(): Promise<void> {
    if (this.client) {
      this.client.close();
    }
    if (this.socket) {
      this.socket.terminate();
      this.socket = void 0;
    }
    if (this.wsServer) {
      this.wsServer.close();
      this.wsServer = void 0;
    }
    if (this.httpServer) {
      return new Promise((resolve: () => void, reject: (reason: unknown) => void): void => {
        this.httpServer!.close(() => {
          this.httpServer = void 0;
          resolve();
        });
      });
    } else {
      return Promise.resolve();
    }
  }

  onOpen(socket: ws): void {
    this.socket = socket;
    this.socket.onmessage = this.onMessage;
    this.socket.onclose = this.onClose;
    this.socket.onerror = this.onError;
  }

  onMessage(message: { data: ws.Data; type: string; target: ws }): void {
    const data = message.data;
    if (typeof data === "string") {
      const envelope = Envelope.parseRecon(data);
      this.onEnvelope(envelope!);
    }
  }

  onClose(): void {
    if (this.socket) {
      this.socket.onopen = void 0 as any;
      this.socket.onmessage = void 0 as any;
      this.socket.onclose = void 0 as any;
      this.socket.onerror = void 0 as any;
      this.socket = void 0;
    }
  }

  onError(): void {
    // stub
  }

  onEnvelope(envelope: Envelope): void {
    // stub
  }
}
