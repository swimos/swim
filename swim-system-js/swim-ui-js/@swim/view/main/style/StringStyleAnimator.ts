// Copyright 2015-2019 SWIM.AI inc.
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
import {Tween, Transition} from "@swim/transition";
import {StyleAnimatorConstructor, StyleAnimator} from "./StyleAnimator";
import {ElementView} from "../ElementView";

/** @hidden */
export interface StringStyleAnimator<V extends ElementView> extends StyleAnimator<V, string, string> {
}

/** @hidden */
export const StringStyleAnimator = (function (_super: typeof StyleAnimator): StyleAnimatorConstructor {
  const StringStyleAnimator: StyleAnimatorConstructor = function <V extends ElementView>(
      this: StringStyleAnimator<V>, view: V, names: string | ReadonlyArray<string>, value?: string | null,
      transition?: Transition<string> | null, priority?: string): StringStyleAnimator<V> {
    let _this: StringStyleAnimator<V> = function (value?: string | null, tween?: Tween<string>, priority?: string | null): string | null | undefined | V {
      if (value === void 0) {
        return _this.value;
      } else {
        _this.setState(value, tween, priority);
        return _this._view;
      }
    } as StringStyleAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, names, value, transition, priority) || _this;
    return _this;
  } as unknown as StyleAnimatorConstructor;
  __extends(StringStyleAnimator, _super);

  Object.defineProperty(StringStyleAnimator.prototype, "value", {
    get: function <V extends ElementView>(this: StringStyleAnimator<V>): string | null | undefined {
      let value = this._value;
      if (value === void 0) {
        const propertyValue = this.propertyValue;
        if (propertyValue) {
          value = propertyValue;
        }
      }
      return value;
    },
    enumerable: true,
    configurable: true,
  });

  return StringStyleAnimator;
}(StyleAnimator));
StyleAnimator.String = StringStyleAnimator;
