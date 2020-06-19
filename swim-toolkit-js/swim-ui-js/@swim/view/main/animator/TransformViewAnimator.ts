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
import {View} from "../View";
import {ViewAnimatorDescriptor, ViewAnimatorConstructor, ViewAnimator} from "./ViewAnimator";

/** @hidden */
export interface TransformViewAnimator<V extends View> extends ViewAnimator<V, Transform, AnyTransform> {
}

/** @hidden */
export const TransformViewAnimator: ViewAnimatorConstructor<Transform, AnyTransform> = (function (_super: typeof ViewAnimator): ViewAnimatorConstructor<Transform, AnyTransform> {
  const TransformViewAnimator: ViewAnimatorConstructor<Transform, AnyTransform> = function <V extends View>(
      this: TransformViewAnimator<V>, view: V, animatorName: string | undefined,
      descriptor?: ViewAnimatorDescriptor<V, Transform, AnyTransform>): TransformViewAnimator<V> {
    let _this: TransformViewAnimator<V> = function accessor(value?: AnyTransform, tween?: Tween<Transform>): Transform | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value, tween);
        return _this._view;
      }
    } as TransformViewAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, descriptor) || _this;
    return _this;
  } as unknown as ViewAnimatorConstructor<Transform, AnyTransform>;
  __extends(TransformViewAnimator, _super);

  TransformViewAnimator.prototype.fromAny = function (this: TransformViewAnimator<View>, value: AnyTransform | null): Transform | null {
    return value !== null ? Transform.fromAny(value) : null;
  };

  return TransformViewAnimator;
}(ViewAnimator));
ViewAnimator.Transform = TransformViewAnimator;
