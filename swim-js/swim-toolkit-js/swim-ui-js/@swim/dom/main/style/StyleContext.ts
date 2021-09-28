// Copyright 2015-2021 Swim Inc.
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

import type {AnyTiming} from "@swim/util";
import type {ConstraintScope} from "@swim/constraint";
import type {Look, Feel, MoodVector, ThemeMatrix} from "@swim/theme";
import type {AnimationTimeline} from "@swim/view";
import type {StyleAnimatorConstructor, StyleAnimator} from "./StyleAnimator";

export interface StyleContextPrototype {
  /** @hidden */
  styleAnimatorConstructors?: {[animatorName: string]: StyleAnimatorConstructor<StyleContext, unknown> | undefined};
}

export interface StyleContext extends AnimationTimeline, ConstraintScope {
  readonly node: Node | null;

  isMounted(): boolean;

  getStyle(propertyNames: string | ReadonlyArray<string>): CSSStyleValue | string | undefined;

  setStyle(propertyName: string, value: unknown, priority?: string): this;

  hasStyleAnimator(animatorName: string): boolean;

  getStyleAnimator(animatorName: string): StyleAnimator<this, unknown> | null;

  setStyleAnimator(animatorName: string, animator: StyleAnimator<this, unknown> | null): void;

  getLook<T>(look: Look<T, unknown>, mood?: MoodVector<Feel> | null): T | undefined;

  getLookOr<T, E>(look: Look<T, unknown>, elseValue: E): T | E;
  getLookOr<T, E>(look: Look<T, unknown>, mood: MoodVector<Feel> | null, elseValue: E): T | E;

  applyTheme(theme: ThemeMatrix, mood: MoodVector, timing?: AnyTiming | boolean): void;

  requireUpdate(updateFlags: number): void;
}

/** @hidden */
export const StyleContext = {} as {
  getStyleAnimatorConstructor(animatorName: string, styleContextPrototype: StyleContextPrototype): StyleAnimatorConstructor<any, unknown> | null;

  decorateStyleAnimator(constructor: StyleAnimatorConstructor<StyleContext, unknown>,
                        target: Object, propertyKey: string | symbol): void;
};

StyleContext.getStyleAnimatorConstructor = function (animatorName: string, styleContextPrototype: StyleContextPrototype | null): StyleAnimatorConstructor<any, unknown> | null {
  while (styleContextPrototype !== null) {
    if (Object.prototype.hasOwnProperty.call(styleContextPrototype, "styleAnimatorConstructors")) {
      const constructor = styleContextPrototype.styleAnimatorConstructors![animatorName];
      if (constructor !== void 0) {
        return constructor;
      }
    }
    styleContextPrototype = Object.getPrototypeOf(styleContextPrototype);
  }
  return null;
};

StyleContext.decorateStyleAnimator = function (constructor: StyleAnimatorConstructor<StyleContext, unknown>,
                                               target: Object, propertyKey: string | symbol): void {
  const styleContextPrototype = target as StyleContextPrototype;
  if (!Object.prototype.hasOwnProperty.call(styleContextPrototype, "styleAnimatorConstructors")) {
    styleContextPrototype.styleAnimatorConstructors = {};
  }
  styleContextPrototype.styleAnimatorConstructors![propertyKey.toString()] = constructor;
  Object.defineProperty(target, propertyKey, {
    get: function (this: StyleContext): StyleAnimator<StyleContext, unknown> {
      let styleAnimator = this.getStyleAnimator(propertyKey.toString());
      if (styleAnimator === null) {
        styleAnimator = new constructor(this, propertyKey.toString());
        this.setStyleAnimator(propertyKey.toString(), styleAnimator);
      }
      return styleAnimator;
    },
    configurable: true,
    enumerable: true,
  });
};
