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

import {Equals, Equivalent, Interpolate, Interpolator} from "@swim/util";
import {Parser, Diagnostic, Unicode} from "@swim/codec";
import {AnyLength, Length} from "@swim/math";
import {AnyColor, Color} from "../color/Color";
import {ColorStopInterpolator} from "../"; // forward import
import {ColorStopParser} from "../"; // forward import
import {ColorStopListParser} from "../"; // forward import

/** @public */
export type AnyColorStop = ColorStop | ColorStopInit | ColorStopTuple | string;

/** @public */
export interface ColorStopInit {
  color: AnyColor;
  stop?: AnyLength;
  hint?: AnyLength;
}

/** @public */
export type ColorStopTuple = [AnyColor, AnyLength | null];

/** @public */
export class ColorStop implements Interpolate<ColorStop>, Equals, Equivalent {
  constructor(color: Color, stop: Length | null, hint: Length | null) {
    this.color = color;
    this.stop = stop;
    this.hint = hint;
  }

  readonly color: Color;

  withColor(color: AnyColor): ColorStop {
    color = Color.fromAny(color);
    return new ColorStop(color, this.stop, this.hint);
  }

  readonly stop: Length | null;

  withStop(stop: AnyLength | null): ColorStop {
    if (stop !== null) {
      stop = Length.fromAny(stop, "%");
    }
    return new ColorStop(this.color, stop, this.hint);
  }

  readonly hint: Length | null;

  withHint(hint: AnyLength | null): ColorStop {
    if (hint !== null) {
      hint = Length.fromAny(hint, "%");
    }
    return new ColorStop(this.color, this.stop, hint);
  }

  interpolateTo(that: ColorStop): Interpolator<ColorStop>;
  interpolateTo(that: unknown): Interpolator<ColorStop> | null;
  interpolateTo(that: unknown): Interpolator<ColorStop> | null {
    if (that instanceof ColorStop) {
      return ColorStopInterpolator(this, that);
    } else {
      return null;
    }
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof ColorStop) {
      return Equivalent(this.color, that.color, epsilon)
          && Equivalent(this.stop, that.stop, epsilon)
          && Equivalent(this.hint, that.hint, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof ColorStop) {
      return this.color.equals(that.color)
          && Equals(this.stop, that.stop)
          && Equals(this.hint, that.hint);
    }
    return false;
  }

  toString(): string {
    let s = "";
    if (this.hint !== null) {
      s += this.hint.toString();
      s += ", ";
    }
    s += this.color.toString();
    if (this.stop !== null) {
      s += " ";
      s += this.stop.toString();
    }
    return s;
  }

  static create(color: AnyColor, stop: AnyLength | null = null,
                hint: AnyLength | null = null): ColorStop {
    color = Color.fromAny(color);
    if (stop !== null) {
      stop = Length.fromAny(stop, "%");
    }
    if (hint !== null) {
      hint = Length.fromAny(hint, "%");
    }
    return new ColorStop(color, stop as Length | null, hint as Length | null);
  }

  static fromInit(init: ColorStopInit): ColorStop {
    const color = Color.fromAny(init.color);
    const stop = init.stop !== void 0 ? Length.fromAny(init.stop, "%") : null;
    const hint = init.hint !== void 0 ? Length.fromAny(init.hint, "%") : null;
    return new ColorStop(color, stop, hint);
  }

  static fromTuple(value: ColorStopTuple): ColorStop {
    const color = Color.fromAny(value[0]);
    const stop = value[1] !== null ? Length.fromAny(value[1], "%") : null;
    return new ColorStop(color, stop, null);
  }

  static fromAny(value: AnyColorStop): ColorStop {
    if (value === void 0 || value === null || value instanceof ColorStop) {
      return value;
    } else if (typeof value === "string") {
      return ColorStop.parse(value);
    } else if (ColorStop.isInit(value)) {
      return ColorStop.fromInit(value);
    } else if (ColorStop.isTuple(value)) {
      return ColorStop.fromTuple(value);
    }
    throw new TypeError("" + value);
  }

  static parse(string: string): ColorStop {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = ColorStopParser.parse(input);
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

  static parseHint(string: string): ColorStop {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = ColorStopParser.parseHint(input);
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

  static parseList(string: string): ColorStop[] {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = ColorStopListParser.parse(input);
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
  static isInit(value: unknown): value is ColorStopInit {
    if (typeof value === "object" && value !== null) {
      const init = value as ColorStopInit;
      return init.color !== void 0;
    }
    return false;
  }

  /** @internal */
  static isTuple(value: unknown): value is ColorStopTuple {
    return Array.isArray(value)
        && value.length === 2
        && Color.isAny(value[0])
        && (value[1] === null || Length.isAny(value[1]));
  }

  /** @internal */
  static isAny(value: unknown): value is AnyColorStop {
    return value instanceof ColorStop
        || ColorStop.isInit(value)
        || ColorStop.isTuple(value)
        || typeof value === "string";
  }
}
