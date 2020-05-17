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

import {Interpolator} from "@swim/interpolate";
import {Item, Attr, Record, Form} from "@swim/structure";
import {AnyStyleValue, StyleValue} from "./StyleValue";

/** @hidden */
export class StyleInterpolatorForm extends Form<Interpolator<StyleValue, AnyStyleValue>> {
  /** @hidden */
  readonly _unit: Interpolator<StyleValue, AnyStyleValue> | undefined;

  constructor(unit?: Interpolator<StyleValue, AnyStyleValue>) {
    super();
    this._unit = unit;
  }

  unit(): Interpolator<StyleValue, AnyStyleValue> | undefined;
  unit(unit: Interpolator<StyleValue, AnyStyleValue> | undefined): Form<Interpolator<StyleValue, AnyStyleValue>>;
  unit(unit?: Interpolator<StyleValue, AnyStyleValue> | undefined): Interpolator<StyleValue, AnyStyleValue> | undefined | Form<Interpolator<StyleValue, AnyStyleValue>> {
    if (arguments.length === 0) {
      return this._unit;
    } else {
      return new StyleInterpolatorForm(unit);
    }
  }

  mold(interpolator: Interpolator<StyleValue, AnyStyleValue> | undefined): Item {
    if (interpolator !== void 0) {
      const valueForm = StyleValue.form();
      const a = valueForm.mold(interpolator.interpolate(0));
      const b = valueForm.mold(interpolator.interpolate(1));
      if (a.isDefined() && b.isDefined()) {
        return Record.of(Attr.of("interpolate", Record.of(a, b)));
      }
    }
    return Item.extant();
  }

  cast(item: Item): Interpolator<StyleValue, AnyStyleValue> | undefined {
    const value = item.toValue();
    const header = value.header("interpolate");
    if (header.length >= 2) {
      const valueForm = StyleValue.form();
      const a = valueForm.cast(header.getItem(0).toValue());
      const b = valueForm.cast(header.getItem(1).toValue());
      if (a !== void 0 && b !== void 0) {
        return Interpolator.between(a, b);
      }
    }
    return void 0;
  }
}
StyleValue.InterpolatorForm = StyleInterpolatorForm;
