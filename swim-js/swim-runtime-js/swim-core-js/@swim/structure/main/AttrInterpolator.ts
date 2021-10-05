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
import {Attr} from "./Attr";
import type {Value} from "./Value";
import type {Text} from "./Text";

/** @internal */
export interface AttrInterpolator extends Interpolator<Attr> {
  /** @internal */
  readonly keyInterpolator: Interpolator<Text>;
  /** @internal */
  readonly valueInterpolator: Interpolator<Value>;

  readonly 0: Attr;

  readonly 1: Attr;

  equals(that: unknown): boolean;
}

/** @internal */
export const AttrInterpolator = (function (_super: typeof Interpolator) {
  const AttrInterpolator = function (y0: Attr, y1: Attr): AttrInterpolator {
    const interpolator = function (u: number): Attr {
      const key = interpolator.keyInterpolator(u);
      const value = interpolator.valueInterpolator(u);
      return Attr.of(key, value);
    } as AttrInterpolator;
    Object.setPrototypeOf(interpolator, AttrInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>).keyInterpolator = y0.key.interpolateTo(y1.key);
    (interpolator as Mutable<typeof interpolator>).valueInterpolator = y0.value.interpolateTo(y1.value);
    return interpolator;
  } as {
    (y0: Attr, y1: Attr): AttrInterpolator;

    /** @internal */
    prototype: AttrInterpolator;
  };

  AttrInterpolator.prototype = Object.create(_super.prototype);

  Object.defineProperty(AttrInterpolator.prototype, 0, {
    get(this: AttrInterpolator): Attr {
      return Attr.of(this.keyInterpolator[0], this.valueInterpolator[0]);
    },
    configurable: true,
  });

  Object.defineProperty(AttrInterpolator.prototype, 1, {
    get(this: AttrInterpolator): Attr {
      return Attr.of(this.keyInterpolator[1], this.valueInterpolator[1]);
    },
    configurable: true,
  });

  AttrInterpolator.prototype.equals = function (that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof AttrInterpolator) {
      return this.keyInterpolator.equals(that.keyInterpolator)
          && this.valueInterpolator.equals(that.valueInterpolator);
    }
    return false;
  };

  return AttrInterpolator;
})(Interpolator);
