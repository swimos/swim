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
import {AttributeAnimatorConstructor, AttributeAnimator} from "./AttributeAnimator";
import {ElementView} from "../ElementView";

/** @hidden */
export interface NumberOrStringAttributeAnimator<V extends ElementView> extends AttributeAnimator<V, number | string, number | string> {
}

/** @hidden */
export const NumberOrStringAttributeAnimator = (function (_super: typeof AttributeAnimator): AttributeAnimatorConstructor {
  const NumberOrStringAttributeAnimator: AttributeAnimatorConstructor = function <V extends ElementView>(
      this: NumberOrStringAttributeAnimator<V>, view: V, name: string, value?: number | string | null,
      transition?: Transition<number | string> | null): NumberOrStringAttributeAnimator<V> {
    let _this: NumberOrStringAttributeAnimator<V> = function (value?: number | string | null, tween?: Tween<number | string>): number | string | null | undefined | V {
      if (value === void 0) {
        return _this.value;
      } else {
        if (typeof value === "string" && isFinite(+value)) {
          value = +value;
        }
        _this.setState(value, tween);
        return _this._view;
      }
    } as NumberOrStringAttributeAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, name, value, transition) || _this;
    return _this;
  } as unknown as AttributeAnimatorConstructor;
  __extends(NumberOrStringAttributeAnimator, _super);

  Object.defineProperty(NumberOrStringAttributeAnimator.prototype, "value", {
    get: function <V extends ElementView>(this: NumberOrStringAttributeAnimator<V>): number | string | null | undefined {
      let value = this._value;
      if (value === void 0) {
        const attributeValue = this.attributeValue;
        if (attributeValue) {
          if (isFinite(+attributeValue)) {
            value = +attributeValue;
          } else {
            value = attributeValue;
          }
        }
      }
      return value;
    },
    enumerable: true,
    configurable: true,
  });

  return NumberOrStringAttributeAnimator;
}(AttributeAnimator));
AttributeAnimator.NumberOrString = NumberOrStringAttributeAnimator;
