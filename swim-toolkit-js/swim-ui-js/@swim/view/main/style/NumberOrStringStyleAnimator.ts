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
export interface NumberOrStringStyleAnimator<V extends ElementView> extends StyleAnimator<V, number | string, number | string> {
}

/** @hidden */
export const NumberOrStringStyleAnimator: StyleAnimatorConstructor<number | string, number | string> = (function (_super: typeof StyleAnimator): StyleAnimatorConstructor<number | string, number | string> {
  const NumberOrStringStyleAnimator: StyleAnimatorConstructor<number | string, number | string> = function <V extends ElementView>(
      this: NumberOrStringStyleAnimator<V>, view: V, animatorName: string, propertyNames: string | ReadonlyArray<string>): NumberOrStringStyleAnimator<V> {
    let _this: NumberOrStringStyleAnimator<V> = function accessor(value?: number | string, tween?: Tween<number | string>, priority?: string): number | string | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value, tween, priority);
        return _this._view;
      }
    } as NumberOrStringStyleAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, propertyNames) || _this;
    return _this;
  } as unknown as StyleAnimatorConstructor<number | string, number | string>;
  __extends(NumberOrStringStyleAnimator, _super);

  NumberOrStringStyleAnimator.prototype.parse = function (this: NumberOrStringStyleAnimator<ElementView>, value: string): number | string {
    const number = +value;
    return isFinite(number) ? number : value;
  };

  NumberOrStringStyleAnimator.prototype.fromAny = function (this: NumberOrStringStyleAnimator<ElementView>, value: number | string): number | string {
    if (typeof value === "string") {
      const number = +value;
      return isFinite(number) ? number : value;
    } else {
      return value;
    }
  };

  return NumberOrStringStyleAnimator;
}(StyleAnimator));
StyleAnimator.NumberOrString = NumberOrStringStyleAnimator;
