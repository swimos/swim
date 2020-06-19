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

import {Output} from "./Output";
import {WriterException} from "./WriterException";
import {Writer} from "./Writer";
import {Base16} from "./Base16";

export class Base16IntegerWriter extends Writer<unknown, unknown> {
  private readonly _value: unknown;
  private readonly _input: number;
  private readonly _width: number;
  private readonly _base16: Base16;
  private readonly _index: number | undefined;
  private readonly _step: number | undefined;

  constructor(value: unknown, input: number, width: number,
              base16: Base16, index?: number, step?: number) {
    super();
    this._value = value;
    this._input = input;
    this._width = width;
    this._base16 = base16;
    this._index = index;
    this._step = step;
  }

  pull(output: Output): Writer<unknown, unknown> {
    return Base16IntegerWriter.write(output, this._value, this._input, this._width,
                                     this._base16, this._index, this._step);
  }

  static write(output: Output, value: unknown, input: number, width: number,
               base16: Base16, index: number = 0, step: number = 3): Writer<unknown, unknown> {
    if (step <= 0) {
      return Writer.done();
    }
    if (step === 1 && output.isCont()) {
      output = output.write(48/*'0'*/);
      step = 2;
    }
    if (step === 2 && output.isCont()) {
      output = output.write(120/*'x'*/);
      step = 3;
    }
    if (step === 3) {
      if (input >= 0 && input < 16 && width <= 1) {
        if (output.isCont()) {
          output = output.write(base16.encodeDigit(input));
          return Writer.done(value);
        }
      } else {
        let i = 15;
        const digits = new Array<number>(16);
        let x = input;
        while (x !== 0 || i >= 16 - width) {
          digits[i] = x & 0xf;
          x >>>= 4;
          i -= 1;
        }
        i += 1 + index;
        while (i < 16 && output.isCont()) {
          output = output.write(base16.encodeDigit(digits[i]));
          index += 1;
          i += 1;
        }
        if (i === 16) {
          return Writer.done(value);
        }
      }
    }
    if (output.isDone()) {
      return Writer.error(new WriterException("truncated"));
    } else if (output.isError()) {
      return Writer.error(output.trap());
    }
    return new Base16IntegerWriter(value, input, width, base16, index, step);
  }

  static writeLiteral(output: Output, value: unknown, input: number, width: number,
                      base16: Base16): Writer<unknown, unknown> {
    return Base16IntegerWriter.write(output, value, input, width, base16, 0, 1);
  }
}
Base16.IntegerWriter = Base16IntegerWriter;
