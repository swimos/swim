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

import {FontFamily, Font} from "@swim/font";
import {Tween, Transition} from "@swim/transition";
import {StyleAnimator} from "./StyleAnimator";
import {ElementView} from "../ElementView";

/** @hidden */
export class FontFamilyStyleAnimator<V extends ElementView> extends StyleAnimator<V, FontFamily | FontFamily[], FontFamily | ReadonlyArray<FontFamily>> {
  constructor(view: V, names: string | ReadonlyArray<string>, value?: FontFamily | FontFamily[] | null,
              transition?: Transition<FontFamily | FontFamily[]> | null, priority?: string) {
    super(view, names, value, transition, priority);
    let animator = this;
    function accessor(): FontFamily | FontFamily[] | null | undefined;
    function accessor(value: FontFamily | ReadonlyArray<FontFamily> | null, tween?: Tween<FontFamily | FontFamily[]>, priority?: string | null): V;
    function accessor(value?: FontFamily | ReadonlyArray<FontFamily> | null, tween?: Tween<FontFamily | FontFamily[]>, priority?: string | null): FontFamily | FontFamily[] | null | undefined | V {
      if (value === void 0) {
        return animator.value;
      } else {
        if (value !== null) {
          value = Font.family(value).family();
        }
        animator.setState(value as FontFamily | FontFamily[], tween, priority);
        return animator._view;
      }
    }
    (accessor as any).__proto__ = animator;
    animator = accessor as any;
    return animator;
  }

  get value(): FontFamily | FontFamily[] | null | undefined {
    let value = this._value;
    if (value === void 0) {
      const propertyValue = this.propertyValue;
      if (propertyValue) {
        try {
          value = Font.parse(propertyValue).family();
        } catch (swallow) {
          // nop
        }
      }
    }
    return value;
  }
}
StyleAnimator.FontFamily = FontFamilyStyleAnimator;
