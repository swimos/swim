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

import {Item, Attr, Record, Form} from "@swim/structure";
import {AnyInterpolator, Interpolator} from "./Interpolator";

/** @hidden */
export class InterpolatorForm<T extends U, U = T> extends Form<Interpolator<T, U>, AnyInterpolator<T, U>> {
  private readonly _valueForm: Form<T, U>;
  private readonly _unit: Interpolator<T, U> | undefined;

  constructor(valueForm: Form<T, U>, unit?: Interpolator<T, U>) {
    super();
    this._valueForm = valueForm;
    this._unit = unit;
  }

  unit(): Interpolator<T, U> | undefined;
  unit(unit: Interpolator<T, U> | undefined): Form<Interpolator<T, U>, AnyInterpolator<T, U>>;
  unit(unit?: Interpolator<T, U> | undefined): Interpolator<T, U> | undefined | Form<Interpolator<T, U>, AnyInterpolator<T, U>> {
    if (arguments.length === 0) {
      return this._unit;
    } else {
      return new InterpolatorForm(this._valueForm, unit);
    }
  }

  mold(interpolator: AnyInterpolator<T, U> | undefined): Item {
    if (interpolator !== void 0) {
      interpolator = Interpolator.fromAny(interpolator);
      const a = this._valueForm.mold(interpolator.interpolate(0));
      const b = this._valueForm.mold(interpolator.interpolate(1));
      if (a.isDefined() && b.isDefined()) {
        return Record.of(Attr.of("interpolate", Record.of(a, b)));
      }
    }
    return Item.extant();
  }

  cast(item: Item): Interpolator<T, U> | undefined {
    const value = item.toValue();
    const header = value.header("interpolate");
    if (header.length >= 2) {
      const a = this._valueForm.cast(header.getItem(0).toValue());
      const b = this._valueForm.cast(header.getItem(1).toValue());
      if (a !== void 0 && b !== void 0) {
        return Interpolator.from(a, b);
      }
    }
    return void 0;
  }
}
Interpolator.Form = InterpolatorForm;
