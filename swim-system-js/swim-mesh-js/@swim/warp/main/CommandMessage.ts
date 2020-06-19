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

import {AnyUri, Uri} from "@swim/uri";
import {AnyValue, Value} from "@swim/structure";
import {Envelope} from "./Envelope";
import {LaneAddressed} from "./LaneAddressed";

export class CommandMessage extends LaneAddressed {
  constructor(node: Uri, lane: Uri, body: Value) {
    super(node, lane, body);
  }

  protected copy(node: Uri, lane: Uri, body: Value): this {
    return new CommandMessage(node, lane, body) as this;
  }

  static tag(): string {
    return "command";
  }

  static fromValue(value: Value): CommandMessage | undefined {
    return LaneAddressed.fromValue(value, CommandMessage) as CommandMessage | undefined;
  }

  static of(node: AnyUri, lane: AnyUri, body: AnyValue = Value.absent()): CommandMessage {
    node = Uri.fromAny(node);
    lane = Uri.fromAny(lane);
    body = Value.fromAny(body);
    return new CommandMessage(node, lane, body);
  }
}
Envelope.CommandMessage = CommandMessage;
