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
export interface BooleanAttributeAnimator<V extends ElementView> extends AttributeAnimator<V, boolean, boolean | string> {
}

/** @hidden */
export const BooleanAttributeAnimator: AttributeAnimatorConstructor<boolean, boolean | string> = (function (_super: typeof AttributeAnimator): AttributeAnimatorConstructor<boolean, boolean | string> {
  const BooleanAttributeAnimator: AttributeAnimatorConstructor<boolean, boolean | string> = function <V extends ElementView>(
      this: BooleanAttributeAnimator<V>, view: V, animatorName: string, attributeName: string): BooleanAttributeAnimator<V> {
    let _this: BooleanAttributeAnimator<V> = function accessor(value?: boolean | string, tween?: Tween<boolean>): boolean | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value, tween);
        return _this._view;
      }
    } as BooleanAttributeAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, attributeName) || _this;
    return _this;
  } as unknown as AttributeAnimatorConstructor<boolean, boolean | string>;
  __extends(BooleanAttributeAnimator, _super);

  BooleanAttributeAnimator.prototype.parse = function (this: BooleanAttributeAnimator<ElementView>, value: string): boolean {
    return !!value;
  };

  BooleanAttributeAnimator.prototype.fromAny = function (this: BooleanAttributeAnimator<ElementView>, value: boolean | string): boolean {
    if (typeof value === "string") {
      return !!value;
    } else {
      return value;
    }
  };

  return BooleanAttributeAnimator;
}(AttributeAnimator));
AttributeAnimator.Boolean = BooleanAttributeAnimator;
