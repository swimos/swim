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
import {Output, Parser, Diagnostic, Unicode} from "@swim/codec";
import type {Interpolator} from "@swim/mapping";
import {Item, Value, Record} from "@swim/structure";
import {R2Point} from "../r2/R2Point";
import {Transform} from "./Transform";
import {IdentityTransform} from "./IdentityTransform";
import {AffineTransformInterpolator} from "../"; // forward import
import {AffineTransformParser} from "../"; // forward import

export class AffineTransform extends Transform {
  constructor(x0: number, y0: number, x1: number, y1: number, tx: number, ty: number) {
    super();
    Object.defineProperty(this, "x0", {
      value: x0,
      enumerable: true,
    });
    Object.defineProperty(this, "y0", {
      value: y0,
      enumerable: true,
    });
    Object.defineProperty(this, "x1", {
      value: x1,
      enumerable: true,
    });
    Object.defineProperty(this, "y1", {
      value: y1,
      enumerable: true,
    });
    Object.defineProperty(this, "tx", {
      value: tx,
      enumerable: true,
    });
    Object.defineProperty(this, "ty", {
      value: ty,
      enumerable: true,
    });
    Object.defineProperty(this, "stringValue", {
      value: void 0,
      enumerable: true,
      configurable: true,
    });
  }

  readonly x0!: number;

  readonly y0!: number;

  readonly x1!: number;

  readonly y1!: number;

  readonly tx!: number;

  readonly ty!: number;

  override transform(that: Transform): Transform;
  override transform(x: number, y: number): R2Point;
  override transform(x: Transform | number, y?: number): Transform | R2Point {
    if (arguments.length === 1) {
      if (x instanceof IdentityTransform) {
        return this;
      } else {
        return this.multiply((x as Transform).toAffine());
      }
    } else {
      return new R2Point(this.x0 * (x as number) + this.x1 * y! + this.tx,
                         this.y0 * (x as number) + this.y1 * y! + this.ty);
    }
  }

  override transformX(x: number, y: number): number {
    return this.x0 * x + this.x1 * y + this.tx;
  }

  override transformY(x: number, y: number): number {
    return this.y0 * x + this.y1 * y + this.ty;
  }

  override inverse(): Transform {
    const m00 = this.x0;
    const m10 = this.y0;
    const m01 = this.x1;
    const m11 = this.y1;
    const m02 = this.tx;
    const m12 = this.ty;
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
    const x0 = this.x0 * that.x0 + this.x1 * that.y0;
    const y0 = this.y0 * that.x0 + this.y1 * that.y0;
    const x1 = this.x0 * that.x1 + this.x1 * that.y1;
    const y1 = this.y0 * that.x1 + this.y1 * that.y1;
    const tx = this.x0 * that.tx + this.x1 * that.ty;
    const ty = this.y0 * that.tx + this.y1 * that.ty;
    return new AffineTransform(x0, y0, x1, y1, tx, ty);
  }

  override toAffine(): AffineTransform {
    return this;
  }

  override toMatrix(): DOMMatrix {
    return new DOMMatrix([this.x0, this.y0, this.x1, this.y1, this.tx, this.ty]);
  }

  override toCssTransformComponent(): CSSTransformComponent | null {
    if (typeof CSSTranslate !== "undefined") {
      return new CSSMatrixComponent(this.toMatrix());
    }
    return null;
  }

  override toValue(): Value {
    return Record.create(1)
                 .attr("matrix", Record.create(6).item(this.x0).item(this.y0)
                                                 .item(this.x1).item(this.y1)
                                                 .item(this.tx).item(this.ty));
  }

  override interpolateTo(that: AffineTransform): Interpolator<AffineTransform>;
  override interpolateTo(that: Transform): Interpolator<Transform>;
  override interpolateTo(that: unknown): Interpolator<Transform> | null;
  override interpolateTo(that: unknown): Interpolator<Transform> | null {
    if (that instanceof AffineTransform) {
      return AffineTransformInterpolator(this, that);
    } else {
      return super.interpolateTo(that);
    }
  }

  override conformsTo(that: Transform): boolean {
    return that instanceof AffineTransform;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (that instanceof AffineTransform) {
      return Numbers.equivalent(this.x0, that.x0, epsilon)
          && Numbers.equivalent(this.y0, that.y0, epsilon)
          && Numbers.equivalent(this.x1, that.x1, epsilon)
          && Numbers.equivalent(this.y1, that.y1, epsilon)
          && Numbers.equivalent(this.tx, that.tx, epsilon)
          && Numbers.equivalent(this.ty, that.ty, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (that instanceof AffineTransform) {
      return this.x0 === that.x0 && this.y0 === that.y0
          && this.x1 === that.x1 && this.y1 === that.y1
          && this.tx === that.tx && this.ty === that.ty;
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Murmur3.mix(Murmur3.mix(Constructors.hash(AffineTransform),
        Numbers.hash(this.x0)), Numbers.hash(this.y0)),
        Numbers.hash(this.x1)), Numbers.hash(this.y1)),
        Numbers.hash(this.tx)), Numbers.hash(this.ty)));
  }

  override debug(output: Output): void {
    output = output.write("Transform").write(46/*'.'*/).write("affine").write(40/*'('*/)
        .debug(this.x0).write(", ").debug(this.y0).write(", ")
        .debug(this.x1).write(", ").debug(this.y1).write(", ")
        .debug(this.tx).write(", ").debug(this.ty).write(41/*')'*/);
  }

  /** @hidden */
  readonly stringValue!: string | undefined;

  override toString(): string {
    let stringValue = this.stringValue;
    if (stringValue === void 0) {
      stringValue = "matrix(" + this.x0 + "," + this.y0 + ","
                              + this.x1 + "," + this.y1 + ","
                              + this.tx + "," + this.ty + ")";
      Object.defineProperty(this, "stringValue", {
        value: stringValue,
        enumerable: true,
        configurable: true,
      });
    }
    return stringValue;
  }

  @Lazy
  static override identity(): AffineTransform {
    return new AffineTransform(1, 0, 0, 1, 0, 0);
  }

  static override fromAny(value: AffineTransform | string): AffineTransform {
    if (value === void 0 || value === null || value instanceof AffineTransform) {
      return value;
    } else if (typeof value === "string") {
      return AffineTransform.parse(value);
    }
    throw new TypeError("" + value);
  }

  static fromMatrix(matrix: DOMMatrixReadOnly): AffineTransform {
    return new AffineTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
  }

  static override fromCssTransformComponent(component: CSSMatrixComponent): AffineTransform {
    return AffineTransform.fromMatrix(component.matrix);
  }

  static override fromValue(value: Value): AffineTransform | null {
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
    return null;
  }

  static override parse(string: string): AffineTransform {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = AffineTransformParser.parse(input);
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
