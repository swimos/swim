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
import {AffineTransform} from "./"; // forward import

/** @public */
export type ScaleTransformLike = ScaleTransform | string;

/** @public */
export const ScaleTransformLike = {
  [Symbol.hasInstance](instance: unknown): instance is ScaleTransformLike {
    return instance instanceof ScaleTransform
        || typeof instance === "string";
  },
};

/** @public */
export class ScaleTransform extends Transform {
  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
    this.stringValue = void 0;
  }

  readonly x: number;

  readonly y: number;

  override transform(that: Transform): Transform;
  override transform(x: number, y: number): R2Point;
  override transform(x: Transform | number, y?: number): Transform | R2Point {
    if (arguments.length === 2) {
      return new R2Point(this.x * (x as number), this.y * y!);
    } else if (x instanceof IdentityTransform) {
      return this;
    } else if (x instanceof Transform) {
      return Transform.list(this, x);
    }
    throw new TypeError("" + x);
  }

  override transformX(x: number, y: number): number {
    return this.x * x;
  }

  override transformY(x: number, y: number): number {
    return this.y * y;
  }

  override inverse(): Transform {
    return new ScaleTransform(1 / (this.x || 1), 1 / (this.y || 1));
  }

  toAffine(): AffineTransform {
    return new AffineTransform(this.x, 0, 0, this.y, 0, 0);
  }

  override toCssTransformComponent(): CSSTransformComponent | null {
    if (typeof CSSTranslate === "undefined") {
      return null;
    }
    return new CSSScale(this.x, this.y);
  }

  override toValue(): Value {
    return Record.create(1)
                 .attr("scale", Record.create(2).slot("x", this.x)
                                                .slot("y", this.y));
  }

  override interpolateTo(that: ScaleTransform): Interpolator<ScaleTransform>;
  override interpolateTo(that: Transform): Interpolator<Transform>;
  override interpolateTo(that: unknown): Interpolator<Transform> | null;
  override interpolateTo(that: unknown): Interpolator<Transform> | null {
    if (that instanceof ScaleTransform) {
      return ScaleTransformInterpolator(this, that);
    }
    return super.interpolateTo(that);
  }

  override conformsTo(that: Transform): boolean {
    return that instanceof ScaleTransform;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (that instanceof ScaleTransform) {
      return Numbers.equivalent(this.x, that.x, epsilon)
          && Numbers.equivalent(this.y, that.y, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (that instanceof ScaleTransform) {
      return this.x === that.x && this.y === that.y;
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(ScaleTransform),
        Numbers.hash(this.x)), Numbers.hash(this.y)));
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("Transform").write(46/*'.'*/).write("scale");
    if (this.x !== 0 && this.y === 0) {
      output = output.write("X").write(40/*'('*/).debug(this.x);
    } else if (this.x === 0 && this.y !== 0) {
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
      if (this.x !== 0 && this.y === 0) {
        stringValue = "scaleX(" + this.x + ")";
      } else if (this.x === 0 && this.y !== 0) {
        stringValue = "scaleY(" + this.y + ")";
      } else {
        stringValue = "scale(" + this.x + "," + this.y + ")";
      }
      (this as Mutable<this>).stringValue = stringValue;
    }
    return stringValue;
  }

  static override fromCssTransformComponent(component: CSSScale): ScaleTransform {
    const x = typeof component.x === "number"
            ? component.x
            : component.x.to("number").value;
    const y = typeof component.y === "number"
            ? component.y
            : component.y.to("number").value;
    return new ScaleTransform(x, y);
  }

  static override fromLike<T extends ScaleTransformLike | null | undefined>(value: T): ScaleTransform | Uninitable<T>;
  static override fromLike<T extends TransformLike | null | undefined>(value: T): never;
  static override fromLike<T extends ScaleTransformLike | null | undefined>(value: T): ScaleTransform | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof ScaleTransform) {
      return value as ScaleTransform | Uninitable<T>;
    } else if (typeof value === "string") {
      return ScaleTransform.parse(value);
    }
    throw new TypeError("" + value);
  }

  static override fromValue(value: Value): ScaleTransform | null {
    const header = value.header("scale");
    if (!header.isDefined()) {
      return null;
    }
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

  static override parse(string: string): ScaleTransform {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = ScaleTransformParser.parse(input);
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
export const ScaleTransformInterpolator = (function (_super: typeof Interpolator) {
  const ScaleTransformInterpolator = function (f0: ScaleTransform, f1: ScaleTransform): Interpolator<ScaleTransform> {
    const interpolator = function (u: number): ScaleTransform {
      const f0 = interpolator[0];
      const f1 = interpolator[1];
      const x = f0.x + u * (f1.x - f0.x);
      const y = f0.y + u * (f1.y - f0.y);
      return new ScaleTransform(x, y);
    } as Interpolator<ScaleTransform>;
    Object.setPrototypeOf(interpolator, ScaleTransformInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = f0;
    (interpolator as Mutable<typeof interpolator>)[1] = f1;
    return interpolator;
  } as {
    (f0: ScaleTransform, f1: ScaleTransform): Interpolator<ScaleTransform>;

    /** @internal */
    prototype: Interpolator<ScaleTransform>;
  };

  ScaleTransformInterpolator.prototype = Object.create(_super.prototype);
  ScaleTransformInterpolator.prototype.constructor = Interpolator;

  return ScaleTransformInterpolator;
})(Interpolator);

/** @internal */
export class ScaleTransformParser extends Parser<ScaleTransform> {
  private readonly identOutput: Output<string> | undefined;
  private readonly xParser: Parser<number> | undefined;
  private readonly yParser: Parser<number> | undefined;
  private readonly step: number | undefined;

  constructor(identOutput?: Output<string>, xParser?: Parser<number>,
              yParser?: Parser<number>, step?: number) {
    super();
    this.identOutput = identOutput;
    this.xParser = xParser;
    this.yParser = yParser;
    this.step = step;
  }

  override feed(input: Input): Parser<ScaleTransform> {
    return ScaleTransformParser.parse(input, this.identOutput, this.xParser, this.yParser, this.step);
  }

  static parse(input: Input, identOutput?: Output<string>, xParser?: Parser<number>,
               yParser?: Parser<number>, step: number = 1): Parser<ScaleTransform> {
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
          case "scaleX":
          case "scaleY":
          case "scale": step = 2; break;
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
          xParser = Base10.parseNumber(input);
        }
      } else {
        xParser = xParser.feed(input);
      }
      if (xParser !== void 0) {
        if (xParser!.isDone()) {
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
            case "scaleX": return Parser.done(new ScaleTransform(xParser!.bind(), 1));
            case "scaleY": return Parser.done(new ScaleTransform(1, xParser!.bind()));
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
          yParser = Base10.parseNumber(input);
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
          case "scale": return Parser.done(new ScaleTransform(xParser!.bind(), yParser!.bind()));
          default: return Parser.error(Diagnostic.message("unknown transform function: " + ident, input));
        }
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected(")", input));
      }
    }
    return new ScaleTransformParser(identOutput, xParser, yParser, step);
  }

  /** @internal */
  static parseRest(input: Input, identOutput?: Output<string>): Parser<ScaleTransform> {
    return ScaleTransformParser.parse(input, identOutput, void 0, void 0, 2);
  }
}
