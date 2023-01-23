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

import type {Value} from "@swim/structure";
import {Recon} from "@swim/recon";
import type {AnyUri, Uri} from "@swim/uri";
import {Message} from "./Message";
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
export abstract class Envelope<E extends Envelope<E> = Envelope<any>> extends Message<E> {
  abstract readonly node: Uri;

  abstract withNode(node: AnyUri): E;

  abstract readonly lane: Uri;

  abstract withLane(lane: AnyUri): E;

  declare readonly prio: number; // getter defined below to work around useDefineForClassFields lunacy

  withPrio(prio: number): E;
  withPrio(this: E, prio: number): E {
    return this;
  }

  declare readonly rate: number; // getter defined below to work around useDefineForClassFields lunacy

  withRate(rate: number): E;
  withRate(this: E, rate: number): E {
    return this;
  }

  static override fromValue(value: Value): Envelope | null {
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

  static override parseRecon(input: string): Envelope | null {
    return this.fromValue(Recon.parse(input));
  }
}
Object.defineProperty(Envelope.prototype, "prio", {
  get(this: Envelope): number {
    return 0;
  },
  configurable: true,
});
Object.defineProperty(Envelope.prototype, "rate", {
  get(this: Envelope): number {
    return 0;
  },
  configurable: true,
});
