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

import type {Input} from "../input/Input";
import {AnyOutputSettings, OutputSettings} from "../output/OutputSettings";
import type {Output} from "../output/Output";
import type {Writer} from "../writer/Writer";
import {StringInput} from "./StringInput";
import {StringOutput} from "./StringOutput";
import {StringWriter} from "./StringWriter";

/**
 * Unicode code point [[Input]]/[[Output]]/[[Writer]] factory.
 *
 * The `Unicode.stringInput(...)` function returns an `Input` that reads the
 * Unicode code points of a `string`.
 *
 * The `Unicode.stringOutput(...)` function returns an `Output` that writes
 * Unicode code points to an internal buffer, and [[Output.bind binds]] a
 * `string` containing all written code points.
 * @public
 */
export const Unicode = (function () {
  const Unicode = {} as {
    stringInput(string: string): Input;

    /**
     * Returns a new `Output` that appends Unicode code points to the given
     * `string`, using the given output `settings`. The returned `Output`
     * accepts an unbounded number of code points, remaining permanently in the
     * _cont_ state, and [[Output.bind binds]] a `string` containing the given
     * `string`, and all appended code points.
     */
    stringOutput(string?: string, settings?: AnyOutputSettings): Output<string>;

    /**
     * Returns a new `Output` that buffers Unicode code points, using the given
     * output `settings`. The returned `Output` accepts an unbounded number of
     * code points, remaining permanently in the _cont_ state, and [[Output.bind
     * binds]] a `string` containing all written code points.
     */
    stringOutput(settings?: AnyOutputSettings): Output<string>;

    stringWriter<I>(): Writer<I, unknown>;

    stringWriter<I, O>(input: O): Writer<I, O>;

    writeString<I>(output: Output, input: unknown): Writer<I, unknown>;

    /** @internal */
    isAlpha(c: number): boolean;

    /** @internal */
    isDigit(c: number): boolean;

    /** @internal */
    isSpace(c: number): boolean;

    /** @internal */
    isNewline(c: number): boolean;

    /** @internal */
    isWhitespace(c: number): boolean;
  };

  Unicode.stringInput = function (string: string): Input {
    return StringInput.create(string);
  };

  Unicode.stringOutput = function (string?: string | AnyOutputSettings, settings?: AnyOutputSettings): Output<string> {
    if (settings === void 0 && typeof string !== "string") {
      settings = string;
      string = "";
    } else if (typeof string !== "string") {
      string = "";
    }
    settings = OutputSettings.fromAny(settings);
    return new StringOutput(string, settings);
  };

  Unicode.stringWriter = function <I, O>(input?: O): Writer<I, unknown> {
    if (input === void 0) {
      return new StringWriter(void 0, "");
    } else {
      return new StringWriter(input, "" + input);
    }
  };

  Unicode.writeString = function <I>(output: Output, input: unknown): Writer<I, unknown> {
    return StringWriter.write(output, void 0, "" + input);
  };

  Unicode.isAlpha = function (c: number): boolean {
    return c >= 65/*'A'*/ && c <= 90/*'Z'*/
        || c >= 97/*'a'*/ && c <= 122/*'z'*/;
  };

  Unicode.isDigit = function (c: number): boolean {
    return c >= 48/*'0'*/ && c <= 57/*'9'*/;
  };

  Unicode.isSpace = function (c: number): boolean {
    return c === 0x20 || c === 0x9;
  };

  Unicode.isNewline = function (c: number): boolean {
    return c === 0xa || c === 0xd;
  };

  Unicode.isWhitespace = function (c: number): boolean {
    return Unicode.isSpace(c) || Unicode.isNewline(c);
  };

  return Unicode;
})();
