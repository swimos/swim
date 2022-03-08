// Copyright 2015-2022 Swim.inc
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

import type {Value, Record} from "@swim/structure";
import {KeyEffect, AbstractInlet} from "@swim/streamlet";
import {RecordOutlet} from "./RecordOutlet";

/** @internal */
export class RecordFieldUpdater extends AbstractInlet<Value> {
  constructor(record: Record, key: Value) {
    super();
    this.record = record;
    this.key = key;
  }

  readonly record: Record;

  readonly key: Value;

  protected override onDecohereOutput(): void {
    const record = this.record;
    if (RecordOutlet.is(record)) {
      record.decohereInputKey(this.key, KeyEffect.Update);
    }
  }

  protected override onRecohereOutput(version: number): void {
    const input = this.input;
    if (input !== null) {
      const value = input.get();
      if (value !== void 0) {
        this.record.set(this.key, value);
      } else {
        this.record.delete(this.key);
      }
    }
  }
}
