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
import {AttributeAnimatorConstructor, AttributeAnimator} from "./AttributeAnimator";
import {ElementView} from "../element/ElementView";

/** @hidden */
export interface NumberAttributeAnimator<V extends ElementView> extends AttributeAnimator<V, number, number | string> {
}

/** @hidden */
export const NumberAttributeAnimator: AttributeAnimatorConstructor<number, number | string> = (function (_super: typeof AttributeAnimator): AttributeAnimatorConstructor<number, number | string> {
  const NumberAttributeAnimator: AttributeAnimatorConstructor<number, number | string> = function <V extends ElementView>(
      this: NumberAttributeAnimator<V>, view: V, animatorName: string, attributeName: string): NumberAttributeAnimator<V> {
    let _this: NumberAttributeAnimator<V> = function accessor(value?: number | string, tween?: Tween<number>): number | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value, tween);
        return _this._view;
      }
    } as NumberAttributeAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, attributeName) || _this;
    return _this;
  } as unknown as AttributeAnimatorConstructor<number, number | string>;
  __extends(NumberAttributeAnimator, _super);

  NumberAttributeAnimator.prototype.parse = function (this: NumberAttributeAnimator<ElementView>, value: string): number {
    const number = +value;
    if (isFinite(number)) {
      return number;
    } else {
      throw new Error(value);
    }
  };

  NumberAttributeAnimator.prototype.fromAny = function (this: NumberAttributeAnimator<ElementView>, value: number | string): number {
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

  return NumberAttributeAnimator;
}(AttributeAnimator));
AttributeAnimator.Number = NumberAttributeAnimator;
