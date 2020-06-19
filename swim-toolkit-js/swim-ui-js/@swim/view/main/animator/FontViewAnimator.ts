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
import {AnyFont, Font} from "@swim/font";
import {Tween} from "@swim/transition";
import {View} from "../View";
import {ViewAnimatorDescriptor, ViewAnimatorConstructor, ViewAnimator} from "./ViewAnimator";

/** @hidden */
export interface FontViewAnimator<V extends View> extends ViewAnimator<V, Font, AnyFont> {
}

/** @hidden */
export const FontViewAnimator: ViewAnimatorConstructor<Font, AnyFont> = (function (_super: typeof ViewAnimator): ViewAnimatorConstructor<Font, AnyFont> {
  const FontViewAnimator: ViewAnimatorConstructor<Font, AnyFont> = function <V extends View>(
      this: FontViewAnimator<V>, view: V, animatorName: string | undefined,
      descriptor?: ViewAnimatorDescriptor<V, Font, AnyFont>): FontViewAnimator<V> {
    let _this: FontViewAnimator<V> = function accessor(value?: AnyFont, tween?: Tween<Font>): Font | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value, tween);
        return _this._view;
      }
    } as FontViewAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, descriptor) || _this;
    return _this;
  } as unknown as ViewAnimatorConstructor<Font, AnyFont>;
  __extends(FontViewAnimator, _super);

  FontViewAnimator.prototype.fromAny = function (this: FontViewAnimator<View>, value: AnyFont | null): Font | null {
    return value !== null ? Font.fromAny(value) : null;
  };

  return FontViewAnimator;
}(ViewAnimator));
ViewAnimator.Font = FontViewAnimator;
