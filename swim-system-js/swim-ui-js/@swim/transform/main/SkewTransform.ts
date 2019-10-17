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
import {Output, Parser, Diagnostic, Unicode} from "@swim/codec";
import {Item, Attr, Slot, Value, Record} from "@swim/structure";
import {AnyAngle, Angle} from "@swim/angle";
import {AnyLength, Length} from "@swim/length";
import {Transform} from "./Transform";
import {AffineTransform} from "./AffineTransform";

export class SkewTransform extends Transform {
  /** @hidden */
  readonly _x: Angle;
  /** @hidden */
  readonly _y: Angle;

  constructor(x: AnyAngle, y: AnyAngle) {
    super();
    this._x = Angle.fromAny(x, "deg");
    this._y = Angle.fromAny(y, "deg");
  }

  get x(): Angle {
    return this._x;
  }

  get y(): Angle {
    return this._y;
  }

  transform(that: Transform): Transform;
  transform(point: [number, number]): [number, number];
  transform(x: number, y: number): [number, number];
  transform(point: [AnyLength, AnyLength]): [Length, Length];
  transform(x: AnyLength, y: AnyLength): [Length, Length];
  transform(x: Transform | [AnyLength, AnyLength] | AnyLength, y?: AnyLength): Transform | [number, number] | [Length, Length] {
    if (x instanceof Transform) {
      if (x instanceof Transform.Identity) {
        return this;
      } else {
        return new Transform.List([this, x]);
      }
    } else {
      if (Array.isArray(x)) {
        y = x[1];
        x = x[0];
      }
      x = Length.fromAny(x);
      y = Length.fromAny(y!);
      if (typeof x === "number" && typeof y === "number") {
        return [x + y * Math.tan(this._x.radValue()),
                x * Math.tan(this._y.radValue()) + y];
      } else {
        return [x.plus(y.times(Math.tan(this._x.radValue()))),
                x.times(Math.tan(this._y.radValue())).plus(y)];
      }
    }
  }

  transformX(x: number, y: number): number {
    return x + y * Math.tan(this._x.radValue());
  }

  transformY(x: number, y: number): number {
    return x * Math.tan(this._y.radValue()) + y;
  }

  inverse(): Transform {
    return new SkewTransform(this._x.opposite(), this._y.opposite());
  }

  toAffine(): AffineTransform {
    const x = this._x.radValue();
    const y = this._y.radValue();
    return new Transform.Affine(1, Math.tan(y), Math.tan(x), 1, 0, 0);
  }

  toValue(): Value {
    return Record.of(Attr.of("skew", Record.of(Slot.of("x", this._x.toString()),
                                               Slot.of("y", this._y.toString()))));
  }

  conformsTo(that: Transform): boolean {
    return that instanceof SkewTransform;
  }

  equals(that: Transform): boolean {
    if (that instanceof SkewTransform) {
      return this._x.equals(that._x) && this._y.equals(that._y);
    }
    return false;
  }

  hashCode(): number {
    if (SkewTransform._hashSeed === void 0) {
      SkewTransform._hashSeed = Murmur3.seed(SkewTransform);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(SkewTransform._hashSeed,
        this._x.hashCode()), this._y.hashCode()));
  }

  debug(output: Output): void {
    output = output.write("Transform").write(46/*'.'*/).write("skew");
    if (this._x.isDefined() && !this._y.isDefined()) {
      output = output.write("X").write(40/*'('*/).debug(this._x).write(41/*')'*/);
    } else if (!this._x.isDefined() && this._y.isDefined()) {
      output = output.write("Y").write(40/*'('*/).debug(this._y).write(41/*')'*/);
    } else {
      output = output.write(40/*'('*/).debug(this._x).write(", ").debug(this._y).write(41/*')'*/);
    }
  }

  toString(): string {
    if (this._x.isDefined() && !this._y.isDefined()) {
      return "skewX(" + this._x + ")";
    } else if (!this._x.isDefined() && this._y.isDefined()) {
      return "skewY(" + this._y + ")";
    } else {
      return "skew(" + this._x + "," + this._y + ")";
    }
  }

  toAttributeString(): string {
    if (this._x.isDefined() && !this._y.isDefined()) {
      return "skewX(" + this._x.degValue() + ")";
    } else if (!this._x.isDefined() && this._y.isDefined()) {
      return "skewY(" + this._y.degValue() + ")";
    } else {
      return "skew(" + this._x.degValue() + "," + this._y.degValue() + ")";
    }
  }

  private static _hashSeed?: number;

  static fromAny(value: SkewTransform | string): SkewTransform {
    if (value instanceof SkewTransform) {
      return value;
    } else if (typeof value === "string") {
      return SkewTransform.parse(value);
    }
    throw new TypeError("" + value);
  }

  static fromValue(value: Value): SkewTransform | undefined {
    const header = value.header("skew");
    if (header.isDefined()) {
      let x = Angle.zero();
      let y = Angle.zero();
      header.forEach(function (item: Item, index: number) {
        const key = item.key.stringValue();
        if (key !== void 0) {
          if (key === "x") {
            x = item.toValue().cast(Angle.form(), x);
          } else if (key === "y") {
            y = item.toValue().cast(Angle.form(), y);
          }
        } else if (item instanceof Value) {
          if (index === 0) {
            x = item.cast(Angle.form(), x);
          } else if (index === 1) {
            y = item.cast(Angle.form(), y);
          }
        }
      }, this);
      return new SkewTransform(x, y);
    }
    return void 0;
  }

  static parse(string: string): SkewTransform {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = Transform.SkewParser.parse(input);
    if (parser.isDone()) {
      while (input.isCont() && Unicode.isWhitespace(input.head())) {
        input = input.step();
      }
    }
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }
}
Transform.Skew = SkewTransform;
