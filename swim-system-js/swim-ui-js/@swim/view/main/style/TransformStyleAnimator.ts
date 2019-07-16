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
import {AnyTransform, Transform} from "@swim/transform";
import {Tween, Transition} from "@swim/transition";
import {StyleAnimatorConstructor, StyleAnimator} from "./StyleAnimator";
import {ElementView} from "../ElementView";

/** @hidden */
export interface TransformStyleAnimator<V extends ElementView> extends StyleAnimator<V, Transform, AnyTransform> {
}

/** @hidden */
export const TransformStyleAnimator = (function (_super: typeof StyleAnimator): StyleAnimatorConstructor {
  const TransformStyleAnimator: StyleAnimatorConstructor = function <V extends ElementView>(
      this: TransformStyleAnimator<V>, view: V, names: string | ReadonlyArray<string>, value?: Transform | null,
      transition?: Transition<Transform> | null, priority?: string): TransformStyleAnimator<V> {
    let _this: TransformStyleAnimator<V> = function (value?: AnyTransform | null, tween?: Tween<Transform>, priority?: string | null): Transform | null | undefined | V {
      if (value === void 0) {
        return _this.value;
      } else {
        if (value !== null) {
          value = Transform.fromAny(value);
        }
        _this.setState(value, tween, priority);
        return _this._view;
      }
    } as TransformStyleAnimator<V>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, names, value, transition, priority) || _this;
    return _this;
  } as unknown as StyleAnimatorConstructor;
  __extends(TransformStyleAnimator, _super);

  Object.defineProperty(TransformStyleAnimator.prototype, "value", {
    get: function <V extends ElementView>(this: TransformStyleAnimator<V>): Transform | null | undefined {
      let value = this._value;
      if (value === void 0) {
        const propertyValue = this.propertyValue;
        if (propertyValue) {
          try {
            value = Transform.parse(propertyValue);
          } catch (swallow) {
            // nop
          }
        }
      }
      return value;
    },
    enumerable: true,
    configurable: true,
  });

  return TransformStyleAnimator;
}(StyleAnimator));
StyleAnimator.Transform = TransformStyleAnimator;
