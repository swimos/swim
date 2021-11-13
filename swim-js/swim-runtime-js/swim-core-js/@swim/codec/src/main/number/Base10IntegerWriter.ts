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
import {Base10} from "./Base10";

/** @internal */
export class Base10IntegerWriter extends Writer {
  /** @internal */
  readonly value: unknown;
  /** @internal */
  readonly input: number;
  /** @internal */
  readonly index: number;
  /** @internal */
  readonly step: number;

  constructor(value: unknown, input: number, index: number = 0, step: number = 1) {
    super();
    this.value = value;
    this.input = input;
    this.index = index;
    this.step = step;
  }

  override pull(output: Output): Writer {
    return Base10IntegerWriter.write(output, this.value, this.input, this.index, this.step);
  }

  static write(output: Output, value: unknown, input: number, index: number = 0,
               step: number = 1): Writer {
    if (step === 0) {
      return Writer.end();
    }
    if (step === 1) {
      if (input < 0) {
        if (output.isCont()) {
          output = output.write(45/*'-'*/);
          step = 2;
        }
      } else {
        step = 2;
      }
    }
    if (step === 2) {
      if (input > -10 && input < 10) {
        if (output.isCont()) {
          output = output.write(Base10.encodeDigit(Math.abs(input | 0)));
          return Writer.done(value);
        }
      } else {
        const digits = new Array<number>(19);
        let x = input;
        let i = 18;
        while (x !== 0) {
          digits[i] = Math.abs((x % 10) | 0);
          x = (x / 10) | 0;
          i -= 1;
        }
        i += 1 + index;
        while (i < 19 && output.isCont()) {
          output = output.write(Base10.encodeDigit(digits[i]!));
          index += 1;
          i += 1;
        }
        if (i === 19) {
          return Writer.done(value);
        }
      }
    }
    if (output.isDone()) {
      return Writer.error(new WriterException("truncated"));
    } else if (output.isError()) {
      return Writer.error(output.trap());
    }
    return new Base10IntegerWriter(value, input, index, step);
  }
}
