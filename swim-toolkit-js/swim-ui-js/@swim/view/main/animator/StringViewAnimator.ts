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
export interface StringViewAnimator<V extends View> extends ViewAnimator<V, string> {
}

/** @hidden */
export const StringViewAnimator: ViewAnimatorConstructor<string> = (function (_super: typeof ViewAnimator): ViewAnimatorConstructor<string> {
  const StringViewAnimator: ViewAnimatorConstructor<string> = function <V extends View>(
      this: StringViewAnimator<V>, view: V, animatorName: string | undefined,
      descriptor?: ViewAnimatorDescriptor<V, string>): StringViewAnimator<V> {
    let _this: StringViewAnimator<V> = function accessor(value?: string, tween?: Tween<string>): string | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value, tween);
        return _this._view;
      }
    } as StringViewAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, descriptor) || _this;
    return _this;
  } as unknown as ViewAnimatorConstructor<string>;
  __extends(StringViewAnimator, _super);

  StringViewAnimator.prototype.fromAny = function (this: StringViewAnimator<View>, value: string | null): string | null {
    return value;
  };

  return StringViewAnimator;
}(ViewAnimator));
ViewAnimator.String = StringViewAnimator;
