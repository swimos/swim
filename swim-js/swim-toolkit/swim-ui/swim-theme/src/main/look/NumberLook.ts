// Copyright 2015-2023 Swim.inc
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

import {Numbers, Interpolator, NumberInterpolator} from "@swim/util";
import {Look} from "./Look";

/** @public */
export type AnyNumberOrLook = Look<number, any> | number | string | boolean;

/** @public */
export type NumberOrLook = Look<number, any> | number;

/** @public */
export class NumberLook extends Look<number> {
  override combine(combination: number | undefined, value: number, weight: number): number {
    if (combination !== void 0) {
      if (weight === void 0 || weight === 1) {
        return value;
      } else if (weight === 0) {
        return combination;
      } else {
        return (1.0 - weight) * combination + weight * value;
      }
    } else if (weight !== void 0 && weight !== 1) {
      return value * weight;
    } else {
      return value;
    }
  }

  override between(a: number, b: number): Interpolator<number> {
    return NumberInterpolator(a, b);
  }

  override coerce(value: number): number {
    return value;
  }

  static fromAny(value: Look<number> | number | string | boolean): Look<number> | number;
  static fromAny(value: Look<number> | number | string | boolean | undefined): Look<number> | number | undefined;
  static fromAny(value: Look<number> | number | string | boolean | null | undefined): Look<number> | number | null | undefined;
  static fromAny(value: Look<number> | number | string | boolean | null | undefined): Look<number> | number | null | undefined {
    if (value === void 0 || value === null || value instanceof Look) {
      return value;
    } else {
      return Numbers.fromAny(value);
    }
  }
}
