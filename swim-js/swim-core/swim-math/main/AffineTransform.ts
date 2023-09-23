// Copyright 2015-2023 Nstream, inc.
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

import type {Uninitable} from "@swim/util";
import type {Mutable} from "@swim/util";
import {Lazy} from "@swim/util";
import {Murmur3} from "@swim/util";
import {Numbers} from "@swim/util";
import {Constructors} from "@swim/util";
import {Interpolator} from "@swim/util";
import {Diagnostic} from "@swim/codec";
import type {Input} from "@swim/codec";
import type {Output} from "@swim/codec";
import {Parser} from "@swim/codec";
import {Base10} from "@swim/codec";
import {Unicode} from "@swim/codec";
import type {Item} from "@swim/structure";
import {Value} from "@swim/structure";
import {Record} from "@swim/structure";
import {R2Point} from "./R2Point";
import type {TransformLike} from "./Transform";
import {Transform} from "./Transform";
import {IdentityTransform} from "./IdentityTransform";

/** @public */
export type AffineTransformLike = AffineTransform | string;

/** @public */
export const AffineTransformLike = {
  [Symbol.hasInstance](instance: unknown): instance is AffineTransformLike {
    return instance instanceof AffineTransform
        || typeof instance === "string";
  },
};

/** @public */
export class AffineTransform extends Transform {
  constructor(x0: number, y0: number, x1: number, y1: number, tx: number, ty: number) {
    super();
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x1;
    this.y1 = y1;
    this.tx = tx;
    this.ty = ty;
    this.stringValue = void 0;
  }

  readonly x0: number;

  readonly y0: number;

  readonly x1: number;

  readonly y1: number;

  readonly tx: number;

  readonly ty: number;

  override transform(that: Transform): Transform;
  override transform(x: number, y: number): R2Point;
  override transform(x: Transform | number, y?: number): Transform | R2Point {
    if (arguments.length === 2) {
      return new R2Point(this.x0 * (x as number) + this.x1 * y! + this.tx,
                         this.y0 * (x as number) + this.y1 * y! + this.ty);
    } else if (x instanceof IdentityTransform) {
      return this;
    } else if (x instanceof Transform) {
      return this.multiply(x.toAffine());
    }
    throw new TypeError("" + x);
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
    if (Math.abs(det) < Number.MIN_VALUE) {
      throw new Error("non-invertible affine transform with determinant " + det);
    }
    return new AffineTransform( m11 / det, -m10 / det,
                               -m01 / det,  m00 / det,
                               (m01 * m12 - m11 * m02) / det,
                               (m10 * m02 - m00 * m12) / det);
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
    if (typeof CSSTranslate === "undefined") {
      return null;
    }
    return new CSSMatrixComponent(this.toMatrix());
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
    }
    return super.interpolateTo(that);
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

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("Transform").write(46/*'.'*/).write("affine").write(40/*'('*/)
                   .debug(this.x0).write(", ").debug(this.y0).write(", ")
                   .debug(this.x1).write(", ").debug(this.y1).write(", ")
                   .debug(this.tx).write(", ").debug(this.ty).write(41/*')'*/);
    return output;
  }

  /** @internal */
  readonly stringValue: string | undefined;

  override toString(): string {
    let stringValue = this.stringValue;
    if (stringValue === void 0) {
      stringValue = "matrix(" + this.x0 + "," + this.y0 + ","
                              + this.x1 + "," + this.y1 + ","
                              + this.tx + "," + this.ty + ")";
      (this as Mutable<this>).stringValue = stringValue;
    }
    return stringValue;
  }

  @Lazy
  static override identity(): AffineTransform {
    return new AffineTransform(1, 0, 0, 1, 0, 0);
  }

  static override fromLike<T extends AffineTransformLike | null | undefined>(value: T): AffineTransform | Uninitable<T>;
  static override fromLike<T extends TransformLike | null | undefined>(value: T): never;
  static override fromLike<T extends AffineTransformLike | null | undefined>(value: T): AffineTransform | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof AffineTransform) {
      return value as AffineTransform | Uninitable<T>;
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
    if (!header.isDefined()) {
      return null;
    }
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

/** @internal */
export const AffineTransformInterpolator = (function (_super: typeof Interpolator) {
  const AffineTransformInterpolator = function (f0: AffineTransform, f1: AffineTransform): Interpolator<AffineTransform> {
    const interpolator = function (u: number): AffineTransform {
      // TODO: interpolate and recompose matrices
      const f0 = interpolator[0];
      const f1 = interpolator[1];
      const x0 = f0.x0 + u * (f1.x0 - f0.x0);
      const y0 = f0.y0 + u * (f1.y0 - f0.y0);
      const x1 = f0.x1 + u * (f1.x1 - f0.x1);
      const y1 = f0.y1 + u * (f1.y1 - f0.y1);
      const tx = f0.tx + u * (f1.tx - f0.tx);
      const ty = f0.ty + u * (f1.ty - f0.ty);
      return new AffineTransform(x0, y0, x1, y1, tx, ty);
    } as Interpolator<AffineTransform>;
    Object.setPrototypeOf(interpolator, AffineTransformInterpolator.prototype);
    // TODO: decompose matrices
    (interpolator as Mutable<typeof interpolator>)[0] = f0;
    (interpolator as Mutable<typeof interpolator>)[1] = f1;
    return interpolator;
  } as {
    (f0: AffineTransform, f1: AffineTransform): Interpolator<AffineTransform>;

    /** @internal */
    prototype: Interpolator<AffineTransform>;
  };

  AffineTransformInterpolator.prototype = Object.create(_super.prototype);
  AffineTransformInterpolator.prototype.constructor = AffineTransformInterpolator;

  return AffineTransformInterpolator;
})(Interpolator);

/** @internal */
export class AffineTransformParser extends Parser<AffineTransform> {
  private readonly identOutput: Output<string> | undefined;
  private readonly entries: number[] | undefined;
  private readonly entryParser: Parser<number> | undefined;
  private readonly step: number | undefined;

  constructor(identOutput?: Output<string>, entries?: number[],
              entryParser?: Parser<number>, step?: number) {
    super();
    this.identOutput = identOutput;
    this.entries = entries;
    this.entryParser = entryParser;
    this.step = step;
  }

  override feed(input: Input): Parser<AffineTransform> {
    return AffineTransformParser.parse(input, this.identOutput, this.entries, this.entryParser, this.step);
  }

  static parse(input: Input, identOutput?: Output<string>, entries: number[] = [],
               entryParser?: Parser<number>, step: number = 1): Parser<AffineTransform> {
    let c = 0;
    if (step === 1) {
      identOutput = identOutput || Unicode.stringOutput();
      while (input.isCont() && (c = input.head(), Unicode.isAlpha(c))) {
        input = input.step();
        identOutput.write(c);
      }
      if (!input.isEmpty()) {
        const ident = identOutput.bind();
        switch (ident) {
          case "matrix": step = 2; break;
          default: return Parser.error(Diagnostic.message("unknown transform function: " + ident, input));
        }
      }
    }
    if (step === 2) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont() && c === 40/*'('*/) {
        input.step();
        step = 3;
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected("(", input));
      }
    }
    do {
      if (step === 3) {
        if (entryParser === void 0) {
          while (input.isCont() && Unicode.isSpace(input.head())) {
            input.step();
          }
          if (!input.isEmpty()) {
            entryParser = Base10.parseNumber(input);
          }
        } else {
          entryParser = entryParser.feed(input);
        }
        if (entryParser !== void 0) {
          if (entryParser.isDone()) {
            entries.push(entryParser.bind());
            entryParser = void 0;
            step = 4;
          } else if (entryParser.isError()) {
            return entryParser.asError();
          }
        }
      }
      if (step === 4) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input.step();
        }
        if (input.isCont()) {
          c = input.head();
          if (c === 41/*')'*/) {
            input.step();
            const ident = identOutput!.bind();
            switch (ident) {
              case "matrix": return Parser.done(Transform.affine(...entries));
              default: return Parser.error(Diagnostic.message("unknown transform function: " + ident, input));
            }
          } else if (entries.length >= 6) {
            return Parser.error(Diagnostic.expected(")", input));
          } else if (c === 44/*','*/) {
            input.step();
            step = 3;
            continue;
          } else {
            return Parser.error(Diagnostic.expected(",", input));
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      break;
    } while (true);
    return new AffineTransformParser(identOutput, entries, entryParser, step);
  }

  /** @internal */
  static parseRest(input: Input, identOutput?: Output<string>): Parser<AffineTransform> {
    return AffineTransformParser.parse(input, identOutput, void 0, void 0, 2);
  }
}
