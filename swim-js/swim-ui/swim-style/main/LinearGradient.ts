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
import type {Equals} from "@swim/util";
import type {Equivalent} from "@swim/util";
import {Arrays} from "@swim/util";
import {Objects} from "@swim/util";
import {Values} from "@swim/util";
import type {Interpolate} from "@swim/util";
import {Interpolator} from "@swim/util";
import {Diagnostic} from "@swim/codec";
import type {Input} from "@swim/codec";
import type {Output} from "@swim/codec";
import {Parser} from "@swim/codec";
import {Unicode} from "@swim/codec";
import {Angle} from "@swim/math";
import {AngleParser} from "@swim/math";
import type {ColorStopLike} from "./ColorStop";
import {ColorStop} from "./ColorStop";
import {ColorStopListParser} from "./ColorStop";

/** @public */
export type LinearGradientAngleLike = LinearGradientAngle | number;

/** @public */
export type LinearGradientAngle = Angle | LinearGradientSide | LinearGradientCorner;

/** @public */
export type LinearGradientCorner = [LinearGradientSide, LinearGradientSide];

/** @public */
export type LinearGradientSide = "left" | "right" | "top" | "bottom";

/** @public */
export type LinearGradientLike = LinearGradient | LinearGradientInit | string;

/** @public */
export const LinearGradientLike = {
  [Symbol.hasInstance](instance: unknown): instance is LinearGradientLike {
    return instance instanceof LinearGradient
        || LinearGradientInit[Symbol.hasInstance](instance)
        || typeof instance === "string";
  },
};

/** @public */
export interface LinearGradientInit {
  angle: LinearGradientAngleLike;
  stops: ColorStopLike[];
}

/** @public */
export const LinearGradientInit = {
  [Symbol.hasInstance](instance: unknown): instance is LinearGradientInit {
    return Objects.hasAllKeys(instance, "angle", "stops");
  },
};

/** @public */
export class LinearGradient implements Interpolate<LinearGradient>, Equals, Equivalent {
  constructor(angle: LinearGradientAngle, stops: readonly ColorStop[]) {
    this.angle = angle;
    this.stops = stops;
    this.stringValue = void 0;
  }

  readonly angle: LinearGradientAngle;

  withAngle(angle: LinearGradientAngleLike): LinearGradient {
    if (angle instanceof Angle || typeof angle === "number") {
      angle = Angle.fromLike(angle, "deg");
    }
    return new LinearGradient(angle, this.stops);
  }

  readonly stops: readonly ColorStop[];

  withStops(stops: readonly ColorStopLike[]): LinearGradient {
    const n = stops.length;
    const array = new Array<ColorStop>(n);
    for (let i = 0; i < n; i += 1) {
      array[i] = ColorStop.fromLike(stops[i]!);
    }
    return new LinearGradient(this.angle, array);
  }

  /** @override */
  interpolateTo(that: LinearGradient): Interpolator<LinearGradient>;
  interpolateTo(that: unknown): Interpolator<LinearGradient> | null;
  interpolateTo(that: unknown): Interpolator<LinearGradient> | null {
    if (that instanceof LinearGradient) {
      return LinearGradientInterpolator(this, that);
    }
    return null;
  }

  /** @override */
  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof LinearGradient) {
      return Values.equivalent(this.angle, that.angle, epsilon)
          && Arrays.equivalent(this.stops, that.stops, epsilon);
    }
    return false;
  }

  /** @override */
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

  /** @override */
  toString(): string {
    let s = this.stringValue;
    if (s === void 0) {
      s = "linear-gradient(";
      if (this.angle instanceof Angle) {
        s += this.angle.toString();
      } else {
        s += "to";
        if (typeof this.angle === "string") {
          s += " ";
          s += this.angle;
        } else {
          for (let i = 0; i < this.angle.length; i += 1) {
            s += " ";
            s += this.angle[i];
          }
        }
      }
      for (let i = 0; i < this.stops.length; i += 1) {
        s += ", ";
        s += this.stops[i]!.toString();
      }
      s += ")";
      (this as Mutable<this>).stringValue = s;
    }
    return s;
  }

  static create(angle: LinearGradientAngleLike, ...stops: ColorStopLike[]): LinearGradient {
    if (angle instanceof Angle || typeof angle === "number") {
      angle = Angle.fromLike(angle, "deg");
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
        array[i] = ColorStop.fromLike(stops[i]!);
      }
    }
    return new LinearGradient(angle, array);
  }

  static fromLike<T extends LinearGradientLike | null | undefined>(value: T): LinearGradient | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof LinearGradient) {
      return value as LinearGradient | Uninitable<T>;
    } else if (typeof value === "string") {
      return LinearGradient.parse(value);
    } else if (typeof value === "object") {
      return LinearGradient.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  static fromInit(init: LinearGradientInit): LinearGradient {
    let angle: LinearGradientAngleLike = init.angle;
    if (angle instanceof Angle || typeof angle === "number") {
      angle = Angle.fromLike(angle, "deg");
    }
    const n = init.stops.length;
    const array = new Array<ColorStop>(n);
    for (let i = 0; i < n; i += 1) {
      array[i] = ColorStop.fromLike(init.stops[i]!);
    }
    return new LinearGradient(angle, array);
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
}

/** @internal */
export interface LinearGradientInterpolator extends Interpolator<LinearGradient> {
  /** @internal */
  readonly angleInterpolator: Interpolator<LinearGradientAngle>;
  /** @internal */
  readonly stopInterpolators: readonly Interpolator<ColorStop>[];

  readonly 0: LinearGradient;

  readonly 1: LinearGradient;

  equals(that: unknown): boolean;
}

/** @internal */
export const LinearGradientInterpolator = (function (_super: typeof Interpolator) {
  const LinearGradientInterpolator = function (g0: LinearGradient, g1: LinearGradient): LinearGradientInterpolator {
    const interpolator = function (u: number): LinearGradient {
      const angle = interpolator.angleInterpolator(u);
      const stopInterpolators = interpolator.stopInterpolators;
      const stopCount = stopInterpolators.length;
      const stops = new Array<ColorStop>(stopCount);
      for (let i = 0; i < stopCount; i += 1) {
        stops[i] = stopInterpolators[i]!(u);
      }
      return new LinearGradient(angle, stops);
    } as LinearGradientInterpolator;
    Object.setPrototypeOf(interpolator, LinearGradientInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>).angleInterpolator = Interpolator(g0.angle, g1.angle);
    const stops0 = g0.stops;
    const stops1 = g1.stops;
    const stopCount = Math.min(stops0.length, stops1.length);
    const stopInterpolators = new Array<Interpolator<ColorStop>>(stopCount);
    for (let i = 0; i < stopCount; i += 1) {
      stopInterpolators[i] = stops0[i]!.interpolateTo(stops1[i]!);
    }
    (interpolator as Mutable<typeof interpolator>).stopInterpolators = stopInterpolators;
    return interpolator;
  } as {
    (g0: LinearGradient, g1: LinearGradient): LinearGradientInterpolator;

    /** @internal */
    prototype: LinearGradientInterpolator;
  };

  LinearGradientInterpolator.prototype = Object.create(_super.prototype);
  LinearGradientInterpolator.prototype.constructor = LinearGradientInterpolator;

  Object.defineProperty(LinearGradientInterpolator.prototype, 0, {
    get(this: LinearGradientInterpolator): LinearGradient {
      const angle = this.angleInterpolator[0];
      const stopInterpolators = this.stopInterpolators;
      const stopCount = stopInterpolators.length;
      const stops = new Array<ColorStop>(stopCount);
      for (let i = 0; i < stopCount; i += 1) {
        stops[i] = stopInterpolators[i]![0];
      }
      return new LinearGradient(angle, stops);
    },
    configurable: true,
  });

  Object.defineProperty(LinearGradientInterpolator.prototype, 1, {
    get(this: LinearGradientInterpolator): LinearGradient {
      const angle = this.angleInterpolator[1];
      const stopInterpolators = this.stopInterpolators;
      const stopCount = stopInterpolators.length;
      const stops = new Array<ColorStop>(stopCount);
      for (let i = 0; i < stopCount; i += 1) {
        stops[i] = stopInterpolators[i]![1];
      }
      return new LinearGradient(angle, stops);
    },
    configurable: true,
  });

  LinearGradientInterpolator.prototype.equals = function (that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof LinearGradientInterpolator) {
      if (this.angleInterpolator.equals(that.angleInterpolator)) {
        const n = this.stopInterpolators.length;
        if (n !== that.stopInterpolators.length) {
          return false;
        }
        for (let i = 0; i < n; i += 1) {
          if (!this.stopInterpolators[i]!.equals(that.stopInterpolators[i]!)) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  };

  return LinearGradientInterpolator;
})(Interpolator);

/** @internal */
export class LinearGradientAngleParser extends Parser<LinearGradientAngle> {
  private readonly identOutput: Output<string> | undefined;
  private readonly angleParser: Parser<Angle> | undefined;
  private readonly side: LinearGradientSide | undefined;
  private readonly step: number | undefined;

  constructor(identOutput?: Output<string>, angleParser?: Parser<Angle>,
              side?: LinearGradientSide, step?: number) {
    super();
    this.identOutput = identOutput;
    this.angleParser = angleParser;
    this.side = side;
    this.step = step;
  }

  override feed(input: Input): Parser<LinearGradientAngle> {
    return LinearGradientAngleParser.parse(input, this.identOutput, this.angleParser,
                                           this.side, this.step);
  }

  static parse(input: Input, identOutput?: Output<string>, angleParser?: Parser<Angle>,
               side?: LinearGradientSide, step: number = 1): Parser<LinearGradientAngle> {
    let c = 0;
    if (step === 1) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input.step();
      }
      if (input.isCont()) {
        if (c === 45/*'-'*/ || c === 46/*'.'*/ || c >= 48/*'0'*/ && c <= 57/*'9'*/) {
          step = 2;
        } else {
          step = 3;
        }
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 2) {
      if (angleParser === void 0) {
        angleParser = AngleParser.parse(input, "deg");
      } else {
        angleParser = angleParser.feed(input);
      }
      if (angleParser !== void 0) {
        if (angleParser.isDone()) {
          return angleParser;
        } else if (angleParser.isError()) {
          return angleParser.asError();
        }
      }
    }
    if (step === 3) {
      if (identOutput === void 0) {
        identOutput = Unicode.stringOutput();
      }
      while (input.isCont() && (c = input.head(), Unicode.isAlpha(c))) {
        input = input.step();
        identOutput.write(c);
      }
      if (!input.isEmpty()) {
        const ident = identOutput.bind();
        if (ident === "to") {
          identOutput = void 0;
          step = 4;
        } else {
          return Parser.error(Diagnostic.message("unexpected " + ident, input));
        }
      }
    }
    if (step === 4) {
      if (input.isCont()) {
        if (Unicode.isSpace(input.head())) {
          input.step();
          step = 5;
        } else {
          return Parser.error(Diagnostic.expected("side or corner", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
    }
    if (step === 5) {
      if (identOutput === void 0) {
        identOutput = Unicode.stringOutput();
      }
      while (input.isCont() && (c = input.head(), Unicode.isAlpha(c))) {
        input = input.step();
        identOutput.write(c);
      }
      if (!input.isEmpty()) {
        const ident = identOutput.bind();
        identOutput = void 0;
        switch (ident) {
          case "left":
          case "right":
            side = ident;
            step = 6;
            break;
          case "top":
          case "bottom":
            side = ident;
            step = 7;
            break;
          default: return Parser.error(Diagnostic.message("unknown side: " + ident, input));
        }
      }
    }
    if (step === 6) {
      if (identOutput === void 0) {
        while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
          input = input.step();
        }
        if (input.isCont() && Unicode.isAlpha(c)) {
          identOutput = Unicode.stringOutput();
        } else if (!input.isEmpty()) {
          return Parser.done(side!);
        }
      }
      if (identOutput !== void 0) {
        while (input.isCont() && (c = input.head(), Unicode.isAlpha(c))) {
          input = input.step();
          identOutput.write(c);
        }
        if (!input.isEmpty()) {
          const ident = identOutput.bind();
          identOutput = void 0;
          switch (ident) {
            case "top":
            case "bottom": return Parser.done([side as "left" | "right", ident]);
            default: return Parser.error(Diagnostic.message("unknown side: " + ident, input));
          }
        }
      }
    }
    if (step === 7) {
      if (identOutput === void 0) {
        while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
          input = input.step();
        }
        if (input.isCont() && Unicode.isAlpha(c)) {
          identOutput = Unicode.stringOutput();
        } else if (!input.isEmpty()) {
          return Parser.done(side!);
        }
      }
      if (identOutput !== void 0) {
        while (input.isCont() && (c = input.head(), Unicode.isAlpha(c))) {
          input = input.step();
          identOutput.write(c);
        }
        if (!input.isEmpty()) {
          const ident = identOutput.bind();
          identOutput = void 0;
          switch (ident) {
            case "left":
            case "right": return Parser.done([side as "top" | "bottom", ident]);
            default: return Parser.error(Diagnostic.message("unknown side: " + ident, input));
          }
        }
      }
    }
    return new LinearGradientAngleParser(identOutput, angleParser, side, step);
  }
}

/** @internal */
export class LinearGradientParser extends Parser<LinearGradient> {
  private readonly identOutput: Output<string> | undefined;
  private readonly angleParser: Parser<LinearGradientAngle> | undefined;
  private readonly stopsParser: Parser<ColorStop[]> | undefined;
  private readonly step: number | undefined;

  constructor(identOutput?: Output<string>, angleParser?: Parser<LinearGradientAngle>,
              stopsParser?: Parser<ColorStop[]>, step?: number) {
    super();
    this.identOutput = identOutput;
    this.angleParser = angleParser;
    this.stopsParser = stopsParser;
    this.step = step;
  }

  override feed(input: Input): Parser<LinearGradient> {
    return LinearGradientParser.parse(input, this.identOutput, this.angleParser,
                                      this.stopsParser, this.step);
  }

  static parse(input: Input, identOutput?: Output<string>, angleParser?: Parser<LinearGradientAngle>,
               stopsParser?: Parser<ColorStop[]>, step: number = 1): Parser<LinearGradient> {
    let c = 0;
    if (step === 1) {
      if (identOutput === void 0) {
        identOutput = Unicode.stringOutput();
      }
      while (input.isCont() && (c = input.head(), Unicode.isAlpha(c) || c === 45/*'-'*/)) {
        input = input.step();
        identOutput.write(c);
      }
      if (!input.isEmpty()) {
        const ident = identOutput.bind();
        if (ident === "linear-gradient") {
          identOutput = void 0;
          step = 2;
        } else {
          return Parser.error(Diagnostic.message("unexpected " + ident, input));
        }
      }
    }
    if (step === 2) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont() && c === 40/*'('*/) {
        input.step();
        step = 3;
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected("(", input));
      }
    }
    if (step === 3) {
      if (angleParser === void 0) {
        angleParser = LinearGradientAngleParser.parse(input);
      } else {
        angleParser = angleParser.feed(input);
      }
      if (angleParser !== void 0) {
        if (angleParser.isDone()) {
          step = 4;
        } else if (angleParser.isError()) {
          return angleParser.asError();
        }
      }
    }
    if (step === 4) {
      while (input.isCont() && (c = input.head(), Unicode.isSpace(c))) {
        input = input.step();
      }
      if (input.isCont() && c === 44/*','*/) {
        input = input.step();
        step = 5;
      } else {
        return Parser.error(Diagnostic.expected("color stops", input));
      }
    }
    if (step === 5) {
      if (stopsParser === void 0) {
        stopsParser = ColorStopListParser.parse(input);
      } else {
        stopsParser = stopsParser.feed(input);
      }
      if (stopsParser !== void 0) {
        if (stopsParser.isDone()) {
          step = 6;
        } else if (stopsParser.isError()) {
          return stopsParser.asError();
        }
      }
    }
    if (step === 6) {
      while (input.isCont() && Unicode.isSpace(input.head())) {
        input.step();
      }
      if (input.isCont() && input.head() === 41/*')'*/) {
        input.step();
        return Parser.done(new LinearGradient(angleParser!.bind(), stopsParser!.bind()));
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected(")", input));
      }
    }
    return new LinearGradientParser(identOutput, angleParser, stopsParser, step);
  }

  /** @internal */
  static parseRest(input: Input, identOutput?: Output<string>): Parser<LinearGradient> {
    return LinearGradientParser.parse(input, identOutput, void 0, void 0, 2);
  }
}
