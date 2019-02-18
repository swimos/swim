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
import {AnyLength, Length} from "@swim/length";
import {Transform} from "./Transform";
import {AffineTransform} from "./AffineTransform";

export class ScaleTransform extends Transform {
  /** @hidden */
  readonly _x: number;
  /** @hidden */
  readonly _y: number;

  constructor(x: string | number, y: string | number) {
    super();
    this._x = +x;
    this._y = +y;
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
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
      if (typeof x === "number" && typeof y === "number") {
        return [x * this._x, y * this._y];
      } else {
        x = Length.fromAny(x);
        y = Length.fromAny(y!);
        return [x.times(this._x), y.times(this._y)];
      }
    }
  }

  transformX(x: number, y: number): number {
    return x * this._x;
  }

  transformY(x: number, y: number): number {
    return y * this._y;
  }

  inverse(): Transform {
    return new ScaleTransform(1 / (this._x || 1), 1 / (this._y || 1));
  }

  toAffine(): AffineTransform {
    return new Transform.Affine(this._x, 0, 0, this._y, 0, 0);
  }

  toValue(): Value {
    return Record.of(Attr.of("scale", Record.of(Slot.of("x", this._x),
                                                Slot.of("y", this._y))));
  }

  conformsTo(that: Transform): boolean {
    return that instanceof ScaleTransform;
  }

  equals(that: Transform): boolean {
    if (that instanceof ScaleTransform) {
      return this._x === that._x && this._y === that._y;
    }
    return false;
  }

  hashCode(): number {
    if (ScaleTransform._hashSeed === void 0) {
      ScaleTransform._hashSeed = Murmur3.seed(ScaleTransform);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(ScaleTransform._hashSeed,
        Murmur3.hash(this._x)), Murmur3.hash(this._y)));
  }

  debug(output: Output): void {
    output = output.write("Transform").write(46/*'.'*/).write("scale");
    if (this._x && !this._y) {
      output = output.write("X").write(40/*'('*/).debug(this._x).write(41/*')'*/);
    } else if (!this._x && this._y) {
      output = output.write("Y").write(40/*'('*/).debug(this._y).write(41/*')'*/);
    } else {
      output = output.write(40/*'('*/).debug(this._x).write(", ").debug(this._y).write(41/*')'*/);
    }
  }

  toString(): string {
    if (this._x && !this._y) {
      return "scaleX(" + this._x + ")";
    } else if (!this._x && this._y) {
      return "scaleY(" + this._y + ")";
    } else {
      return "scale(" + this._x + "," + this._y + ")";
    }
  }

  private static _hashSeed?: number;

  static fromAny(value: ScaleTransform | string): ScaleTransform {
    if (value instanceof ScaleTransform) {
      return value;
    } else if (typeof value === "string") {
      return ScaleTransform.parse(value);
    }
    throw new TypeError("" + value);
  }

  static fromValue(value: Value): ScaleTransform | undefined {
    const header = value.header("scale");
    if (header.isDefined()) {
      let x = 0;
      let y = 0;
      header.forEach(function (item: Item, index: number) {
        const key = item.key.stringValue();
        if (key !== void 0) {
          if (key === "x") {
            x = item.toValue().numberValue(x);
          } else if (key === "y") {
            y = item.toValue().numberValue(y);
          }
        } else if (item instanceof Value) {
          if (index === 0) {
            x = item.numberValue(x);
          } else if (index === 1) {
            y = item.numberValue(y);
          }
        }
      }, this);
      return new ScaleTransform(x, y);
    }
    return void 0;
  }

  static parse(string: string): ScaleTransform {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = Transform.ScaleParser.parse(input);
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
Transform.Scale = ScaleTransform;
