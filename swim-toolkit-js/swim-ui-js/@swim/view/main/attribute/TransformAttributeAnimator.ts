// Copyright 2015-2020 Swim inc.
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
import {Tween} from "@swim/transition";
import {AttributeAnimatorConstructor, AttributeAnimator} from "./AttributeAnimator";
import {ElementView} from "../element/ElementView";

/** @hidden */
export interface TransformAttributeAnimator<V extends ElementView> extends AttributeAnimator<V, Transform, AnyTransform> {
}

/** @hidden */
export const TransformAttributeAnimator: AttributeAnimatorConstructor<Transform, AnyTransform> = (function (_super: typeof AttributeAnimator): AttributeAnimatorConstructor<Transform, AnyTransform> {
  const TransformAttributeAnimator: AttributeAnimatorConstructor<Transform, AnyTransform> = function <V extends ElementView>(
      this: TransformAttributeAnimator<V>, view: V, animatorName: string, attributeName: string): TransformAttributeAnimator<V> {
    let _this: TransformAttributeAnimator<V> = function accessor(value?: AnyTransform, tween?: Tween<Transform>): Transform | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value, tween);
        return _this._view;
      }
    } as TransformAttributeAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, attributeName) || _this;
    return _this;
  } as unknown as AttributeAnimatorConstructor<Transform, AnyTransform>;
  __extends(TransformAttributeAnimator, _super);

  TransformAttributeAnimator.prototype.parse = function (this: TransformAttributeAnimator<ElementView>, value: string): Transform {
    return Transform.parse(value);
  };

  TransformAttributeAnimator.prototype.fromAny = function (this: TransformAttributeAnimator<ElementView>, value: AnyTransform): Transform {
    return Transform.fromAny(value);
  };

  return TransformAttributeAnimator;
}(AttributeAnimator));
AttributeAnimator.Transform = TransformAttributeAnimator;
