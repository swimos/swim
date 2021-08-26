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
import {LengthException} from "./LengthException";
import {LengthUnits, LengthBasis, Length} from "./Length";

export class UnitlessLength extends Length {
  constructor(value: number) {
    super();
    Object.defineProperty(this, "value", {
      value: value,
      enumerable: true,
    });
  }

  override readonly value!: number;

  override get units(): LengthUnits {
    return "";
  }

  override pxValue(basis?: LengthBasis | number): number {
    throw new LengthException("unitless length");
  }

  override toCssValue(): CSSUnitValue | null {
    return null;
  }

  override compareTo(that: unknown): number {
    if (that instanceof Length) {
      const x = this.value;
      const y = that.value;
      return x < y ? -1 : x > y ? 1 : isNaN(y) ? (isNaN(x) ? 0 : -1) : isNaN(x) ? 1 : 0;
    }
    return NaN;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (that instanceof Length) {
      return Numbers.equivalent(this.value, that.value);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (that instanceof UnitlessLength) {
      return this.value === that.value;
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Constructors.hash(UnitlessLength), Numbers.hash(this.value)));
  }

  override debug(output: Output): void {
    output = output.write("Length").write(46/*'.'*/).write("unitless")
        .write(40/*'('*/).debug(this.value).write(41/*')'*/);
  }

  override toString(): string {
    return this.value + "";
  }

  @Lazy
  static override zero(): UnitlessLength {
    return new UnitlessLength(0);
  }
}
