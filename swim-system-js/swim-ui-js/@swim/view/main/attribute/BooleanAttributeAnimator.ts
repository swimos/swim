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
import {Tween, Transition} from "@swim/transition";
import {AttributeAnimatorConstructor, AttributeAnimator} from "./AttributeAnimator";
import {ElementView} from "../ElementView";

/** @hidden */
export interface BooleanAttributeAnimator<V extends ElementView> extends AttributeAnimator<V, boolean, boolean | string> {
}

/** @hidden */
export const BooleanAttributeAnimator = (function (_super: typeof AttributeAnimator): AttributeAnimatorConstructor {
  const BooleanAttributeAnimator: AttributeAnimatorConstructor = function <V extends ElementView>(
      this: BooleanAttributeAnimator<V>, view: V, name: string, value?: boolean | null,
      transition?: Transition<boolean> | null): BooleanAttributeAnimator<V> {
    let _this: BooleanAttributeAnimator<V> = function (value?: boolean | string | null, tween?: Tween<boolean>): boolean | null | undefined | V {
      if (value === void 0) {
        return _this.value;
      } else {
        if (typeof value === "string") {
          value = value ? true : false;
        }
        _this.setState(value, tween);
        return _this._view;
      }
    } as BooleanAttributeAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, name, value, transition) || _this;
    return _this;
  } as unknown as AttributeAnimatorConstructor;
  __extends(BooleanAttributeAnimator, _super);

  Object.defineProperty(BooleanAttributeAnimator.prototype, "value", {
    get: function <V extends ElementView>(this: BooleanAttributeAnimator<V>): boolean | null | undefined {
      let value = this._value;
      if (value === void 0) {
        const attributeValue = this.attributeValue;
        if (attributeValue) {
          value = !!attributeValue;
        }
      }
      return value;
    },
    enumerable: true,
    configurable: true,
  });

  return BooleanAttributeAnimator;
}(AttributeAnimator));
AttributeAnimator.Boolean = BooleanAttributeAnimator;
