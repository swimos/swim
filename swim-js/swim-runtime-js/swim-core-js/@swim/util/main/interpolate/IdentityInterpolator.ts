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

import type {Mutable} from "../types/Mutable";
import {Interpolator} from "./Interpolator";

/** @internal */
export interface IdentityInterpolator<Y> extends Interpolator<Y> {
  /** @internal */
  readonly value: Y;

  readonly 0: Y;

  readonly 1: Y;

  equals(that: unknown): boolean;
}

/** @internal */
export const IdentityInterpolator = (function (_super: typeof Interpolator) {
  const IdentityInterpolator = function <Y>(value: Y): IdentityInterpolator<Y> {
    const interpolator = function (u: number): Y {
      return interpolator.value;
    } as IdentityInterpolator<Y>;
    Object.setPrototypeOf(interpolator, IdentityInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>).value = value;
    return interpolator;
  } as {
    <Y>(value: Y): IdentityInterpolator<Y>;

    /** @internal */
    prototype: IdentityInterpolator<any>;
  };

  IdentityInterpolator.prototype = Object.create(_super.prototype);
  IdentityInterpolator.prototype.constructor = IdentityInterpolator;

  Object.defineProperty(IdentityInterpolator.prototype, 0, {
    get<Y>(this: IdentityInterpolator<Y>): Y {
      return this.value;
    },
    configurable: true,
  });

  Object.defineProperty(IdentityInterpolator.prototype, 1, {
    get<Y>(this: IdentityInterpolator<Y>): Y {
      return this.value;
    },
    configurable: true,
  });

  IdentityInterpolator.prototype.equals = function (that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof IdentityInterpolator) {
      return this.value === that.value;
    }
    return false;
  };

  return IdentityInterpolator;
})(Interpolator);
