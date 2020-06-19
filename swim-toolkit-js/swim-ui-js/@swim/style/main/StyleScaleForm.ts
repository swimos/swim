// Copyright 2015-2020 Swim inc.
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

import {Item, Attr, Value, Record, Form} from "@swim/structure";
import {Scale, ContinuousScale} from "@swim/scale";
import {AnyStyleValue, StyleValue} from "./StyleValue";

/** @hidden */
export class StyleScaleForm extends Form<Scale<StyleValue, StyleValue, AnyStyleValue, AnyStyleValue>> {
  /** @hidden */
  readonly _unit: Scale<StyleValue, StyleValue, AnyStyleValue, AnyStyleValue> | undefined;

  constructor(unit?: Scale<StyleValue, StyleValue, AnyStyleValue, AnyStyleValue>) {
    super();
    this._unit = unit;
  }

  unit(): Scale<StyleValue, StyleValue, AnyStyleValue, AnyStyleValue> | undefined;
  unit(unit: Scale<StyleValue, StyleValue, AnyStyleValue, AnyStyleValue> | undefined): Form<Scale<StyleValue, StyleValue, AnyStyleValue, AnyStyleValue>>;
  unit(unit?: Scale<StyleValue, StyleValue, AnyStyleValue, AnyStyleValue> | undefined): Scale<StyleValue, StyleValue, AnyStyleValue, AnyStyleValue> | undefined | Form<Scale<StyleValue, StyleValue, AnyStyleValue, AnyStyleValue>> {
    if (arguments.length === 0) {
      return this._unit;
    } else {
      return new StyleScaleForm(unit);
    }
  }

  mold(scale: Scale<StyleValue, StyleValue, AnyStyleValue, AnyStyleValue>): Item {
    if (scale instanceof ContinuousScale) {
      const valueForm = StyleValue.form();
      const domain = scale.domain();
      const x0 = valueForm.mold(domain[0]);
      const x1 = valueForm.mold(domain[1]);
      const header = Record.of(x0, x1);
      let record = Record.of(Attr.of("scale", header));
      const f = StyleValue.interpolatorForm().mold(scale.interpolator());
      if (f.isDefined()) {
        record = record.concat(f);
      }
      return record;
    } else {
      return Item.extant();
    }
  }

  cast(item: Item): Scale<StyleValue, StyleValue, AnyStyleValue, AnyStyleValue> | undefined {
    const value = item.toValue();
    const header = value.header("scale");
    if (header.length >= 2) {
      const valueForm = StyleValue.form();
      let x0: StyleValue | undefined;
      let x1: StyleValue | undefined;
      header.forEach(function (item: Item, index: number): void {
        if (item instanceof Value) {
          if (index === 0) {
            x0 = item.cast(valueForm, x0);
          } else if (index === 1) {
            x1 = item.cast(valueForm, x1);
          }
        }
      }, this);
      const fx = StyleValue.interpolatorForm().cast(value.body());
      if (x0 !== void 0 && x1 !== void 0 && fx !== void 0) {
        return Scale.from(x0, x1, fx);
      }
    }
    return void 0;
  }
}
StyleValue.ScaleForm = StyleScaleForm;
