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

export class PctLength extends Length {
  constructor(value: number) {
    super();
    Object.defineProperty(this, "value", {
      value: value,
      enumerable: true,
    });
  }

  declare readonly value: number;

  get units(): LengthUnits {
    return "%";
  }

  pxValue(basis?: LengthBasis | number): number {
    return this.value !== 0 ? this.value * Length.pctUnit(basis) / 100 : 0;
  }

  pctValue(basis?: LengthBasis | number): number {
    return this.value;
  }

  pct(basis?: LengthBasis | number): PctLength {
    return this;
  }

  toCssValue(): CSSUnitValue | null {
    if (typeof CSSUnitValue !== "undefined") {
      return new CSSUnitValue(this.value, "percent");
    } else {
      return null;
    }
  }

  compareTo(that: unknown): number {
    if (that instanceof Length) {
      const x = this.value;
      const y = that.pctValue();
      return x < y ? -1 : x > y ? 1 : isNaN(y) ? (isNaN(x) ? 0 : -1) : isNaN(x) ? 1 : 0;
    }
    return NaN;
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (that instanceof Length) {
      return Numbers.equivalent(this.value, that.pctValue());
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (that instanceof PctLength) {
      return this.value === that.value;
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Constructors.hash(PctLength), Numbers.hash(this.value)));
  }

  debug(output: Output): void {
    output = output.write("Length").write(46/*'.'*/).write("pct")
        .write(40/*'('*/).debug(this.value).write(41/*')'*/);
  }

  toString(): string {
    return this.value + "%";
  }

  @Lazy
  static zero(): PctLength {
    return new PctLength(0);
  }
}
