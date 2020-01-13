// Copyright 2015-2020 SWIM.AI inc.
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

export class RadAngle extends Angle {
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
    return "rad";
  }

  degValue(): number {
    return this._value * 180 / Angle.PI;
  }

  gradValue(): number {
    return this._value * 200 / Angle.PI;
  }

  radValue(): number {
    return this._value;
  }

  turnValue(): number {
    return this._value / Angle.TAU;
  }

  rad(): RadAngle {
    return this;
  }

  equals(that: unknown): boolean {
    if (that instanceof RadAngle) {
      return this._value === that._value;
    }
    return false;
  }

  hashCode(): number {
    if (RadAngle._hashSeed === void 0) {
      RadAngle._hashSeed = Murmur3.seed(RadAngle);
    }
    return Murmur3.mash(Murmur3.mix(RadAngle._hashSeed, Murmur3.hash(this._value)));
  }

  debug(output: Output): void {
    output = output.write("Angle").write(46/*'.'*/).write("rad").write(40/*'('*/)
        .debug(this._value).write(41/*')'*/);
  }

  toString(): string {
    return this._value + "rad";
  }

  private static _hashSeed?: number;
}
Angle.Rad = RadAngle;
