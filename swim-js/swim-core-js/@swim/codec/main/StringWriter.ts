// Copyright 2015-2019 SWIM.AI inc.
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

/** @hidden */
export class StringWriter<I> extends Writer<I, unknown> {
  private readonly _value: unknown;
  private readonly _input: string;
  private readonly _index: number;

  constructor(value: unknown, input: string, index: number = 0) {
    super();
    this._value = value;
    this._input = input;
    this._index = index;
  }

  feed(input: unknown): Writer<I, unknown> {
    return new StringWriter(input, "" + input);
  }

  pull(output: Output): Writer<I, unknown> {
    return StringWriter.write(output, this._value, this._input, this._index);
  }

  static write<I>(output: Output, value: unknown, input: string, index: number = 0): Writer<I, unknown> {
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
