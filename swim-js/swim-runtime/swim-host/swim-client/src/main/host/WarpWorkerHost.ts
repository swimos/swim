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

import type {Mutable} from "@swim/util";
import {AnyValue, Value} from "@swim/structure";
import type {Uri} from "@swim/uri";
import {
  Message,
  Signal,
  OpenSignal,
  OpenedSignal,
  CloseSignal,
  ClosedSignal,
  ConnectSignal,
  ConnectedSignal,
  DisconnectedSignal,
  ErrorSignal,
  Envelope,
  CommandMessage,
  AuthRequest,
} from "@swim/warp";
import webworker from "@swim/client/webworker";
import type {HostContext} from "./HostContext";
import type {HostOptions} from "./Host";
import {RemoteHost} from "./RemoteHost";

/** @internal */
export class WarpWorkerHost extends RemoteHost {
  constructor(context: HostContext, hostUri: Uri, options: HostOptions, worker: Worker) {
    super(context, hostUri, options);
    this.worker = worker;
    this.port = null;
    this.connected = false;

    this.onWorkerReceive = this.onWorkerReceive.bind(this);
    this.onPortReceive = this.onPortReceive.bind(this);
    this.worker.addEventListener("message", this.onWorkerReceive);
    this.worker.postMessage(OpenSignal.create(this.hostUri).toAny());
  }

  /** @internal */
  readonly worker: Worker;

  /** @internal */
  readonly port: MessagePort | null;

  override readonly connected: boolean;

  override open(): void {
    const port = this.port;
    if (port !== null) {
      port.postMessage(ConnectSignal.create(this.hostUri).toAny());
    }
  }

  override close(): void {
    this.clearIdle();
    if (this.port !== null) {
      this.worker.postMessage(CloseSignal.create(this.hostUri).toAny());
      if (!this.context.online) {
        this.closeDown();
      }
    } else {
      super.close();
    }
  }

  override push(envelope: Envelope): void {
    if (this.connected) {
      this.clearIdle();
      this.port!.postMessage(envelope.toAny());
      this.watchIdle();
    } else if (envelope instanceof CommandMessage) {
      if (this.sendBuffer.length < this.sendBufferSize) {
        this.sendBuffer.push(envelope);
      } else {
        throw new Error("send buffer overflow");
      }
    }
  }

  protected onWorkerReceive(event: MessageEvent<AnyValue>): void {
    const value = Value.fromAny(event.data);
    const signal = Signal.fromValue(value);
    if (signal !== null && signal.host.equals(this.hostUri)) {
      this.onSignal(signal, event);
    }
  }

  protected onPortReceive(event: MessageEvent<AnyValue>): void {
    const value = Value.fromAny(event.data);
    const message = Message.fromValue(value);
    if (message !== null) {
      this.onMessage(message, event);
    } else {
      this.onUnknownMessage(value);
    }
  }

  protected onMessage(message: Message, event: MessageEvent): void {
    if (message instanceof Signal) {
      this.onSignal(message, event);
    } else if (message instanceof Envelope) {
      this.onEnvelope(message);
    } else {
      this.onUnknownMessage(message);
    }
  }

  protected onSignal(signal: Signal, event: MessageEvent): void {
    if (signal instanceof OpenedSignal) {
      this.onOpenedSignal(signal, event);
    } else if (signal instanceof ClosedSignal) {
      this.onClosedSignal(signal);
    } else if (signal instanceof ConnectedSignal) {
      this.onConnectedSignal(signal);
    } else if (signal instanceof DisconnectedSignal) {
      this.onDisconnectedSignal(signal);
    } else if (signal instanceof ErrorSignal) {
      this.onErrorSignal(signal);
    } else {
      this.onUnexpectedSignal(signal);
    }
  }

  protected onOpenedSignal(response: OpenedSignal, event: MessageEvent): void {
    const port = event.ports[0];
    if (port !== void 0) {
      (this as Mutable<this>).port = port;
      port.addEventListener("message", this.onPortReceive);
      port.start();
    }
  }

  protected onClosedSignal(response: ClosedSignal): void {
    const port = this.port;
    if (port !== null) {
      (this as Mutable<this>).port = null;
      port.removeEventListener("message", this.onPortReceive);
    }
    this.closeDown();
  }

  protected onConnectedSignal(response: ConnectedSignal): void {
    (this as Mutable<this>).connected = true;
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
  }

  protected onDisconnectedSignal(response: DisconnectedSignal): void {
    (this as Mutable<this>).connected = false;
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

  protected onErrorSignal(response: ErrorSignal): void {
    // hook
  }

  protected onUnexpectedSignal(signal: Signal): void {
    throw new Error("unexpected warp host signal: " + signal);
  }

  protected onUnknownMessage(message: Message | Value): void {
    throw new Error("unknown warp host message: " + message);
  }

  protected closeDown(): void {
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

  static create(context: HostContext, hostUri: Uri, options: HostOptions): WarpWorkerHost | null {
    try {
      if (options.worker !== false && this.webworker !== void 0 && typeof Blob !== "undefined") {
        let webworkerUrl = this.webworkerUrl;
        if (webworkerUrl === void 0) {
          const webworkerBlob = new Blob([this.webworker], {type: "text/javascript"});
          webworkerUrl = URL.createObjectURL(webworkerBlob);
          this.webworkerUrl = webworkerUrl;
        }
        const worker = new Worker(webworkerUrl, {
          name: hostUri.toString(),
          type: "classic",
          credentials: "same-origin",
        });
        return new WarpWorkerHost(context, hostUri, options, worker);
      }
    } catch (error) {
      // swallow
    }
    return null;
  }

  /** @internal */
  static webworker: string | undefined = webworker;
  /** @internal */
  static webworkerUrl: string | undefined = void 0;
}
