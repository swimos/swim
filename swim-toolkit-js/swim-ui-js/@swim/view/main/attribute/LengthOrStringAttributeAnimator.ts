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
import {AnyLength, Length} from "@swim/length";
import {Tween} from "@swim/transition";
import {AttributeAnimatorConstructor, AttributeAnimator} from "./AttributeAnimator";
import {ElementView} from "../element/ElementView";

/** @hidden */
export interface LengthOrStringAttributeAnimator<V extends ElementView> extends AttributeAnimator<V, Length | string, AnyLength | string> {
}

/** @hidden */
export const LengthOrStringAttributeAnimator: AttributeAnimatorConstructor<Length | string, AnyLength | string> = (function (_super: typeof AttributeAnimator): AttributeAnimatorConstructor<Length | string, AnyLength | string> {
  const LengthOrStringAttributeAnimator: AttributeAnimatorConstructor<Length | string, AnyLength | string> = function <V extends ElementView>(
      this: LengthOrStringAttributeAnimator<V>, view: V, animatorName: string, attributeName: string): LengthOrStringAttributeAnimator<V> {
    let _this: LengthOrStringAttributeAnimator<V> = function accessor(value?: AnyLength | string, tween?: Tween<Length | string>): Length | string | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value, tween);
        return _this._view;
      }
    } as LengthOrStringAttributeAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, attributeName) || _this;
    return _this;
  } as unknown as AttributeAnimatorConstructor<Length | string, AnyLength | string>;
  __extends(LengthOrStringAttributeAnimator, _super);

  LengthOrStringAttributeAnimator.prototype.parse = function (this: LengthOrStringAttributeAnimator<ElementView>, value: string): Length | string {
    try {
      return Length.parse(value, this._view._node);
    } catch (swallow) {
      return value;
    }
  };

  LengthOrStringAttributeAnimator.prototype.fromAny = function (this: LengthOrStringAttributeAnimator<ElementView>, value: AnyLength | string): Length | string {
    if (typeof value === "string") {
      try {
        return Length.parse(value, this._view._node);
      } catch (swallow) {
        return value;
      }
    } else {
      return Length.fromAny(value, this._view._node);
    }
  };

  return LengthOrStringAttributeAnimator;
}(AttributeAnimator));
AttributeAnimator.LengthOrString = LengthOrStringAttributeAnimator;
