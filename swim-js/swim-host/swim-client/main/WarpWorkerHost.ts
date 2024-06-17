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

import type {Mutable} from "@swim/util";
import type {ValueLike} from "@swim/structure";
import {Value} from "@swim/structure";
import type {Uri} from "@swim/uri";
import {Message} from "@swim/warp";
import {Signal} from "@swim/warp";
import {OpenSignal} from "@swim/warp";
import {OpenedSignal} from "@swim/warp";
import {ClosedSignal} from "@swim/warp";
import {ConnectSignal} from "@swim/warp";
import {ConnectedSignal} from "@swim/warp";
import {DisconnectSignal} from "@swim/warp";
import {DisconnectedSignal} from "@swim/warp";
import {ErrorSignal} from "@swim/warp";
import {Envelope} from "@swim/warp";
import {CommandMessage} from "@swim/warp";
import {WarpHost} from "./WarpHost";

/** @internal */
export class WarpWorkerHost extends WarpHost {
  constructor(hostUri: Uri, worker: Worker) {
    super(hostUri);
    this.worker = worker;
    this.port = null;

    this.onWorkerReceive = this.onWorkerReceive.bind(this);
    this.onPortReceive = this.onPortReceive.bind(this);
    this.worker.addEventListener("message", this.onWorkerReceive);
    this.worker.postMessage(OpenSignal.create(this.hostUri).toLike());
  }

  /** @internal */
  readonly worker: Worker;

  /** @internal */
  readonly port: MessagePort | null;

  override push(envelope: Envelope): void {
    if (this.connected) {
      this.idleTimer.cancel();
      this.port!.postMessage(envelope.toLike());
      this.idleTimer.watch();
    } else if (envelope instanceof CommandMessage) {
      if (this.sendBuffer.length >= this.sendBufferSize.value) {
        throw new Error("send buffer overflow");
      }
      this.sendBuffer.push(envelope);
      if (!this.connected && this.online.value) {
        this.connect();
      }
    }
  }

  override connect(): void {
    this.reconnectTimer.cancel();
    const port = this.port;
    if (port !== null) {
      port.postMessage(ConnectSignal.create(this.hostUri).toLike());
    }
  }

  override disconnect(): void {
    const port = this.port;
    if (port !== null) {
      port.postMessage(DisconnectSignal.create(this.hostUri).toLike());
    }
    this.setConnected(false);
  }

  protected onWorkerReceive(event: MessageEvent<ValueLike>): void {
    const value = Value.fromLike(event.data);
    const signal = Signal.fromValue(value);
    if (signal !== null && signal.host.equals(this.hostUri)) {
      this.onSignal(signal, event);
    }
  }

  protected onPortReceive(event: MessageEvent<ValueLike>): void {
    const value = Value.fromLike(event.data);
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

  protected onClosedSignal(response?: ClosedSignal): void {
    const port = this.port;
    if (port !== null) {
      (this as Mutable<this>).port = null;
      port.removeEventListener("message", this.onPortReceive);
    }
    this.setConnected(false);
  }

  protected onConnectedSignal(response: ConnectedSignal): void {
    this.setConnected(true);
  }

  protected onDisconnectedSignal(response: DisconnectedSignal): void {
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

  protected onErrorSignal(response: ErrorSignal): void {
    // hook
  }

  protected onUnexpectedSignal(signal: Signal): void {
    throw new Error("unexpected warp host signal: " + signal);
  }

  protected onUnknownMessage(message: Message | Value): void {
    throw new Error("unknown warp host message: " + message);
  }
}
