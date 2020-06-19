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
import {AnyBoxShadow, BoxShadow} from "@swim/shadow";
import {Tween} from "@swim/transition";
import {StyleAnimatorConstructor, StyleAnimator} from "./StyleAnimator";
import {ElementView} from "../element/ElementView";

/** @hidden */
export interface BoxShadowStyleAnimator<V extends ElementView> extends StyleAnimator<V, BoxShadow, AnyBoxShadow> {
}

/** @hidden */
export const BoxShadowStyleAnimator: StyleAnimatorConstructor<BoxShadow, AnyBoxShadow> = (function (_super: typeof StyleAnimator): StyleAnimatorConstructor<BoxShadow, AnyBoxShadow> {
  const BoxShadowStyleAnimator: StyleAnimatorConstructor<BoxShadow, AnyBoxShadow> = function <V extends ElementView>(
      this: BoxShadowStyleAnimator<V>, view: V, animatorName: string, propertyNames: string | ReadonlyArray<string>): BoxShadowStyleAnimator<V> {
    let _this: BoxShadowStyleAnimator<V> = function accessor(value?: AnyBoxShadow, tween?: Tween<BoxShadow>, priority?: string): BoxShadow | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value, tween, priority);
        return _this._view;
      }
    } as BoxShadowStyleAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, propertyNames) || _this;
    return _this;
  } as unknown as StyleAnimatorConstructor<BoxShadow, AnyBoxShadow>;
  __extends(BoxShadowStyleAnimator, _super);

  BoxShadowStyleAnimator.prototype.parse = function (this: BoxShadowStyleAnimator<ElementView>, value: string): BoxShadow {
    return BoxShadow.parse(value);
  };

  BoxShadowStyleAnimator.prototype.fromAny = function (this: BoxShadowStyleAnimator<ElementView>, value: AnyBoxShadow): BoxShadow {
    return BoxShadow.fromAny(value);
  };

  return BoxShadowStyleAnimator;
}(StyleAnimator));
StyleAnimator.BoxShadow = BoxShadowStyleAnimator;
