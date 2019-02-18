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

import {Tween, Transition} from "@swim/transition";
import {MemberAnimatorInherit, MemberAnimator} from "./MemberAnimator";
import {AnimatedView} from "../AnimatedView";

/** @hidden */
export class NumberMemberAnimator<V extends AnimatedView> extends MemberAnimator<V, number, number | string> {
  constructor(view: V, value?: number | null, transition?: Transition<number> | null, inherit?: MemberAnimatorInherit) {
    super(view, value, transition, inherit);
    let animator = this;
    function accessor(): number | undefined;
    function accessor(value: number | string | null, tween?: Tween<number>): V;
    function accessor(value?: number | string | null, tween?: Tween<number>): number | null | undefined | V {
      if (value === void 0) {
        return animator.value;
      } else {
        if (typeof value === "string") {
          value = +value;
        }
        animator.setState(value, tween);
        return animator._view;
      }
    }
    (accessor as any).__proto__ = animator;
    animator = accessor as any;
    return animator;
  }
}
MemberAnimator.Number = NumberMemberAnimator;
