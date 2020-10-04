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

import {AnimatorContext, Animator} from "@swim/animate";
import {StyleAnimatorConstructor, StyleAnimator} from "../animator/StyleAnimator";

export interface StyleContext extends AnimatorContext {
  readonly node?: Node;

  getStyle(propertyNames: string | ReadonlyArray<string>): CSSStyleValue | string | undefined;

  setStyle(propertyName: string, value: unknown, priority?: string): this;

  hasStyleAnimator(animatorName: string): boolean;

  getStyleAnimator(animatorName: string): StyleAnimator<this, unknown> | null;

  setStyleAnimator(animatorName: string, animator: StyleAnimator<this, unknown> | null): void;

  animate(animator: Animator): void;

  requireUpdate(updateFlags: number): void;
}

/** @hidden */
export const StyleContext: {
  decorateStyleAnimator<V extends StyleContext, T, U>(constructor: StyleAnimatorConstructor<V, T, U>,
                                                      contextClass: unknown, animatorName: string): void;
} = {} as any;

StyleContext.decorateStyleAnimator = function<V extends StyleContext, T, U>(constructor: StyleAnimatorConstructor<V, T, U>,
                                                                            contextClass: unknown, animatorName: string): void {
  Object.defineProperty(contextClass, animatorName, {
    get: function (this: V): StyleAnimator<V, T, U> {
      let animator = this.getStyleAnimator(animatorName) as StyleAnimator<V, T, U> | null;
      if (animator === null) {
        animator = new constructor(this, animatorName);
        this.setStyleAnimator(animatorName, animator);
      }
      return animator;
    },
    configurable: true,
    enumerable: true,
  });
};
