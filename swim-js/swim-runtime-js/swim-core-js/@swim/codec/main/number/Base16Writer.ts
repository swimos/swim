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
export class Base16Writer extends Writer {
  /** @hidden */
  readonly base16: Base16;
  /** @hidden */
  readonly value: unknown;
  /** @hidden */
  readonly input: Uint8Array | null;
  /** @hidden */
  readonly index: number;
  /** @hidden */
  readonly step: number;

  constructor(base16: Base16, value: unknown, input: Uint8Array | null,
              index: number = 0, step: number = 1) {
    super();
    this.base16 = base16;
    this.value = value;
    this.input = input;
    this.index = index;
    this.step = step;
  }

  override feed(value: unknown): Writer {
    if (value instanceof Uint8Array) {
      return new Base16Writer(this.base16, void 0, value);
    } else {
      throw new TypeError("" + value);
    }
  }

  override pull(output: Output): Writer {
    if (this.input === null) {
      throw new WriterException();
    }
    return Base16Writer.write(output, this.base16, this.value, this.input,
                              this.index, this.step);
  }

  static write(output: Output, base16: Base16, value: unknown, input: Uint8Array,
               index: number = 0, step: number = 1): Writer {
    while (index < input.length) {
      const x = input[index]!;
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
    return new Base16Writer(base16, value, input, index, step);
  }
}
