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

import {AnyItem, Value, Record} from "@swim/structure";
import type {StreamletScope} from "@swim/streamlet";
import {RecordModel} from "./RecordModel";

/** @public */
export class RecordScope extends RecordModel {
  constructor(scope: StreamletScope<Value> | null, state?: Record) {
    super(state);
    Object.defineProperty(this, "streamletScope", {
      value: scope,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }

  override readonly streamletScope!: StreamletScope<Value> | null;

  static override from(record: Record): RecordScope {
    const scope = new RecordScope(RecordScope.globalScope());
    scope.materialize(record);
    scope.compile(record);
    return scope;
  }

  static override of(...items: AnyItem[]): RecordScope {
    return RecordScope.from(Record.of(...items));
  }
}
