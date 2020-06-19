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
import {FromAny} from "@swim/util";
import {Tween} from "@swim/transition";
import {View} from "../View";
import {ViewAnimatorDescriptor, ViewAnimator} from "./ViewAnimator";

/** @hidden */
export interface AnyViewAnimatorClass {
  new<V extends View, T, U = T>(type: FromAny<T, U>, view: V, animatorName?: string,
                                descriptor?: ViewAnimatorDescriptor<V, T, U>): AnyViewAnimator<V, T, U>;
}

/** @hidden */
export interface AnyViewAnimator<V extends View, T, U = T> extends ViewAnimator<V, T, U> {
  /** @hidden */
  readonly _type: FromAny<T, U>;

  readonly type: FromAny<T, U>;
}

/** @hidden */
export const AnyViewAnimator: AnyViewAnimatorClass = (function (_super: typeof ViewAnimator): AnyViewAnimatorClass {
  const AnyViewAnimator: AnyViewAnimatorClass = function <V extends View, T, U>(
      this: AnyViewAnimator<V, T, U>, type: FromAny<T, U>, view: V, animatorName?: string,
      descriptor?: ViewAnimatorDescriptor<V, T, U>): AnyViewAnimator<V, T, U> {
    let _this: AnyViewAnimator<V, T, U> = function accessor(value?: T | U, tween?: Tween<T>): T | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value as T | undefined, tween);
        return _this._view;
      }
    } as AnyViewAnimator<V, T, U>;
    (_this as any).__proto__ = this;
    (_this as any)._type = type;
    _this = _super.call(_this, view, animatorName, descriptor) || _this;
    return _this;
  } as unknown as AnyViewAnimatorClass;
  __extends(AnyViewAnimator, _super);

  Object.defineProperty(AnyViewAnimator.prototype, "type", {
    get: function <V extends View, T, U>(this: AnyViewAnimator<V, T, U>): FromAny<T, U> {
      return this._type;
    },
    enumerable: true,
    configurable: true,
  });

  AnyViewAnimator.prototype.fromAny = function <T, U>(this: AnyViewAnimator<View, T, U>, value: T | U): T {
    return this._type.fromAny(value);
  };

  return AnyViewAnimator;
}(ViewAnimator));
ViewAnimator.Any = AnyViewAnimator;
