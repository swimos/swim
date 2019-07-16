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
import {AnyTransform, Transform} from "@swim/transform";
import {Tween, Transition} from "@swim/transition";
import {AttributeAnimatorConstructor, AttributeAnimator} from "./AttributeAnimator";
import {ElementView} from "../ElementView";

/** @hidden */
export interface TransformAttributeAnimator<V extends ElementView> extends AttributeAnimator<V, Transform, AnyTransform> {
}

/** @hidden */
export const TransformAttributeAnimator = (function (_super: typeof AttributeAnimator): AttributeAnimatorConstructor {
  const TransformAttributeAnimator: AttributeAnimatorConstructor = function <V extends ElementView>(
      this: TransformAttributeAnimator<V>, view: V, name: string, value?: Transform | null,
      transition?: Transition<Transform> | null): TransformAttributeAnimator<V> {
    let _this: TransformAttributeAnimator<V> = function (value?: AnyTransform | null, tween?: Tween<Transform>): Transform | null | undefined | V {
      if (value === void 0) {
        return _this.value;
      } else {
        if (value !== null) {
          value = Transform.fromAny(value);
        }
        _this.setState(value, tween);
        return _this._view;
      }
    } as TransformAttributeAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, name, value, transition) || _this;
    return _this;
  } as unknown as AttributeAnimatorConstructor;
  __extends(TransformAttributeAnimator, _super);

  Object.defineProperty(TransformAttributeAnimator.prototype, "value", {
    get: function <V extends ElementView>(this: TransformAttributeAnimator<V>): Transform | null | undefined {
      let value = this._value;
      if (value === void 0) {
        const attributeValue = this.attributeValue;
        if (attributeValue) {
          try {
            value = Transform.parse(attributeValue);
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

  return TransformAttributeAnimator;
}(AttributeAnimator));
AttributeAnimator.Transform = TransformAttributeAnimator;
