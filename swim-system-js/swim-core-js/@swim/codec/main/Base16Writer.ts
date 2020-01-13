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

import {Output} from "./Output";
import {WriterException} from "./WriterException";
import {Writer} from "./Writer";
import {Base16} from "./Base16";

/** @hidden */
export class Base16Writer extends Writer<unknown, unknown> {
  /** @hidden */
  readonly _value: unknown;
  /** @hidden */
  readonly _input: Uint8Array | undefined;
  /** @hidden */
  readonly _base16: Base16;
  /** @hidden */
  readonly _index: number;
  /** @hidden */
  readonly _step: number;

  constructor(value: unknown, input: Uint8Array | undefined, base16: Base16,
              index: number = 0, step: number = 1) {
    super();
    this._value = value;
    this._input = input;
    this._base16 = base16;
    this._index = index;
    this._step = step;
  }

  feed(value: unknown): Writer<unknown, unknown> {
    if (value instanceof Uint8Array) {
      return new Base16Writer(undefined, value, this._base16);
    } else {
      throw new TypeError("" + value);
    }
  }

  pull(output: Output): Writer<unknown, unknown> {
    return Base16Writer.write(output, this._value, this._input!, this._base16,
                              this._index, this._step);
  }

  static write(output: Output, value: unknown, input: Uint8Array, base16: Base16,
               index: number = 0, step: number = 1): Writer<unknown, unknown> {
    while (index < input.length) {
      const x = input[index];
      if (step === 1 && output.isCont()) {
        output = output.write(base16.encodeDigit(x >>> 4));
        step = 2;
      }
      if (step === 2 && output.isCont()) {
        output = output.write(base16.encodeDigit(x & 0x0f));
        index += 1;
        step = 1;
      }
    }
    if (index === input.length) {
      return Writer.done(value);
    } else if (output.isDone()) {
      return Writer.error(new WriterException("truncated"));
    } else if (output.isError()) {
      return Writer.error(output.trap());
    }
    return new Base16Writer(value, input, base16, index, step);
  }
}
Base16.Writer = Base16Writer;
