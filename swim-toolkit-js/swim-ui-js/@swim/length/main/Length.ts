// Copyright 2015-2020 Swim inc.
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

import {HashCode} from "@swim/util";
import {Output, Parser, Debug, Diagnostic, Unicode} from "@swim/codec";
import {Attr, Value, Form} from "@swim/structure";
import {PxLength} from "./PxLength";
import {EmLength} from "./EmLength";
import {RemLength} from "./RemLength";
import {PctLength} from "./PctLength";
import {UnitlessLength} from "./UnitlessLength";
import {LengthParser} from "./LengthParser";
import {LengthForm} from "./LengthForm";

export type LengthUnits = "px" | "em" | "rem" | "%" | "";

export type AnyLength = Length | string | number;

export abstract class Length implements HashCode, Debug {
  isDefined(): boolean {
    return this.value !== 0;
  }

  abstract isRelative(): boolean;

  abstract get value(): number;

  abstract get units(): LengthUnits;

  abstract get node(): Node | null;

  plus(that: AnyLength, units: LengthUnits = this.units): Length {
    that = Length.fromAny(that);
    return Length.from(this.toValue(units) + that.toValue(units), units);
  }

  opposite(units: LengthUnits = this.units): Length {
    return Length.from(-this.toValue(units), units);
  }

  minus(that: AnyLength, units: LengthUnits = this.units): Length {
    that = Length.fromAny(that);
    return Length.from(this.toValue(units) - that.toValue(units), units);
  }

  times(scalar: number, units: LengthUnits = this.units): Length {
    return Length.from(this.toValue(units) * scalar, units);
  }

  divide(scalar: number, units: LengthUnits = this.units): Length {
    return Length.from(this.toValue(units) / scalar, units);
  }

  combine(that: AnyLength, scalar: number = 1, units: LengthUnits = this.units): Length {
    that = Length.fromAny(that);
    return Length.from(this.toValue(units) + that.toValue(units) * scalar, units);
  }

  /** Returns the base unit value, in pixels. */
  abstract unitValue(): number;

  abstract pxValue(unitValue?: number): number;

  emValue(): number {
    return this.pxValue() / Length.emUnit(this.node);
  }

  remValue(): number {
    return this.pxValue() / Length.remUnit();
  }

  pctValue(): number {
    return this.px().value / this.unitValue();
  }

  px(unitValue?: number): PxLength {
    return Length.px(this.pxValue(unitValue), this.node);
  }

  em(): EmLength {
    return Length.em(this.emValue(), this.node);
  }

  rem(): RemLength {
    return Length.rem(this.remValue(), this.node);
  }

  pct(): PctLength {
    return Length.pct(this.pctValue(), this.node);
  }

  toValue(units: LengthUnits): number {
    switch (units) {
      case "px": return this.pxValue();
      case "em": return this.emValue();
      case "rem": return this.remValue();
      case "%": return this.pctValue();
      default: throw new Error("unknown length units: " + units);
    }
  }

  to(units: LengthUnits): Length {
    switch (units) {
      case "px": return this.px();
      case "em": return this.em();
      case "rem": return this.rem();
      case "%": return this.pct();
      default: throw new Error("unknown length units: " + units);
    }
  }

  toCssValue(): CSSUnitValue | undefined {
    return void 0; // conditionally overridden when CSS Typed OM is available
  }

  abstract equals(that: unknown): boolean;

  abstract hashCode(): number;

  abstract debug(output: Output): void;

  abstract toString(): string;

  static zero(units?: LengthUnits, node?: Node | null): Length;
  static zero(node?: Node | null): Length;
  static zero(units?: LengthUnits | Node | null, node?: Node | null): Length {
    if (typeof units !== "string") {
      node = units;
      units = "px";
    }
    switch (units) {
      case "px": return Length.Px.zero(node);
      case "em": return Length.Em.zero(node);
      case "rem": return Length.Rem.zero(node);
      case "%": return Length.Pct.zero(node);
      case "": return Length.Unitless.zero(node);
      default: throw new Error("unknown length units: " + units);
    }
  }

  static px(value: number, node?: Node | null): PxLength {
    return new Length.Px(value, node);
  }

  static em(value: number, node?: Node | null): EmLength {
    return new Length.Em(value, node);
  }

  static rem(value: number, node?: Node | null): RemLength {
    return new Length.Rem(value, node);
  }

  static pct(value: number, node?: Node | null): PctLength {
    return new Length.Pct(value, node);
  }

  static unitless(value: number, node?: Node | null): UnitlessLength {
    return new Length.Unitless(value, node);
  }

  static from(value: number, units?: LengthUnits, node?: Node | null): Length;
  static from(value: number, node?: Node | null): Length;
  static from(value: number, units?: LengthUnits | Node | null, node?: Node | null): Length {
    if (typeof units !== "string") {
      node = units;
      units = "px";
    }
    switch (units) {
      case "px": return Length.px(value, node);
      case "em": return Length.em(value, node);
      case "rem": return Length.rem(value, node);
      case "%": return Length.pct(value, node);
      case "": return Length.unitless(value, node);
      default: throw new Error("unknown length units: " + units);
    }
  }

  static fromCss(value: CSSStyleValue, node?: Node | null): Length {
    if (value instanceof CSSUnitValue) {
      switch (value.unit) {
        case "px": return Length.px(value.value, node);
        case "em": return Length.em(value.value, node);
        case "rem": return Length.rem(value.value, node);
        case "percent": return Length.pct(value.value, node);
        case "number": return Length.unitless(value.value, node);
        default: throw new Error("unknown length units: " + value.unit);
      }
    } else {
      throw new TypeError("" + value);
    }
  }

  static fromAny(value: AnyLength, defaultUnits?: LengthUnits, node?: Node | null): Length;
  static fromAny(value: AnyLength, node?: Node | null): Length;
  static fromAny(value: AnyLength, defaultUnits?: LengthUnits | Node | null, node?: Node | null): Length {
    if (typeof defaultUnits !== "string") {
      node = defaultUnits;
      defaultUnits = void 0;
    }
    if (value instanceof Length) {
      return value;
    } else if (typeof value === "number") {
      return Length.from(value, defaultUnits, node);
    } else if (typeof value === "string" && typeof defaultUnits !== "string") {
      return Length.parse(value, defaultUnits, node);
    }
    throw new TypeError("" + value);
  }

  static fromValue(value: Value, node?: Node | null): Length | undefined {
    if (value.length === 2) {
      const num = value.getItem(0).numberValue(void 0);
      const units = value.getItem(1);
      if (num !== void 0 && isFinite(num) && units instanceof Attr && units.toValue() === Value.extant()) {
        switch (units.key.value) {
          case "px": return Length.px(num, node);
          case "em": return Length.em(num, node);
          case "rem": return Length.rem(num, node);
          case "pct": return Length.pct(num, node);
          default:
        }
      }
    }
    return void 0;
  }

  static parse(string: string, defaultUnits?: LengthUnits, node?: Node | null): Length;
  static parse(string: string, node?: Node | null): Length;
  static parse(string: string, defaultUnits?: LengthUnits | Node | null, node?: Node | null): Length {
    if (typeof defaultUnits !== "string") {
      node = defaultUnits;
      defaultUnits = void 0;
    }
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = Length.Parser.parse(input, defaultUnits, node);
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

  /** @hidden */
  static isAny(value: unknown): value is AnyLength {
    return value instanceof Length
        || typeof value === "number"
        || typeof value === "string";
  }

  private static _form: Form<Length, AnyLength>;
  static form(defaultUnits?: LengthUnits, node: Node | null = null, unit?: AnyLength): Form<Length, AnyLength> {
    if (unit !== void 0) {
      unit = Length.fromAny(unit);
    }
    if (defaultUnits !== void 0 || node !== null || unit !== void 0) {
      return new Length.Form(defaultUnits, node, unit);
    } else {
      if (Length._form === void 0) {
        Length._form = new Length.Form();
      }
      return Length._form;
    }
  }

  /** @hidden */
  static widthUnit(node: Node | null): number {
    while (node !== null) {
      if (node instanceof HTMLElement && node.offsetParent instanceof HTMLElement) {
        return node.offsetParent.offsetWidth;
      }
      node = node.parentNode;
    }
    return 0;
  }

  /** @hidden */
  static emUnit(node: Node | null): number {
    while (node !== null) {
      if (node instanceof Element) {
        const fontSize = getComputedStyle(node).fontSize;
        if (fontSize !== null) {
          return parseFloat(fontSize);
        }
      }
      node = node.parentNode;
    }
    return 0;
  }

  /** @hidden */
  static remUnit(): number {
    const fontSize = getComputedStyle(document.documentElement).fontSize;
    if (fontSize !== null) {
      return parseFloat(fontSize);
    }
    return 0;
  }

  // Forward type declarations
  /** @hidden */
  static Px: typeof PxLength; // defined by PxLength
  /** @hidden */
  static Em: typeof EmLength; // defined by EmLength
  /** @hidden */
  static Rem: typeof RemLength; // defined by RemLength
  /** @hidden */
  static Pct: typeof PctLength; // defined by PctLength
  /** @hidden */
  static Unitless: typeof UnitlessLength; // defined by UnitlessLength
  /** @hidden */
  static Parser: typeof LengthParser; // defined by LengthParser
  /** @hidden */
  static Form: typeof LengthForm; // defined by LengthForm
}
