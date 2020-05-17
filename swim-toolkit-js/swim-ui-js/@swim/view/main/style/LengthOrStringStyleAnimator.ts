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
export interface LengthOrStringStyleAnimator<V extends ElementView> extends StyleAnimator<V, Length | string, AnyLength | string> {
}

/** @hidden */
export const LengthOrStringStyleAnimator: StyleAnimatorConstructor<Length | String, AnyLength | String> = (function (_super: typeof StyleAnimator): StyleAnimatorConstructor<Length | String, AnyLength | String> {
  const LengthOrStringStyleAnimator: StyleAnimatorConstructor<Length | String, AnyLength | String> = function <V extends ElementView>(
      this: LengthOrStringStyleAnimator<V>, view: V, animatorName: string, propertyNames: string | ReadonlyArray<string>): LengthOrStringStyleAnimator<V> {
    let _this: LengthOrStringStyleAnimator<V> = function accessor(value?: AnyLength | string, tween?: Tween<Length | string>, priority?: string): Length | string | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value, tween, priority);
        return _this._view;
      }
    } as LengthOrStringStyleAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, propertyNames) || _this;
    return _this;
  } as unknown as StyleAnimatorConstructor<Length | String, AnyLength | String>;
  __extends(LengthOrStringStyleAnimator, _super);

  LengthOrStringStyleAnimator.prototype.parse = function (this: LengthOrStringStyleAnimator<ElementView>, value: string): Length | string {
    try {
      return Length.parse(value, this._view._node);
    } catch (swallow) {
      return value;
    }
  };

  LengthOrStringStyleAnimator.prototype.fromAny = function (this: LengthOrStringStyleAnimator<ElementView>, value: AnyLength | string): Length | string {
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

  return LengthOrStringStyleAnimator;
}(StyleAnimator));
StyleAnimator.LengthOrString = LengthOrStringStyleAnimator;
