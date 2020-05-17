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
import {Tween} from "@swim/transition";
import {StyleAnimatorConstructor, StyleAnimator} from "./StyleAnimator";
import {ElementView} from "../element/ElementView";

/** @hidden */
export interface StringStyleAnimator<V extends ElementView> extends StyleAnimator<V, string> {
}

/** @hidden */
export const StringStyleAnimator: StyleAnimatorConstructor<string> = (function (_super: typeof StyleAnimator): StyleAnimatorConstructor<string> {
  const StringStyleAnimator: StyleAnimatorConstructor<string> = function <V extends ElementView>(
      this: StringStyleAnimator<V>, view: V, animatorName: string, propertyNames: string | ReadonlyArray<string>): StringStyleAnimator<V> {
    let _this: StringStyleAnimator<V> = function accessor(value?: string, tween?: Tween<string>, priority?: string): string | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value, tween, priority);
        return _this._view;
      }
    } as StringStyleAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, propertyNames) || _this;
    return _this;
  } as unknown as StyleAnimatorConstructor<string>;
  __extends(StringStyleAnimator, _super);

  StringStyleAnimator.prototype.parse = function (this: StringStyleAnimator<ElementView>, value: string): string {
    return value;
  };

  StringStyleAnimator.prototype.fromAny = function (this: StringStyleAnimator<ElementView>, value: string): string {
    return value;
  };

  return StringStyleAnimator;
}(StyleAnimator));
StyleAnimator.String = StringStyleAnimator;
