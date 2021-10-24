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

import {Mutable, Interpolator} from "@swim/util";
import type {Field} from "./Field";
import {Slot} from "./Slot";
import type {Value} from "./Value";

/** @internal */
export interface FieldInterpolator extends Interpolator<Field> {
  /** @internal */
  readonly keyInterpolator: Interpolator<Value>;
  /** @internal */
  readonly valueInterpolator: Interpolator<Value>;

  readonly 0: Field;

  readonly 1: Field;

  equals(that: unknown): boolean;
}

/** @internal */
export const FieldInterpolator = (function (_super: typeof Interpolator) {
  const FieldInterpolator = function (y0: Field, y1: Field): FieldInterpolator {
    const interpolator = function (u: number): Field {
      const key = interpolator.keyInterpolator(u);
      const value = interpolator.valueInterpolator(u);
      return Slot.of(key, value);
    } as FieldInterpolator;
    Object.setPrototypeOf(interpolator, FieldInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>).keyInterpolator = y0.key.interpolateTo(y1.key);
    (interpolator as Mutable<typeof interpolator>).valueInterpolator = y0.value.interpolateTo(y1.value);
    return interpolator;
  } as {
    (y0: Field, y1: Field): FieldInterpolator;

    /** @internal */
    prototype: FieldInterpolator;
  };

  FieldInterpolator.prototype = Object.create(_super.prototype);
  FieldInterpolator.prototype.constructor = FieldInterpolator;

  Object.defineProperty(FieldInterpolator.prototype, 0, {
    get(this: FieldInterpolator): Field {
      return Slot.of(this.keyInterpolator[0], this.valueInterpolator[0]);
    },
    configurable: true,
  });

  Object.defineProperty(FieldInterpolator.prototype, 1, {
    get(this: FieldInterpolator): Field {
      return Slot.of(this.keyInterpolator[1], this.valueInterpolator[1]);
    },
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

  return FieldInterpolator;
})(Interpolator);
