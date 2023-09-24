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
export type LengthUnits = "px" | "em" | "rem" | "%" | "";

/** @public */
export interface LengthBasis {
  emUnit?: Node | number;
  remUnit?: number;
  pctUnit?: number;
}

/** @public */
export type LengthLike = Length | number | string;

/** @public */
export const LengthLike = {
  [Symbol.hasInstance](instance: unknown): instance is LengthLike {
    return instance instanceof Length
        || typeof instance === "number"
        || typeof instance === "string";
  },
};

/** @public */
export abstract class Length implements Interpolate<Length>, HashCode, Equivalent, Compare, Debug {
  isDefined(): boolean {
    return isFinite(this.value);
  }

  likeType?(like: number | string): void;

  abstract readonly value: number;

  abstract readonly units: LengthUnits;

  plus(that: LengthLike, units: LengthUnits = this.units, basis?: LengthBasis | number): Length {
    that = Length.fromLike(that);
    return Length.of(this.toValue(units, basis) + that.toValue(units, basis), units);
  }

  negative(units: LengthUnits = this.units, basis?: LengthBasis | number): Length {
    return Length.of(-this.toValue(units, basis), units);
  }

  minus(that: LengthLike, units: LengthUnits = this.units, basis?: LengthBasis | number): Length {
    that = Length.fromLike(that);
    return Length.of(this.toValue(units, basis) - that.toValue(units, basis), units);
  }

  times(scalar: number, units: LengthUnits = this.units, basis?: LengthBasis | number): Length {
    return Length.of(this.toValue(units, basis) * scalar, units);
  }

  divide(scalar: number, units: LengthUnits = this.units, basis?: LengthBasis | number): Length {
    return Length.of(this.toValue(units, basis) / scalar, units);
  }

  combine(that: LengthLike, scalar: number = 1, units: LengthUnits = this.units, basis?: LengthBasis | number): Length {
    that = Length.fromLike(that);
    return Length.of(this.toValue(units, basis) + that.toValue(units, basis) * scalar, units);
  }

  abstract pxValue(basis?: LengthBasis | number): number;

  emValue(basis?: LengthBasis | number): number {
    return this.value !== 0 ? this.pxValue(basis) / Length.emUnit(basis) : 0;
  }

  remValue(basis?: LengthBasis | number): number {
    return this.value !== 0 ? this.pxValue(basis) / Length.remUnit(basis) : 0;
  }

  pctValue(basis?: LengthBasis | number): number {
    return this.value !== 0 ? this.pxValue(basis) / Length.pctUnit(basis) : 0;
  }

  px(basis?: LengthBasis | number): PxLength {
    return PxLength.of(this.pxValue(basis));
  }

  em(basis?: LengthBasis | number): EmLength {
    return EmLength.of(this.emValue(basis));
  }

  rem(basis?: LengthBasis | number): RemLength {
    return RemLength.of(this.remValue(basis));
  }

  pct(basis?: LengthBasis | number): PctLength {
    return PctLength.of(this.pctValue(basis));
  }

  toValue(): Value;
  toValue(units: LengthUnits, basis?: LengthBasis | number): number;
  toValue(units?: LengthUnits, basis?: LengthBasis | number): Value | number {
    if (units === void 0) {
      return Text.from(this.toString());
    }
    switch (units) {
      case "px": return this.pxValue(basis);
      case "em": return this.emValue(basis);
      case "rem": return this.remValue(basis);
      case "%": return this.pctValue(basis);
      default: throw new Error("unknown length units: " + units);
    }
  }

  to(units: LengthUnits, basis?: LengthBasis | number): Length {
    switch (units) {
      case "px": return this.px(basis);
      case "em": return this.em(basis);
      case "rem": return this.rem(basis);
      case "%": return this.pct(basis);
      default: throw new Error("unknown length units: " + units);
    }
  }

  abstract toCssValue(): CSSUnitValue | null;

  /** @override */
  interpolateTo(that: Length): Interpolator<Length>;
  interpolateTo(that: unknown): Interpolator<Length> | null;
  interpolateTo(that: unknown): Interpolator<Length> | null {
    if (that instanceof Length) {
      return LengthInterpolator(this, that);
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

  static zero(units?: LengthUnits): Length {
    switch (units) {
      case void 0:
      case "px": return PxLength.zero();
      case "em": return EmLength.zero();
      case "rem": return RemLength.zero();
      case "%": return PctLength.zero();
      case "": return UnitlessLength.zero();
      default: throw new Error("unknown length units: " + units);
    }
  }

  static px(value: number): PxLength {
    return PxLength.of(value);
  }

  static em(value: number): EmLength {
    return EmLength.of(value);
  }

  static rem(value: number): RemLength {
    return RemLength.of(value);
  }

  static pct(value: number): PctLength {
    return PctLength.of(value);
  }

  static unitless(value: number): UnitlessLength {
    return UnitlessLength.of(value);
  }

  static of(value: number, units?: LengthUnits): Length {
    switch (units) {
      case void 0:
      case "px": return PxLength.of(value);
      case "em": return EmLength.of(value);
      case "rem": return RemLength.of(value);
      case "%": return PctLength.of(value);
      case "": return UnitlessLength.of(value);
      default: throw new Error("unknown length units: " + units);
    }
  }

  static fromCssValue(value: CSSStyleValue): Length {
    if (value instanceof CSSUnitValue) {
      return Length.of(value.value, value.unit as LengthUnits);
    }
    throw new TypeError("" + value);
  }

  static fromLike<T extends LengthLike | null | undefined>(value: T, defaultUnits?: LengthUnits): Length | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof Length) {
      return value as Length | Uninitable<T>;
    } else if (typeof value === "number") {
      return Length.of(value, defaultUnits);
    } else if (typeof value === "string") {
      return Length.parse(value, defaultUnits);
    }
    throw new TypeError("" + value);
  }

  static fromValue(value: Value): Length | null {
    if (value.length !== 2) {
      return null;
    }
    const num = value.getItem(0).numberValue(void 0);
    const units = value.getItem(1);
    if (num === void 0 || !isFinite(num) || !(units instanceof Attr) || units.value !== Value.extant()) {
      return null;
    }
    switch (units.key.value) {
      case "px": return PxLength.of(num);
      case "em": return EmLength.of(num);
      case "rem": return RemLength.of(num);
      case "pct": return PctLength.of(num);
      default: return null;
    }
  }

  static parse(string: string, defaultUnits?: LengthUnits): Length {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = LengthParser.parse(input, defaultUnits);
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
  static form(): Form<Length, LengthLike> {
    return new LengthForm(void 0, Length.zero());
  }

  /** @internal */
  static emUnit(basis?: LengthBasis | number): number {
    if (basis === void 0 || typeof basis === "number") {
      throw new Error("unknown em unit: " + basis);
    }
    const emUnit = basis.emUnit;
    if (typeof emUnit === "number") {
      return emUnit;
    } else if (!(emUnit instanceof Node)) {
      throw new Error("unknown em unit: " + emUnit);
    }
    let node: Node | null = emUnit;
    while (node !== null) {
      if (node instanceof Element) {
        const fontSize = getComputedStyle(node).fontSize;
        if (typeof fontSize === "string") {
          return parseFloat(fontSize);
        }
      }
      node = node.parentNode;
    }
    throw new Error("unknown em unit: " + emUnit);
  }

  /** @internal */
  static remUnit(basis?: LengthBasis | number): number {
    if (basis !== void 0 && typeof basis !== "number") {
      const remUnit = basis.remUnit;
      if (typeof remUnit === "number") {
        return remUnit;
      }
    }
    const fontSize = getComputedStyle(document.documentElement).fontSize;
    if (typeof fontSize === "string") {
      return parseFloat(fontSize);
    }
    throw new Error("unknown rem unit");
  }

  /** @internal */
  static pctUnit(basis?: LengthBasis | number): number {
    if (typeof basis === "number") {
      return basis;
    } else if (basis !== void 0) {
      const pctUnit = basis.pctUnit;
      if (typeof pctUnit === "number") {
        return pctUnit;
      }
    }
    throw new Error("unknown percentage unit");
  }
}

/** @public */
export class PxLength extends Length {
  constructor(value: number) {
    super();
    this.value = value;
  }

  override readonly value: number;

  override get units(): "px" {
    return "px";
  }

  override pxValue(basis?: LengthBasis | number): number {
    return this.value;
  }

  override px(basis?: LengthBasis | number): PxLength {
    return this;
  }

  override toCssValue(): CSSUnitValue | null {
    if (typeof CSSUnitValue !== "undefined") {
      return new CSSUnitValue(this.value, "px");
    }
    return null;
  }

  override valueOf(): number {
    return this.value;
  }

  override compareTo(that: unknown): number {
    if (that instanceof Length) {
      const x = this.value;
      const y = that.pxValue();
      return x < y ? -1 : x > y ? 1 : isNaN(y) ? (isNaN(x) ? 0 : -1) : isNaN(x) ? 1 : 0;
    }
    return NaN;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (that instanceof Length) {
      return Numbers.equivalent(this.value, that.pxValue());
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (that instanceof PxLength) {
      return this.value === that.value;
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Constructors.hash(PxLength), Numbers.hash(this.value)));
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("Length").write(46/*'.'*/).write("px")
                   .write(40/*'('*/).debug(this.value).write(41/*')'*/);
    return output;
  }

  override toString(): string {
    return this.value + "px";
  }

  @Lazy
  static override zero(): PxLength {
    return new PxLength(0);
  }

  static override of(value: number): PxLength {
    if (value === 0) {
      return this.zero();
    }
    return new PxLength(value);
  }
}

/** @public */
export class EmLength extends Length {
  constructor(value: number) {
    super();
    this.value = value;
  }

  override readonly value: number;

  override get units(): "em" {
    return "em";
  }

  override pxValue(basis?: LengthBasis | number): number {
    return this.value !== 0 ? this.value * Length.emUnit(basis) : 0;
  }

  override emValue(basis?: LengthBasis | number): number {
    return this.value;
  }

  override em(basis?: LengthBasis | number): EmLength {
    return this;
  }

  override toCssValue(): CSSUnitValue | null {
    if (typeof CSSUnitValue !== "undefined") {
      return new CSSUnitValue(this.value, "em");
    }
    return null;
  }

  override compareTo(that: unknown): number {
    if (that instanceof Length) {
      const x = this.value;
      const y = that.emValue();
      return x < y ? -1 : x > y ? 1 : isNaN(y) ? (isNaN(x) ? 0 : -1) : isNaN(x) ? 1 : 0;
    }
    return NaN;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (that instanceof Length) {
      return Numbers.equivalent(this.value, that.emValue());
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (that instanceof EmLength) {
      return this.value === that.value;
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Constructors.hash(EmLength), Numbers.hash(this.value)));
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("Length").write(46/*'.'*/).write("em")
                   .write(40/*'('*/).debug(this.value).write(41/*')'*/);
    return output;
  }

  override toString(): string {
    return this.value + "em";
  }

  @Lazy
  static override zero(): EmLength {
    return new EmLength(0);
  }

  static override of(value: number): EmLength {
    if (value === 0) {
      return this.zero();
    }
    return new EmLength(value);
  }
}

/** @public */
export class RemLength extends Length {
  constructor(value: number) {
    super();
    this.value = value;
  }

  override readonly value: number;

  override get units(): "rem" {
    return "rem";
  }

  override pxValue(basis?: LengthBasis | number): number {
    return this.value !== 0 ? this.value * Length.remUnit(basis) : 0;
  }

  override remValue(basis?: LengthBasis | number): number {
    return this.value;
  }

  override rem(basis?: LengthBasis | number): RemLength {
    return this;
  }

  override toCssValue(): CSSUnitValue | null {
    if (typeof CSSUnitValue !== "undefined") {
      return new CSSUnitValue(this.value, "rem");
    }
    return null;
  }

  override compareTo(that: unknown): number {
    if (that instanceof RemLength) {
      const x = this.value;
      const y = that.remValue();
      return x < y ? -1 : x > y ? 1 : isNaN(y) ? (isNaN(x) ? 0 : -1) : isNaN(x) ? 1 : 0;
    }
    return NaN;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (that instanceof RemLength) {
      return Numbers.equivalent(this.value, that.remValue());
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (that instanceof RemLength) {
      return this.value === that.value;
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Constructors.hash(RemLength), Numbers.hash(this.value)));
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("Length").write(46/*'.'*/).write("rem")
                   .write(40/*'('*/).debug(this.value).write(41/*')'*/);
    return output;
  }

  override toString(): string {
    return this.value + "rem";
  }

  @Lazy
  static override zero(): RemLength {
    return new RemLength(0);
  }

  static override of(value: number): RemLength {
    if (value === 0) {
      return this.zero();
    }
    return new RemLength(value);
  }
}

/** @public */
export class PctLength extends Length {
  constructor(value: number) {
    super();
    this.value = value;
  }

  override readonly value: number;

  override get units(): "%" {
    return "%";
  }

  override pxValue(basis?: LengthBasis | number): number {
    return this.value !== 0 ? this.value * Length.pctUnit(basis) / 100 : 0;
  }

  override pctValue(basis?: LengthBasis | number): number {
    return this.value;
  }

  override pct(basis?: LengthBasis | number): PctLength {
    return this;
  }

  override toCssValue(): CSSUnitValue | null {
    if (typeof CSSUnitValue !== "undefined") {
      return new CSSUnitValue(this.value, "percent");
    }
    return null;
  }

  override compareTo(that: unknown): number {
    if (that instanceof Length) {
      const x = this.value;
      const y = that.pctValue();
      return x < y ? -1 : x > y ? 1 : isNaN(y) ? (isNaN(x) ? 0 : -1) : isNaN(x) ? 1 : 0;
    }
    return NaN;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (that instanceof Length) {
      return Numbers.equivalent(this.value, that.pctValue());
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (that instanceof PctLength) {
      return this.value === that.value;
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Constructors.hash(PctLength), Numbers.hash(this.value)));
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("Length").write(46/*'.'*/).write("pct")
                   .write(40/*'('*/).debug(this.value).write(41/*')'*/);
    return output;
  }

  override toString(): string {
    return this.value + "%";
  }

  @Lazy
  static override zero(): PctLength {
    return new PctLength(0);
  }

  static override of(value: number): PctLength {
    if (value === 0) {
      return this.zero();
    }
    return new PctLength(value);
  }
}

/** @public */
export class UnitlessLength extends Length {
  constructor(value: number) {
    super();
    this.value = value;
  }

  override readonly value: number;

  override get units(): "" {
    return "";
  }

  override pxValue(basis?: LengthBasis | number): number {
    throw new Error("unitless length");
  }

  override toCssValue(): CSSUnitValue | null {
    return null;
  }

  override compareTo(that: unknown): number {
    if (that instanceof Length) {
      const x = this.value;
      const y = that.value;
      return x < y ? -1 : x > y ? 1 : isNaN(y) ? (isNaN(x) ? 0 : -1) : isNaN(x) ? 1 : 0;
    }
    return NaN;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (that instanceof Length) {
      return Numbers.equivalent(this.value, that.value);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (that instanceof UnitlessLength) {
      return this.value === that.value;
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Constructors.hash(UnitlessLength), Numbers.hash(this.value)));
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("Length").write(46/*'.'*/).write("unitless")
                   .write(40/*'('*/).debug(this.value).write(41/*')'*/);
    return output;
  }

  override toString(): string {
    return this.value + "";
  }

  @Lazy
  static override zero(): UnitlessLength {
    return new UnitlessLength(0);
  }

  static override of(value: number): UnitlessLength {
    if (value === 0) {
      return this.zero();
    }
    return new UnitlessLength(value);
  }
}

/** @internal */
export const LengthInterpolator = (function (_super: typeof Interpolator) {
  const LengthInterpolator = function (l0: Length, l1: Length): Interpolator<Length> {
    const interpolator = function (u: number): Length {
      const l0 = interpolator[0];
      const l1 = interpolator[1];
      return Length.of(l0.value + u * (l1.value - l0.value), l1.units);
    } as Interpolator<Length>;
    Object.setPrototypeOf(interpolator, LengthInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = l0.to(l1.units);
    (interpolator as Mutable<typeof interpolator>)[1] = l1;
    return interpolator;
  } as {
    (l0: Length, l1: Length): Interpolator<Length>;

    /** @internal */
    prototype: Interpolator<Length>;
  };

  LengthInterpolator.prototype = Object.create(_super.prototype);
  LengthInterpolator.prototype.constructor = LengthInterpolator;

  return LengthInterpolator;
})(Interpolator);

/** @internal */
export class LengthForm extends Form<Length, LengthLike> {
  constructor(defaultUnits: LengthUnits | undefined, unit: Length | undefined) {
    super();
    this.defaultUnits = defaultUnits;
    Object.defineProperty(this, "unit", {
      value: unit,
      enumerable: true,
      configurable: true,
    });
  }

  readonly defaultUnits: LengthUnits | undefined;

  override readonly unit: Length | undefined;

  override withUnit(unit: Length | undefined): Form<Length, LengthLike> {
    if (unit === this.unit) {
      return this;
    }
    return new LengthForm(this.defaultUnits, unit);
  }

  override mold(length: LengthLike): Item {
    length = Length.fromLike(length, this.defaultUnits);
    return Text.from(length.toString());
  }

  override cast(item: Item): Length | undefined {
    const value = item.toValue();
    let length: Length | null = null;
    try {
      length = Length.fromValue(value);
      if (length !== void 0) {
        const string = value.stringValue(void 0);
        if (string !== void 0) {
          length = Length.parse(string, this.defaultUnits);
        }
      }
    } catch (e) {
      // swallow
    }
    return length !== null ? length : void 0;
  }
}

/** @internal */
export class LengthParser extends Parser<Length> {
  private readonly defaultUnits: LengthUnits | undefined;
  private readonly valueParser: Parser<number> | undefined;
  private readonly unitsOutput: Output<string> | undefined;
  private readonly step: number | undefined;

  constructor(defaultUnits?: LengthUnits, valueParser?: Parser<number>,
              unitsOutput?: Output<string>, step?: number) {
    super();
    this.defaultUnits = defaultUnits;
    this.valueParser = valueParser;
    this.unitsOutput = unitsOutput;
    this.step = step;
  }

  override feed(input: Input): Parser<Length> {
    return LengthParser.parse(input, this.defaultUnits, this.valueParser,
                              this.unitsOutput, this.step);
  }

  static parse(input: Input, defaultUnits?: LengthUnits, valueParser?: Parser<number>,
               unitsOutput?: Output<string>, step: number = 1): Parser<Length> {
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
      while (input.isCont() && (c = input.head(), Unicode.isAlpha(c) || c === 37/*'%'*/)) {
        input = input.step();
        unitsOutput.push(c);
      }
      if (!input.isEmpty()) {
        const value = valueParser!.bind();
        const units = unitsOutput.bind() || defaultUnits;
        switch (units) {
          case "px": return Parser.done(Length.px(value));
          case "em": return Parser.done(Length.em(value));
          case "rem": return Parser.done(Length.rem(value));
          case "%": return Parser.done(Length.pct(value));
          case "":
          case void 0: return Parser.done(Length.unitless(value));
          default: return Parser.error(Diagnostic.message("unknown length units: " + units, input));
        }
      }
    }
    return new LengthParser(defaultUnits, valueParser, unitsOutput, step);
  }
}
