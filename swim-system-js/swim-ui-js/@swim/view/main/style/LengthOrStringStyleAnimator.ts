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
import {Tween, Transition} from "@swim/transition";
import {StyleAnimatorConstructor, StyleAnimator} from "./StyleAnimator";
import {ElementView} from "../ElementView";

/** @hidden */
export interface LengthOrStringStyleAnimator<V extends ElementView> extends StyleAnimator<V, Length | string, AnyLength | string> {
}

/** @hidden */
export const LengthOrStringStyleAnimator = (function (_super: typeof StyleAnimator): StyleAnimatorConstructor {
  const LengthOrStringStyleAnimator: StyleAnimatorConstructor = function <V extends ElementView>(
      this: LengthOrStringStyleAnimator<V>, view: V, names: string | ReadonlyArray<string>, value?: Length | string | null,
      transition?: Transition<Length | string> | null, priority?: string): LengthOrStringStyleAnimator<V> {
    let _this: LengthOrStringStyleAnimator<V> = function (value?: AnyLength | string | null, tween?: Tween<Length | string>, priority?: string | null): Length | string | null | undefined | V {
      if (value === void 0) {
        return _this.value;
      } else {
        if (value !== null) {
          if (typeof value === "string") {
            try {
              value = Length.parse(value, _this._view._node);
            } catch (swallow) {
              // string value
            }
          } else {
            value = Length.fromAny(value, _this._view._node);
          }
        }
        _this.setState(value, tween, priority);
        return _this._view;
      }
    } as LengthOrStringStyleAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, names, value, transition, priority) || _this;
    return _this;
  } as unknown as StyleAnimatorConstructor;
  __extends(LengthOrStringStyleAnimator, _super);

  Object.defineProperty(LengthOrStringStyleAnimator.prototype, "value", {
    get: function <V extends ElementView>(this: LengthOrStringStyleAnimator<V>): Length | string | null | undefined {
      let value = this._value;
      if (value === void 0) {
        const propertyValue = this.propertyValue;
        if (propertyValue) {
          try {
            value = Length.parse(propertyValue, this._view._node);
          } catch (swallow) {
            value = propertyValue;
          }
        }
      }
      return value;
    },
    enumerable: true,
    configurable: true,
  });

  return LengthOrStringStyleAnimator;
}(StyleAnimator));
StyleAnimator.LengthOrString = LengthOrStringStyleAnimator;
