// Copyright 2015-2021 Swim Inc.
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

import {AnyValue, Value} from "@swim/structure";
import {AnyUri, Uri} from "@swim/uri";
import {LinkAddressed} from "./LinkAddressed";

/** @public */
export class SyncRequest extends LinkAddressed<SyncRequest> {
  constructor(node: Uri, lane: Uri, prio: number, rate: number, body: Value) {
    super(node, lane, prio, rate, body);
  }

  protected override copy(node: Uri, lane: Uri, prio: number, rate: number, body: Value): SyncRequest {
    return new SyncRequest(node, lane, prio, rate, body);
  }

  static get tag(): string {
    return "sync";
  }

  static create(node: AnyUri, lane: AnyUri, prio: number = 0, rate: number = 0,
                body: AnyValue = Value.absent()): SyncRequest {
    node = Uri.fromAny(node);
    lane = Uri.fromAny(lane);
    body = Value.fromAny(body);
    return new SyncRequest(node as Uri, lane as Uri, prio, rate, body);
  }
}
