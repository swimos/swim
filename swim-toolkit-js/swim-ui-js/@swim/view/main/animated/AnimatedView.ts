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

import {Transition} from "@swim/transition";
import {AnimatorContext, Animator} from "@swim/animate";
import {MemberAnimatorDescriptor, MemberAnimatorConstructor, MemberAnimator} from "../member/MemberAnimator";
import {ViewFlags, View} from "../View";
import {AnimatedViewContext} from "./AnimatedViewContext";
import {AnimatedViewController} from "./AnimatedViewController";

export interface AnimatedViewClass {
  /** @hidden */
  _memberAnimatorDescriptors?: {[animatorName: string]: MemberAnimatorDescriptor<AnimatedView, unknown> | undefined};
}

export interface AnimatedView extends AnimatorContext, View {
  readonly viewController: AnimatedViewController | null;

  needsProcess(processFlags: ViewFlags, viewContext: AnimatedViewContext): ViewFlags;

  needsDisplay(displayFlags: ViewFlags, viewContext: AnimatedViewContext): ViewFlags;

  hasMemberAnimator(animatorName: string): boolean;

  getMemberAnimator(animatorName: string): Animator | null;

  setMemberAnimator(animatorName: string, animator: Animator | null): void;

  /** @hidden */
  getLazyMemberAnimator(animatorName: string): Animator | null;

  /** @hidden */
  animatorDidSetAuto(animator: Animator, auto: boolean): void;
}

/** @hidden */
export const AnimatedView = {
  is(object: unknown): object is AnimatedView {
    if (typeof object === "object" && object !== null) {
      const view = object as AnimatedView;
      return view instanceof View.Node || view instanceof View.Graphics
          || view instanceof View && typeof view.animate === "function";
    }
    return false;
  },

  /** @hidden */
  getMemberAnimatorDescriptor(animatorName: string, viewClass: AnimatedViewClass | null): MemberAnimatorDescriptor<AnimatedView, unknown> | null {
    while (viewClass !== null) {
      if (viewClass.hasOwnProperty("_memberAnimatorDescriptors")) {
        const descriptor = viewClass._memberAnimatorDescriptors![animatorName];
        if (descriptor !== void 0) {
          return descriptor;
        }
      }
      viewClass = (viewClass as any).__proto__ as AnimatedViewClass | null;
    }
    return null;
  },

  /** @hidden */
  initMemberAnimator<V extends AnimatedView, T, U>(
      MemberAnimator: MemberAnimatorConstructor<T, U>, view: V, animatorName: string,
      descriptor: MemberAnimatorDescriptor<V, T, U> | undefined): MemberAnimator<V, T, U> {
    let value: T | U | undefined;
    let transition: Transition<T> | null | undefined;
    let inherit: string | null | undefined;
    if (descriptor !== void 0) {
      if (descriptor.init !== void 0) {
        value = descriptor.init.call(view)
      } else {
        value = descriptor.value;
      }
      if (descriptor.transition !== void 0 && descriptor.transition !== null) {
        transition = Transition.fromAny(descriptor.transition);
      }
      if (typeof descriptor.inherit === "string") {
        inherit = descriptor.inherit;
      } else if (descriptor.inherit === true) {
        inherit = animatorName;
      }
    }
    return new MemberAnimator<V>(view, animatorName, value, transition, inherit);
  },

  /** @hidden */
  decorateMemberAnimator<V extends AnimatedView, T, U>(MemberAnimator: MemberAnimatorConstructor<T, U>,
                                                       descriptor: MemberAnimatorDescriptor<V, T, U> | undefined,
                                                       viewClass: AnimatedViewClass, animatorName: string): void {
    if (!viewClass.hasOwnProperty("_memberAnimatorDescriptors")) {
      viewClass._memberAnimatorDescriptors = {};
    }
    viewClass._memberAnimatorDescriptors![animatorName] = descriptor;
    Object.defineProperty(viewClass, animatorName, {
      get: function (this: V): MemberAnimator<V, T, U> {
        let animator = this.getMemberAnimator(animatorName) as MemberAnimator<V, T, U> | null;
        if (animator === null) {
          animator = AnimatedView.initMemberAnimator(MemberAnimator, this, animatorName, descriptor);
          this.setMemberAnimator(animatorName, animator);
        }
        return animator;
      },
      configurable: true,
      enumerable: true,
    });
  },
};
View.Animated = AnimatedView;
