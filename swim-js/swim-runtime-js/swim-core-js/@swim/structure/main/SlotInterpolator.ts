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
import {Slot} from "./Slot";
import type {Value} from "./Value";

/** @internal */
export interface SlotInterpolator extends Interpolator<Slot> {
  /** @internal */
  readonly keyInterpolator: Interpolator<Value>;
  /** @internal */
  readonly valueInterpolator: Interpolator<Value>;

  readonly 0: Slot;

  readonly 1: Slot;

  equals(that: unknown): boolean;
}

/** @internal */
export const SlotInterpolator = (function (_super: typeof Interpolator) {
  const SlotInterpolator = function (y0: Slot, y1: Slot): SlotInterpolator {
    const interpolator = function (u: number): Slot {
      const key = interpolator.keyInterpolator(u);
      const value = interpolator.valueInterpolator(u);
      return Slot.of(key, value);
    } as SlotInterpolator;
    Object.setPrototypeOf(interpolator, SlotInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>).keyInterpolator = y0.key.interpolateTo(y1.key);
    (interpolator as Mutable<typeof interpolator>).valueInterpolator = y0.value.interpolateTo(y1.value);
    return interpolator;
  } as {
    (y0: Slot, y1: Slot): SlotInterpolator;

    /** @internal */
    prototype: SlotInterpolator;
  };

  SlotInterpolator.prototype = Object.create(_super.prototype);

  Object.defineProperty(SlotInterpolator.prototype, 0, {
    get(this: SlotInterpolator): Slot {
      return Slot.of(this.keyInterpolator[0], this.valueInterpolator[0]);
    },
    configurable: true,
  });

  Object.defineProperty(SlotInterpolator.prototype, 1, {
    get(this: SlotInterpolator): Slot {
      return Slot.of(this.keyInterpolator[1], this.valueInterpolator[1]);
    },
    configurable: true,
  });

  SlotInterpolator.prototype.equals = function (that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof SlotInterpolator) {
      return this.keyInterpolator.equals(that.keyInterpolator)
          && this.valueInterpolator.equals(that.valueInterpolator);
    }
    return false;
  };

  return SlotInterpolator;
})(Interpolator);
