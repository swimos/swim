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
import {Equals} from "@swim/util";
import {Equivalent} from "@swim/util";
import {Objects} from "@swim/util";
import type {Interpolate} from "@swim/util";
import {Interpolator} from "@swim/util";
import {Diagnostic} from "@swim/codec";
import type {Input} from "@swim/codec";
import {Parser} from "@swim/codec";
import {Unicode} from "@swim/codec";
import {LengthLike} from "@swim/math";
import {Length} from "@swim/math";
import {LengthParser} from "@swim/math";
import {ColorLike} from "./Color";
import {Color} from "./Color";
import {ColorParser} from "./Color";

/** @public */
export type ColorStopLike = ColorStop | ColorStopInit | ColorStopTuple | string;

/** @public */
export const ColorStopLike = {
  [Symbol.hasInstance](instance: unknown): instance is ColorStopLike {
    return instance instanceof ColorStop
        || ColorStopInit[Symbol.hasInstance](instance)
        || ColorStopTuple[Symbol.hasInstance](instance)
        || typeof instance === "string";
  },
};

/** @public */
export interface ColorStopInit {
  color: ColorLike;
  stop?: LengthLike;
  hint?: LengthLike;
}

/** @public */
export const ColorStopInit = {
  [Symbol.hasInstance](instance: unknown): instance is ColorStopInit {
    return Objects.hasAllKeys(instance, "color");
  },
};

/** @public */
export type ColorStopTuple = [ColorLike, LengthLike | null];

/** @public */
export const ColorStopTuple = {
  [Symbol.hasInstance](instance: unknown): instance is ColorStopTuple {
    return Array.isArray(instance) && instance.length === 2
        && ColorLike[Symbol.hasInstance](instance[0])
        && (instance[1] === null || LengthLike[Symbol.hasInstance](instance[1]));
  },
};

/** @public */
export class ColorStop implements Interpolate<ColorStop>, Equals, Equivalent {
  constructor(color: Color, stop: Length | null, hint: Length | null) {
    this.color = color;
    this.stop = stop;
    this.hint = hint;
  }

  likeType?(like: ColorStopInit | ColorStopTuple | string): void;

  readonly color: Color;

  withColor(color: ColorLike): ColorStop {
    color = Color.fromLike(color);
    return new ColorStop(color, this.stop, this.hint);
  }

  readonly stop: Length | null;

  withStop(stop: LengthLike | null): ColorStop {
    stop = Length.fromLike(stop, "%");
    return new ColorStop(this.color, stop, this.hint);
  }

  readonly hint: Length | null;

  withHint(hint: LengthLike | null): ColorStop {
    hint = Length.fromLike(hint, "%");
    return new ColorStop(this.color, this.stop, hint);
  }

  /** @override */
  interpolateTo(that: ColorStop): Interpolator<ColorStop>;
  interpolateTo(that: unknown): Interpolator<ColorStop> | null;
  interpolateTo(that: unknown): Interpolator<ColorStop> | null {
    if (that instanceof ColorStop) {
      return ColorStopInterpolator(this, that);
    }
    return null;
  }

  /** @override */
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

  /** @override */
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

  /** @override */
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

  static create(color: ColorLike, stop: LengthLike | null = null,
                hint: LengthLike | null = null): ColorStop {
    color = Color.fromLike(color);
    stop = Length.fromLike(stop, "%");
    hint = Length.fromLike(hint, "%");
    return new ColorStop(color, stop, hint);
  }

  static fromLike<T extends ColorStopLike | null | undefined>(value: T): ColorStop | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof ColorStop) {
      return value as ColorStop | Uninitable<T>;
    } else if (typeof value === "string") {
      return ColorStop.parse(value);
    } else if (ColorStopInit[Symbol.hasInstance](value)) {
      return ColorStop.fromInit(value);
    } else if (ColorStopTuple[Symbol.hasInstance](value)) {
      return ColorStop.fromTuple(value);
    }
    throw new TypeError("" + value);
  }

  static fromInit(init: ColorStopInit): ColorStop {
    const color = Color.fromLike(init.color);
    const stop = init.stop !== void 0 ? Length.fromLike(init.stop, "%") : null;
    const hint = init.hint !== void 0 ? Length.fromLike(init.hint, "%") : null;
    return new ColorStop(color, stop, hint);
  }

  static fromTuple(value: ColorStopTuple): ColorStop {
    const color = Color.fromLike(value[0]);
    const stop = Length.fromLike(value[1], "%");
    return new ColorStop(color, stop, null);
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
}

/** @internal */
export interface ColorStopInterpolator extends Interpolator<ColorStop> {
  /** @internal */
  readonly colorInterpolator: Interpolator<Color>;
  /** @internal */
  readonly stopInterpolator: Interpolator<Length | null>;
  /** @internal */
  readonly hintInterpolator: Interpolator<Length | null>;

  readonly 0: ColorStop;

  readonly 1: ColorStop;

  equals(that: unknown): boolean;
}

/** @internal */
export const ColorStopInterpolator = (function (_super: typeof Interpolator) {
  const ColorStopInterpolator = function (y0: ColorStop, y1: ColorStop): ColorStopInterpolator {
    const interpolator = function (u: number): ColorStop {
      const color = interpolator.colorInterpolator(u);
      const stop = interpolator.stopInterpolator(u);
      const hint = interpolator.hintInterpolator(u);
      return new ColorStop(color, stop, hint);
    } as ColorStopInterpolator;
    Object.setPrototypeOf(interpolator, ColorStopInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>).colorInterpolator = y0.color.interpolateTo(y1.color);
    (interpolator as Mutable<typeof interpolator>).stopInterpolator = Interpolator(y0.stop, y1.stop);
    (interpolator as Mutable<typeof interpolator>).hintInterpolator = Interpolator(y0.hint, y1.hint);
    return interpolator;
  } as {
    (y0: ColorStop, y1: ColorStop): ColorStopInterpolator;

    /** @internal */
    prototype: ColorStopInterpolator;
  };

  ColorStopInterpolator.prototype = Object.create(_super.prototype);
  ColorStopInterpolator.prototype.constructor = ColorStopInterpolator;

  Object.defineProperty(ColorStopInterpolator.prototype, 0, {
    get(this: ColorStopInterpolator): ColorStop {
      const color = this.colorInterpolator[0];
      const stop = this.stopInterpolator[0];
      const hint = this.hintInterpolator[0];
      return new ColorStop(color, stop, hint);
    },
    configurable: true,
  });

  Object.defineProperty(ColorStopInterpolator.prototype, 1, {
    get(this: ColorStopInterpolator): ColorStop {
      const color = this.colorInterpolator[1];
      const stop = this.stopInterpolator[1];
      const hint = this.hintInterpolator[1];
      return new ColorStop(color, stop, hint);
    },
    configurable: true,
  });

  ColorStopInterpolator.prototype.equals = function (that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof ColorStopInterpolator) {
      return this.colorInterpolator.equals(that.colorInterpolator)
          && this.stopInterpolator.equals(that.stopInterpolator)
          && this.hintInterpolator.equals(that.hintInterpolator);
    }
    return false;
  };

  return ColorStopInterpolator;
})(Interpolator);

/** @internal */
export class ColorStopParser extends Parser<ColorStop> {
  private readonly colorParser: Parser<Color> | undefined;
  private readonly stopParser: Parser<Length> | undefined;
  private readonly hintParser: Parser<Length> | undefined;
  private readonly step: number | undefined;

  constructor(colorParser?: Parser<Color>, stopParser?: Parser<Length>,
              hintParser?: Parser<Length>, step?: number) {
    super();
    this.colorParser = colorParser;
    this.stopParser = stopParser;
    this.hintParser = hintParser;
    this.step = step;
  }

  override feed(input: Input): Parser<ColorStop> {
    return ColorStopParser.parse(input, this.colorParser, this.stopParser,
                                 this.hintParser, this.step);
  }

  static parse(input: Input, colorParser?: Parser<Color>, stopParser?: Parser<Length>,
               hintParser?: Parser<Length>, step: number = 4): Parser<ColorStop> {
    let c = 0;
    if (step === 1) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input.step();
      }
      if (input.isCont()) {
        if (c === 45/*'-'*/ || c === 46/*'.'*/ || c >= 48/*'0'*/ && c <= 57/*'9'*/) {
          step = 2;
        } else {
          step = 7;
        }
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 2) {
      if (hintParser === void 0) {
        hintParser = LengthParser.parse(input);
      } else {
        hintParser = hintParser.feed(input);
      }
      if (hintParser !== void 0) {
        if (hintParser.isDone()) {
          step = 3;
        } else if (hintParser.isError()) {
          return hintParser.asError();
        }
      }
    }
    if (step === 3) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input.step();
      }
      if (input.isCont()) {
        if (c === 44/*','*/) {
          input.step();
          step = 4;
        } else {
          stopParser = hintParser;
          hintParser = void 0;
          step = 7;
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 4) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input.step();
      }
      if (input.isCont()) {
        if (c === 45/*'-'*/ || c === 46/*'.'*/ || c >= 48/*'0'*/ && c <= 57/*'9'*/) {
          step = 5;
        } else {
          step = 7;
        }
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 5) {
      if (stopParser === void 0) {
        stopParser = LengthParser.parse(input);
      } else {
        stopParser = stopParser.feed(input);
      }
      if (stopParser !== void 0) {
        if (stopParser.isDone()) {
          step = 6;
        } else if (stopParser.isError()) {
          return stopParser.asError();
        }
      }
    }
    if (step === 6) {
      if (input.isCont()) {
        if (Unicode.isSpace(input.head())) {
          input.step();
          step = 7;
        } else {
          return Parser.error(Diagnostic.expected("color", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 7) {
      if (colorParser === void 0) {
        colorParser = ColorParser.parse(input);
      } else {
        colorParser = colorParser.feed(input);
      }
      if (colorParser !== void 0) {
        if (colorParser.isDone()) {
          if (stopParser !== void 0) {
            const hint = hintParser !== void 0 ? hintParser.bind() : null;
            return Parser.done(new ColorStop(colorParser.bind(), stopParser.bind(), hint));
          } else {
            step = 8;
          }
        } else if (colorParser.isError()) {
          return colorParser.asError();
        }
      }
    }
    if (step === 8) {
      if (input.isCont() && Unicode.isSpace(input.head())) {
        input.step();
        step = 9;
      } else if (!input.isEmpty()) {
        const hint = hintParser !== void 0 ? hintParser.bind() : null;
        return Parser.done(new ColorStop(colorParser!.bind(), null, hint));
      }
    }
    if (step === 9) {
      if (stopParser === void 0) {
        stopParser = LengthParser.parse(input);
      } else {
        stopParser = stopParser.feed(input);
      }
      if (stopParser !== void 0) {
        if (stopParser.isDone()) {
          const hint = hintParser !== void 0 ? hintParser.bind() : null;
          return Parser.done(new ColorStop(colorParser!.bind(), stopParser.bind(), hint));
        } else if (stopParser.isError()) {
          return stopParser.asError();
        }
      }
    }
    return new ColorStopParser(colorParser, stopParser, hintParser, step);
  }

  static parseHint(input: Input): Parser<ColorStop> {
    return ColorStopParser.parse(input, void 0, void 0, void 0, 1);
  }
}

/** @internal */
export class ColorStopListParser extends Parser<ColorStop[]> {
  private readonly stops: readonly ColorStop[] | undefined;
  private readonly stopParser: Parser<ColorStop> | undefined;
  private readonly step: number | undefined;

  constructor(stops?: readonly ColorStop[], stopParser?: Parser<ColorStop>, step?: number) {
    super();
    this.stops = stops;
    this.stopParser = stopParser;
    this.step = step;
  }

  override feed(input: Input): Parser<ColorStop[]> {
    return ColorStopListParser.parse(input, this.stops !== void 0 ? this.stops.slice(0) : void 0,
                                     this.stopParser, this.step);
  }

  static parse(input: Input, stops?: ColorStop[], stopParser?: Parser<ColorStop>,
               step: number = 1): Parser<ColorStop[]> {
    let c = 0;
    if (step === 1) {
      if (stopParser === void 0) {
        while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
          input.step();
        }
        if (!input.isEmpty()) {
          stopParser = ColorStopParser.parse(input);
        }
      } else {
        stopParser = stopParser.feed(input);
      }
      if (stopParser !== void 0) {
        if (stopParser.isDone()) {
          if (stops === void 0) {
            stops = [];
          }
          stops.push(stopParser.bind());
          stopParser = void 0;
          step = 2;
        } else if (stopParser.isError()) {
          return stopParser.asError();
        }
      }
    }
    do {
      if (step === 2) {
        while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
          input = input.step();
        }
        if (input.isCont() && c === 44/*','*/) {
          input = input.step();
          step = 3;
        } else {
          return Parser.done(stops!);
        }
      }
      if (step === 3) {
        if (stopParser === void 0) {
          while (input.isCont() && Unicode.isSpace(input.head())) {
            input.step();
          }
          if (!input.isEmpty()) {
            stopParser = ColorStopParser.parseHint(input);
          }
        } else {
          stopParser = stopParser.feed(input);
        }
        if (stopParser !== void 0) {
          if (stopParser.isDone()) {
            stops!.push(stopParser.bind());
            stopParser = void 0;
            step = 2;
            continue;
          } else if (stopParser.isError()) {
            return stopParser.asError();
          }
        }
      }
      break;
    } while (true);
    return new ColorStopListParser(stops, stopParser, step);
  }
}
