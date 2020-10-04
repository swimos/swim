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

import {Murmur3} from "@swim/util";
import {Output} from "@swim/codec";
import {LengthUnits, Length} from "./Length";

export class RemLength extends Length {
  /** @hidden */
  readonly _value: number;
  /** @hidden */
  readonly _node?: Node;

  constructor(value: number, node: Node | null = null) {
    super();
    this._value = value;
    if (node !== null) {
      this._node = node;
    }
  }

  isRelative(): boolean {
    return false;
  }

  get value(): number {
    return this._value;
  }

  get units(): LengthUnits {
    return "rem";
  }

  get node(): Node | null {
    const node = this._node;
    return node !== void 0 ? node : null;
  }

  unitValue(): number {
    return Length.remUnit();
  }

  pxValue(): number {
    return this.unitValue() * this._value;
  }

  remValue(): number {
    return this._value;
  }

  rem(): RemLength {
    return this;
  }

  equals(that: unknown): boolean {
    if (that instanceof RemLength) {
      return this._value === that._value && this._node === that._node;
    }
    return false;
  }

  hashCode(): number {
    if (RemLength._hashSeed === void 0) {
      RemLength._hashSeed = Murmur3.seed(RemLength);
    }
    return Murmur3.mash(Murmur3.mix(RemLength._hashSeed, Murmur3.hash(this._value)));
  }

  debug(output: Output): void {
    output = output.write("Length").write(46/*'.'*/).write("rem").write(40/*'('*/).debug(this._value);
    if (this._node !== void 0) {
      output = output.write(", ").debug(this._node);
    }
    output = output.write(41/*')'*/);
  }

  toString(): string {
    return this._value + "rem";
  }

  private static _hashSeed?: number;

  private static _zero: RemLength;
  static zero(units?: "rem", node?: Node | null): RemLength;
  static zero(node?: Node | null): RemLength;
  static zero(units?: "rem" | Node | null, node?: Node | null): RemLength {
    if (typeof units !== "string") {
      node = units;
      units = "rem";
    }
    if (node === void 0 || node === null) {
      if (RemLength._zero === void 0) {
        RemLength._zero = new RemLength(0);
      }
      return RemLength._zero;
    } else {
      return new RemLength(0, node);
    }
  }
}
if (typeof CSSUnitValue !== "undefined") { // CSS Typed OM support
  RemLength.prototype.toCssValue = function (this: RemLength): CSSUnitValue | undefined {
    return new CSSUnitValue(this._value, "rem");
  };
}
Length.Rem = RemLength;
