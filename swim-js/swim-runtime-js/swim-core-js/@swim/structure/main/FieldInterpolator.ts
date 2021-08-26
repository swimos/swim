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

import {Interpolator} from "@swim/mapping";
import type {Field} from "./Field";
import {Slot} from "./Slot";
import type {Value} from "./Value";

/** @hidden */
export interface FieldInterpolator extends Interpolator<Field> {
  /** @hidden */
  readonly keyInterpolator: Interpolator<Value>;
  /** @hidden */
  readonly valueInterpolator: Interpolator<Value>;

  readonly 0: Field;

  readonly 1: Field;

  equals(that: unknown): boolean;
}

/** @hidden */
export const FieldInterpolator = function (y0: Field, y1: Field): FieldInterpolator {
  const interpolator = function (u: number): Field {
    const key = interpolator.keyInterpolator(u);
    const value = interpolator.valueInterpolator(u);
    return Slot.of(key, value);
  } as FieldInterpolator;
  Object.setPrototypeOf(interpolator, FieldInterpolator.prototype);
  Object.defineProperty(interpolator, "keyInterpolator", {
    value: y0.key.interpolateTo(y1.key),
    enumerable: true,
  });
  Object.defineProperty(interpolator, "valueInterpolator", {
    value: y0.value.interpolateTo(y1.value),
    enumerable: true,
  });
  return interpolator;
} as {
  (y0: Field, y1: Field): FieldInterpolator;

  /** @hidden */
  prototype: FieldInterpolator;
};

FieldInterpolator.prototype = Object.create(Interpolator.prototype);

Object.defineProperty(FieldInterpolator.prototype, 0, {
  get(this: FieldInterpolator): Field {
    return Slot.of(this.keyInterpolator[0], this.valueInterpolator[0]);
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(FieldInterpolator.prototype, 1, {
  get(this: FieldInterpolator): Field {
    return Slot.of(this.keyInterpolator[1], this.valueInterpolator[1]);
  },
  enumerable: true,
  configurable: true,
});

FieldInterpolator.prototype.equals = function (that: unknown): boolean {
  if (this === that) {
    return true;
  } else if (that instanceof FieldInterpolator) {
    return this.keyInterpolator.equals(that.keyInterpolator)
        && this.valueInterpolator.equals(that.valueInterpolator);
  }
  return false;
};
