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

import {AnyUri, Uri} from "@swim/uri";
import {AnyValue, Value} from "@swim/structure";
import {Envelope} from "./Envelope";
import {LinkAddressed} from "./LinkAddressed";

export class LinkRequest extends LinkAddressed {
  constructor(node: Uri, lane: Uri, prio: number, rate: number, body: Value) {
    super(node, lane, prio, rate, body);
  }

  protected copy(node: Uri, lane: Uri, prio: number, rate: number, body: Value): this {
    return new LinkRequest(node, lane, prio, rate, body) as this;
  }

  static tag(): string {
    return "link";
  }

  static fromValue(value: Value): LinkRequest | undefined {
    return LinkAddressed.fromValue(value, LinkRequest) as LinkRequest | undefined;
  }

  static of(node: AnyUri, lane: AnyUri, prio: number = 0, rate: number = 0,
            body: AnyValue = Value.absent()): LinkRequest {
    node = Uri.fromAny(node);
    lane = Uri.fromAny(lane);
    body = Value.fromAny(body);
    return new LinkRequest(node, lane, prio, rate, body);
  }
}
Envelope.LinkRequest = LinkRequest;
