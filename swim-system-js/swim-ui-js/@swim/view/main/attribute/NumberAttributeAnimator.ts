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
export interface NumberAttributeAnimator<V extends ElementView> extends AttributeAnimator<V, number, number | string> {
}

/** @hidden */
export const NumberAttributeAnimator = (function (_super: typeof AttributeAnimator): AttributeAnimatorConstructor {
  const NumberAttributeAnimator: AttributeAnimatorConstructor = function <V extends ElementView>(
      this: NumberAttributeAnimator<V>, view: V, name: string, value?: number | null,
      transition?: Transition<number> | null): NumberAttributeAnimator<V> {
    let _this: NumberAttributeAnimator<V> = function (value?: number | string | null, tween?: Tween<number>): number | null | undefined | V {
      if (value === void 0) {
        return _this.value;
      } else {
        if (typeof value === "string") {
          value = +value;
        }
        _this.setState(value, tween);
        return _this._view;
      }
    } as NumberAttributeAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, name, value, transition) || _this;
    return _this;
  } as unknown as AttributeAnimatorConstructor;
  __extends(NumberAttributeAnimator, _super);

  Object.defineProperty(NumberAttributeAnimator.prototype, "value", {
    get: function <V extends ElementView>(this: NumberAttributeAnimator<V>): number | null | undefined {
      let value = this._value;
      if (value === void 0) {
        const attributeValue = this.attributeValue;
        if (attributeValue) {
          value = +attributeValue;
        }
      }
      return value;
    },
    enumerable: true,
    configurable: true,
  });

  return NumberAttributeAnimator;
}(AttributeAnimator));
AttributeAnimator.Number = NumberAttributeAnimator;
