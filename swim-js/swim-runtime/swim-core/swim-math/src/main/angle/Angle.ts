// Copyright 2015-2023 Swim.inc
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
import {DegAngle} from "../"; // forward import
import {RadAngle} from "../"; // forward import
import {GradAngle} from "../"; // forward import
import {TurnAngle} from "../"; // forward import
import {AngleInterpolator} from "../"; // forward import
import {AngleForm} from "../"; // forward import
import {AngleParser} from "../"; // forward import

/** @public */
export type AngleUnits = "deg" | "rad" | "grad" | "turn";

/** @public */
export type AnyAngle = Angle | string | number;

/** @public */
export abstract class Angle implements Interpolate<Angle>, HashCode, Equivalent, Compare, Debug {
  isDefined(): boolean {
    return isFinite(this.value);
  }

  abstract readonly value: number;

  abstract readonly units: AngleUnits;

  plus(that: AnyAngle, units: AngleUnits = this.units): Angle {
    that = Angle.fromAny(that);
    return Angle.create(this.toValue(units) + that.toValue(units), units);
  }

  negative(units: AngleUnits = this.units): Angle {
    return Angle.create(-this.toValue(units), units);
  }

  minus(that: AnyAngle, units: AngleUnits = this.units): Angle {
    that = Angle.fromAny(that);
    return Angle.create(this.toValue(units) - that.toValue(units), units);
  }

  times(scalar: number, units: AngleUnits = this.units): Angle {
    return Angle.create(this.toValue(units) * scalar, units);
  }

  divide(scalar: number, units: AngleUnits = this.units): Angle {
    return Angle.create(this.toValue(units) / scalar, units);
  }

  combine(that: AnyAngle, scalar: number = 1, units: AngleUnits = this.units): Angle {
    that = Angle.fromAny(that);
    return Angle.create(this.toValue(units) + that.toValue(units) * scalar, units);
  }

  norm(total: AnyAngle, units: AngleUnits = this.units): Angle {
    total = Angle.fromAny(total);
    return Angle.create(this.toValue(units) / total.toValue(units), units);
  }

  abstract degValue(): number;

  abstract gradValue(): number;

  abstract radValue(): number;

  abstract turnValue(): number;

  deg(): DegAngle {
    return Angle.deg(this.degValue());
  }

  rad(): RadAngle {
    return Angle.rad(this.radValue());
  }

  grad(): GradAngle {
    return Angle.grad(this.gradValue());
  }

  turn(): TurnAngle {
    return Angle.turn(this.turnValue());
  }

  toValue(): Value;
  toValue(units: AngleUnits): number;
  toValue(units?: AngleUnits): Value | number {
    if (units === void 0) {
      return Text.from(this.toString());
    } else {
      switch (units) {
        case "deg": return this.degValue();
        case "rad": return this.radValue();
        case "grad": return this.gradValue();
        case "turn": return this.turnValue();
        default: throw new Error("unknown angle units: " + units);
      }
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

  interpolateTo(that: Angle): Interpolator<Angle>;
  interpolateTo(that: unknown): Interpolator<Angle> | null;
  interpolateTo(that: unknown): Interpolator<Angle> | null {
    if (that instanceof Angle) {
      return AngleInterpolator(this, that);
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
    return new DegAngle(value);
  }

  static rad(value: number): RadAngle {
    return new RadAngle(value);
  }

  static grad(value: number): GradAngle {
    return new GradAngle(value);
  }

  static turn(value: number): TurnAngle {
    return new TurnAngle(value);
  }

  static create(value: number, units?: AngleUnits): Angle {
    switch (units) {
      case "deg": return Angle.deg(value);
      case void 0:
      case "rad": return Angle.rad(value);
      case "grad": return Angle.grad(value);
      case "turn": return Angle.turn(value);
      default: throw new Error("unknown angle units: " + units);
    }
  }

  static fromCssValue(value: CSSStyleValue): Angle {
    if (value instanceof CSSUnitValue) {
      return Angle.create(value.value, value.unit as AngleUnits);
    } else {
      throw new TypeError("" + value);
    }
  }

  static fromAny(value: AnyAngle, defaultUnits?: AngleUnits): Angle {
    if (value === void 0 || value === null || value instanceof Angle) {
      return value;
    } else if (typeof value === "number") {
      return Angle.create(value, defaultUnits);
    } else if (typeof value === "string") {
      return Angle.parse(value, defaultUnits);
    }
    throw new TypeError("" + value);
  }

  static fromValue(value: Value): Angle | null {
    if (value.length === 2) {
      const num = value.getItem(0).numberValue();
      const units = value.getItem(1);
      if (num !== void 0 && isFinite(num) && units instanceof Attr && units.toValue() === Value.extant()) {
        switch (units.key.value) {
          case "deg": return Angle.deg(num);
          case "rad": return Angle.rad(num);
          case "grad": return Angle.grad(num);
          case "turn": return Angle.turn(num);
          default:
        }
      }
    }
    return null;
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
  static form(): Form<Angle, AnyAngle> {
    return new AngleForm(void 0, Angle.zero());
  }

  /** @internal */
  static isAny(value: unknown): value is AnyAngle {
    return value instanceof Angle
        || typeof value === "number"
        || typeof value === "string";
  }
}
