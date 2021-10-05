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

import {Lazy, HashCode, Equivalent, Compare, Interpolate, Interpolator} from "@swim/util";
import {Output, Parser, Debug, Diagnostic, Unicode} from "@swim/codec";
import {Attr, Value, Text, Form} from "@swim/structure";
import {LengthException} from "./LengthException";
import {PxLength} from "../"; // forward import
import {EmLength} from "../"; // forward import
import {RemLength} from "../"; // forward import
import {PctLength} from "../"; // forward import
import {UnitlessLength} from "../"; // forward import
import {LengthInterpolator} from "../"; // forward import
import {LengthForm} from "../"; // forward import
import {LengthParser} from "../"; // forward import

export type LengthUnits = "px" | "em" | "rem" | "%" | "";

export interface LengthBasis {
  emUnit?: Node | number;
  remUnit?: number;
  pctUnit?: number;
}

export type AnyLength = Length | string | number;

export abstract class Length implements Interpolate<Length>, HashCode, Equivalent, Compare, Debug {
  isDefined(): boolean {
    return isFinite(this.value);
  }

  abstract readonly value: number;

  abstract readonly units: LengthUnits;

  plus(that: AnyLength, units: LengthUnits = this.units, basis?: LengthBasis | number): Length {
    that = Length.fromAny(that);
    return Length.create(this.toValue(units, basis) + that.toValue(units, basis), units);
  }

  negative(units: LengthUnits = this.units, basis?: LengthBasis | number): Length {
    return Length.create(-this.toValue(units, basis), units);
  }

  minus(that: AnyLength, units: LengthUnits = this.units, basis?: LengthBasis | number): Length {
    that = Length.fromAny(that);
    return Length.create(this.toValue(units, basis) - that.toValue(units, basis), units);
  }

  times(scalar: number, units: LengthUnits = this.units, basis?: LengthBasis | number): Length {
    return Length.create(this.toValue(units, basis) * scalar, units);
  }

  divide(scalar: number, units: LengthUnits = this.units, basis?: LengthBasis | number): Length {
    return Length.create(this.toValue(units, basis) / scalar, units);
  }

  combine(that: AnyLength, scalar: number = 1, units: LengthUnits = this.units, basis?: LengthBasis | number): Length {
    that = Length.fromAny(that);
    return Length.create(this.toValue(units, basis) + that.toValue(units, basis) * scalar, units);
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
    return Length.px(this.pxValue(basis));
  }

  em(basis?: LengthBasis | number): EmLength {
    return Length.em(this.emValue(basis));
  }

  rem(basis?: LengthBasis | number): RemLength {
    return Length.rem(this.remValue(basis));
  }

  pct(basis?: LengthBasis | number): PctLength {
    return Length.pct(this.pctValue(basis));
  }

  toValue(): Value;
  toValue(units: LengthUnits, basis?: LengthBasis | number): number;
  toValue(units?: LengthUnits, basis?: LengthBasis | number): Value | number {
    if (units === void 0) {
      return Text.from(this.toString());
    } else {
      switch (units) {
        case "px": return this.pxValue(basis);
        case "em": return this.emValue(basis);
        case "rem": return this.remValue(basis);
        case "%": return this.pctValue(basis);
        default: throw new LengthException("unknown length units: " + units);
      }
    }
  }

  to(units: LengthUnits, basis?: LengthBasis | number): Length {
    switch (units) {
      case "px": return this.px(basis);
      case "em": return this.em(basis);
      case "rem": return this.rem(basis);
      case "%": return this.pct(basis);
      default: throw new LengthException("unknown length units: " + units);
    }
  }

  abstract toCssValue(): CSSUnitValue | null;

  interpolateTo(that: Length): Interpolator<Length>;
  interpolateTo(that: unknown): Interpolator<Length> | null;
  interpolateTo(that: unknown): Interpolator<Length> | null {
    if (that instanceof Length) {
      return LengthInterpolator(this, that);
    } else {
      return null;
    }
  }

  abstract compareTo(that: unknown): number;

  abstract equivalentTo(that: unknown, epsilon?: number): boolean;

  abstract equals(that: unknown): boolean;

  abstract hashCode(): number;

  abstract debug<T>(output: Output<T>): Output<T>;

  abstract toString(): string;

  static zero(units?: LengthUnits): Length {
    switch (units) {
      case void 0:
      case "px": return PxLength.zero();
      case "em": return EmLength.zero();
      case "rem": return RemLength.zero();
      case "%": return PctLength.zero();
      case "": return UnitlessLength.zero();
      default: throw new LengthException("unknown length units: " + units);
    }
  }

  static px(value: number): PxLength {
    return new PxLength(value);
  }

  static em(value: number): EmLength {
    return new EmLength(value);
  }

  static rem(value: number): RemLength {
    return new RemLength(value);
  }

  static pct(value: number): PctLength {
    return new PctLength(value);
  }

  static unitless(value: number): UnitlessLength {
    return new UnitlessLength(value);
  }

  static create(value: number, units?: LengthUnits): Length {
    switch (units) {
      case void 0:
      case "px": return Length.px(value);
      case "em": return Length.em(value);
      case "rem": return Length.rem(value);
      case "%": return Length.pct(value);
      case "": return Length.unitless(value);
      default: throw new LengthException("unknown length units: " + units);
    }
  }

  static fromCssValue(value: CSSStyleValue): Length {
    if (value instanceof CSSUnitValue) {
      return Length.create(value.value, value.unit as LengthUnits);
    } else {
      throw new TypeError("" + value);
    }
  }

  static fromAny(value: AnyLength, defaultUnits?: LengthUnits): Length {
    if (value === void 0 || value === null || value instanceof Length) {
      return value;
    } else if (typeof value === "number") {
      return Length.create(value, defaultUnits);
    } else if (typeof value === "string") {
      return Length.parse(value, defaultUnits);
    }
    throw new TypeError("" + value);
  }

  static fromValue(value: Value): Length | null {
    if (value.length === 2) {
      const num = value.getItem(0).numberValue(void 0);
      const units = value.getItem(1);
      if (num !== void 0 && isFinite(num) && units instanceof Attr && units.value === Value.extant()) {
        switch (units.key.value) {
          case "px": return Length.px(num);
          case "em": return Length.em(num);
          case "rem": return Length.rem(num);
          case "pct": return Length.pct(num);
          default:
        }
      }
    }
    return null;
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
  static form(): Form<Length, AnyLength> {
    return new LengthForm(void 0, Length.zero());
  }

  /** @internal */
  static isAny(value: unknown): value is AnyLength {
    return value instanceof Length
        || typeof value === "number"
        || typeof value === "string";
  }

  /** @internal */
  static emUnit(basis?: LengthBasis | number): number {
    if (typeof basis === "object" && typeof basis.emUnit === "number") {
      return basis.emUnit;
    } else if (typeof basis === "object" && basis.emUnit instanceof Node) {
      let node: Node | null = basis.emUnit;
      while (node !== null) {
        if (node instanceof Element) {
          const fontSize = getComputedStyle(node).fontSize;
          if (typeof fontSize === "string") {
            return parseFloat(fontSize);
          }
        }
        node = node.parentNode;
      }
    }
    throw new LengthException("unknown em unit");
  }

  /** @internal */
  static remUnit(basis?: LengthBasis | number): number {
    if (typeof basis === "object" && typeof basis.remUnit === "number") {
      return basis.remUnit;
    } else {
      const fontSize = getComputedStyle(document.documentElement).fontSize;
      if (typeof fontSize === "string") {
        return parseFloat(fontSize);
      }
    }
    throw new LengthException("unknown rem unit");
  }

  /** @internal */
  static pctUnit(basis?: LengthBasis | number): number {
    if (typeof basis === "number") {
      return basis;
    } else if (typeof basis === "object" && typeof basis.pctUnit === "number") {
      return basis.pctUnit;
    }
    throw new LengthException("unknown percentage unit");
  }
}
