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

import {Item, Record, Form} from "@swim/structure";
import {Length} from "@swim/math";
import {Color} from "../color/Color";
import {AnyBoxShadow, BoxShadow} from "./BoxShadow";

/** @internal */
export class BoxShadowForm extends Form<BoxShadow | null, AnyBoxShadow> {
  constructor(unit: BoxShadow | null | undefined) {
    super();
    Object.defineProperty(this, "unit", {
      value: unit,
      enumerable: true,
    });
  }

  override readonly unit!: BoxShadow | null | undefined;

  override withUnit(unit: BoxShadow | null | undefined): Form<BoxShadow | null, AnyBoxShadow> {
    if (unit !== this.unit) {
      return new BoxShadowForm(unit);
    } else {
      return this;
    }
  }

  override mold(boxShadow: AnyBoxShadow): Item {
    let shadow = BoxShadow.fromAny(boxShadow)!;
    const record = Record.create();
    do {
      const header = Record.create(5);
      if (shadow.inset) {
        header.push("inset");
      }
      header.push(Length.form().mold(shadow.offsetX));
      header.push(Length.form().mold(shadow.offsetY));
      header.push(Length.form().mold(shadow.blurRadius));
      header.push(Length.form().mold(shadow.spreadRadius));
      header.push(Color.form().mold(shadow.color));
      record.attr("boxShadow", header);
      if (shadow.next !== null) {
        shadow = shadow.next;
        continue;
      }
      break;
    } while (true);
    return record;
  }

  override cast(item: Item): BoxShadow | null | undefined {
    const value = item.toValue();
    let boxShadow: BoxShadow | null | undefined;
    try {
      boxShadow = BoxShadow.fromValue(value);
      if (boxShadow === void 0) {
        const string = value.stringValue();
        if (string !== void 0) {
          boxShadow = BoxShadow.parse(string);
        }
      }
    } catch (e) {
      // swallow
    }
    return boxShadow;
  }
}
