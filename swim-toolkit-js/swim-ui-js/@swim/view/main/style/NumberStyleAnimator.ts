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

import {__extends} from "tslib";
import {Tween} from "@swim/transition";
import {StyleAnimatorConstructor, StyleAnimator} from "./StyleAnimator";
import {ElementView} from "../element/ElementView";

/** @hidden */
export interface NumberStyleAnimator<V extends ElementView> extends StyleAnimator<V, number, number | string> {
}

/** @hidden */
export const NumberStyleAnimator: StyleAnimatorConstructor<number, number | string> = (function (_super: typeof StyleAnimator): StyleAnimatorConstructor<number, number | string> {
  const NumberStyleAnimator: StyleAnimatorConstructor<number, number | string> = function <V extends ElementView>(
      this: NumberStyleAnimator<V>, view: V, animatorName: string, propertyNames: string | ReadonlyArray<string>): NumberStyleAnimator<V> {
    let _this: NumberStyleAnimator<V> = function accessor(value?: number | string, tween?: Tween<number>, priority?: string): number | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value, tween, priority);
        return _this._view;
      }
    } as NumberStyleAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, propertyNames) || _this;
    return _this;
  } as unknown as StyleAnimatorConstructor<number, number | string>;
  __extends(NumberStyleAnimator, _super);

  NumberStyleAnimator.prototype.parse = function (this: NumberStyleAnimator<ElementView>, value: string): number {
    const number = +value;
    if (isFinite(number)) {
      return number;
    } else {
      throw new Error(value);
    }
  };

  NumberStyleAnimator.prototype.fromAny = function (this: NumberStyleAnimator<ElementView>, value: number | string): number {
    if (typeof value === "string") {
      const number = +value;
      if (isFinite(number)) {
        return number;
      } else {
        throw new Error(value);
      }
    } else {
      return value;
    }
  };

  return NumberStyleAnimator;
}(StyleAnimator));
StyleAnimator.Number = NumberStyleAnimator;
