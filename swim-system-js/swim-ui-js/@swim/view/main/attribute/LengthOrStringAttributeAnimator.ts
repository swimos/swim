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
import {AnyLength, Length} from "@swim/length";
import {Tween, Transition} from "@swim/transition";
import {AttributeAnimatorConstructor, AttributeAnimator} from "./AttributeAnimator";
import {ElementView} from "../ElementView";

/** @hidden */
export interface LengthOrStringAttributeAnimator<V extends ElementView> extends AttributeAnimator<V, Length | string, AnyLength | string> {
}

/** @hidden */
export const LengthOrStringAttributeAnimator = (function (_super: typeof AttributeAnimator): AttributeAnimatorConstructor {
  const LengthOrStringAttributeAnimator: AttributeAnimatorConstructor = function <V extends ElementView>(
      this: LengthOrStringAttributeAnimator<V>, view: V, name: string, value?: Length | string | null,
      transition?: Transition<Length | string> | null): LengthOrStringAttributeAnimator<V> {
    let _this: LengthOrStringAttributeAnimator<V> = function (value?: AnyLength | string | null, tween?: Tween<Length | string>): Length | string | null | undefined | V {
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
        _this.setState(value, tween);
        return _this._view;
      }
    } as LengthOrStringAttributeAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, name, value, transition) || _this;
    return _this;
  } as unknown as AttributeAnimatorConstructor;
  __extends(LengthOrStringAttributeAnimator, _super);

  Object.defineProperty(LengthOrStringAttributeAnimator.prototype, "value", {
    get: function <V extends ElementView>(this: LengthOrStringAttributeAnimator<V>): Length | string | null | undefined {
      let value = this._value;
      if (value === void 0) {
        const attributeValue = this.attributeValue;
        if (attributeValue) {
          try {
            value = Length.parse(attributeValue, this._view._node);
          } catch (swallow) {
            value = attributeValue;
          }
        }
      }
      return value;
    },
    enumerable: true,
    configurable: true,
  });

  return LengthOrStringAttributeAnimator;
}(AttributeAnimator));
AttributeAnimator.LengthOrString = LengthOrStringAttributeAnimator;
