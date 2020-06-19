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
export interface StringAttributeAnimator<V extends ElementView> extends AttributeAnimator<V, string> {
}

/** @hidden */
export const StringAttributeAnimator: AttributeAnimatorConstructor<string> = (function (_super: typeof AttributeAnimator): AttributeAnimatorConstructor<string> {
  const StringAttributeAnimator: AttributeAnimatorConstructor<string> = function <V extends ElementView>(
      this: StringAttributeAnimator<V>, view: V, animatorName: string, attributeName: string): StringAttributeAnimator<V> {
    let _this: StringAttributeAnimator<V> = function accessor(value?: string, tween?: Tween<string>): string | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value, tween);
        return _this._view;
      }
    } as StringAttributeAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, attributeName) || _this;
    return _this;
  } as unknown as AttributeAnimatorConstructor<string>;
  __extends(StringAttributeAnimator, _super);

  StringAttributeAnimator.prototype.parse = function (this: StringAttributeAnimator<ElementView>, value: string): string {
    return value;
  };

  StringAttributeAnimator.prototype.fromAny = function (this: StringAttributeAnimator<ElementView>, value: string): string {
    return value;
  };

  return StringAttributeAnimator;
}(AttributeAnimator));
AttributeAnimator.String = StringAttributeAnimator;
