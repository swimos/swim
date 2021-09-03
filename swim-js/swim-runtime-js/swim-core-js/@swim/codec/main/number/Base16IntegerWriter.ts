// Copyright 2015-2021 Swim Inc.
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

import type {Output} from "../output/Output";
import {WriterException} from "../writer/WriterException";
import {Writer} from "../writer/Writer";
import type {Base16} from "./Base16";

/** @hidden */
export class Base16IntegerWriter extends Writer {
  /** @hidden */
  readonly base16!: Base16;
  /** @hidden */
  readonly value!: unknown;
  /** @hidden */
  readonly input!: number;
  /** @hidden */
  readonly width!: number;
  /** @hidden */
  readonly index!: number;
  /** @hidden */
  readonly step!: number;

  constructor(base16: Base16, value: unknown, input: number,
              width: number, index: number = 0, step: number = 3) {
    super();
    Object.defineProperty(this, "base16", {
      value: base16,
      enumerable: true,
    });
    Object.defineProperty(this, "value", {
      value: value,
      enumerable: true,
    });
    Object.defineProperty(this, "input", {
      value: input,
      enumerable: true,
    });
    Object.defineProperty(this, "width", {
      value: width,
      enumerable: true,
    });
    Object.defineProperty(this, "index", {
      value: index,
      enumerable: true,
    });
    Object.defineProperty(this, "step", {
      value: step,
      enumerable: true,
    });
  }

  override pull(output: Output): Writer {
    return Base16IntegerWriter.write(output, this.base16, this.value, this.input,
                                     this.width, this.index, this.step);
  }

  static write(output: Output, base16: Base16, value: unknown, input: number,
               width: number, index: number = 0, step: number = 3): Writer {
    if (step <= 0) {
      return Writer.end();
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
          output = output.write(base16.encodeDigit(digits[i]!));
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
    return new Base16IntegerWriter(base16, value, input, width, index, step);
  }

  static writeLiteral(output: Output, base16: Base16, value: unknown,
                      input: number, width: number): Writer {
    return Base16IntegerWriter.write(output, base16, value, input, width, 0, 1);
  }
}
