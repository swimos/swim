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
import type {Base64} from "./Base64";

/** @hidden */
export class Base64Writer extends Writer {
  /** @hidden */
  readonly base64!: Base64;
  /** @hidden */
  readonly value!: unknown;
  /** @hidden */
  readonly input!: Uint8Array | null;
  /** @hidden */
  readonly index!: number;
  /** @hidden */
  readonly step!: number;

  constructor(base64: Base64, value: unknown, input: Uint8Array | null,
              index: number = 0, step: number = 1) {
    super();
    Object.defineProperty(this, "base64", {
      value: base64,
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
      return new Base64Writer(this.base64, null, value);
    } else {
      throw new TypeError("" + value);
    }
  }

  override pull(output: Output): Writer {
    if (this.input === null) {
      throw new WriterException();
    }
    return Base64Writer.write(output, this.base64, this.value, this.input,
                              this.index, this.step);
  }

  static write(output: Output, base64: Base64, value: unknown, input: Uint8Array,
               index: number = 0, step: number = 1): Writer {
    while (index + 2 < input.length && output.isCont()) {
      const x = input[index]!;
      const y = input[index + 1]!;
      const z = input[index + 2]!;
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
      const x = input[index]!;
      const y = input[index + 1]!;
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
      const x = input[index]!;
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
    return new Base64Writer(base64, value, input, index, step);
  }
}
