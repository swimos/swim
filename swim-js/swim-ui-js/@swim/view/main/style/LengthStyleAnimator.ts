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

import {AnyLength, Length} from "@swim/length";
import {Tween, Transition} from "@swim/transition";
import {StyleAnimator} from "./StyleAnimator";
import {ElementView} from "../ElementView";

/** @hidden */
export class LengthStyleAnimator<V extends ElementView> extends StyleAnimator<V, Length, AnyLength> {
  constructor(view: V, names: string | ReadonlyArray<string>, value?: Length | null,
              transition?: Transition<Length> | null, priority?: string) {
    super(view, names, value, transition, priority);
    let animator = this;
    function accessor(): Length | null | undefined;
    function accessor(value: AnyLength | null, tween?: Tween<Length>, priority?: string | null): V;
    function accessor(value?: AnyLength | null, tween?: Tween<Length>, priority?: string | null): Length | null | undefined | V {
      if (value === void 0) {
        return animator.value;
      } else {
        if (value !== null) {
          value = Length.fromAny(value, view._node);
        }
        animator.setState(value, tween, priority);
        return animator._view;
      }
    }
    (accessor as any).__proto__ = animator;
    animator = accessor as any;
    return animator;
  }

  get value(): Length | null | undefined {
    let value = this._value;
    if (value === void 0) {
      const propertyValue = this.propertyValue;
      if (propertyValue) {
        try {
          value = Length.parse(propertyValue);
        } catch (swallow) {
          // nop
        }
      }
    }
    return value;
  }
}
StyleAnimator.Length = LengthStyleAnimator;
