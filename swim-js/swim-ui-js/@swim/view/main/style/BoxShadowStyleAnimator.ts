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

import {AnyBoxShadow, BoxShadow} from "@swim/style";
import {Tween, Transition} from "@swim/transition";
import {StyleAnimator} from "./StyleAnimator";
import {ElementView} from "../ElementView";

/** @hidden */
export class BoxShadowStyleAnimator<V extends ElementView> extends StyleAnimator<V, BoxShadow, AnyBoxShadow> {
  constructor(view: V, names: string | ReadonlyArray<string>, value?: BoxShadow | null,
              transition?: Transition<BoxShadow> | null, priority?: string) {
    super(view, names, value, transition, priority);
    let animator = this;
    function accessor(): BoxShadow | null | undefined;
    function accessor(value: AnyBoxShadow | null, tween?: Tween<BoxShadow>, priority?: string | null): V;
    function accessor(value?: AnyBoxShadow | null, tween?: Tween<BoxShadow>, priority?: string | null): BoxShadow | null | undefined | V {
      if (value === void 0) {
        return animator.value;
      } else {
        if (value !== null) {
          value = BoxShadow.fromAny(value);
        }
        animator.setState(value as BoxShadow | null, tween, priority);
        return animator._view;
      }
    }
    (accessor as any).__proto__ = animator;
    animator = accessor as any;
    return animator;
  }

  get value(): BoxShadow | null | undefined {
    let value = this._value;
    if (value === void 0) {
      const propertyValue = this.propertyValue;
      if (propertyValue) {
        try {
          value = BoxShadow.parse(propertyValue);
        } catch (swallow) {
          // nop
        }
      }
    }
    return value;
  }
}
StyleAnimator.BoxShadow = BoxShadowStyleAnimator;
