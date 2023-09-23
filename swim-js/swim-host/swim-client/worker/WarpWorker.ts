// Copyright 2015-2023 Nstream, inc.
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

import type {ValueLike} from "@swim/structure";
import {Value} from "@swim/structure";
import type {UriLike} from "@swim/uri";
import {Uri} from "@swim/uri";
import {Message} from "@swim/warp";
import {Signal} from "@swim/warp";
import {OpenSignal} from "@swim/warp";
import {OpenedSignal} from "@swim/warp";
import {CloseSignal} from "@swim/warp";
import {ClosedSignal} from "@swim/warp";
import {Envelope} from "@swim/warp";
import {WarpSocketHostWorker} from "./WarpSocketHostWorker";

/** @internal */
export interface WarpWorkerOptions {
  sendBufferSize?: number;

  protocols?: string | string[];
  WebSocket?: typeof WebSocket;
}

/** @internal */
export class WarpWorker {
  constructor(scope: DedicatedWorkerGlobalScope, options: WarpWorkerOptions = {}) {
    this.scope = scope;
    this.options = options;
    this.hosts = {};

    this.onWorkerReceive = this.onWorkerReceive.bind(this);
    this.scope.addEventListener("message", this.onWorkerReceive);
  }

  readonly scope: DedicatedWorkerGlobalScope;

  /** @internal */
  readonly options: WarpWorkerOptions;

  /** @internal */
  readonly hosts: {readonly [hostUri: string]: WarpSocketHostWorker | undefined};

  /** @internal */
  getHost(hostUri: UriLike): WarpSocketHostWorker | null {
    hostUri = Uri.fromLike(hostUri);
    const host = this.hosts[hostUri.toString()];
    return host !== void 0 ? host : null;
  }

  /** @internal */
  openHost(hostUri: UriLike, options: WarpWorkerOptions): WarpSocketHostWorker {
    hostUri = Uri.fromLike(hostUri);
    const hosts = this.hosts as {[hostUri: string]: WarpSocketHostWorker | undefined};
    let host = hosts[hostUri.toString()];
    if (host === void 0) {
      host = new WarpSocketHostWorker(hostUri, options);
      hosts[hostUri.toString()] = host;
    }
    return host;
  }

  /** @internal */
  closeHost(host: WarpSocketHostWorker): void {
    const hosts = this.hosts as {[hostUri: string]: WarpSocketHostWorker | undefined};
    if (hosts[host.hostUri.toString()] !== void 0) {
      delete hosts[host.hostUri.toString()];
      host.close();
    }
  }

  protected onWorkerReceive(event: MessageEvent<ValueLike>): void {
    const value = Value.fromLike(event.data);
    const message = Message.fromValue(value);
    if (message !== null) {
      this.onMessage(message);
    } else {
      this.onUnknownMessage(value);
    }
  }

  protected onMessage(message: Message): void {
    if (message instanceof Signal) {
      this.onSignal(message);
    } else if (message instanceof Envelope) {
      this.onEnvelope(message);
    } else {
      this.onUnknownMessage(message);
    }
  }

  protected onSignal(signal: Signal): void {
    if (signal instanceof OpenSignal) {
      this.onOpenSignal(signal);
    } else if (signal instanceof CloseSignal) {
      this.onCloseSignal(signal);
    } else {
      this.onUnexpectedSignal(signal);
    }
  }

  protected onOpenSignal(request: OpenSignal): void {
    const hostUri = request.host;
    const host = this.openHost(hostUri, {});
    if (host instanceof WarpSocketHostWorker) {
      this.scope.postMessage(OpenedSignal.create(hostUri).toLike(), [host.channel.port2]);
      host.connect();
    }
  }

  protected onCloseSignal(request: CloseSignal): void {
    const hostUri = request.host;
    const host = this.getHost(hostUri);
    if (host instanceof WarpSocketHostWorker) {
      this.closeHost(host);
      this.scope.postMessage(ClosedSignal.create(hostUri).toLike());
    }
  }

  protected onUnexpectedSignal(signal: Signal): void {
    throw new Error("unexpected warp signal: " + signal);
  }

  protected onEnvelope(envelope: Envelope): void {
    throw new Error("unexpected warp envelope: " + envelope);
  }

  protected onUnknownMessage(message: Message | Value): void {
    throw new Error("unknown warp message: " + message);
  }
}
