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

import type {Mutable} from "@swim/util";
import {Interpolator} from "@swim/mapping";
import {Attr} from "./Attr";
import type {Value} from "./Value";
import type {Text} from "./Text";

/** @hidden */
export interface AttrInterpolator extends Interpolator<Attr> {
  /** @hidden */
  readonly keyInterpolator: Interpolator<Text>;
  /** @hidden */
  readonly valueInterpolator: Interpolator<Value>;

  readonly 0: Attr;

  readonly 1: Attr;

  equals(that: unknown): boolean;
}

/** @hidden */
export const AttrInterpolator = function (y0: Attr, y1: Attr): AttrInterpolator {
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

  /** @hidden */
  prototype: AttrInterpolator;
};

AttrInterpolator.prototype = Object.create(Interpolator.prototype);

Object.defineProperty(AttrInterpolator.prototype, 0, {
  get(this: AttrInterpolator): Attr {
    return Attr.of(this.keyInterpolator[0], this.valueInterpolator[0]);
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(AttrInterpolator.prototype, 1, {
  get(this: AttrInterpolator): Attr {
    return Attr.of(this.keyInterpolator[1], this.valueInterpolator[1]);
  },
  enumerable: true,
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
