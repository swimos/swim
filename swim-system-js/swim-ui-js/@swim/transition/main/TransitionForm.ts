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
import {Ease} from "./Ease";
import {AnyTransition, Transition} from "./Transition";

/** @hidden */
export class TransitionForm<T> extends Form<Transition<T>, AnyTransition<T>> {
  private readonly _interpolatorForm: Form<Interpolator<T> , AnyInterpolator<T>>;
  private readonly _unit: Transition<T> | undefined;

  constructor(interpolatorForm: Form<Interpolator<T>, AnyInterpolator<T>>, unit?: Transition<T>) {
    super();
    this._interpolatorForm = interpolatorForm;
    this._unit = unit;
  }

  unit(): Transition<T> | undefined;
  unit(unit: AnyTransition<T> | undefined): Form<Transition<T>>;
  unit(unit?: AnyTransition<T> | undefined): Transition<T> | undefined | Form<Transition<T>> {
    if (unit === void 0) {
      return this._unit;
    } else {
      unit = Transition.fromAny(unit);
      return new TransitionForm(this._interpolatorForm, unit);
    }
  }

  mold(transition: AnyTransition<T>): Item {
    if (transition !== void 0) {
      transition = Transition.fromAny(transition);
      const header = Record.create();
      if (transition._duration !== null) {
        header.slot("duration", transition._duration);
      }
      if (transition._ease !== null) {
        header.slot("ease", Ease.form().mold(transition._ease));
      }
      let record = Record.of(Attr.of("transition", header));
      if (transition._interpolator !== null) {
        const interpolator = this._interpolatorForm.mold(transition._interpolator);
        if (interpolator.isDefined()) {
          record = record.concat(interpolator);
        }
      }
      return record;
    } else {
      return Item.extant();
    }
  }

  cast(item: Item): Transition<T> | undefined {
    const value = item.toValue();
    const header = value.header("transition");
    if (header.length >= 2) {
      let duration: number | null = null;
      let ease: Ease | null = null;
      header.forEach(function (item: Item, index: number): void {
        const key = item.key.stringValue(void 0);
        if (key !== void 0) {
          if (key === "duration") {
            duration = item.toValue().numberValue(duration);
          } else if (key === "ease") {
            ease = item.toValue().cast(Ease.form(), ease);
          }
        } else if (item instanceof Value) {
          if (index === 0) {
            duration = item.numberValue(duration);
          } else if (index === 1) {
            ease = item.cast(Ease.form(), ease);
          }
        }
      }, this);
      const interpolator = this._interpolatorForm.cast(value.body());
      return Transition.from(duration, ease, interpolator);
    }
    return void 0;
  }
}
Transition.Form = TransitionForm;
