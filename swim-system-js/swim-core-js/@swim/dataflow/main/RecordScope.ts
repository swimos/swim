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

import {AnyItem, Value, Record} from "@swim/structure";
import {StreamletScope} from "@swim/streamlet";
import {RecordOutlet} from "./RecordOutlet";
import {RecordModel} from "./RecordModel";

export class RecordScope extends RecordModel {
  /** @hidden */
  protected scope: StreamletScope<Value> | null;

  constructor(scope: StreamletScope<Value> | null, state?: Record) {
    super(state);
    this.scope = scope;
  }

  streamletScope(): StreamletScope<Value> | null {
    return this.scope;
  }

  static from(record: Record): RecordScope {
    const scope = new RecordScope(RecordScope.globalScope());
    scope.materialize(record);
    scope.compile(record);
    return scope;
  }

  static of(...items: AnyItem[]): RecordScope {
    return RecordScope.from(Record.of.apply(void 0, arguments));
  }
}
RecordOutlet.Scope = RecordScope;
