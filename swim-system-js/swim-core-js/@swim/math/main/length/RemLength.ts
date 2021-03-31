// Copyright 2015-2020 Swim inc.
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

import {Lazy, Murmur3, Numbers, Constructors} from "@swim/util";
import type {Output} from "@swim/codec";
import {LengthUnits, LengthBasis, Length} from "./Length";

export class RemLength extends Length {
  constructor(value: number) {
    super();
    Object.defineProperty(this, "value", {
      value: value,
      enumerable: true,
    });
  }

  declare readonly value: number;

  get units(): LengthUnits {
    return "rem";
  }

  pxValue(basis?: LengthBasis | number): number {
    return this.value !== 0 ? this.value * Length.remUnit(basis) : 0;
  }

  remValue(basis?: LengthBasis | number): number {
    return this.value;
  }

  rem(basis?: LengthBasis | number): RemLength {
    return this;
  }

  toCssValue(): CSSUnitValue | null {
    if (typeof CSSUnitValue !== "undefined") {
      return new CSSUnitValue(this.value, "rem");
    } else {
      return null;
    }
  }

  compareTo(that: unknown): number {
    if (that instanceof RemLength) {
      const x = this.value;
      const y = that.remValue();
      return x < y ? -1 : x > y ? 1 : isNaN(y) ? (isNaN(x) ? 0 : -1) : isNaN(x) ? 1 : 0;
    }
    return NaN;
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (that instanceof RemLength) {
      return Numbers.equivalent(this.value, that.remValue());
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (that instanceof RemLength) {
      return this.value === that.value;
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Constructors.hash(RemLength), Numbers.hash(this.value)));
  }

  debug(output: Output): void {
    output = output.write("Length").write(46/*'.'*/).write("rem")
        .write(40/*'('*/).debug(this.value).write(41/*')'*/);
  }

  toString(): string {
    return this.value + "rem";
  }

  @Lazy
  static zero(): RemLength {
    return new RemLength(0);
  }
}
