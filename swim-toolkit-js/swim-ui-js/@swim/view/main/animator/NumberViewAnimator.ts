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

import {__extends} from "tslib";
import {Tween} from "@swim/transition";
import {View} from "../View";
import {ViewAnimatorDescriptor, ViewAnimatorConstructor, ViewAnimator} from "./ViewAnimator";

/** @hidden */
export interface NumberViewAnimator<V extends View> extends ViewAnimator<V, number, number | string> {
}

/** @hidden */
export const NumberViewAnimator: ViewAnimatorConstructor<number, number | string> = (function (_super: typeof ViewAnimator): ViewAnimatorConstructor<number, number | string> {
  const NumberViewAnimator: ViewAnimatorConstructor<number, number | string> = function <V extends View>(
      this: NumberViewAnimator<V>, view: V, animatorName: string | undefined,
      descriptor?: ViewAnimatorDescriptor<V, number, number | string>): NumberViewAnimator<V> {
    let _this: NumberViewAnimator<V> = function accessor(value?: number | string, tween?: Tween<number>): number | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value, tween);
        return _this._view;
      }
    } as NumberViewAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, descriptor) || _this;
    return _this;
  } as unknown as ViewAnimatorConstructor<number, number | string>;
  __extends(NumberViewAnimator, _super);

  NumberViewAnimator.prototype.fromAny = function (this: NumberViewAnimator<View>, value: number | string | null): number | null {
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

  return NumberViewAnimator;
}(ViewAnimator));
ViewAnimator.Number = NumberViewAnimator;
