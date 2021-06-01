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

import type {Output} from "../output/Output";
import {WriterException} from "../writer/WriterException";
import {Writer} from "../writer/Writer";
import type {Base16} from "./Base16";

/** @hidden */
export class Base16Writer extends Writer {
  /** @hidden */
  readonly value!: unknown;
  /** @hidden */
  readonly input!: Uint8Array | null;
  /** @hidden */
  readonly base16!: Base16;
  /** @hidden */
  readonly index!: number;
  /** @hidden */
  readonly step!: number;

  constructor(value: unknown, input: Uint8Array | null, base16: Base16,
              index: number = 0, step: number = 1) {
    super();
    Object.defineProperty(this, "value", {
      value: value,
      enumerable: true,
    });
    Object.defineProperty(this, "input", {
      value: input,
      enumerable: true,
    });
    Object.defineProperty(this, "base16", {
      value: base16,
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

  override feed(value: unknown): Writer {
    if (value instanceof Uint8Array) {
      return new Base16Writer(void 0, value, this.base16);
    } else {
      throw new TypeError("" + value);
    }
  }

  override pull(output: Output): Writer {
    if (this.input === null) {
      throw new WriterException();
    }
    return Base16Writer.write(output, this.value, this.input, this.base16,
                              this.index, this.step);
  }

  static write(output: Output, value: unknown, input: Uint8Array,
               base16: Base16, index: number = 0, step: number = 1): Writer {
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
    return new Base16Writer(value, input, base16, index, step);
  }
}
