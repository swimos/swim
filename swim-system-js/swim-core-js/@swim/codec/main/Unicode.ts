// Copyright 2015-2020 SWIM.AI inc.
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

import {Input} from "./Input";
import {AnyOutputSettings, OutputSettings} from "./OutputSettings";
import {Output} from "./Output";
import {Writer} from "./Writer";
import {StringInput} from "./StringInput";
import {StringOutput} from "./StringOutput";
import {StringWriter} from "./StringWriter";

/**
 * Unicode code point [[Input]]/[[Output]]/[[Writer]] factory.
 *
 * The `Unicode.stringInput(...)` function returns an `Input` that reads the
 * Unicode code points of a `string`.
 *
 * The `Unicode.stringOutput(...)}` function returns an `Output` that writes
 * Unicode code points to an internal buffer, and [[Output.bind binds]] a
 * `string` containing all written code points.
 */
export class Unicode {
  private constructor() {
    // nop
  }

  static stringInput(string: string): Input {
    return new StringInput(string);
  }

  /**
   * Returns a new `Output` that appends Unicode code points to the given
   * `string`, using the given output `settings`.  The returned `Output`
   * accepts an unbounded number of code points, remaining permanently in the
   * _cont_ state, and [[Output.bind binds]] a `string` containing the given
   * `string`, and all appended code points.
   */
  static stringOutput(string?: string, settings?: AnyOutputSettings): Output<string>;
  /**
   * Returns a new `Output` that buffers Unicode code points, using the given
   * output `settings`.  The returned `Output` accepts an unbounded number of
   * code points, remaining permanently in the _cont_ state, and [[Output.bind
   * binds]] a `string` containing all written code points.
   */
  static stringOutput(settings?: AnyOutputSettings): Output<string>;
  static stringOutput(string?: string | AnyOutputSettings, settings?: AnyOutputSettings): Output<string> {
    if (settings === void 0 && typeof string !== "string") {
      settings = string;
      string = "";
    } else if (typeof string !== "string") {
      string = "";
    }
    settings = OutputSettings.fromAny(settings);
    return new StringOutput(string, settings);
  }

  static stringWriter<I>(): Writer<I, unknown>;
  static stringWriter<I, O>(input: O): Writer<I, O>;
  static stringWriter<I, O>(input?: O): Writer<I, unknown> {
    if (input === void 0) {
      return new StringWriter(void 0, "");
    } else {
      return new StringWriter(input, "" + input);
    }
  }

  static writeString<I>(input: unknown, output: Output): Writer<I, unknown> {
    return StringWriter.write(output, void 0, "" + input);
  }

  /** @hidden */
  static isAlpha(c: number): boolean {
    return c >= 65/*'A'*/ && c <= 90/*'Z'*/
        || c >= 97/*'a'*/ && c <= 122/*'z'*/;
  }

  /** @hidden */
  static isSpace(c: number): boolean {
    return c === 0x20 || c === 0x9;
  }

  /** @hidden */
  static isNewline(c: number): boolean {
    return c === 0xa || c === 0xd;
  }

  /** @hidden */
  static isWhitespace(c: number): boolean {
    return Unicode.isSpace(c) || Unicode.isNewline(c);
  }
}
