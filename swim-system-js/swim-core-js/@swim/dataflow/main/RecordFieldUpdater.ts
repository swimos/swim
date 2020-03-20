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

import {Value, Record} from "@swim/structure";
import {KeyEffect, AbstractInlet} from "@swim/streamlet";
import {RecordOutlet} from "./RecordOutlet";

export class RecordFieldUpdater extends AbstractInlet<Value> {
  /** @hidden */
  protected readonly _record: Record;
  /** @hidden */
  protected readonly _key: Value;

  constructor(record: Record, key: Value) {
    super();
    this._record = record;
    this._key = key;
  }

  protected onDecohereOutput(): void {
    if (RecordOutlet.is(this._record)) {
      this._record.decohereInputKey(this._key, KeyEffect.Update);
    }
  }

  protected onRecohereOutput(version: number): void {
    if (this._input !== null) {
      const value = this._input.get();
      if (value !== void 0) {
        this._record.set(this._key, value);
      } else {
        this._record.delete(this._key);
      }
    }
  }
}
