// Copyright 2015-2020 Swim inc.
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
import type {AnyUri, Uri} from "@swim/uri";
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

export abstract class Envelope implements HashCode, Debug {
  get tag(): string {
    return (this.constructor as unknown as {readonly tag: string}).tag;
  }

  abstract readonly node: Uri;

  abstract withNode(node: AnyUri): Envelope;

  abstract readonly lane: Uri;

  abstract withLane(lane: AnyUri): Envelope;

  declare readonly prio: number; // getter defined below to work around useDefineForClassFields lunacy

  withPrio(prio: number): Envelope {
    return this;
  }

  declare readonly rate: number; // getter defined below to work around useDefineForClassFields lunacy

  withRate(rate: number): Envelope {
    return this;
  }

  abstract readonly body: Value;

  abstract withBody(body: AnyValue): Envelope;

  abstract toValue(): Value;

  toRecon(): string {
    return Recon.toString(this.toValue());
  }

  abstract equals(that: unknown): boolean;

  abstract hashCode(): number;

  abstract debug(output: Output): void;

  toString(): string {
    return Format.debug(this);
  }

  static fromValue(value: Value): Envelope | null {
    switch (value.tag) {
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

  static parseRecon(input: string): Envelope | null {
    return Envelope.fromValue(Recon.parse(input));
  }
}
Object.defineProperty(Envelope.prototype, "prio", {
  get(this: Envelope): number {
    return 0;
  },
  enumerable: true,
  configurable: true,
});
Object.defineProperty(Envelope.prototype, "rate", {
  get(this: Envelope): number {
    return 0;
  },
  enumerable: true,
  configurable: true,
});
