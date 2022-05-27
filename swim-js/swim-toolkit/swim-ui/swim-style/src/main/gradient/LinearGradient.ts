// Copyright 2015-2022 Swim.inc
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

import {Equals, Equivalent, Mutable, Arrays, Values, Interpolate, Interpolator} from "@swim/util";
import {Parser, Diagnostic, Unicode} from "@swim/codec";
import {Angle} from "@swim/math";
import {AnyColorStop, ColorStop} from "./ColorStop";
import {LinearGradientInterpolator} from "../"; // forward import
import {LinearGradientAngleParser} from "../"; // forward import
import {LinearGradientParser} from "../"; // forward import

/** @public */
export type AnyLinearGradient = LinearGradient | LinearGradientInit | string;

/** @public */
export type AnyLinearGradientAngle = LinearGradientAngle | number;

/** @public */
export type LinearGradientAngle = Angle | LinearGradientSide | LinearGradientCorner;

/** @public */
export type LinearGradientCorner = [LinearGradientSide, LinearGradientSide];

/** @public */
export type LinearGradientSide = "left" | "right" | "top" | "bottom";

/** @public */
export interface LinearGradientInit {
  angle: AnyLinearGradientAngle;
  stops: AnyColorStop[];
}

/** @public */
export class LinearGradient implements Interpolate<LinearGradient>, Equals, Equivalent {
  constructor(angle: LinearGradientAngle, stops: ReadonlyArray<ColorStop>) {
    this.angle = angle;
    this.stops = stops;
    this.stringValue = void 0;
  }

  readonly angle: LinearGradientAngle;

  withAngle(angle: AnyLinearGradientAngle): LinearGradient {
    if (angle instanceof Angle || typeof angle === "number") {
      angle = Angle.fromAny(angle, "deg");
    }
    return new LinearGradient(angle, this.stops);
  }

  readonly stops: ReadonlyArray<ColorStop>;

  withStops(stops: ReadonlyArray<AnyColorStop>): LinearGradient {
    const n = stops.length;
    const array = new Array<ColorStop>(n);
    for (let i = 0; i < n; i += 1) {
      array[i] = ColorStop.fromAny(stops[i]!);
    }
    return new LinearGradient(this.angle, array);
  }

  interpolateTo(that: LinearGradient): Interpolator<LinearGradient>;
  interpolateTo(that: unknown): Interpolator<LinearGradient> | null;
  interpolateTo(that: unknown): Interpolator<LinearGradient> | null {
    if (that instanceof LinearGradient) {
      return LinearGradientInterpolator(this, that);
    } else {
      return null;
    }
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof LinearGradient) {
      return Values.equivalent(this.angle, that.angle, epsilon)
          && Arrays.equivalent(this.stops, that.stops, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof LinearGradient) {
      return Values.equal(this.angle, that.angle)
          && Arrays.equal(this.stops, that.stops);
    }
    return false;
  }

  /** @internal */
  readonly stringValue: string | undefined;

  toString(): string {
    let s = this.stringValue;
    if (s === void 0) {
      s = "linear-gradient(";
      if (this.angle instanceof Angle) {
        s += this.angle.toString();
      } else {
        s += "to"
        if (typeof this.angle === "string") {
          s += " ";
          s += this.angle;
        } else {
          for (let i = 0, n = this.angle.length; i < n; i += 1) {
            s += " ";
            s += this.angle[i];
          }
        }
      }
      for (let i = 0, n = this.stops.length; i < n; i += 1) {
        s += ", ";
        s += this.stops[i]!.toString();
      }
      s += ")";
      (this as Mutable<this>).stringValue = s;
    }
    return s;
  }

  static create(angle: AnyLinearGradientAngle, ...stops: AnyColorStop[]): LinearGradient {
    if (angle instanceof Angle || typeof angle === "number") {
      angle = Angle.fromAny(angle, "deg");
    }
    const n = stops.length;
    const array = new Array<ColorStop>(n);
    for (let i = 0; i < n; i += 1) {
      const stop = stops[i];
      if (typeof stop === "string") {
        if (i === 0) {
          array[i] = ColorStop.parse(stop);
        } else {
          array[i] = ColorStop.parseHint(stop);
        }
      } else {
        array[i] = ColorStop.fromAny(stops[i]!);
      }
    }
    return new LinearGradient(angle, array);
  }

  static fromInit(init: LinearGradientInit): LinearGradient {
    let angle: AnyLinearGradientAngle = init.angle;
    if (angle instanceof Angle || typeof angle === "number") {
      angle = Angle.fromAny(angle, "deg");
    }
    const n = init.stops.length;
    const array = new Array<ColorStop>(n);
    for (let i = 0; i < n; i += 1) {
      array[i] = ColorStop.fromAny(init.stops[i]!);
    }
    return new LinearGradient(angle, array);
  }

  static fromAny(value: AnyLinearGradient): LinearGradient;
  static fromAny(value: AnyLinearGradient | null): LinearGradient | null;
  static fromAny(value: AnyLinearGradient | null | undefined): LinearGradient | null | undefined;
  static fromAny(value: AnyLinearGradient | null | undefined): LinearGradient | null | undefined {
    if (value === void 0 || value === null || value instanceof LinearGradient) {
      return value;
    } else if (typeof value === "string") {
      return LinearGradient.parse(value);
    } else if (typeof value === "object" && value !== null) {
      return LinearGradient.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  static parse(string: string): LinearGradient {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = LinearGradientParser.parse(input);
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

  static parseAngle(string: string): LinearGradientAngle {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = LinearGradientAngleParser.parse(input);
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

  /** @internal */
  static isInit(value: unknown): value is LinearGradientInit {
    if (typeof value === "object" && value !== null) {
      const init = value as LinearGradientInit;
      return init.angle !== void 0 && init.stops !== void 0;
    }
    return false;
  }

  /** @internal */
  static isAny(value: unknown): value is AnyLinearGradient {
    return value instanceof LinearGradient
        || LinearGradient.isInit(value)
        || typeof value === "string";
  }
}
