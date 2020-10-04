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
import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color} from "@swim/color";
import {ColorStopParser} from "./ColorStopParser";
import {ColorStopListParser} from "./ColorStopListParser";

export type AnyColorStop = ColorStop | ColorStopInit | ColorStopTuple | string;

export interface ColorStopInit {
  color: AnyColor;
  stop?: AnyLength;
  hint?: AnyLength;
}

export type ColorStopTuple = [AnyColor, AnyLength | null];

export class ColorStop implements Equals {
  /** @hidden */
  readonly _color: Color;
  /** @hidden */
  readonly _stop: Length | null;
  /** @hidden */
  readonly _hint: Length | null

  constructor(color: Color, stop: Length | null, hint: Length | null) {
    this._color = color;
    this._stop = stop;
    this._hint = hint;
  }

  color(): Color;
  color(color: AnyColor): ColorStop;
  color(color?: AnyColor): Color | ColorStop {
    if (color === void 0) {
      return this._color;
    } else {
      color = Color.fromAny(color);
      return new ColorStop(color, this._stop, this._hint);
    }
  }

  stop(): Length | null;
  stop(stop: AnyLength | null): ColorStop;
  stop(stop?: AnyLength | null): Length | null | ColorStop {
    if (stop === void 0) {
      return this._stop;
    } else {
      if (stop !== null) {
        stop = Length.fromAny(stop, "%");
      }
      return new ColorStop(this._color, stop, this._hint);
    }
  }

  hint(): Length | null;
  hint(hint: AnyLength | null): ColorStop;
  hint(hint?: AnyLength | null): Length | null | ColorStop {
    if (hint === void 0) {
      return this._hint;
    } else {
      if (hint !== null) {
        hint = Length.fromAny(hint, "%");
      }
      return new ColorStop(this._color, this._stop, hint);
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof ColorStop) {
      return this._color.equals(that._color)
          && Objects.equal(this._stop, that._stop)
          && Objects.equal(this._hint, that._hint);
    }
    return false;
  }

  toString(): string {
    let s = "";
    if (this._hint !== null) {
      s += this._hint.toString();
      s += ", ";
    }
    s += this._color.toString();
    if (this._stop !== null) {
      s += " ";
      s += this._stop.toString();
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
    if (value instanceof ColorStop) {
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
    let parser = ColorStop.Parser.parse(input);
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
    let parser = ColorStop.Parser.parseHint(input);
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
    let parser = ColorStop.ListParser.parse(input);
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
  static isInit(value: unknown): value is ColorStopInit {
    if (typeof value === "object" && value !== null) {
      const init = value as ColorStopInit;
      return init.color !== void 0;
    }
    return false;
  }

  /** @hidden */
  static isTuple(value: unknown): value is ColorStopTuple {
    return Array.isArray(value)
        && value.length === 2
        && Color.isAny(value[0])
        && (value[1] === null || Length.isAny(value[1]));
  }

  /** @hidden */
  static isAny(value: unknown): value is AnyColorStop {
    return value instanceof ColorStop
        || ColorStop.isInit(value)
        || ColorStop.isTuple(value)
        || typeof value === "string";
  }

  // Forward type declarations
  /** @hidden */
  static Parser: typeof ColorStopParser; // defined by ColorStopParser
  /** @hidden */
  static ListParser: typeof ColorStopListParser; // defined by ColorStopListParser
}
