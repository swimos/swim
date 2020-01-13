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

import {Item, Record, Form} from "@swim/structure";
import {Length} from "@swim/length";
import {Color} from "@swim/color";
import {AnyBoxShadow, BoxShadow} from "./BoxShadow";

/** @hidden */
export class BoxShadowForm extends Form<BoxShadow, AnyBoxShadow> {
  private readonly _unit: BoxShadow | undefined;

  constructor(unit?: BoxShadow) {
    super();
    this._unit = unit;
  }

  unit(): BoxShadow | undefined;
  unit(unit: BoxShadow | undefined): Form<BoxShadow, AnyBoxShadow>;
  unit(unit?: BoxShadow): BoxShadow | undefined | Form<BoxShadow, AnyBoxShadow> {
    if (arguments.length === 0) {
      return this._unit;
    } else {
      return new BoxShadowForm(unit);
    }
  }

  mold(boxShadow: AnyBoxShadow): Item {
    let shadow = BoxShadow.fromAny(boxShadow) as BoxShadow;
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
      if (shadow.next) {
        shadow = shadow.next;
        continue;
      }
      break;
    } while (true);
    return record;
  }

  cast(item: Item): BoxShadow | undefined {
    const value = item.toValue();
    let boxShadow: BoxShadow | undefined;
    try {
      boxShadow = BoxShadow.fromValue(value);
      if (!boxShadow) {
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
BoxShadow.Form = BoxShadowForm;
