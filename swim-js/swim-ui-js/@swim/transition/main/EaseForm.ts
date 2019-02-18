// Copyright 2015-2019 SWIM.AI inc.
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

import {Item, Text, Form} from "@swim/structure";
import {EaseType, AnyEase, Ease} from "./Ease";

/** @hidden */
export class EaseForm extends Form<Ease, AnyEase> {
  private readonly _unit: Ease | undefined;

  constructor(unit?: Ease) {
    super();
    this._unit = unit;
  }

  unit(): Ease | undefined;
  unit(unit: Ease | undefined): Form<Ease, AnyEase>;
  unit(unit?: Ease | undefined): Ease | undefined | Form<Ease, AnyEase> {
    if (arguments.length === 0) {
      return this._unit;
    } else {
      return new EaseForm(unit);
    }
  }

  mold(ease: AnyEase): Item {
    ease = Ease.fromAny(ease);
    if (typeof ease.type === "string") {
      return Text.from(ease.type);
    } else {
      return Item.extant();
    }
  }

  cast(item: Item): Ease | undefined {
    const string = item.toValue().stringValue(void 0);
    if (string !== void 0) {
      try {
        return Ease.fromAny(string as EaseType);
      } catch (e) {
        // swallow
      }
    }
    return void 0;
  }
}
Ease.Form = EaseForm;
