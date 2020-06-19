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
import {AttributeAnimatorConstructor, AttributeAnimator} from "./AttributeAnimator";
import {ElementView} from "../element/ElementView";

/** @hidden */
export interface NumberOrStringAttributeAnimator<V extends ElementView> extends AttributeAnimator<V, number | string, number | string> {
}

/** @hidden */
export const NumberOrStringAttributeAnimator: AttributeAnimatorConstructor<number | string, number | string> = (function (_super: typeof AttributeAnimator): AttributeAnimatorConstructor<number | string, number | string> {
  const NumberOrStringAttributeAnimator: AttributeAnimatorConstructor<number | string, number | string> = function <V extends ElementView>(
      this: NumberOrStringAttributeAnimator<V>, view: V, animatorName: string, attributeName: string): NumberOrStringAttributeAnimator<V> {
    let _this: NumberOrStringAttributeAnimator<V> = function accessor(value?: number | string, tween?: Tween<number | string>): number | string | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value, tween);
        return _this._view;
      }
    } as NumberOrStringAttributeAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, attributeName) || _this;
    return _this;
  } as unknown as AttributeAnimatorConstructor<number | string, number | string>;
  __extends(NumberOrStringAttributeAnimator, _super);

  NumberOrStringAttributeAnimator.prototype.parse = function (this: NumberOrStringAttributeAnimator<ElementView>, value: string): number | string {
    const number = +value;
    return isFinite(number) ? number : value;
  };

  NumberOrStringAttributeAnimator.prototype.fromAny = function (this: NumberOrStringAttributeAnimator<ElementView>, value: number | string): number | string {
    if (typeof value === "string") {
      const number = +value;
      return isFinite(number) ? number : value;
    } else {
      return value;
    }
  };

  return NumberOrStringAttributeAnimator;
}(AttributeAnimator));
AttributeAnimator.NumberOrString = NumberOrStringAttributeAnimator;
