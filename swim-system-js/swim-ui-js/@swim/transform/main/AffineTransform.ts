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
import {Item, Attr, Value, Record} from "@swim/structure";
import {AnyLength, Length} from "@swim/length";
import {Transform} from "./Transform";

export class AffineTransform extends Transform {
  /** @hidden */
  readonly _x0: number;
  /** @hidden */
  readonly _y0: number;
  /** @hidden */
  readonly _x1: number;
  /** @hidden */
  readonly _y1: number;
  /** @hidden */
  readonly _tx: number;
  /** @hidden */
  readonly _ty: number;

  constructor(x0: string | number = 1, y0: string | number = 0,
              x1: string | number = 0, y1: string | number = 1,
              tx: string | number = 0, ty: string | number = 0) {
    super();
    this._x0 = +x0;
    this._y0 = +y0;
    this._x1 = +x1;
    this._y1 = +y1;
    this._tx = +tx;
    this._ty = +ty;
  }

  get x0(): number {
    return this._x0;
  }

  get y0(): number {
    return this._y0;
  }

  get x1(): number {
    return this._x1;
  }

  get y1(): number {
    return this._y1;
  }

  get tx(): number {
    return this._tx;
  }

  get ty(): number {
    return this._ty;
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
        return this.multiply(x.toAffine());
      }
    } else {
      if (Array.isArray(x)) {
        y = x[1];
        x = x[0];
      }
      x = Length.fromAny(x);
      y = Length.fromAny(y!);
      if (typeof x === "number" && typeof y === "number") {
        return [x * this._x0 + y * this._x1 + this._tx,
                x * this._y0 + y * this._y1 + this._ty];
      } else {
        return [x.times(this._x0).plus(y.times(this._x1)).plus(this._tx),
                x.times(this._y0).plus(y.times(this._y1)).plus(this._ty)];
      }
    }
  }

  transformX(x: number, y: number): number {
    return x * this._x0 + y * this._x1 + this._tx;
  }

  transformY(x: number, y: number): number {
    return x * this._y0 + y * this._y1 + this._ty;
  }

  inverse(): Transform {
    const m00 = this._x0;
    const m10 = this._y0;
    const m01 = this._x1;
    const m11 = this._y1;
    const m02 = this._tx;
    const m12 = this._ty;
    const det = m00 * m11 - m01 * m10;
    if (Math.abs(det) >= Number.MIN_VALUE) {
      return new AffineTransform( m11 / det, -m10 / det,
                                 -m01 / det,  m00 / det,
                                 (m01 * m12 - m11 * m02) / det,
                                 (m10 * m02 - m00 * m12) / det);
    } else {
      throw new Error("non-invertible affine transform with determinant " + det);
    }
  }

  multiply(that: AffineTransform): AffineTransform {
    const x0 = this._x0 * that._x0 + this._x1 * that._y0;
    const y0 = this._y0 * that._x0 + this._y1 * that._y0;
    const x1 = this._x0 * that._x1 + this._x1 * that._y1;
    const y1 = this._y0 * that._x1 + this._y1 * that._y1;
    const tx = this._x0 * that._tx + this._x1 * that._ty;
    const ty = this._y0 * that._tx + this._y1 * that._ty;
    return new AffineTransform(x0, y0, x1, y1, tx, ty);
  }

  toAffine(): AffineTransform {
    return this;
  }

  toValue(): Value {
    return Record.of(Attr.of("matrix", Record.of(this._x0, this._y0,
                                                 this._x1, this._y1,
                                                 this._tx, this._ty)));
  }

  conformsTo(that: Transform): boolean {
    return that instanceof AffineTransform;
  }

  equals(that: Transform): boolean {
    if (that instanceof AffineTransform) {
      return this._x0 === that._x0 && this._y0 === that._y0 &&
             this._x1 === that._x1 && this._y1 === that._y1 &&
             this._tx === that._tx && this._ty === that._ty;
    }
    return false;
  }

  hashCode(): number {
    if (AffineTransform._hashSeed === void 0) {
      AffineTransform._hashSeed = Murmur3.seed(AffineTransform);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Murmur3.mix(Murmur3.mix( AffineTransform._hashSeed,
        Murmur3.hash(this._x0)), Murmur3.hash(this._y0)),
        Murmur3.hash(this._x1)), Murmur3.hash(this._y1)),
        Murmur3.hash(this._tx)), Murmur3.hash(this._ty)));
  }

  debug(output: Output): void {
    output = output.write("Transform").write(46/*'.'*/).write("affine").write(40/*'('*/)
        .debug(this._x0).write(", ").debug(this._y0).write(", ")
        .debug(this._x1).write(", ").debug(this._y1).write(", ")
        .debug(this._tx).write(", ").debug(this._ty).write(41/*')'*/);
  }

  toString(): string {
    return "matrix(" + this._x0 + "," + this._y0 + ","
                     + this._x1 + "," + this._y1 + ","
                     + this._tx + "," + this._ty + ")";
  }

  private static _hashSeed?: number;

  private static _identityMatrix: AffineTransform;
  static identity(): AffineTransform {
    if (!AffineTransform._identityMatrix) {
      AffineTransform._identityMatrix = new AffineTransform();
    }
    return AffineTransform._identityMatrix;
  }

  static fromAny(value: AffineTransform | string): AffineTransform {
    if (value instanceof AffineTransform) {
      return value;
    } else if (typeof value === "string") {
      return AffineTransform.parse(value);
    }
    throw new TypeError("" + value);
  }

  static fromValue(value: Value): AffineTransform | undefined {
    const header = value.header("matrix");
    if (header.isDefined()) {
      let x0 = 0;
      let y0 = 0;
      let x1 = 0;
      let y1 = 0;
      let tx = 0;
      let ty = 0;
      header.forEach(function (item: Item, index: number) {
        const key = item.key.stringValue();
        if (key !== void 0) {
          if (key === "x0") {
            x0 = item.toValue().numberValue(x0);
          } else if (key === "y0") {
            y0 = item.toValue().numberValue(y0);
          } else if (key === "x1") {
            x1 = item.toValue().numberValue(x1);
          } else if (key === "y1") {
            y1 = item.toValue().numberValue(y1);
          } else if (key === "tx") {
            tx = item.toValue().numberValue(tx);
          } else if (key === "ty") {
            ty = item.toValue().numberValue(ty);
          }
        } else if (item instanceof Value) {
          switch (index) {
            case 0: x0 = item.numberValue(x0); break;
            case 1: y0 = item.numberValue(y0); break;
            case 2: x1 = item.numberValue(x1); break;
            case 3: y1 = item.numberValue(y1); break;
            case 4: tx = item.numberValue(tx); break;
            case 5: ty = item.numberValue(ty); break;
            default:
          }
        }
      }, this);
      return new AffineTransform(x0, y0, x1, y1, tx, ty);
    }
    return void 0;
  }

  static parse(string: string): AffineTransform {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = Transform.AffineParser.parse(input);
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
Transform.Affine = AffineTransform;
