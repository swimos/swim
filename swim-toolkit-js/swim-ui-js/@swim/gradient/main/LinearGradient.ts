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

import {Equals, Objects} from "@swim/util";
import {Parser, Diagnostic, Unicode} from "@swim/codec";
import {Angle} from "@swim/angle";
import {AnyColorStop, ColorStop} from "./ColorStop";
import {LinearGradientParser} from "./LinearGradientParser";
import {LinearGradientAngleParser} from "./LinearGradientAngleParser";

export type AnyLinearGradient = LinearGradient | LinearGradientInit | string;

export type AnyLinearGradientAngle = LinearGradientAngle | number;

export type LinearGradientAngle = Angle | LinearGradientSide | LinearGradientCorner;

export type LinearGradientCorner = [LinearGradientSide, LinearGradientSide];

export type LinearGradientSide = "left" | "right" | "top" | "bottom";

export interface LinearGradientInit {
  angle: AnyLinearGradientAngle;
  stops: AnyColorStop[];
}

export class LinearGradient implements Equals {
  /** @hidden */
  readonly _angle: LinearGradientAngle;
  /** @hidden */
  readonly _stops: ReadonlyArray<ColorStop>;
  /** @hidden */
  _string?: string;

  constructor(angle: LinearGradientAngle, stops: ReadonlyArray<ColorStop>) {
    this._angle = angle;
    this._stops = stops;
  }

  angle(): LinearGradientAngle;
  angle(angle: AnyLinearGradientAngle): LinearGradient;
  angle(angle?: AnyLinearGradientAngle): LinearGradientAngle | LinearGradient {
    if (angle === void 0) {
      return this._angle;
    } else {
      if (angle instanceof Angle || typeof angle === "number") {
        angle = Angle.fromAny(angle, "deg");
      }
      return new LinearGradient(angle as LinearGradientAngle, this._stops);
    }
  }

  stops(): ReadonlyArray<ColorStop>;
  stops(stops: ReadonlyArray<AnyColorStop>): LinearGradient;
  stops(stops?: ReadonlyArray<AnyColorStop>): ReadonlyArray<ColorStop> | LinearGradient {
    if (stops === void 0) {
      return this._stops;
    } else {
      const n = stops.length;
      const array = new Array<ColorStop>(n);
      for (let i = 0; i < n; i += 1) {
        array[i] = ColorStop.fromAny(stops[i]);
      }
      return new LinearGradient(this._angle, array);
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof LinearGradient) {
      return Objects.equal(this._angle, that._angle)
          && Objects.equal(this._stops, that._stops);
    }
    return false;
  }

  toString(): string {
    let s = this._string;
    if (s === void 0) {
      s = "linear-gradient(";
      if (this._angle instanceof Angle) {
        s += this._angle.toString();
      } else {
        s += "to"
        if (typeof this._angle === "string") {
          s += " ";
          s += this._angle;
        } else {
          for (let i = 0, n = this._angle.length; i < n; i += 1) {
            s += " ";
            s += this._angle[i];
          }
        }
      }
      for (let i = 0, n = this._stops.length; i < n; i += 1) {
        s += ", ";
        s += this._stops[i].toString();
      }
      s += ")";
      this._string = s;
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
        array[i] = ColorStop.fromAny(stops[i]);
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
      array[i] = ColorStop.fromAny(init.stops[i]);
    }
    return new LinearGradient(angle as LinearGradientAngle, array);
  }

  static fromAny(value: AnyLinearGradient): LinearGradient {
    if (value instanceof LinearGradient) {
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
    let parser = LinearGradient.Parser.parse(input);
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
    let parser = LinearGradient.AngleParser.parse(input);
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
  static isInit(value: unknown): value is LinearGradientInit {
    if (typeof value === "object" && value !== null) {
      const init = value as LinearGradientInit;
      return init.angle !== void 0 && init.stops !== void 0;
    }
    return false;
  }

  /** @hidden */
  static isAny(value: unknown): value is AnyLinearGradient {
    return value instanceof LinearGradient
        || LinearGradient.isInit(value)
        || typeof value === "string";
  }

  // Forward type declarations
  /** @hidden */
  static Parser: typeof LinearGradientParser; // defined by LinearGradientParser
  /** @hidden */
  static AngleParser: typeof LinearGradientAngleParser; // defined by LinearGradientAngleParser
}
