// Copyright 2015-2019 SWIM.AI inc.
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

import {Tag} from "./Tag";
import {AnyOutputSettings} from "./OutputSettings";
import {Output} from "./Output";
import {Display} from "./Display";
import {Debug} from "./Debug";
import {Unicode} from "./Unicode";

/**
 * Text format utility functions.
 */
export class Format {
  private constructor() {
  }

  /**
   * Writes the code points of the human-readable [[Display]] string for the
   * given `object` to `output`.  Assumes `output` is a Unicode `Output` writer
   * with sufficient capacity.  Delegates to [[Display.display]], if `object`
   * implements `Display`; otherwise writes the result of `Object.toString`.
   *
   * @throws [[OutputException]] if the `output` exits the _cont_ state before
   *         the full display string has been written.
   */
  static display(object: unknown, output: Output): void;

  /**
   * Returns the human-readable [[Display]] string for the givem `object`,
   * output using the given `settings`.  Delegates to [[Display.displa]],
   * if `object` implements `Display`; otherwise returns the result of
   * `Object.toString`.
   */
  static display(object: unknown, settings?: AnyOutputSettings): string;

  static display(object: unknown, output?: Output | AnyOutputSettings): void | string {
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
    } else if (object && typeof (object as any).display === "function") {
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
  }

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
  static debug(object: unknown, output: Output): void;

  /**
   * Returns the developer-readable [[Debug]] string for the givem `object`,
   * output using the given `settings`.  Delegates to [[Debug.debug]], if
   * `object` implements `Debug`; returns a JavaScript string literal, if
   * `object` is a `string`, and returns a JavaScript number literal, if
   * `object` is a `number`; otherwise returns the result of `Object.toString`.
   */
  static debug(object: unknown, settings?: AnyOutputSettings): string;

  static debug(object: unknown, output?: Output | AnyOutputSettings): void | string {
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
  }

  /**
   * Writes the code points of the numeric string for the given `value`
   * to `output`.
   *
   * @throws [[OutputException]] if the `output` exits the _cont_ state before
   *         the full numeric string has been written.
   */
  static displayNumber(value: number, output: Output): void {
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
        while (x) {
          digits[i] = Math.abs((x % 10) | 0);
          x = (x / 10) | 0;
          i -= 1;
        }
        i += 1;
        while (i < 19) {
          output = output.write(48/*'0'*/ + digits[i]);
          i += 1;
        }
      }
    } else {
      output = output.write("" + value);
    }
  }

  /**
   * Writes the code points of the JavaScript numeric literal for the given
   * `value` to `output`.
   *
   * @throws [[OutputException]] if the `output` exits the _cont_ state before
   *         the full numeric literal has been written.
   */
  static debugNumber(value: number, output: Output): void {
    Format.displayNumber(value, output);
  }

  /**
   * Writes the code points of the JavaScript character literal for the given
   * `character` to `output`.
   *
   * @throws [[OutputException]] if the `output` exits the _cont_ state before
   *         the full character literal has been written.
   */
  static debugChar(character: number, output: Output): void {
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
  }

  /**
   * Writes the code points of the JavaScript string literal for the given
   * `string` to `output`.
   *
   * @throws [[OutputException]] if the `output` exits the _cont_ state before
   *         the full string literal has been written.
   */
  static debugString(string: string, output: Output): void {
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
  }

  private static encodeHex(x: number): number {
    if (x < 10) {
      return 48/*'0'*/ + x;
    } else {
      return 65/*'A'*/ + (x - 10);
    }
  }

  private static _lineSeparator?: string;

  /**
   * Returns the operting system specific string used to separate lines of text.
   */
  static lineSeparator(): string {
    if (!Format._lineSeparator) {
      if (typeof require === "function") {
        const os = require("os");
        if (os) {
          Format._lineSeparator = os.EOL;
        }
      }
      if (!Format._lineSeparator) {
        Format._lineSeparator = "\n";
      }
    }
    return Format._lineSeparator;
  }
}
Tag.Format = Format;
