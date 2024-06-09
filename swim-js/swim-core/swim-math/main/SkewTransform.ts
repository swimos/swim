// Copyright 2015-2024 Nstream, inc.
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
import {Murmur3} from "@swim/util";
import {Constructors} from "@swim/util";
import {Interpolator} from "@swim/util";
import {Diagnostic} from "@swim/codec";
import type {Input} from "@swim/codec";
import type {Output} from "@swim/codec";
import {Parser} from "@swim/codec";
import {Unicode} from "@swim/codec";
import type {Item} from "@swim/structure";
import {Value} from "@swim/structure";
import {Record} from "@swim/structure";
import {Angle} from "./Angle";
import {DegAngle} from "./Angle";
import {AngleParser} from "./Angle";
import {R2Point} from "./R2Point";
import type {TransformLike} from "./Transform";
import {Transform} from "./Transform";
import {IdentityTransform} from "./IdentityTransform";
import {AffineTransform} from "./"; // forward import

/** @public */
export type SkewTransformLike = SkewTransform | string;

/** @public */
export const SkewTransformLike = {
  [Symbol.hasInstance](instance: unknown): instance is SkewTransformLike {
    return instance instanceof SkewTransform
        || typeof instance === "string";
  },
};

/** @public */
export class SkewTransform extends Transform {
  constructor(x: Angle, y: Angle) {
    super();
    this.x = x;
    this.y = y;
    this.stringValue = void 0;
  }

  readonly x: Angle;

  readonly y: Angle;

  override transform(that: Transform): Transform;
  override transform(x: number, y: number): R2Point;
  override transform(x: Transform | number, y?: number): Transform | R2Point {
    if (arguments.length === 2) {
      return new R2Point(Math.tan(this.x.radValue()) * y! + (x as number),
                         Math.tan(this.y.radValue()) * (x as number) + y!);
    } else if (x instanceof IdentityTransform) {
      return this;
    } else if (x instanceof Transform) {
      return Transform.list(this, x);
    }
    throw new TypeError("" + x);
  }

  override transformX(x: number, y: number): number {
    return Math.tan(this.x.radValue()) * y + x;
  }

  override transformY(x: number, y: number): number {
    return Math.tan(this.y.radValue()) * x + y;
  }

  override inverse(): Transform {
    return new SkewTransform(this.x.negative(), this.y.negative());
  }

  override toAffine(): AffineTransform {
    const x = this.x.radValue();
    const y = this.y.radValue();
    return new AffineTransform(1, Math.tan(y), Math.tan(x), 1, 0, 0);
  }

  override toCssTransformComponent(): CSSTransformComponent | null {
    if (typeof CSSTranslate === "undefined") {
      return null;
    }
    return new CSSSkew(this.x.toCssValue()!, this.y.toCssValue()!);
  }

  override toValue(): Value {
    return Record.create(1)
                 .attr("skew", Record.create(2).slot("x", this.x.toValue())
                                               .slot("y", this.y.toValue()));
  }

  override interpolateTo(that: SkewTransform): Interpolator<SkewTransform>;
  override interpolateTo(that: Transform): Interpolator<Transform>;
  override interpolateTo(that: unknown): Interpolator<Transform> | null;
  override interpolateTo(that: unknown): Interpolator<Transform> | null {
    if (that instanceof SkewTransform) {
      return SkewTransformInterpolator(this, that);
    }
    return super.interpolateTo(that);
  }

  override conformsTo(that: Transform): boolean {
    return that instanceof SkewTransform;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (that instanceof SkewTransform) {
      return this.x.equivalentTo(that.x, epsilon)
          && this.y.equivalentTo(that.y, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (that instanceof SkewTransform) {
      return this.x.equals(that.x) && this.y.equals(that.y);
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(SkewTransform),
        this.x.hashCode()), this.y.hashCode()));
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("Transform").write(46/*'.'*/).write("skew");
    if (this.x.isDefined() && !this.y.isDefined()) {
      output = output.write("X").write(40/*'('*/).debug(this.x);
    } else if (!this.x.isDefined() && this.y.isDefined()) {
      output = output.write("Y").write(40/*'('*/).debug(this.y);
    } else {
      output = output.write(40/*'('*/).debug(this.x).write(", ").debug(this.y);
    }
    output = output.write(41/*')'*/);
    return output;
  }

  /** @internal */
  readonly stringValue: string | undefined;

  override toString(): string {
    let stringValue = this.stringValue;
    if (stringValue === void 0) {
      if (this.x.isDefined() && !this.y.isDefined()) {
        stringValue = "skewX(" + this.x + ")";
      } else if (!this.x.isDefined() && this.y.isDefined()) {
        stringValue = "skewY(" + this.y + ")";
      } else {
        stringValue = "skew(" + this.x + "," + this.y + ")";
      }
      (this as Mutable<this>).stringValue = stringValue;
    }
    return stringValue;
  }

  override toAttributeString(): string {
    if (this.x.isDefined() && !this.y.isDefined()) {
      return "skewX(" + this.x.degValue() + ")";
    } else if (!this.x.isDefined() && this.y.isDefined()) {
      return "skewY(" + this.y.degValue() + ")";
    }
    return "skew(" + this.x.degValue() + "," + this.y.degValue() + ")";
  }

  static override fromCssTransformComponent(component: CSSSkew): SkewTransform {
    const x = typeof component.ax === "number"
            ? Angle.rad(component.ax)
            : Angle.fromCssValue(component.ax);
    const y = typeof component.ay === "number"
            ? Angle.rad(component.ay)
            : Angle.fromCssValue(component.ay);
    return new SkewTransform(x, y);
  }

  static override fromLike<T extends SkewTransformLike | null | undefined>(value: T): SkewTransform | Uninitable<T>;
  static override fromLike<T extends TransformLike | null | undefined>(value: T): never;
  static override fromLike<T extends SkewTransformLike | null | undefined>(value: T): SkewTransform | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof SkewTransform) {
      return value as SkewTransform | Uninitable<T>;
    } else if (typeof value === "string") {
      return SkewTransform.parse(value);
    }
    throw new TypeError("" + value);
  }

  static override fromValue(value: Value): SkewTransform | null {
    const header = value.header("skew");
    if (!header.isDefined()) {
      return null;
    }
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

  static override parse(string: string): SkewTransform {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = SkewTransformParser.parse(input);
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
export const SkewTransformInterpolator = (function (_super: typeof Interpolator) {
  const SkewTransformInterpolator = function (f0: SkewTransform, f1: SkewTransform): Interpolator<SkewTransform> {
    const interpolator = function (u: number): SkewTransform {
      const f0 = interpolator[0];
      const f1 = interpolator[1];
      const x = Angle.of(f0.x.value + u * (f1.x.value - f0.x.value), f1.x.units);
      const y = Angle.of(f0.y.value + u * (f1.y.value - f0.y.value), f1.y.units);
      return new SkewTransform(x, y);
    } as Interpolator<SkewTransform>;
    Object.setPrototypeOf(interpolator, SkewTransformInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = f0.x.units === f1.x.units && f0.y.units === f1.y.units
                                                      ? f0 : new SkewTransform(f0.x.to(f1.x.units), f0.y.to(f1.y.units));
    (interpolator as Mutable<typeof interpolator>)[1] = f1;
    return interpolator;
  } as {
    (f0: SkewTransform, f1: SkewTransform): Interpolator<SkewTransform>;

    /** @internal */
    prototype: Interpolator<SkewTransform>;
  };

  SkewTransformInterpolator.prototype = Object.create(_super.prototype);
  SkewTransformInterpolator.prototype.constructor = SkewTransformInterpolator;

  return SkewTransformInterpolator;
})(Interpolator);

/** @internal */
export class SkewTransformParser extends Parser<SkewTransform> {
  private readonly identOutput: Output<string> | undefined;
  private readonly xParser: Parser<Angle> | undefined;
  private readonly yParser: Parser<Angle> | undefined;
  private readonly step: number | undefined;

  constructor(identOutput?: Output<string>, xParser?: Parser<Angle>,
              yParser?: Parser<Angle>, step?: number) {
    super();
    this.identOutput = identOutput;
    this.xParser = xParser;
    this.yParser = yParser;
    this.step = step;
  }

  override feed(input: Input): Parser<SkewTransform> {
    return SkewTransformParser.parse(input, this.identOutput, this.xParser, this.yParser, this.step);
  }

  static parse(input: Input, identOutput?: Output<string>, xParser?: Parser<Angle>,
               yParser?: Parser<Angle>, step: number = 1): Parser<SkewTransform> {
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
          case "skewX":
          case "skewY":
          case "skew": step = 2; break;
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
    if (step === 3) {
      if (xParser === void 0) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input.step();
        }
        if (!input.isEmpty()) {
          xParser = AngleParser.parse(input, "deg");
        }
      } else {
        xParser = xParser.feed(input);
      }
      if (xParser !== void 0) {
        if (xParser.isDone()) {
          step = 4;
        } else if (xParser.isError()) {
          return xParser.asError();
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
            case "skewX": return Parser.done(new SkewTransform(xParser!.bind(), DegAngle.zero()));
            case "skewY": return Parser.done(new SkewTransform(DegAngle.zero(), xParser!.bind()));
            default: return Parser.error(Diagnostic.message("unknown transform function: " + ident, input));
          }
        } else if (c === 44/*','*/) {
          input.step();
          step = 5;
        } else {
          return Parser.error(Diagnostic.expected(",", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 5) {
      if (yParser === void 0) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input.step();
        }
        if (!input.isEmpty()) {
          yParser = AngleParser.parse(input, "deg");
        }
      } else {
        yParser = yParser.feed(input);
      }
      if (yParser !== void 0) {
        if (yParser.isDone()) {
          step = 6;
        } else if (yParser.isError()) {
          return yParser.asError();
        }
      }
    }
    if (step === 6) {
      while (input.isCont() && Unicode.isSpace(input.head())) {
        input.step();
      }
      if (input.isCont() && input.head() === 41/*')'*/) {
        input.step();
        const ident = identOutput!.bind();
        switch (ident) {
          case "skew": return Parser.done(new SkewTransform(xParser!.bind(), yParser!.bind()));
          default: return Parser.error(Diagnostic.message("unknown transform function: " + ident, input));
        }
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected(")", input));
      }
    }
    return new SkewTransformParser(identOutput, xParser, yParser, step);
  }

  /** @internal */
  static parseRest(input: Input, identOutput?: Output<string>): Parser<SkewTransform> {
    return SkewTransformParser.parse(input, identOutput, void 0, void 0, 2);
  }
}
