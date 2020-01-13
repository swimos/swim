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

import {Item, Attr, Value, Record, Form} from "@swim/structure";
import {AnyInterpolator, Interpolator} from "@swim/interpolate";
import {Scale} from "./Scale";
import {ContinuousScale} from "./ContinuousScale";

/** @hidden */
export class ScaleForm<D extends DU, R extends RU, DU = R, RU = R> extends Form<Scale<D, R, DU, RU>> {
  private readonly _domainForm: Form<D, DU>;
  private readonly _interpolatorForm: Form<Interpolator<R, RU>, AnyInterpolator<R, RU>>;
  private readonly _unit: Scale<D, R, DU, RU> | undefined;

  constructor(domainForm: Form<D, DU>, interpolatorForm: Form<Interpolator<R, RU>, AnyInterpolator<R, RU>>,
              unit?: Scale<D, R, DU, RU>) {
    super();
    this._domainForm = domainForm;
    this._interpolatorForm = interpolatorForm;
    this._unit = unit;
  }

  unit(): Scale<D, R, DU, RU> | undefined;
  unit(unit: Scale<D, R, DU, RU> | undefined): Form<Scale<D, R, DU, RU>>;
  unit(unit?: Scale<D, R, DU, RU> | undefined): Scale<D, R, DU, RU> | undefined | Form<Scale<D, R, DU, RU>> {
    if (arguments.length === 0) {
      return this._unit;
    } else {
      return new ScaleForm(this._domainForm, this._interpolatorForm, unit);
    }
  }

  mold(scale: Scale<D, R, DU, RU>): Item {
    if (scale instanceof ContinuousScale) {
      const domain = scale.domain();
      const x0 = this._domainForm.mold(domain[0]);
      const x1 = this._domainForm.mold(domain[1]);
      const header = Record.of(x0, x1);
      let record = Record.of(Attr.of("scale", header));
      const f = this._interpolatorForm.mold(scale.interpolator());
      if (f.isDefined()) {
        record = record.concat(f);
      }
      return record;
    } else {
      return Item.extant();
    }
  }

  cast(item: Item): Scale<D, R, DU, RU> | undefined {
    const value = item.toValue();
    const header = value.header("scale");
    if (header.length >= 2) {
      let x0: DU | undefined;
      let x1: DU | undefined;
      header.forEach(function (item: Item, index: number): void {
        if (item instanceof Value) {
          if (index === 0) {
            x0 = item.cast(this._domainForm, x0) as DU | undefined;
          } else if (index === 1) {
            x1 = item.cast(this._domainForm, x1) as DU | undefined;
          }
        }
      }, this);
      const fx = this._interpolatorForm.cast(value.body());
      if (x0 !== void 0 && x1 !== void 0 && fx) {
        return Scale.from(x0, x1, fx);
      }
    }
    return void 0;
  }
}
Scale.Form = ScaleForm;
