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
import {AnyTransform, Transform} from "@swim/transform";
import {Tween} from "@swim/transition";
import {StyleAnimatorConstructor, StyleAnimator} from "./StyleAnimator";
import {ElementView} from "../element/ElementView";

/** @hidden */
export interface TransformStyleAnimator<V extends ElementView> extends StyleAnimator<V, Transform, AnyTransform> {
}

/** @hidden */
export const TransformStyleAnimator: StyleAnimatorConstructor<Transform, AnyTransform> = (function (_super: typeof StyleAnimator): StyleAnimatorConstructor<Transform, AnyTransform> {
  const TransformStyleAnimator: StyleAnimatorConstructor<Transform, AnyTransform> = function <V extends ElementView>(
      this: TransformStyleAnimator<V>, view: V, animatorName: string, propertyNames: string | ReadonlyArray<string>): TransformStyleAnimator<V> {
    let _this: TransformStyleAnimator<V> = function accessor(value?: AnyTransform, tween?: Tween<Transform>, priority?: string): Transform | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value, tween, priority);
        return _this._view;
      }
    } as TransformStyleAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, propertyNames) || _this;
    return _this;
  } as unknown as StyleAnimatorConstructor<Transform, AnyTransform>;
  __extends(TransformStyleAnimator, _super);

  TransformStyleAnimator.prototype.parse = function (this: TransformStyleAnimator<ElementView>, value: string): Transform {
    return Transform.parse(value);
  };

  TransformStyleAnimator.prototype.fromAny = function (this: TransformStyleAnimator<ElementView>, value: AnyTransform): Transform {
    return Transform.fromAny(value);
  };

  return TransformStyleAnimator;
}(StyleAnimator));
StyleAnimator.Transform = TransformStyleAnimator;
