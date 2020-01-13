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
import {Tween, Transition} from "@swim/transition";
import {StyleAnimatorConstructor, StyleAnimator} from "./StyleAnimator";
import {ElementView} from "../ElementView";

/** @hidden */
export interface LineHeightStyleAnimator<V extends ElementView> extends StyleAnimator<V, LineHeight, AnyLineHeight> {
}

/** @hidden */
export const LineHeightStyleAnimator = (function (_super: typeof StyleAnimator): StyleAnimatorConstructor {
  const LineHeightStyleAnimator: StyleAnimatorConstructor = function <V extends ElementView>(
      this: LineHeightStyleAnimator<V>, view: V, names: string | ReadonlyArray<string>, value?: LineHeight | null,
      transition?: Transition<LineHeight> | null, priority?: string): LineHeightStyleAnimator<V> {
    let _this: LineHeightStyleAnimator<V> = function (value?: AnyLineHeight | null, tween?: Tween<LineHeight>, priority?: string | null): LineHeight | null | undefined | V {
      if (value === void 0) {
        return _this.value;
      } else {
        if (value !== null) {
          value = LineHeight.fromAny(value);
        }
        _this.setState(value as LineHeight | null, tween, priority);
        return _this._view;
      }
    } as LineHeightStyleAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, names, value, transition, priority) || _this;
    return _this;
  } as unknown as StyleAnimatorConstructor;
  __extends(LineHeightStyleAnimator, _super);

  Object.defineProperty(LineHeightStyleAnimator.prototype, "value", {
    get: function <V extends ElementView>(this: LineHeightStyleAnimator<V>): LineHeight | null | undefined {
      let value = this._value;
      if (value === void 0) {
        const propertyValue = this.propertyValue;
        if (propertyValue) {
          try {
            value = LineHeight.fromAny(propertyValue);
          } catch (swallow) {
            // nop
          }
        }
      }
      return value;
    },
    enumerable: true,
    configurable: true,
  });

  return LineHeightStyleAnimator;
}(StyleAnimator));
StyleAnimator.LineHeight = LineHeightStyleAnimator;
