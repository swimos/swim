// Copyright 2015-2019 SWIM.AI inc.
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

import {Murmur3} from "@swim/util";
import {Output} from "@swim/codec";
import {AngleUnits, Angle} from "./Angle";

export class GradAngle extends Angle {
  /** @hidden */
  readonly _value: number;

  constructor(value: number) {
    super();
    this._value = value;
  }

  value(): number {
    return this._value;
  }

  units(): AngleUnits {
    return "grad";
  }

  degValue(): number {
    return this._value * 0.9;
  }

  gradValue(): number {
    return this._value;
  }

  radValue(): number {
    return this._value * Angle.PI / 200;
  }

  turnValue(): number {
    return this._value / 400;
  }

  grad(): GradAngle {
    return this;
  }

  equals(that: unknown): boolean {
    if (that instanceof GradAngle) {
      return this._value === that._value;
    }
    return false;
  }

  hashCode(): number {
    if (GradAngle._hashSeed === void 0) {
      GradAngle._hashSeed = Murmur3.seed(GradAngle);
    }
    return Murmur3.mash(Murmur3.mix(GradAngle._hashSeed, Murmur3.hash(this._value)));
  }

  debug(output: Output): void {
    output = output.write("Angle").write(46/*'.'*/).write("grad").write(40/*'('*/)
        .debug(this._value).write(41/*')'*/);
  }

  toString(): string {
    return this._value + "grad";
  }

  private static _hashSeed?: number;
}
Angle.Grad = GradAngle;
