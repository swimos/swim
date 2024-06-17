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
import {AngleParser} from "./Angle";
import {R2Point} from "./R2Point";
import type {TransformLike} from "./Transform";
import {Transform} from "./Transform";
import {IdentityTransform} from "./IdentityTransform";
import {AffineTransform} from "./"; // forward import

/** @public */
export type RotateTransformLike = RotateTransform | string;

/** @public */
export const RotateTransformLike = {
  [Symbol.hasInstance](instance: unknown): instance is RotateTransformLike {
    return instance instanceof RotateTransform
        || typeof instance === "string";
  },
};

/** @public */
export class RotateTransform extends Transform {
  constructor(angle: Angle) {
    super();
    this.angle = angle;
    this.stringValue = void 0;
  }

  readonly angle: Angle;

  override transform(that: Transform): Transform;
  override transform(x: number, y: number): R2Point;
  override transform(x: Transform | number, y?: number): Transform | R2Point {
    if (arguments.length === 2) {
      const angle = this.angle.radValue();
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      return new R2Point((x as number) * cosA - y! * sinA,
                         (x as number) * sinA + y! * cosA);
    } else if (x instanceof IdentityTransform) {
      return this;
    } else if (x instanceof Transform) {
      return Transform.list(this, x);
    }
    throw new TypeError("" + x);
  }

  override transformX(x: number, y: number): number {
    const angle = this.angle.radValue();
    return x * Math.cos(angle) - y * Math.sin(angle);
  }

  override transformY(x: number, y: number): number {
    const angle = this.angle.radValue();
    return x * Math.sin(angle) + y * Math.cos(angle);
  }

  override inverse(): Transform {
    return new RotateTransform(this.angle.negative());
  }

  override toAffine(): AffineTransform {
    const angle = this.angle.radValue();
    return new AffineTransform(Math.cos(angle), Math.sin(angle),
                              -Math.sin(angle), Math.cos(angle),
                               0, 0);
  }

  override toCssTransformComponent(): CSSTransformComponent | null {
    if (typeof CSSTranslate === "undefined") {
      return null;
    }
    return new CSSRotate(this.angle.toCssValue()!);
  }

  override toValue(): Value {
    return Record.create(1).attr("rotate", this.angle.toString());
  }

  override interpolateTo(that: RotateTransform): Interpolator<RotateTransform>;
  override interpolateTo(that: Transform): Interpolator<Transform>;
  override interpolateTo(that: unknown): Interpolator<Transform> | null;
  override interpolateTo(that: unknown): Interpolator<Transform> | null {
    if (that instanceof RotateTransform) {
      return RotateTransformInterpolator(this, that);
    }
    return super.interpolateTo(that);
  }

  override conformsTo(that: Transform): boolean {
    return that instanceof RotateTransform;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (that instanceof RotateTransform) {
      return this.angle.equivalentTo(that.angle, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (that instanceof RotateTransform) {
      return this.angle.equals(that.angle);
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Constructors.hash(RotateTransform), this.angle.hashCode()));
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("Transform").write(46/*'.'*/).write("rotate")
                   .write(40/*'('*/).debug(this.angle).write(41/*')'*/);
    return output;
  }

  /** @internal */
  readonly stringValue: string | undefined;

  override toString(): string {
    let stringValue = this.stringValue;
    if (stringValue === void 0) {
      stringValue = "rotate(" + this.angle + ")";
      (this as Mutable<this>).stringValue = stringValue;
    }
    return stringValue;
  }

  override toAttributeString(): string {
    return "rotate(" + this.angle.degValue() + ")";
  }

  static override fromCssTransformComponent(component: CSSRotate): RotateTransform {
    const angle = Angle.fromCssValue(component.angle);
    return new RotateTransform(angle);
  }

  static override fromLike<T extends RotateTransformLike | null | undefined>(value: T): RotateTransform | Uninitable<T>;
  static override fromLike<T extends TransformLike | null | undefined>(value: T): never;
  static override fromLike<T extends RotateTransformLike | null | undefined>(value: T): RotateTransform | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof RotateTransform) {
      return value as RotateTransform | Uninitable<T>;
    } else if (typeof value === "string") {
      return RotateTransform.parse(value);
    }
    throw new TypeError("" + value);
  }

  static override fromValue(value: Value): RotateTransform | null {
    const header = value.header("rotate");
    if (!header.isDefined()) {
      return null;
    }
    let angle = Angle.zero();
    header.forEach(function (item: Item, index: number) {
      const key = item.key.stringValue();
      if (key === "angle") {
        angle = item.toValue().cast(Angle.form(), angle);
      } else if (item instanceof Value && index === 0) {
        angle = item.cast(Angle.form(), angle);
      }
    }, this);
    return new RotateTransform(angle);
  }

  static override parse(string: string): RotateTransform {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = RotateTransformParser.parse(input);
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
export const RotateTransformInterpolator = (function (_super: typeof Interpolator) {
  const RotateTransformInterpolator = function (f0: RotateTransform, f1: RotateTransform): Interpolator<RotateTransform> {
    const interpolator = function (u: number): RotateTransform {
      const f0 = interpolator[0];
      const f1 = interpolator[1];
      const a = Angle.of(f0.angle.value + u * (f1.angle.value - f0.angle.value), f1.angle.units);
      return new RotateTransform(a);
    } as Interpolator<RotateTransform>;
    Object.setPrototypeOf(interpolator, RotateTransformInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = f0.angle.units === f1.angle.units
                                                      ? f0 : new RotateTransform(f0.angle.to(f1.angle.units));
    (interpolator as Mutable<typeof interpolator>)[1] = f1;
    return interpolator;
  } as {
    (f0: RotateTransform, f1: RotateTransform): Interpolator<RotateTransform>;

    /** @internal */
    prototype: Interpolator<RotateTransform>;
  };

  RotateTransformInterpolator.prototype = Object.create(_super.prototype);
  RotateTransformInterpolator.prototype.constructor = RotateTransformInterpolator;

  return RotateTransformInterpolator;
})(Interpolator);

/** @internal */
export class RotateTransformParser extends Parser<RotateTransform> {
  private readonly identOutput: Output<string> | undefined;
  private readonly angleParser: Parser<Angle> | undefined;
  private readonly step: number | undefined;

  constructor(identOutput?: Output<string>, angleParser?: Parser<Angle>, step?: number) {
    super();
    this.identOutput = identOutput;
    this.angleParser = angleParser;
    this.step = step;
  }

  override feed(input: Input): Parser<RotateTransform> {
    return RotateTransformParser.parse(input, this.identOutput, this.angleParser, this.step);
  }

  static parse(input: Input, identOutput?: Output<string>, angleParser?: Parser<Angle>,
               step: number = 1): Parser<RotateTransform> {
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
          case "rotate": step = 2; break;
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
      if (angleParser === void 0) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input.step();
        }
        if (!input.isEmpty()) {
          angleParser = AngleParser.parse(input, "deg");
        }
      } else {
        angleParser = angleParser.feed(input);
      }
      if (angleParser !== void 0) {
        if (angleParser.isDone()) {
          step = 4;
        } else if (angleParser.isError()) {
          return angleParser.asError();
        }
      }
    }
    if (step === 4) {
      while (input.isCont() && Unicode.isSpace(input.head())) {
        input.step();
      }
      if (input.isCont() && input.head() === 41/*')'*/) {
        input.step();
        const ident = identOutput!.bind();
        switch (ident) {
          case "rotate": return Parser.done(new RotateTransform(angleParser!.bind()));
          default: return Parser.error(Diagnostic.message("unknown transform function: " + ident, input));
        }
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected(")", input));
      }
    }
    return new RotateTransformParser(identOutput, angleParser, step);
  }

  /** @internal */
  static parseRest(input: Input, identOutput?: Output<string>): Parser<RotateTransform> {
    return RotateTransformParser.parse(input, identOutput, void 0, 2);
  }
}
