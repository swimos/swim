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
import {ViewAnimatorDescriptor, ViewAnimatorConstructor, ViewAnimator} from "./ViewAnimator";

/** @hidden */
export interface BooleanViewAnimator<V extends View> extends ViewAnimator<V, boolean, boolean | string> {
}

/** @hidden */
export const BooleanViewAnimator: ViewAnimatorConstructor<boolean, boolean | string> = (function (_super: typeof ViewAnimator): ViewAnimatorConstructor<boolean, boolean | string> {
  const BooleanViewAnimator: ViewAnimatorConstructor<boolean, boolean | string> = function <V extends View>(
      this: BooleanViewAnimator<V>, view: V, animatorName: string | undefined,
      descriptor?: ViewAnimatorDescriptor<V, boolean, boolean | string>): BooleanViewAnimator<V> {
    let _this: BooleanViewAnimator<V> = function accessor(value?: boolean | string, tween?: Tween<boolean>): boolean | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value, tween);
        return _this._view;
      }
    } as BooleanViewAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, descriptor) || _this;
    return _this;
  } as unknown as ViewAnimatorConstructor<boolean, boolean | string>;
  __extends(BooleanViewAnimator, _super);

  BooleanViewAnimator.prototype.fromAny = function (this: BooleanViewAnimator<View>, value: boolean | string | null): boolean | null {
    if (typeof value === "string") {
      return !!value;
    } else {
      return value;
    }
  };

  return BooleanViewAnimator;
}(ViewAnimator));
ViewAnimator.Boolean = BooleanViewAnimator;
