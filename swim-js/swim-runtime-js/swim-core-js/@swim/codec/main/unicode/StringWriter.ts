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

/** @hidden */
export class StringWriter extends Writer<unknown, unknown> {
  /** @hidden */
  readonly value!: unknown;
  /** @hidden */
  readonly input!: string;
  /** @hidden */
  readonly index!: number;

  constructor(value: unknown, input: string, index: number = 0) {
    super();
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
  }

  override feed(input: unknown): Writer<unknown, unknown> {
    return new StringWriter(input, "" + input);
  }

  override pull(output: Output): Writer<unknown, unknown> {
    return StringWriter.write(output, this.value, this.input, this.index);
  }

  static write(output: Output, value: unknown, input: string, index: number = 0): Writer<unknown, unknown> {
    const length = input.length;
    while (index < length && output.isCont()) {
      let c = input.codePointAt(index);
      if (c === void 0) {
        c = input.charCodeAt(index);
      }
      output = output.write(c);
      index = input.offsetByCodePoints(index, 1);
    }
    if (index === length) {
      return Writer.done(value);
    }
    if (output.isDone()) {
      return Writer.error(new WriterException("truncated"));
    } else if (output.isError()) {
      return Writer.error(output.trap());
    }
    return new StringWriter(value, input, index);
  }
}
