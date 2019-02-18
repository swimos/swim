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

import {AnyLineHeight, LineHeight} from "@swim/font";
import {Tween, Transition} from "@swim/transition";
import {StyleAnimator} from "./StyleAnimator";
import {ElementView} from "../ElementView";

/** @hidden */
export class LineHeightStyleAnimator<V extends ElementView> extends StyleAnimator<V, LineHeight, AnyLineHeight> {
  constructor(view: V, names: string | ReadonlyArray<string>, value?: LineHeight | null,
              transition?: Transition<LineHeight> | null, priority?: string) {
    super(view, names, value, transition, priority);
    let animator = this;
    function accessor(): LineHeight | null | undefined;
    function accessor(value: AnyLineHeight | null, tween?: Tween<LineHeight>, priority?: string | null): V;
    function accessor(value?: AnyLineHeight | null, tween?: Tween<LineHeight>, priority?: string | null): LineHeight | null | undefined | V {
      if (value === void 0) {
        return animator.value;
      } else {
        if (value !== null) {
          value = LineHeight.fromAny(value);
        }
        animator.setState(value as LineHeight | null, tween, priority);
        return animator._view;
      }
    }
    (accessor as any).__proto__ = animator;
    animator = accessor as any;
    return animator;
  }

  get value(): LineHeight | null | undefined {
    let value = this._value;
    if (value === void 0) {
      const propertyValue = this.propertyValue;
      if (propertyValue) {
        try {
          value = LineHeight.fromAny(propertyValue);
        } catch (swallow) {
          // nop
        }
      }
    }
    return value;
  }
}
StyleAnimator.LineHeight = LineHeightStyleAnimator;
