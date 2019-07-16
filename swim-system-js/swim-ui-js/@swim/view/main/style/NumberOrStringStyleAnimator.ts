// Copyright 2015-2019 SWIM.AI inc.
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
import {Tween, Transition} from "@swim/transition";
import {StyleAnimatorConstructor, StyleAnimator} from "./StyleAnimator";
import {ElementView} from "../ElementView";

/** @hidden */
export interface NumberOrStringStyleAnimator<V extends ElementView> extends StyleAnimator<V, number | string, number | string> {
}

/** @hidden */
export const NumberOrStringStyleAnimator = (function (_super: typeof StyleAnimator): StyleAnimatorConstructor {
  const NumberOrStringStyleAnimator: StyleAnimatorConstructor = function <V extends ElementView>(
      this: NumberOrStringStyleAnimator<V>, view: V, names: string | ReadonlyArray<string>, value?: number | string | null,
      transition?: Transition<number | string> | null, priority?: string): NumberOrStringStyleAnimator<V> {
    let _this: NumberOrStringStyleAnimator<V> = function (value?: number | string | null, tween?: Tween<number | string>, priority?: string | null): number | string | null | undefined | V {
      if (value === void 0) {
        return _this.value;
      } else {
        if (typeof value === "string" && isFinite(+value)) {
          value = +value;
        }
        _this.setState(value, tween, priority);
        return _this._view;
      }
    } as NumberOrStringStyleAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, names, value, transition, priority) || _this;
    return _this;
  } as unknown as StyleAnimatorConstructor;
  __extends(NumberOrStringStyleAnimator, _super);

  Object.defineProperty(NumberOrStringStyleAnimator.prototype, "value", {
    get: function <V extends ElementView>(this: NumberOrStringStyleAnimator<V>): number | string | null | undefined {
      let value = this._value;
      if (value === void 0) {
        const propertyValue = this.propertyValue;
        if (propertyValue) {
          if (isFinite(+propertyValue)) {
            value = +propertyValue;
          } else {
            value = propertyValue;
          }
        }
      }
      return value;
    },
    enumerable: true,
    configurable: true,
  });

  return NumberOrStringStyleAnimator;
}(StyleAnimator));
StyleAnimator.NumberOrString = NumberOrStringStyleAnimator;
