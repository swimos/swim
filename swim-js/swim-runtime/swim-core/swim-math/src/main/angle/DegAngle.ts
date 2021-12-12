// Copyright 2015-2021 Swim.inc
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
import {AngleUnits, Angle} from "./Angle";

/** @public */
export class DegAngle extends Angle {
  constructor(value: number) {
    super();
    this.value = value;
  }

  override readonly value: number;

  override get units(): AngleUnits {
    return "deg";
  }

  override degValue(): number {
    return this.value;
  }

  override gradValue(): number {
    return this.value * 10 / 9;
  }

  override radValue(): number {
    return this.value * Math.PI / 180;
  }

  override turnValue(): number {
    return this.value / 360;
  }

  override deg(): DegAngle {
    return this;
  }

  override toCssValue(): CSSUnitValue | null {
    if (typeof CSSUnitValue !== "undefined") {
      return new CSSUnitValue(this.value, "deg");
    } else {
      return null;
    }
  }

  override compareTo(that: unknown): number {
    if (that instanceof Angle) {
      const x = this.value;
      const y = that.degValue();
      return x < y ? -1 : x > y ? 1 : isNaN(y) ? (isNaN(x) ? 0 : -1) : isNaN(x) ? 1 : 0;
    }
    return NaN;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (that instanceof Angle) {
      return Numbers.equivalent(this.value, that.degValue());
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (that instanceof DegAngle) {
      return this.value === that.value;
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Constructors.hash(DegAngle), Numbers.hash(this.value)));
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("Angle").write(46/*'.'*/).write("deg")
                   .write(40/*'('*/).debug(this.value).write(41/*')'*/);
    return output;
  }

  override toString(): string {
    return this.value + "deg";
  }

  @Lazy
  static override zero(): DegAngle {
    return new DegAngle(0);
  }
}
