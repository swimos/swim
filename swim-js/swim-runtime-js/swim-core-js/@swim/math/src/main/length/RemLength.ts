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

import {Lazy, Murmur3, Numbers, Constructors} from "@swim/util";
import type {Output} from "@swim/codec";
import {LengthUnits, LengthBasis, Length} from "./Length";

/** @public */
export class RemLength extends Length {
  constructor(value: number) {
    super();
    this.value = value;
  }

  override readonly value: number;

  override get units(): LengthUnits {
    return "rem";
  }

  override pxValue(basis?: LengthBasis | number): number {
    return this.value !== 0 ? this.value * Length.remUnit(basis) : 0;
  }

  override remValue(basis?: LengthBasis | number): number {
    return this.value;
  }

  override rem(basis?: LengthBasis | number): RemLength {
    return this;
  }

  override toCssValue(): CSSUnitValue | null {
    if (typeof CSSUnitValue !== "undefined") {
      return new CSSUnitValue(this.value, "rem");
    } else {
      return null;
    }
  }

  override compareTo(that: unknown): number {
    if (that instanceof RemLength) {
      const x = this.value;
      const y = that.remValue();
      return x < y ? -1 : x > y ? 1 : isNaN(y) ? (isNaN(x) ? 0 : -1) : isNaN(x) ? 1 : 0;
    }
    return NaN;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (that instanceof RemLength) {
      return Numbers.equivalent(this.value, that.remValue());
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (that instanceof RemLength) {
      return this.value === that.value;
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Constructors.hash(RemLength), Numbers.hash(this.value)));
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("Length").write(46/*'.'*/).write("rem")
                   .write(40/*'('*/).debug(this.value).write(41/*')'*/);
    return output;
  }

  override toString(): string {
    return this.value + "rem";
  }

  @Lazy
  static override zero(): RemLength {
    return new RemLength(0);
  }
}
