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
import {Output, Parser, Diagnostic, Unicode} from "@swim/codec";
import {Item, Attr, Slot, Value, Record} from "@swim/structure";
import {AnyLength, Length} from "@swim/length";
import {Transform} from "./Transform";
import {AffineTransform} from "./AffineTransform";

export class TranslateTransform extends Transform {
  /** @hidden */
  readonly _x: Length;
  /** @hidden */
  readonly _y: Length;

  constructor(x: AnyLength, y: AnyLength) {
    super();
    this._x = Length.fromAny(x);
    this._y = Length.fromAny(y);
  }

  get x(): Length {
    return this._x;
  }

  get y(): Length {
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
        return [x + this._x.pxValue(), y + this._y.pxValue()];
      } else {
        x = Length.fromAny(x);
        y = Length.fromAny(y!);
        return [x.plus(this._x), y.plus(this._y)];
      }
    }
  }

  transformX(x: number, y: number): number {
    return x + this._x.pxValue();
  }

  transformY(x: number, y: number): number {
    return y + this._y.pxValue();
  }

  inverse(): Transform {
    return new TranslateTransform(this._x.opposite(), this._y.opposite());
  }

  toAffine(): AffineTransform {
    return new Transform.Affine(1, 0, 0, 1, this._x.pxValue(), this._y.pxValue());
  }

  toValue(): Value {
    return Record.of(Attr.of("translate", Record.of(Slot.of("x", this._x.toString()),
                                                    Slot.of("y", this._y.toString()))));
  }

  conformsTo(that: Transform): boolean {
    return that instanceof TranslateTransform;
  }

  equals(that: Transform): boolean {
    if (that instanceof TranslateTransform) {
      return this._x.equals(that._x) && this._y.equals(that._y);
    }
    return false;
  }

  hashCode(): number {
    if (TranslateTransform._hashSeed === void 0) {
      TranslateTransform._hashSeed = Murmur3.seed(TranslateTransform);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(TranslateTransform._hashSeed,
        this._x.hashCode()), this._y.hashCode()));
  }

  debug(output: Output): void {
    output = output.write("Transform").write(46/*'.'*/).write("translate");
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
      return "translate(" + this._x + ",0)";
    } else if (!this._x.isDefined() && this._y.isDefined()) {
      return "translate(0," + this._y + ")";
    } else {
      return "translate(" + this._x + "," + this._y + ")";
    }
  }

  toAttributeString(): string {
    if (this._x.isDefined() && !this._y.isDefined()) {
      return "translate(" + this._x.pxValue() + ",0)";
    } else if (!this._x.isDefined() && this._y.isDefined()) {
      return "translate(0," + this._y.pxValue() + ")";
    } else {
      return "translate(" + this._x.pxValue() + "," + this._y.pxValue() + ")";
    }
  }

  private static _hashSeed?: number;

  static fromAny(value: TranslateTransform | string): TranslateTransform {
    if (value instanceof TranslateTransform) {
      return value;
    } else if (typeof value === "string") {
      return TranslateTransform.parse(value);
    }
    throw new TypeError("" + value);
  }

  static fromValue(value: Value): TranslateTransform | undefined {
    const header = value.header("translate");
    if (header.isDefined()) {
      let x = Length.zero();
      let y = Length.zero();
      header.forEach(function (item: Item, index: number) {
        const key = item.key.stringValue();
        if (key !== void 0) {
          if (key === "x") {
            x = item.toValue().cast(Length.form(), x);
          } else if (key === "y") {
            y = item.toValue().cast(Length.form(), y);
          }
        } else if (item instanceof Value) {
          if (index === 0) {
            x = item.cast(Length.form(), x);
          } else if (index === 1) {
            y = item.cast(Length.form(), y);
          }
        }
      }, this);
      return new TranslateTransform(x, y);
    }
    return void 0;
  }

  static parse(string: string): TranslateTransform {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = Transform.TranslateParser.parse(input);
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
Transform.Translate = TranslateTransform;
