// Copyright 2015-2020 SWIM.AI inc.
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

import {HashCode} from "@swim/util";
import {Output, Debug, Format} from "@swim/codec";
import {AnyUri, Uri} from "@swim/uri";
import {AnyValue, Value} from "@swim/structure";
import {Recon} from "@swim/recon";
import {EventMessage} from "./EventMessage";
import {CommandMessage} from "./CommandMessage";
import {LinkRequest} from "./LinkRequest";
import {LinkedResponse} from "./LinkedResponse";
import {SyncRequest} from "./SyncRequest";
import {SyncedResponse} from "./SyncedResponse";
import {UnlinkRequest} from "./UnlinkRequest";
import {UnlinkedResponse} from "./UnlinkedResponse";
import {AuthRequest} from "./AuthRequest";
import {AuthedResponse} from "./AuthedResponse";
import {DeauthRequest} from "./DeauthRequest";
import {DeauthedResponse} from "./DeauthedResponse";

export abstract class Envelope implements HashCode, Debug {
  tag(): string {
    return (this.constructor as typeof Envelope).tag();
  }

  abstract node(): Uri;
  abstract node(node: AnyUri): this;

  abstract lane(): Uri;
  abstract lane(lane: AnyUri): this;

  prio(): number;
  prio(prio: number): this;
  prio(prio?: number): number | this {
    if (prio === void 0) {
      return 0;
    } else {
      return this;
    }
  }

  rate(): number;
  rate(rate: number): this;
  rate(rate?: number): number | this {
    if (rate === void 0) {
      return 0;
    } else {
      return this;
    }
  }

  abstract body(): Value;
  abstract body(body: AnyValue): this;

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

  /** @hidden */
  static tag(): string {
    return void 0 as any;
  }

  static fromValue(value: Value): Envelope | undefined {
    switch (value.tag()) {
      case "event": return Envelope.EventMessage.fromValue(value);
      case "command": return Envelope.CommandMessage.fromValue(value);
      case "link": return Envelope.LinkRequest.fromValue(value);
      case "linked": return Envelope.LinkedResponse.fromValue(value);
      case "sync": return Envelope.SyncRequest.fromValue(value);
      case "synced": return Envelope.SyncedResponse.fromValue(value);
      case "unlink": return Envelope.UnlinkRequest.fromValue(value);
      case "unlinked": return Envelope.UnlinkedResponse.fromValue(value);
      case "auth": return Envelope.AuthRequest.fromValue(value);
      case "authed": return Envelope.AuthedResponse.fromValue(value);
      case "deauth": return Envelope.DeauthRequest.fromValue(value);
      case "deauthed": return Envelope.DeauthedResponse.fromValue(value);
      default: return void 0;
    }
  }

  static parseRecon(input: string): Envelope | undefined {
    return Envelope.fromValue(Recon.parse(input));
  }

  // Forward type declarations
  /** @hidden */
  static EventMessage: typeof EventMessage; // defined by EventMessage
  /** @hidden */
  static CommandMessage: typeof CommandMessage; // defined by CommandMessage
  /** @hidden */
  static LinkRequest: typeof LinkRequest; // defined by LinkRequest
  /** @hidden */
  static LinkedResponse: typeof LinkedResponse; // defined by LinkedResponse
  /** @hidden */
  static SyncRequest: typeof SyncRequest; // defined by SyncRequest
  /** @hidden */
  static SyncedResponse: typeof SyncedResponse; // defined by SyncedResponse
  /** @hidden */
  static UnlinkRequest: typeof UnlinkRequest; // defined by UnlinkRequest
  /** @hidden */
  static UnlinkedResponse: typeof UnlinkedResponse; // defined by UnlinkedResponse
  /** @hidden */
  static AuthRequest: typeof AuthRequest; // defined by AuthRequest
  /** @hidden */
  static AuthedResponse: typeof AuthedResponse; // defined by AuthedResponse
  /** @hidden */
  static DeauthRequest: typeof DeauthRequest; // defined by DeauthRequest
  /** @hidden */
  static DeauthedResponse: typeof DeauthedResponse; // defined by DeauthedResponse
}
