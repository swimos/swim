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
import {Tween} from "@swim/transition";
import {View} from "../View";
import {ViewAnimatorDescriptor, ViewAnimator} from "./ViewAnimator";

/** @hidden */
export interface ObjectViewAnimatorClass {
  new<V extends View, T>(view: V, animatorName: string, descriptor?: ViewAnimatorDescriptor<V, T>): ObjectViewAnimator<V, T>;
}

/** @hidden */
export interface ObjectViewAnimator<V extends View, T> extends ViewAnimator<V, T> {
}

/** @hidden */
export const ObjectViewAnimator: ObjectViewAnimatorClass = (function (_super: typeof ViewAnimator): ObjectViewAnimatorClass {
  const ObjectViewAnimator: ObjectViewAnimatorClass = function <V extends View, T>(
      this: ObjectViewAnimator<V, T>, view: V, animatorName: string | undefined,
      descriptor?: ViewAnimatorDescriptor<V, T>): ObjectViewAnimator<V, T> {
    let _this: ObjectViewAnimator<V, T> = function accessor(value?: T, tween?: Tween<T>): T | null | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value, tween);
        return _this._view;
      }
    } as ObjectViewAnimator<V, T>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, descriptor) || _this;
    return _this;
  } as unknown as ObjectViewAnimatorClass;
  __extends(ObjectViewAnimator, _super);

  ObjectViewAnimator.prototype.fromAny = function <T>(this: ObjectViewAnimator<View, T>, value: T | null): T | null {
    return value;
  };

  return ObjectViewAnimator;
}(ViewAnimator));
ViewAnimator.Object = ObjectViewAnimator;
