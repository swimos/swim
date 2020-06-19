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
export interface LengthAttributeAnimator<V extends ElementView> extends AttributeAnimator<V, Length, AnyLength> {
}

/** @hidden */
export const LengthAttributeAnimator: AttributeAnimatorConstructor<Length, AnyLength> = (function (_super: typeof AttributeAnimator): AttributeAnimatorConstructor<Length, AnyLength> {
  const LengthAttributeAnimator: AttributeAnimatorConstructor<Length, AnyLength> = function <V extends ElementView>(
      this: LengthAttributeAnimator<V>, view: V, animatorName: string, attributeName: string): LengthAttributeAnimator<V> {
    let _this: LengthAttributeAnimator<V> = function accessor(value?: AnyLength, tween?: Tween<Length>): Length | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value, tween);
        return _this._view;
      }
    } as LengthAttributeAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, attributeName) || _this;
    return _this;
  } as unknown as AttributeAnimatorConstructor<Length, AnyLength>;
  __extends(LengthAttributeAnimator, _super);

  LengthAttributeAnimator.prototype.parse = function (this: LengthAttributeAnimator<ElementView>, value: string): Length {
    return Length.parse(value, this._view._node);
  };

  LengthAttributeAnimator.prototype.fromAny = function (this: LengthAttributeAnimator<ElementView>, value: AnyLength): Length {
    return Length.fromAny(value, this._view._node);
  };

  return LengthAttributeAnimator;
}(AttributeAnimator));
AttributeAnimator.Length = LengthAttributeAnimator;
