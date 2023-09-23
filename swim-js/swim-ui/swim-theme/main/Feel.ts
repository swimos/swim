// Copyright 2015-2023 Nstream, inc.
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

import {Color} from "@swim/style";
import {FeelVector} from "./FeelVector";
import type {Look} from "./Look";
import type {Mood} from "./Mood";

/** @public */
export abstract class Feel implements Mood {
  constructor(name: string) {
    this.name = name;
  }

  readonly name: string;

  abstract combine<T>(look: Look<T>, combination: T | undefined,
                      value: T, weight?: number): T;

  empty(): FeelVector {
    return FeelVector.empty();
  }

  of(...looks: [Look<unknown>, any][]): FeelVector {
    return FeelVector.of(...looks);
  }

  from(array: readonly [Look<unknown>, unknown][],
       index?: {readonly [name: string]: number | undefined}): FeelVector {
    return FeelVector.fromArray(array, index);
  }

  toString(): string {
    return "Feel" + "." + this.name;
  }

  static ambient: Feel; // defined by feels
  static default: Feel; // defined by feels

  static primary: Feel; // defined by feels
  static secondary: Feel; // defined by feels
  static disabled: Feel; // defined by feels
  static inactive: Feel; // defined by feels
  static warning: Feel; // defined by feels
  static alert: Feel; // defined by feels

  static unselected: Feel; // defined by feels
  static selected: Feel; // defined by feels

  static darker: Feel; // defined by feels
  static lighter: Feel; // defined by feels
  static contrasted: Feel; // defined by feels

  static raised: Feel; // defined by feels
  static covered: Feel; // defined by feels

  static opaque: Feel; // defined by feels
  static floating: Feel; // defined by feels
  static embossed: Feel; // defined by feels
  static nested: Feel; // defined by feels
  static hovering: Feel; // defined by feels
  static translucent: Feel; // defined by feels
  static transparent: Feel; // defined by feels

  static navigating: Feel; // defined by feels
}

/** @public */
export class InterpolatedFeel extends Feel {
  override combine<T>(look: Look<T>, combination: T | undefined,
                      value: T, weight?: number): T {
    return look.combine(combination, value, weight);
  }
}

/** @public */
export class BrightnessFeel extends Feel {
  override combine<T>(look: Look<T>, combination: T | undefined,
                      value: T, weight?: number): T {
    if (combination instanceof Color && value instanceof Color) {
      const amount = weight === void 0 ? value.alpha() : value.alpha() * weight;
      if (amount >= 0) {
        return combination.darker(amount) as unknown as T;
      } else {
        return combination.lighter(-amount) as unknown as T;
      }
    }
    return look.combine(combination, value, weight);
  }
}

/** @public */
export class OpacityFeel extends Feel {
  override combine<T>(look: Look<T>, combination: T | undefined,
                      value: T, weight?: number): T {
    if (combination instanceof Color && value instanceof Color) {
      if (weight === void 0) {
        weight = 1;
      }
      const alpha0 = combination.alpha();
      const alpha1 = alpha0 * value.alpha();
      const alpha = (1.0 - weight) * alpha0 + weight * alpha1;
      const color = combination.alpha(alpha) as unknown as T;
      return color;
    }
    return look.combine(combination, value, weight);
  }
}

Feel.ambient = new InterpolatedFeel("ambient");
Feel.default = new InterpolatedFeel("default");

Feel.primary = new InterpolatedFeel("primary");
Feel.secondary = new InterpolatedFeel("secondary");
Feel.disabled = new InterpolatedFeel("disabled");
Feel.inactive = new InterpolatedFeel("inactive");
Feel.warning = new InterpolatedFeel("warning");
Feel.alert = new InterpolatedFeel("alert");

Feel.unselected = new InterpolatedFeel("unselected");
Feel.selected = new InterpolatedFeel("selected");

Feel.darker = new BrightnessFeel("darker");
Feel.lighter = new BrightnessFeel("lighter");
Feel.contrasted = new BrightnessFeel("contrasted");

Feel.raised = new InterpolatedFeel("raised");
Feel.covered = new InterpolatedFeel("covered");

Feel.opaque = new InterpolatedFeel("opaque");
Feel.floating = new InterpolatedFeel("floating");
Feel.embossed = new BrightnessFeel("embossed");
Feel.nested = new BrightnessFeel("nested");
Feel.hovering = new BrightnessFeel("hovering");
Feel.translucent = new OpacityFeel("translucent");
Feel.transparent = new OpacityFeel("transparent");

Feel.navigating = new InterpolatedFeel("navigating");
