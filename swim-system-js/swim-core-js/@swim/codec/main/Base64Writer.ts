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
import {Base64} from "./Base64";

/** @hidden */
export class Base64Writer extends Writer<unknown, unknown> {
  /** @hidden */
  readonly _value: unknown;
  /** @hidden */
  readonly _input: Uint8Array | undefined;
  /** @hidden */
  readonly _base64: Base64;
  /** @hidden */
  readonly _index: number;
  /** @hidden */
  readonly _step: number;

  constructor(value: unknown, input: Uint8Array | undefined, base64: Base64,
              index: number = 0, step: number = 1) {
    super();
    this._value = value;
    this._input = input;
    this._base64 = base64;
    this._index = index;
    this._step = step;
  }

  feed(value: unknown): Writer<unknown, unknown> {
    if (value instanceof Uint8Array) {
      return new Base64Writer(undefined, value, this._base64);
    } else {
      throw new TypeError("" + value);
    }
  }

  pull(output: Output): Writer<unknown, unknown> {
    return Base64Writer.write(output, this._value, this._input!, this._base64,
                              this._index, this._step);
  }

  static write(output: Output, value: unknown, input: Uint8Array, base64: Base64,
               index: number = 0, step: number = 1): Writer<unknown, unknown> {
    while (index + 2 < input.length && output.isCont()) {
      const x = input[index];
      const y = input[index + 1];
      const z = input[index + 2];
      if (step === 1 && output.isCont()) {
        output = output.write(base64.encodeDigit(x >>> 2));
        step = 2;
      }
      if (step === 2 && output.isCont()) {
        output = output.write(base64.encodeDigit(((x << 4) | (y >>> 4)) & 0x3f));
        step = 3;
      }
      if (step === 3 && output.isCont()) {
        output = output.write(base64.encodeDigit(((y << 2) | (z >>> 6)) & 0x3f));
        step = 4;
      }
      if (step === 4 && output.isCont()) {
        output = output.write(base64.encodeDigit(z & 0x3f));
        index += 3;
        step = 1;
      }
    }
    if (index + 1 < input.length && output.isCont()) {
      const x = input[index];
      const y = input[index + 1];
      if (step === 1 && output.isCont()) {
        output = output.write(base64.encodeDigit(x >>> 2));
        step = 2;
      }
      if (step === 2 && output.isCont()) {
        output = output.write(base64.encodeDigit(((x << 4) | (y >>> 4)) & 0x3f));
        step = 3;
      }
      if (step === 3 && output.isCont()) {
        output = output.write(base64.encodeDigit((y << 2) & 0x3f));
        step = 4;
      }
      if (step === 4) {
        if (!base64.isPadded()) {
          index += 2;
        } else if (output.isCont()) {
          output = output.write(61/*'='*/);
          index += 2;
        }
      }
    } else if (index < input.length && output.isCont()) {
      const x = input[index];
      if (step === 1 && output.isCont()) {
        output = output.write(base64.encodeDigit(x >>> 2));
        step = 2;
      }
      if (step === 2 && output.isCont()) {
        output = output.write(base64.encodeDigit((x << 4) & 0x3f));
        step = 3;
      }
      if (step === 3) {
        if (!base64.isPadded()) {
          index += 1;
        } else if (output.isCont()) {
          output = output.write(61/*'='*/);
          step = 4;
        }
      }
      if (step === 4 && output.isCont()) {
        output = output.write(61/*'='*/);
        index += 1;
      }
    }
    if (index === input.length) {
      return Writer.done(value);
    } else if (output.isDone()) {
      return Writer.error(new WriterException("truncated"));
    } else if (output.isError()) {
      return Writer.error(output.trap());
    }
    return new Base64Writer(value, input, base64, index, step);
  }
}
Base64.Writer = Base64Writer;
