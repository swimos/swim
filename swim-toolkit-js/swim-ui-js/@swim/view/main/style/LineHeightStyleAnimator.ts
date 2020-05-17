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
import {AnyLineHeight, LineHeight} from "@swim/font";
import {Tween} from "@swim/transition";
import {StyleAnimatorConstructor, StyleAnimator} from "./StyleAnimator";
import {ElementView} from "../element/ElementView";

/** @hidden */
export interface LineHeightStyleAnimator<V extends ElementView> extends StyleAnimator<V, LineHeight, AnyLineHeight> {
}

/** @hidden */
export const LineHeightStyleAnimator: StyleAnimatorConstructor<LineHeight, AnyLineHeight> = (function (_super: typeof StyleAnimator): StyleAnimatorConstructor<LineHeight, AnyLineHeight> {
  const LineHeightStyleAnimator: StyleAnimatorConstructor<LineHeight, AnyLineHeight> = function <V extends ElementView>(
      this: LineHeightStyleAnimator<V>, view: V, animatorName: string, propertyNames: string | ReadonlyArray<string>): LineHeightStyleAnimator<V> {
    let _this: LineHeightStyleAnimator<V> = function accessor(value?: AnyLineHeight, tween?: Tween<LineHeight>, priority?: string): LineHeight | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value as LineHeight, tween, priority);
        return _this._view;
      }
    } as LineHeightStyleAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, propertyNames) || _this;
    return _this;
  } as unknown as StyleAnimatorConstructor<LineHeight, AnyLineHeight>;
  __extends(LineHeightStyleAnimator, _super);

  LineHeightStyleAnimator.prototype.parse = function (this: LineHeightStyleAnimator<ElementView>, value: string): LineHeight {
    return LineHeight.fromAny(value);
  };

  LineHeightStyleAnimator.prototype.fromAny = function (this: LineHeightStyleAnimator<ElementView>, value: AnyLineHeight): LineHeight {
    return LineHeight.fromAny(value);
  };

  return LineHeightStyleAnimator;
}(StyleAnimator));
StyleAnimator.LineHeight = LineHeightStyleAnimator;
