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
import {AnyLength, Length} from "@swim/length";
import {Tween} from "@swim/transition";
import {StyleAnimatorConstructor, StyleAnimator} from "./StyleAnimator";
import {ElementView} from "../element/ElementView";

/** @hidden */
export interface LengthStyleAnimator<V extends ElementView> extends StyleAnimator<V, Length, AnyLength> {
}

/** @hidden */
export const LengthStyleAnimator: StyleAnimatorConstructor<Length, AnyLength> = (function (_super: typeof StyleAnimator): StyleAnimatorConstructor<Length, AnyLength> {
  const LengthStyleAnimator: StyleAnimatorConstructor<Length, AnyLength> = function <V extends ElementView>(
      this: LengthStyleAnimator<V>, view: V, animatorName: string, propertyNames: string | ReadonlyArray<string>): LengthStyleAnimator<V> {
    let _this: LengthStyleAnimator<V> = function accessor(value?: AnyLength, tween?: Tween<Length>, priority?: string): Length | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value, tween, priority);
        return _this._view;
      }
    } as LengthStyleAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, propertyNames) || _this;
    return _this;
  } as unknown as StyleAnimatorConstructor<Length, AnyLength>;
  __extends(LengthStyleAnimator, _super);

  LengthStyleAnimator.prototype.parse = function (this: LengthStyleAnimator<ElementView>, value: string): Length {
    return Length.parse(value, this._view._node);
  };

  LengthStyleAnimator.prototype.fromAny = function (this: LengthStyleAnimator<ElementView>, value: AnyLength): Length {
    return Length.fromAny(value, this._view._node);
  };

  return LengthStyleAnimator;
}(StyleAnimator));
StyleAnimator.Length = LengthStyleAnimator;
