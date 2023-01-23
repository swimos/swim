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

import {Strings} from "@swim/util";
import type {Output} from "../output/Output";
import {WriterException} from "../writer/WriterException";
import {Writer} from "../writer/Writer";

/** @internal */
export class StringWriter extends Writer<unknown, unknown> {
  /** @internal */
  readonly value: unknown;
  /** @internal */
  readonly input: string;
  /** @internal */
  readonly index: number;

  constructor(value: unknown, input: string, index: number = 0) {
    super();
    this.value = value;
    this.input = input;
    this.index = index;
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
      index = Strings.offsetByCodePoints(input, index, 1);
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
