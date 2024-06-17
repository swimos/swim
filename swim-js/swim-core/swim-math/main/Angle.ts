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
import {Lazy} from "@swim/util";
import type {HashCode} from "@swim/util";
import type {Equivalent} from "@swim/util";
import type {Compare} from "@swim/util";
import {Numbers} from "@swim/util";
import {Constructors} from "@swim/util";
import type {Interpolate} from "@swim/util";
import {Interpolator} from "@swim/util";
import {Diagnostic} from "@swim/codec";
import type {Input} from "@swim/codec";
import type {Output} from "@swim/codec";
import {Parser} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Base10} from "@swim/codec";
import {Unicode} from "@swim/codec";
import type {Item} from "@swim/structure";
import {Attr} from "@swim/structure";
import {Value} from "@swim/structure";
import {Text} from "@swim/structure";
import {Form} from "@swim/structure";

/** @public */
export type AngleUnits = "deg" | "rad" | "grad" | "turn";

/** @public */
export type AngleLike = Angle | string | number;

/** @public */
export const AngleLike = {
  [Symbol.hasInstance](instance: unknown): instance is AngleLike {
    return instance instanceof Angle
        || typeof instance === "number"
        || typeof instance === "string";
  },
};

/** @public */
export abstract class Angle implements Interpolate<Angle>, HashCode, Equivalent, Compare, Debug {
  isDefined(): boolean {
    return isFinite(this.value);
  }

  likeType?(like: string | number): void;

  abstract readonly value: number;

  abstract readonly units: AngleUnits;

  plus(that: AngleLike, units: AngleUnits = this.units): Angle {
    that = Angle.fromLike(that);
    return Angle.of(this.toValue(units) + that.toValue(units), units);
  }

  negative(units: AngleUnits = this.units): Angle {
    return Angle.of(-this.toValue(units), units);
  }

  minus(that: AngleLike, units: AngleUnits = this.units): Angle {
    that = Angle.fromLike(that);
    return Angle.of(this.toValue(units) - that.toValue(units), units);
  }

  times(scalar: number, units: AngleUnits = this.units): Angle {
    return Angle.of(this.toValue(units) * scalar, units);
  }

  divide(scalar: number, units: AngleUnits = this.units): Angle {
    return Angle.of(this.toValue(units) / scalar, units);
  }

  combine(that: AngleLike, scalar: number = 1, units: AngleUnits = this.units): Angle {
    that = Angle.fromLike(that);
    return Angle.of(this.toValue(units) + that.toValue(units) * scalar, units);
  }

  norm(total: AngleLike, units: AngleUnits = this.units): Angle {
    total = Angle.fromLike(total);
    return Angle.of(this.toValue(units) / total.toValue(units), units);
  }

  abstract degValue(): number;

  abstract gradValue(): number;

  abstract radValue(): number;

  abstract turnValue(): number;

  deg(): DegAngle {
    return DegAngle.of(this.degValue());
  }

  rad(): RadAngle {
    return RadAngle.of(this.radValue());
  }

  grad(): GradAngle {
    return GradAngle.of(this.gradValue());
  }

  turn(): TurnAngle {
    return TurnAngle.of(this.turnValue());
  }

  toValue(): Value;
  toValue(units: AngleUnits): number;
  toValue(units?: AngleUnits): Value | number {
    if (units === void 0) {
      return Text.from(this.toString());
    }
    switch (units) {
      case "deg": return this.degValue();
      case "rad": return this.radValue();
      case "grad": return this.gradValue();
      case "turn": return this.turnValue();
      default: throw new Error("unknown angle units: " + units);
    }
  }

  to(units: AngleUnits): Angle {
    switch (units) {
      case "deg": return this.deg();
      case "rad": return this.rad();
      case "grad": return this.grad();
      case "turn": return this.turn();
      default: throw new Error("unknown angle units: " + units);
    }
  }

  abstract toCssValue(): CSSUnitValue | null;

  /** @override */
  interpolateTo(that: Angle): Interpolator<Angle>;
  interpolateTo(that: unknown): Interpolator<Angle> | null;
  interpolateTo(that: unknown): Interpolator<Angle> | null {
    if (that instanceof Angle) {
      return AngleInterpolator(this, that);
    }
    return null;
  }

  /** @override */
  abstract compareTo(that: unknown): number;

  /** @override */
  abstract equivalentTo(that: unknown, epsilon?: number): boolean;

  /** @override */
  abstract equals(that: unknown): boolean;

  /** @override */
  abstract hashCode(): number;

  /** @override */
  abstract debug<T>(output: Output<T>): Output<T>;

  /** @override */
  abstract toString(): string;

  static zero(units?: AngleUnits): Angle {
    switch (units) {
      case "deg": return DegAngle.zero();
      case void 0:
      case "rad": return RadAngle.zero();
      case "grad": return GradAngle.zero();
      case "turn": return TurnAngle.zero();
      default: throw new Error("unknown angle units: " + units);
    }
  }

  static deg(value: number): DegAngle {
    return DegAngle.of(value);
  }

  static rad(value: number): RadAngle {
    return RadAngle.of(value);
  }

  static grad(value: number): GradAngle {
    return GradAngle.of(value);
  }

  static turn(value: number): TurnAngle {
    return TurnAngle.of(value);
  }

  static of(value: number, units?: AngleUnits): Angle {
    switch (units) {
      case "deg": return DegAngle.of(value);
      case void 0:
      case "rad": return RadAngle.of(value);
      case "grad": return GradAngle.of(value);
      case "turn": return TurnAngle.of(value);
      default: throw new Error("unknown angle units: " + units);
    }
  }

  static fromCssValue(value: CSSStyleValue): Angle {
    if (value instanceof CSSUnitValue) {
      return Angle.of(value.value, value.unit as AngleUnits);
    }
    throw new TypeError("" + value);
  }

  static fromLike<T extends AngleLike | null | undefined>(value: T, defaultUnits?: AngleUnits): Angle | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof Angle) {
      return value as Angle | Uninitable<T>;
    } else if (typeof value === "number") {
      return Angle.of(value, defaultUnits);
    } else if (typeof value === "string") {
      return Angle.parse(value, defaultUnits);
    }
    throw new TypeError("" + value);
  }

  static fromValue(value: Value): Angle | null {
    if (value.length !== 2) {
      return null;
    }
    const num = value.getItem(0).numberValue();
    const units = value.getItem(1);
    if (num === void 0 || !isFinite(num) || !(units instanceof Attr) || units.toValue() !== Value.extant()) {
      return null;
    }
    switch (units.key.value) {
      case "deg": return DegAngle.of(num);
      case "rad": return RadAngle.of(num);
      case "grad": return GradAngle.of(num);
      case "turn": return TurnAngle.of(num);
      default: return null;
    }
  }

  static parse(string: string, defaultUnits?: AngleUnits): Angle {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = AngleParser.parse(input, defaultUnits);
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

  @Lazy
  static form(): Form<Angle, AngleLike> {
    return new AngleForm(void 0, Angle.zero());
  }
}

/** @public */
export class DegAngle extends Angle {
  constructor(value: number) {
    super();
    this.value = value;
  }

  override readonly value: number;

  override get units(): "deg" {
    return "deg";
  }

  override degValue(): number {
    return this.value;
  }

  override gradValue(): number {
    return this.value * 10 / 9;
  }

  override radValue(): number {
    return this.value * Math.PI / 180;
  }

  override turnValue(): number {
    return this.value / 360;
  }

  override deg(): DegAngle {
    return this;
  }

  override toCssValue(): CSSUnitValue | null {
    if (typeof CSSUnitValue !== "undefined") {
      return new CSSUnitValue(this.value, "deg");
    }
    return null;
  }

  override compareTo(that: unknown): number {
    if (that instanceof Angle) {
      const x = this.value;
      const y = that.degValue();
      return x < y ? -1 : x > y ? 1 : isNaN(y) ? (isNaN(x) ? 0 : -1) : isNaN(x) ? 1 : 0;
    }
    return NaN;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (that instanceof Angle) {
      return Numbers.equivalent(this.value, that.degValue());
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (that instanceof DegAngle) {
      return this.value === that.value;
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Constructors.hash(DegAngle), Numbers.hash(this.value)));
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("Angle").write(46/*'.'*/).write("deg")
                   .write(40/*'('*/).debug(this.value).write(41/*')'*/);
    return output;
  }

  override toString(): string {
    return this.value + "deg";
  }

  @Lazy
  static override zero(): DegAngle {
    return new DegAngle(0);
  }

  static override of(value: number): DegAngle {
    if (value === 0) {
      return this.zero();
    }
    return new DegAngle(value);
  }
}

/** @public */
export class RadAngle extends Angle {
  constructor(value: number) {
    super();
    this.value = value;
  }

  override readonly value: number;

  override get units(): "rad" {
    return "rad";
  }

  override degValue(): number {
    return this.value * 180 / Math.PI;
  }

  override gradValue(): number {
    return this.value * 200 / Math.PI;
  }

  override radValue(): number {
    return this.value;
  }

  override turnValue(): number {
    return this.value / (2 * Math.PI);
  }

  override rad(): RadAngle {
    return this;
  }

  override toCssValue(): CSSUnitValue | null {
    if (typeof CSSUnitValue !== "undefined") {
      return new CSSUnitValue(this.value, "rad");
    }
    return null;
  }

  override compareTo(that: unknown): number {
    if (that instanceof Angle) {
      const x = this.value;
      const y = that.radValue();
      return x < y ? -1 : x > y ? 1 : isNaN(y) ? (isNaN(x) ? 0 : -1) : isNaN(x) ? 1 : 0;
    }
    return NaN;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (that instanceof Angle) {
      return Numbers.equivalent(this.value, that.radValue());
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (that instanceof RadAngle) {
      return this.value === that.value;
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Constructors.hash(RadAngle), Numbers.hash(this.value)));
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("Angle").write(46/*'.'*/).write("rad")
                   .write(40/*'('*/).debug(this.value).write(41/*')'*/);
    return output;
  }

  override toString(): string {
    return this.value + "rad";
  }

  @Lazy
  static override zero(): RadAngle {
    return new RadAngle(0);
  }

  static override of(value: number): RadAngle {
    if (value === 0) {
      return this.zero();
    }
    return new RadAngle(value);
  }
}

/** @public */
export class GradAngle extends Angle {
  constructor(value: number) {
    super();
    this.value = value;
  }

  override readonly value: number;

  override get units(): "grad" {
    return "grad";
  }

  override degValue(): number {
    return this.value * 0.9;
  }

  override gradValue(): number {
    return this.value;
  }

  override radValue(): number {
    return this.value * Math.PI / 200;
  }

  override turnValue(): number {
    return this.value / 400;
  }

  override grad(): GradAngle {
    return this;
  }

  override toCssValue(): CSSUnitValue | null {
    if (typeof CSSUnitValue !== "undefined") {
      return new CSSUnitValue(this.value, "grad");
    }
    return null;
  }

  override compareTo(that: unknown): number {
    if (that instanceof Angle) {
      const x = this.value;
      const y = that.gradValue();
      return x < y ? -1 : x > y ? 1 : isNaN(y) ? (isNaN(x) ? 0 : -1) : isNaN(x) ? 1 : 0;
    }
    return NaN;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (that instanceof Angle) {
      return Numbers.equivalent(this.value, that.gradValue());
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (that instanceof GradAngle) {
      return this.value === that.value;
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Constructors.hash(GradAngle), Numbers.hash(this.value)));
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("Angle").write(46/*'.'*/).write("grad")
                   .write(40/*'('*/).debug(this.value).write(41/*')'*/);
    return output;
  }

  override toString(): string {
    return this.value + "grad";
  }

  @Lazy
  static override zero(): GradAngle {
    return new GradAngle(0);
  }

  static override of(value: number): GradAngle {
    if (value === 0) {
      return this.zero();
    }
    return new GradAngle(value);
  }
}

/** @public */
export class TurnAngle extends Angle {
  constructor(value: number) {
    super();
    this.value = value;
  }

  readonly value: number;

  override get units(): "turn" {
    return "turn";
  }

  override degValue(): number {
    return this.value * 360;
  }

  override gradValue(): number {
    return this.value * 400;
  }

  override radValue(): number {
    return this.value * (2 * Math.PI);
  }

  override turnValue(): number {
    return this.value;
  }

  override turn(): TurnAngle {
    return this;
  }

  override toCssValue(): CSSUnitValue | null {
    if (typeof CSSUnitValue !== "undefined") {
      return new CSSUnitValue(this.value, "turn");
    }
    return null;
  }

  override compareTo(that: unknown): number {
    if (that instanceof Angle) {
      const x = this.value;
      const y = that.turnValue();
      return x < y ? -1 : x > y ? 1 : isNaN(y) ? (isNaN(x) ? 0 : -1) : isNaN(x) ? 1 : 0;
    }
    return NaN;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (that instanceof Angle) {
      return Numbers.equivalent(this.value, that.turnValue());
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (that instanceof TurnAngle) {
      return this.value === that.value;
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Constructors.hash(TurnAngle), Numbers.hash(this.value)));
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("Angle").write(46/*'.'*/).write("turn")
                   .write(40/*'('*/).debug(this.value).write(41/*')'*/);
    return output;
  }

  override toString(): string {
    return this.value + "turn";
  }

  @Lazy
  static override zero(): TurnAngle {
    return new TurnAngle(0);
  }

  static override of(value: number): TurnAngle {
    if (value === 0) {
      return this.zero();
    }
    return new TurnAngle(value);
  }
}

/** @internal */
export const AngleInterpolator = (function (_super: typeof Interpolator) {
  const AngleInterpolator = function (a0: Angle, a1: Angle): Interpolator<Angle> {
    const interpolator = function (u: number): Angle {
      const a0 = interpolator[0];
      const a1 = interpolator[1];
      return Angle.of(a0.value + u * (a1.value - a0.value), a1.units);
    } as Interpolator<Angle>;
    Object.setPrototypeOf(interpolator, AngleInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = a0.to(a1.units);
    (interpolator as Mutable<typeof interpolator>)[1] = a1;
    return interpolator;
  } as {
    (a0: Angle, a1: Angle): Interpolator<Angle>;

    /** @internal */
    prototype: Interpolator<Angle>;
  };

  AngleInterpolator.prototype = Object.create(_super.prototype);
  AngleInterpolator.prototype.constructor = AngleInterpolator;

  return AngleInterpolator;
})(Interpolator);

/** @internal */
export class AngleForm extends Form<Angle, AngleLike> {
  constructor(defaultUnits: AngleUnits | undefined, unit: Angle | undefined) {
    super();
    this.defaultUnits = defaultUnits;
    Object.defineProperty(this, "unit", {
      value: unit,
      enumerable: true,
      configurable: true,
    });
  }

  readonly defaultUnits: AngleUnits | undefined;

  override readonly unit: Angle | undefined;

  override withUnit(unit: Angle | undefined): Form<Angle, AngleLike> {
    if (unit === this.unit) {
      return this;
    }
    return new AngleForm(this.defaultUnits, unit);
  }

  override mold(angle: AngleLike): Item {
    angle = Angle.fromLike(angle, this.defaultUnits);
    return Text.from(angle.toString());
  }

  override cast(item: Item): Angle | undefined {
    const value = item.toValue();
    let angle: Angle | null = null;
    try {
      angle = Angle.fromValue(value);
      if (angle === void 0) {
        const string = value.stringValue(void 0);
        if (string !== void 0) {
          angle = Angle.parse(string, this.defaultUnits);
        }
      }
    } catch (e) {
      // swallow
    }
    return angle !== null ? angle : void 0;
  }
}

/** @internal */
export class AngleParser extends Parser<Angle> {
  private readonly defaultUnits: AngleUnits | undefined;
  private readonly valueParser: Parser<number> | undefined;
  private readonly unitsOutput: Output<string> | undefined;
  private readonly step: number | undefined;

  constructor(defaultUnits?: AngleUnits, valueParser?: Parser<number>,
              unitsOutput?: Output<string>, step?: number) {
    super();
    this.defaultUnits = defaultUnits;
    this.valueParser = valueParser;
    this.unitsOutput = unitsOutput;
    this.step = step;
  }

  override feed(input: Input): Parser<Angle> {
    return AngleParser.parse(input, this.defaultUnits, this.valueParser,
                             this.unitsOutput, this.step);
  }

  static parse(input: Input, defaultUnits?: AngleUnits, valueParser?: Parser<number>,
               unitsOutput?: Output<string>, step: number = 1): Parser<Angle> {
    let c = 0;
    if (step === 1) {
      if (valueParser === void 0) {
        valueParser = Base10.parseDecimal(input);
      } else {
        valueParser = valueParser.feed(input);
      }
      if (valueParser.isDone()) {
        step = 2;
      } else if (valueParser.isError()) {
        return valueParser.asError();
      }
    }
    if (step === 2) {
      unitsOutput = unitsOutput || Unicode.stringOutput();
      while (input.isCont() && (c = input.head(), Unicode.isAlpha(c))) {
        input = input.step();
        unitsOutput.push(c);
      }
      if (!input.isEmpty()) {
        const value = valueParser!.bind();
        const units = unitsOutput.bind() || defaultUnits;
        switch (units) {
          case "deg": return Parser.done(Angle.deg(value));
          case "":
          case "rad": return Parser.done(Angle.rad(value));
          case "grad": return Parser.done(Angle.grad(value));
          case "turn": return Parser.done(Angle.turn(value));
          default: return Parser.error(Diagnostic.message("unknown units: " + units, input));
        }
      }
    }
    return new AngleParser(defaultUnits, valueParser, unitsOutput, step);
  }
}
