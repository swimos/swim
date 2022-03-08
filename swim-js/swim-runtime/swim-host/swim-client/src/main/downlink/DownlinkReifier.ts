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

import {Item, Field, Value, Record} from "@swim/structure";
import {RecordModel, Reifier} from "@swim/dataflow";
import {DownlinkStreamlet} from "./DownlinkStreamlet";
import type {WarpRef} from "../ref/WarpRef";

/** @internal */
export class DownlinkReifier extends Reifier {
  constructor(warp: WarpRef | null = null) {
    super();
    this.warp = warp;
  }

  warp: WarpRef | null;

  override reify(item: Item): Item {
    if (item instanceof Field) {
      return this.reifyField(item);
    } else {
      return this.reifyValue(item);
    }
  }

  /** @internal */
  reifyField(field: Field): Field {
    const oldValue = field.value;
    const newValue = this.reifyValue(oldValue);
    if (oldValue !== newValue) {
      return field.updatedValue(newValue);
    } else {
      return field;
    }
  }

  /** @internal */
  reifyValue(value: Value): Value {
    if (value instanceof RecordModel) {
      return this.reifyModel(value);
    } else {
      return value;
    }
  }

  /** @internal */
  reifyModel(model: RecordModel): Record {
    if (model.tag === "link") {
      const streamlet = new DownlinkStreamlet(this.warp, model);
      streamlet.compile();
      return streamlet;
    }
    return model;
  }
}
