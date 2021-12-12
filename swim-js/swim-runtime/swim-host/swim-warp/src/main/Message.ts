// Copyright 2015-2021 Swim.inc
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

import type {HashCode} from "@swim/util";
import {Output, Debug, Format} from "@swim/codec";
import type {AnyValue, Value} from "@swim/structure";
import {Recon} from "@swim/recon";
import {OpenSignal} from "./"; // forward import
import {OpenedSignal} from "./"; // forward import
import {CloseSignal} from "./"; // forward import
import {ClosedSignal} from "./"; // forward import
import {ConnectSignal} from "./"; // forward import
import {ConnectedSignal} from "./"; // forward import
import {DisconnectSignal} from "./"; // forward import
import {DisconnectedSignal} from "./"; // forward import
import {ErrorSignal} from "./"; // forward import
import {EventMessage} from "./"; // forward import
import {CommandMessage} from "./"; // forward import
import {LinkRequest} from "./"; // forward import
import {LinkedResponse} from "./"; // forward import
import {SyncRequest} from "./"; // forward import
import {SyncedResponse} from "./"; // forward import
import {UnlinkRequest} from "./"; // forward import
import {UnlinkedResponse} from "./"; // forward import
import {AuthRequest} from "./"; // forward import
import {AuthedResponse} from "./"; // forward import
import {DeauthRequest} from "./"; // forward import
import {DeauthedResponse} from "./"; // forward import

/** @public */
export abstract class Message<M extends Message<M> = Message<any>> implements HashCode, Debug {
  get tag(): string {
    return (this.constructor as typeof Message).tag!;
  }

  abstract readonly body: Value;

  abstract withBody(body: AnyValue): M;

  abstract toValue(): Value;

  toAny(): AnyValue {
    return this.toValue().toAny();
  }

  toRecon(): string {
    return Recon.toString(this.toValue());
  }

  abstract equals(that: unknown): boolean;

  abstract hashCode(): number;

  abstract debug<T>(output: Output<T>): Output<T>;

  toString(): string {
    return Format.debug(this);
  }

  static readonly tag?: string;

  static fromValue(value: Value): Message | null {
    switch (value.tag) {
      case "open": return OpenSignal.fromValue(value);
      case "opened": return OpenedSignal.fromValue(value);
      case "close": return CloseSignal.fromValue(value);
      case "closed": return ClosedSignal.fromValue(value);
      case "connect": return ConnectSignal.fromValue(value);
      case "connected": return ConnectedSignal.fromValue(value);
      case "disconnect": return DisconnectSignal.fromValue(value);
      case "disconnected": return DisconnectedSignal.fromValue(value);
      case "error": return ErrorSignal.fromValue(value);
      case "event": return EventMessage.fromValue(value);
      case "command": return CommandMessage.fromValue(value);
      case "link": return LinkRequest.fromValue(value);
      case "linked": return LinkedResponse.fromValue(value);
      case "sync": return SyncRequest.fromValue(value);
      case "synced": return SyncedResponse.fromValue(value);
      case "unlink": return UnlinkRequest.fromValue(value);
      case "unlinked": return UnlinkedResponse.fromValue(value);
      case "auth": return AuthRequest.fromValue(value);
      case "authed": return AuthedResponse.fromValue(value);
      case "deauth": return DeauthRequest.fromValue(value);
      case "deauthed": return DeauthedResponse.fromValue(value);
      default: return null;
    }
  }

  static parseRecon(input: string): Message | null {
    return this.fromValue(Recon.parse(input));
  }
}
