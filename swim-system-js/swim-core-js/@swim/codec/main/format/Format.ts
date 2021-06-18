// Copyright 2015-2021 Swim inc.
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

import type {AnyOutputSettings} from "../output/OutputSettings";
import {Output} from "../output/Output";
import type {Display} from "./Display";
import type {Debug} from "./Debug";
import {Unicode} from "../unicode/Unicode";

/**
 * utility functions for formatting values.
 */
export const Format = {} as {
  /**
   * The operting system specific string used to separate lines of text.
   */
  readonly lineSeparator: string;

  /**
   * Writes the code points of the human-readable [[Display]] string for the
   * given `object` to `output`.  Assumes `output` is a Unicode `Output` writer
   * with sufficient capacity.  Delegates to [[Display.display]], if `object`
   * implements `Display`; otherwise writes the result of `Object.toString`.
   *
   * @throws [[OutputException]] if the `output` exits the _cont_ state before
   *         the full display string has been written.
   */
  display(object: unknown, output: Output): void;

  /**
   * Returns the human-readable [[Display]] string for the givem `object`,
   * output using the given `settings`.  Delegates to [[Display.displa]],
   * if `object` implements `Display`; otherwise returns the result of
   * `Object.toString`.
   */
  display(object: unknown, settings?: AnyOutputSettings): string;

  /**
   * Writes the code points of the developer-readable [[Debug]] string for the
   * given `object` to `output`.  Assumes `output` is a Unicode `Output` writer
   * with sufficient capacity.  Delegates to [[Debug.debug]], if `object`
   * implements `Debug`; writes a JavaScript string literal, if `object` is a
   * `string`, and writes a JavaScript number literal, if `object` is a
   * `number`; otherwise writes the result of `Object.toString`.
   *
   * @throws [[OutputException]] if the `output` exits the _cont_ state before
   *         the full debug string has been written.
   */
  debug(object: unknown, output: Output): void;

  /**
   * Returns the developer-readable [[Debug]] string for the givem `object`,
   * output using the given `settings`.  Delegates to [[Debug.debug]], if
   * `object` implements `Debug`; returns a JavaScript string literal, if
   * `object` is a `string`, and returns a JavaScript number literal, if
   * `object` is a `number`; otherwise returns the result of `Object.toString`.
   */
  debug(object: unknown, settings?: AnyOutputSettings): string;

  /**
   * Writes the code points of the numeric string for the given `value`
   * to `output`.
   *
   * @throws [[OutputException]] if the `output` exits the _cont_ state before
   *         the full numeric string has been written.
   */
  displayNumber(value: number, output: Output): void;

  /**
   * Writes the code points of the JavaScript numeric literal for the given
   * `value` to `output`.
   *
   * @throws [[OutputException]] if the `output` exits the _cont_ state before
   *         the full numeric literal has been written.
   */
  debugNumber(value: number, output: Output): void;

  /**
   * Writes the code points of the JavaScript character literal for the given
   * `character` to `output`.
   *
   * @throws [[OutputException]] if the `output` exits the _cont_ state before
   *         the full character literal has been written.
   */
  debugChar(character: number, output: Output): void;

  /**
   * Writes the code points of the JavaScript string literal for the given
   * `string` to `output`.
   *
   * @throws [[OutputException]] if the `output` exits the _cont_ state before
   *         the full string literal has been written.
   */
  debugString(string: string, output: Output): void;

  /** @hidden */
  encodeHex(x: number): number;

  /**
   * Returns a string representation of `value` scaled by its SI magnitude,
   * keeping at most `precision` digits past the decimal place, appended with
   * the appropriate SI prefix.
   */
  prefix(value: number, precision?: number): string;

  decimal(value: number, precision?: number): string;

  /** @hidden */
  trimTrailingZeros(s: string): string;

  /**
   * Returns a string representation of the duration represented by the given
   * number of milliseconds.
   */
  duration(millis: number, separator?: string): string;
};

Object.defineProperty(Format, "lineSeparator", {
  get(): string {
    let lineSeparator: string | undefined;
    if (typeof global !== "undefined" && typeof global.require === "function") {
      const os = global.require("os");
      if (typeof os === "object" && os !== null) {
        lineSeparator = os.EOL;
      }
    }
    if (lineSeparator === void 0) {
      lineSeparator = "\n";
    }
    Object.defineProperty(Format, "lineSeparator", {
      value: lineSeparator,
      enumerable: true,
      configurable: true,
    })
    return lineSeparator;
  },
  enumerable: true,
  configurable: true,
});

Format.display = function (object: unknown, output?: Output | AnyOutputSettings): void | string {
  const notOutput = !(output instanceof Output);
  if (object === void 0) {
    if (output === void 0) {
      return "undefined";
    } else {
      if (!(output instanceof Output)) {
        output = Unicode.stringOutput(output);
      }
      output = output.write("undefined");
    }
  } else if (object === null) {
    if (output === void 0) {
      return "null";
    } else {
      if (!(output instanceof Output)) {
        output = Unicode.stringOutput(output);
      }
      output = output.write("null");
    }
  } else if (typeof object === "number") {
    if (output === void 0) {
      return "" + object;
    } else {
      if (!(output instanceof Output)) {
        output = Unicode.stringOutput(output);
      }
      Format.displayNumber(object, output);
    }
  } else if (typeof object === "string") {
    if (output === void 0) {
      return object;
    } else {
      if (!(output instanceof Output)) {
        output = Unicode.stringOutput(output);
      }
      output = output.write(object);
    }
  } else if (typeof (object as any).display === "function") {
    if (!(output instanceof Output)) {
      output = Unicode.stringOutput(output);
    }
    (object as Display).display(output);
  } else {
    if (output === void 0) {
      return "" + object;
    } else {
      if (!(output instanceof Output)) {
        output = Unicode.stringOutput(output);
      }
      output = output.write("" + object);
    }
  }
  if (notOutput) {
    return output.toString();
  }
} as typeof Format.display;

Format.debug = function (object: unknown, output?: Output | AnyOutputSettings): void | string {
  const notOutput = !(output instanceof Output);
  if (object === void 0) {
    if (output === void 0) {
      return "undefined";
    } else {
      if (!(output instanceof Output)) {
        output = Unicode.stringOutput(output);
      }
      output = output.write("undefined");
    }
  } else if (object === null) {
    if (output === void 0) {
      return "null";
    } else {
      if (!(output instanceof Output)) {
        output = Unicode.stringOutput(output);
      }
      output = output.write("null");
    }
  } else if (typeof object === "number") {
    if (output === void 0) {
      return "" + object;
    } else {
      if (!(output instanceof Output)) {
        output = Unicode.stringOutput(output);
      }
      Format.debugNumber(object, output);
    }
  } else if (typeof object === "string") {
    if (!(output instanceof Output)) {
      output = Unicode.stringOutput(output);
    }
    Format.debugString(object, output);
  } else if (typeof (object as any).debug === "function") {
    if (!(output instanceof Output)) {
      output = Unicode.stringOutput(output);
    }
    (object as Debug).debug(output);
  } else {
    if (output === void 0) {
      return "" + object;
    } else {
      if (!(output instanceof Output)) {
        output = Unicode.stringOutput(output);
      }
      output = output.write("" + object);
    }
  }
  if (notOutput) {
    return output.toString();
  }
} as typeof Format.debug;

Format.displayNumber = function (value: number, output: Output): void {
  if (isFinite(value) && Math.floor(value) === value && Math.abs(value) < 2147483648) {
    if (value < 0) {
      output = output.write(45/*'-'*/);
    }
    if (value > -10 && value < 10) {
      output = output.write(48/*'0'*/ + Math.abs(value));
    } else {
      const digits = new Array<number>(19);
      let x = value;
      let i = 18;
      while (x !== 0) {
        digits[i] = Math.abs((x % 10) | 0);
        x = (x / 10) | 0;
        i -= 1;
      }
      i += 1;
      while (i < 19) {
        output = output.write(48/*'0'*/ + digits[i]!);
        i += 1;
      }
    }
  } else {
    output = output.write(Format.decimal(value, output.settings.precision));
  }
};

Format.debugNumber = function (value: number, output: Output): void {
  Format.displayNumber(value, output);
};

Format.debugChar = function (character: number, output: Output): void {
  output = output.write(39/*'\''*/);
  switch (character) {
      case 8/*'\b'*/: output.write(92/*'\\'*/).write(98/*'b'*/); break;
      case 9/*'\t'*/: output.write(92/*'\\'*/).write(116/*'t'*/); break;
      case 10/*'\n'*/: output.write(92/*'\\'*/).write(110/*'n'*/); break;
      case 12/*'\f'*/: output.write(92/*'\\'*/).write(102/*'f'*/); break;
      case 13/*'\r'*/: output.write(92/*'\\'*/).write(114/*'r'*/); break;
      case 34/*'\"'*/: output.write(92/*'\\'*/).write(34/*'\"'*/); break;
      case 39/*'\"'*/: output.write(92/*'\\'*/).write(39/*'\''*/); break;
      case 92/*'\\'*/: output.write(92/*'\\'*/).write(92/*'\\'*/); break;
    default:
      if (character >= 0x0000 && character <= 0x001f
          || character >= 0x007f && character <= 0x009f) {
        output = output.write(92/*'\\'*/).write(117/*'u'*/)
          .write(Format.encodeHex(character >>> 12 & 0xf))
          .write(Format.encodeHex(character >>>  8 & 0xf))
          .write(Format.encodeHex(character >>>  4 & 0xf))
          .write(Format.encodeHex(character        & 0xf));
      } else {
        output = output.write(character);
      }
  }
  output = output.write(39/*'\''*/);
};

Format.debugString = function (string: string, output: Output): void {
  output = output.write(34/*'\"'*/);
  let input = Unicode.stringInput(string);
  while (input.isCont()) {
    const c = input.head();
    switch (c) {
      case 8/*'\b'*/: output.write(92/*'\\'*/).write(98/*'b'*/); break;
      case 9/*'\t'*/: output.write(92/*'\\'*/).write(116/*'t'*/); break;
      case 10/*'\n'*/: output.write(92/*'\\'*/).write(110/*'n'*/); break;
      case 12/*'\f'*/: output.write(92/*'\\'*/).write(102/*'f'*/); break;
      case 13/*'\r'*/: output.write(92/*'\\'*/).write(114/*'r'*/); break;
      case 34/*'\"'*/: output.write(92/*'\\'*/).write(34/*'\"'*/); break;
      case 92/*'\\'*/: output.write(92/*'\\'*/).write(92/*'\\'*/); break;
      default:
        if (c >= 0x0000 && c <= 0x001f || c >= 0x007f && c <= 0x009f) {
          output = output.write(92/*'\\'*/).write(117/*'u'*/)
            .write(Format.encodeHex(c >>> 12 & 0xf))
            .write(Format.encodeHex(c >>>  8 & 0xf))
            .write(Format.encodeHex(c >>>  4 & 0xf))
            .write(Format.encodeHex(c        & 0xf));
        } else {
          output = output.write(c);
        }
    }
    input = input.step();
  }
  output = output.write(34/*'\"'*/);
};

Format.encodeHex = function (x: number): number {
  if (x < 10) {
    return 48/*'0'*/ + x;
  } else {
    return 65/*'A'*/ + (x - 10);
  }
};

Format.prefix = (function () {
  const prefixes: ReadonlyArray<string> = ["y", "z", "a", "f", "p", "n", "µ", "m", "", "k", "M", "G", "T", "P", "E"," Z", "Y"];
  return function (value: number, precision: number = 1): string {
    if (isFinite(value)) {
      const exponential = Math.abs(value).toExponential();
      const exponentIndex = exponential.indexOf("e");
      const exponent = exponentIndex >= 0 ? +exponential.slice(exponentIndex + 1) : NaN;
      const power = Math.min(Math.max(-8, Math.floor(exponent / 3)), 8) * 3;
      const scaled = Math.pow(10, -power) * value;
      let s = Format.trimTrailingZeros(Math.abs(scaled).toFixed(precision));
      if (scaled < 0 && +s !== 0) {
        s = "-" + s;
      }
      s += prefixes[8 + power / 3];
      return s;
    } else {
      return "" + value;
    }
  }
})();

Format.decimal = function (value: number, precision: number = -1): string {
  if (precision >= 0) {
    let s = Format.trimTrailingZeros(Math.abs(value).toFixed(precision));
    if (value < 0 && +s !== 0) {
      s = "-" + s;
    }
    return s;
  } else {
    return "" + value;
  }
};

Format.trimTrailingZeros = function (s: string): string {
  let i0 = -1;
  let i1: number | undefined;
  for (let i = 1, n = s.length; i < n; i += 1) {
    const c = s.charCodeAt(i);
    if (c === 46/*'.'*/) {
      i0 = i; // candidate start of trailing zeros
      i1 = i; // candidate end of trailing zeros
    } else if (c === 48/*'0'*/) {
      if (i0 === 0) { // if after decimal
        i0 = i; // new candidate start of trailing zeros
      }
      i1 = i; // new candidate end of trailing zeros
    } else if (c >= 49/*'1'*/ && c <= 57/*'9'*/) {
      if (i0 > 0) { // if non-zero digit after decimal
        i0 = 0; // no candidate start of trailing zeros
      }
    } else if (i0 > 0) { // if non-numeric character after decimal
      break; // accept current range of trailing zeros
    }
  }
  if (i0 > 0) {
    s = s.slice(0, i0) + s.slice(i1! + 1); // cut out trailing zeros
  }
  return s;
};

Format.duration = function (millis: number, separator: string = " "): string {
  if (isFinite(millis)) {
    const SECOND = 1000;
    const MINUTE = 60 * SECOND;
    const HOUR = 60 * MINUTE;
    const DAY = 24 * HOUR;
    const WEEK = 7 * DAY;
    let weeks: number | undefined;
    if (millis > WEEK) {
      weeks = Math.floor(millis / WEEK);
      millis %= WEEK;
    }
    let days: number | undefined;
    if (millis > DAY) {
      days = Math.floor(millis / DAY);
      millis %= DAY;
    }
    let hours: number | undefined;
    if (millis > HOUR) {
      hours = Math.floor(millis / HOUR);
      millis %= HOUR;
    }
    let minutes: number | undefined;
    if (millis > MINUTE) {
      minutes = Math.floor(millis / MINUTE);
      millis %= MINUTE;
    }
    let seconds: number | undefined;
    if (millis > SECOND) {
      seconds = Math.floor(millis / SECOND);
      millis %= SECOND;
    }
    let s = "";
    if (weeks !== void 0) {
      s += weeks + "w";
    }
    if (days !== void 0) {
      s += (s.length !== 0 ? separator : "") + days + "d";
    }
    if (hours !== void 0) {
      s += (s.length !== 0 ? separator : "") + hours + "h";
    }
    if (minutes !== void 0) {
      s += (s.length !== 0 ? separator : "") + minutes + "m";
    }
    if (seconds !== void 0 || millis === 0) {
      s += (s.length !== 0 ? separator : "") + (seconds !== void 0 ? seconds : 0) + "s";
    }
    if (millis !== 0 && s.length === 0) {
      s += millis + "ms";
    }
    return s;
  } else {
    return "" + millis;
  }
};
