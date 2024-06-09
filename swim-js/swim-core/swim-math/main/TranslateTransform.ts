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
import {Length} from "./Length";
import {PxLength} from "./Length";
import {LengthParser} from "./Length";
import {R2Point} from "./R2Point";
import type {TransformLike} from "./Transform";
import {Transform} from "./Transform";
import {IdentityTransform} from "./IdentityTransform";
import {AffineTransform} from "./"; // forward import

/** @public */
export type TranslateTransformLike = TranslateTransform | string;

/** @public */
export const TranslateTransformLike = {
  [Symbol.hasInstance](instance: unknown): instance is TranslateTransformLike {
    return instance instanceof TranslateTransform
        || typeof instance === "string";
  },
};

/** @public */
export class TranslateTransform extends Transform {
  constructor(x: Length, y: Length) {
    super();
    this.x = x;
    this.y = y;
    this.stringValue = void 0;
  }

  readonly x: Length;

  readonly y: Length;

  override transform(that: Transform): Transform;
  override transform(x: number, y: number): R2Point;
  override transform(x: Transform | number, y?: number): Transform | R2Point {
    if (arguments.length === 2) {
      return new R2Point(this.x.pxValue() + (x as number), this.y.pxValue() + y!);
    } else if (x instanceof IdentityTransform) {
      return this;
    } else if (x instanceof TranslateTransform) {
      return new TranslateTransform(this.x.plus(x.x), this.y.plus(x.y));
    } else if (x instanceof Transform) {
      return Transform.list(this, x);
    }
    throw new TypeError("" + x);
  }

  override transformX(x: number, y: number): number {
    return this.x.pxValue() + x;
  }

  override transformY(x: number, y: number): number {
    return this.y.pxValue() + y;
  }

  override inverse(): Transform {
    return new TranslateTransform(this.x.negative(), this.y.negative());
  }

  override toAffine(): AffineTransform {
    return new AffineTransform(1, 0, 0, 1, this.x.pxValue(), this.y.pxValue());
  }

  override toCssTransformComponent(): CSSTransformComponent | null {
    if (typeof CSSTranslate === "undefined") {
      return null;
    }
    return new CSSTranslate(this.x.toCssValue()!, this.y.toCssValue()!);
  }

  override toValue(): Value {
    return Record.create(1)
                 .attr("translate", Record.create(2).slot("x", this.x.toValue())
                                                    .slot("y", this.y.toValue()));
  }

  override interpolateTo(that: TranslateTransform): Interpolator<TranslateTransform>;
  override interpolateTo(that: Transform): Interpolator<Transform>;
  override interpolateTo(that: unknown): Interpolator<Transform> | null;
  override interpolateTo(that: unknown): Interpolator<Transform> | null {
    if (that instanceof TranslateTransform) {
      return TranslateTransformInterpolator(this, that);
    }
    return super.interpolateTo(that);
  }

  override conformsTo(that: Transform): boolean {
    return that instanceof TranslateTransform;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (that instanceof TranslateTransform) {
      return this.x.equivalentTo(that.x, epsilon)
          && this.y.equivalentTo(that.y, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (that instanceof TranslateTransform) {
      return this.x.equals(that.x) && this.y.equals(that.y);
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(TranslateTransform),
        this.x.hashCode()), this.y.hashCode()));
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("Transform").write(46/*'.'*/).write("translate");
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
        stringValue = "translate(" + this.x + ",0)";
      } else if (!this.x.isDefined() && this.y.isDefined()) {
        stringValue = "translate(0," + this.y + ")";
      } else {
        stringValue = "translate(" + this.x + "," + this.y + ")";
      }
      (this as Mutable<this>).stringValue = stringValue;
    }
    return stringValue;
  }

  override toAttributeString(): string {
    if (this.x.isDefined() && !this.y.isDefined()) {
      return "translate(" + this.x.pxValue() + ",0)";
    } else if (!this.x.isDefined() && this.y.isDefined()) {
      return "translate(0," + this.y.pxValue() + ")";
    }
    return "translate(" + this.x.pxValue() + "," + this.y.pxValue() + ")";
  }

  static override fromCssTransformComponent(component: CSSTranslate): TranslateTransform {
    const x = typeof component.x === "number"
            ? Length.px(component.x)
            : Length.fromCssValue(component.x);
    const y = typeof component.y === "number"
            ? Length.px(component.y)
            : Length.fromCssValue(component.y);
    return new TranslateTransform(x, y);
  }

  static override fromLike<T extends TranslateTransformLike | null | undefined>(value: T): TranslateTransform | Uninitable<T>;
  static override fromLike<T extends TransformLike | null | undefined>(value: T): never;
  static override fromLike<T extends TranslateTransformLike | null | undefined>(value: T): TranslateTransform | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof TranslateTransform) {
      return value as TranslateTransform | Uninitable<T>;
    } else if (typeof value === "string") {
      return TranslateTransform.parse(value);
    }
    throw new TypeError("" + value);
  }

  static override fromValue(value: Value): TranslateTransform | null {
    const header = value.header("translate");
    if (!header.isDefined()) {
      return null;
    }
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

  static override parse(string: string): TranslateTransform {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = TranslateTransformParser.parse(input);
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
export const TranslateTransformInterpolator = (function (_super: typeof Interpolator) {
  const TranslateTransformInterpolator = function (f0: TranslateTransform, f1: TranslateTransform): Interpolator<TranslateTransform> {
    const interpolator = function (u: number): TranslateTransform {
      const f0 = interpolator[0];
      const f1 = interpolator[1];
      const x = Length.of(f0.x.value + u * (f1.x.value - f0.x.value), f1.x.units);
      const y = Length.of(f0.y.value + u * (f1.y.value - f0.y.value), f1.y.units);
      return new TranslateTransform(x, y);
    } as Interpolator<TranslateTransform>;
    Object.setPrototypeOf(interpolator, TranslateTransformInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = f0.x.units === f1.x.units && f0.y.units === f1.y.units
                                                      ? f0 : new TranslateTransform(f0.x.to(f1.x.units), f0.y.to(f1.y.units));
    (interpolator as Mutable<typeof interpolator>)[1] = f1;
    return interpolator;
  } as {
    (f0: TranslateTransform, f1: TranslateTransform): Interpolator<TranslateTransform>;

    /** @internal */
    prototype: Interpolator<TranslateTransform>;
  };

  TranslateTransformInterpolator.prototype = Object.create(_super.prototype);
  TranslateTransformInterpolator.prototype.constructor = TranslateTransformInterpolator;

  return TranslateTransformInterpolator;
})(Interpolator);

/** @internal */
export class TranslateTransformParser extends Parser<TranslateTransform> {
  private readonly identOutput: Output<string> | undefined;
  private readonly xParser: Parser<Length> | undefined;
  private readonly yParser: Parser<Length> | undefined;
  private readonly zParser: Parser<Length> | undefined;
  private readonly step: number | undefined;

  constructor(identOutput?: Output<string>, xParser?: Parser<Length>,
              yParser?: Parser<Length>, zParser?: Parser<Length>, step?: number) {
    super();
    this.identOutput = identOutput;
    this.xParser = xParser;
    this.yParser = yParser;
    this.zParser = zParser;
    this.step = step;
  }

  override feed(input: Input): Parser<TranslateTransform> {
    return TranslateTransformParser.parse(input, this.identOutput, this.xParser,
                                          this.yParser, this.zParser, this.step);
  }

  static parse(input: Input, identOutput?: Output<string>, xParser?: Parser<Length>,
               yParser?: Parser<Length>, zParser?: Parser<Length>,
               step: number = 1): Parser<TranslateTransform> {
    let c = 0;
    if (step === 1) {
      identOutput = identOutput || Unicode.stringOutput();
      while (input.isCont() && (c = input.head(), Unicode.isAlpha(c) || Unicode.isDigit(c) || c === 45/*'-'*/)) {
        input = input.step();
        identOutput.write(c);
      }
      if (!input.isEmpty()) {
        const ident = identOutput.bind();
        switch (ident) {
          case "translate3d":
          case "translateX":
          case "translateY":
          case "translate": step = 2; break;
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
          xParser = LengthParser.parse(input, "px");
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
            case "translateX": return Parser.done(new TranslateTransform(xParser!.bind(), PxLength.zero()));
            case "translateY": return Parser.done(new TranslateTransform(PxLength.zero(), xParser!.bind()));
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
          yParser = LengthParser.parse(input, "px");
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
      if (input.isCont()) {
        c = input.head();
        if (c === 41/*')'*/) {
          input.step();
          const ident = identOutput!.bind();
          switch (ident) {
            case "translate": return Parser.done(new TranslateTransform(xParser!.bind(), yParser!.bind()));
            default: return Parser.error(Diagnostic.message("unknown transform function: " + ident, input));
          }
        } else if (c === 44/*','*/) {
          input.step();
          step = 7;
        } else {
          return Parser.error(Diagnostic.expected(",", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 7) {
      if (zParser === void 0) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input.step();
        }
        if (!input.isEmpty()) {
          zParser = LengthParser.parse(input, "px");
        }
      } else {
        zParser = zParser.feed(input);
      }
      if (zParser !== void 0) {
        if (zParser.isDone()) {
          step = 8;
        } else if (zParser.isError()) {
          return zParser.asError();
        }
      }
    }
    if (step === 8) {
      while (input.isCont() && Unicode.isSpace(input.head())) {
        input.step();
      }
      if (input.isCont() && input.head() === 41/*')'*/) {
        input.step();
        const ident = identOutput!.bind();
        switch (ident) {
          case "translate3d":
            if (zParser!.bind().value === 0) {
              return Parser.done(new TranslateTransform(xParser!.bind(), yParser!.bind()));
            }
          default: return Parser.error(Diagnostic.message("unknown transform function: " + ident, input));
        }
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected(")", input));
      }
    }
    return new TranslateTransformParser(identOutput, xParser, yParser, zParser, step);
  }

  /** @internal */
  static parseRest(input: Input, identOutput?: Output<string>): Parser<TranslateTransform> {
    return TranslateTransformParser.parse(input, identOutput, void 0, void 0, void 0, 2);
  }
}
