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

import {AnyColor, Color} from "@swim/color";
import {Tween, Transition} from "@swim/transition";
import {StyleAnimator} from "./StyleAnimator";
import {ElementView} from "../ElementView";

/** @hidden */
export class ColorOrStringStyleAnimator<V extends ElementView> extends StyleAnimator<V, Color | string, AnyColor | string> {
  constructor(view: V, names: string | ReadonlyArray<string>, value?: Color | string | null,
              transition?: Transition<Color | string> | null, priority?: string) {
    super(view, names, value, transition, priority);
    let animator = this;
    function accessor(): Color | string | null | undefined;
    function accessor(value: AnyColor | string | null, tween?: Tween<Color | string>, priority?: string | null): V;
    function accessor(value?: AnyColor | string | null, tween?: Tween<Color | string>, priority?: string | null): Color | string | null | undefined | V {
      if (value === void 0) {
        return animator.value;
      } else {
        if (value !== null) {
          if (typeof value === "string") {
            try {
              value = Color.parse(value);
            } catch (swallow) {
              // string value
            }
          } else {
            value = Color.fromAny(value);
          }
        }
        animator.setState(value, tween);
        return animator._view;
      }
    }
    (accessor as any).__proto__ = animator;
    animator = accessor as any;
    return animator;
  }

  get value(): Color | string | null | undefined {
    let value = this._value;
    if (value === void 0) {
      const propertyValue = this.propertyValue;
      if (propertyValue) {
        try {
          value = Color.parse(propertyValue);
        } catch (swallow) {
          value = propertyValue;
        }
      }
    }
    return value;
  }
}
StyleAnimator.ColorOrString = ColorOrStringStyleAnimator;
