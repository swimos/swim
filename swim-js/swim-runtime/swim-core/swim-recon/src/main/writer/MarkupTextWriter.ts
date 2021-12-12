// Copyright 2015-2021 Swim.inc
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
import {Output, WriterException, Writer, Utf8, Base16} from "@swim/codec";

/** @internal */
export class MarkupTextWriter extends Writer {
  private readonly text: string;
  private readonly index: number | undefined;
  private readonly escape: number | undefined;
  private readonly step: number | undefined;

  constructor(text: string, index?: number, escape?: number, step?: number) {
    super();
    this.text = text;
    this.index = index;
    this.escape = escape;
    this.step = step;
  }

  override pull(output: Output): Writer {
    return MarkupTextWriter.write(output, this.text, this.index, this.escape, this.step);
  }

  static sizeOf(text: string): number {
    let size = 0;
    for (let i = 0, n = text.length; i < n; i = Strings.offsetByCodePoints(text, i, 1)) {
      let c = text.codePointAt(i);
      if (c === void 0) {
        c = text.charCodeAt(i);
      }
      if (c === 36/*'$'*/ || c === 64/*'@'*/ || c === 91/*'['*/ || c === 92/*'\\'*/
          || c === 93/*']'*/ || c === 123/*'{'*/ || c === 125/*'}'*/ || c === 8/*'\b'*/
          || c === 12/*'\f'*/ || c === 10/*'\n'*/ || c === 13/*'\r'*/ || c === 9/*'\t'*/) {
        size += 2;
      } else if (c < 0x20) {
        size += 6;
      } else {
        size += Utf8.sizeOf(c);
      }
    }
    return size;
  }

  static write(output: Output, text: string, index: number = 0,
               escape: number = 0, step: number = 1): Writer {
    const length = text.length;
    while (output.isCont()) {
      if (step === 1) {
        if (index < length) {
          let c = text.codePointAt(index);
          if (c === void 0) {
            c = text.charCodeAt(index);
          }
          index = Strings.offsetByCodePoints(text, index, 1);
          if (c === 36/*'$'*/ || c === 64/*'@'*/ || c === 91/*'['*/ || c === 92/*'\\'*/
              || c === 93/*']'*/ || c === 123/*'{'*/ || c === 125/*'}'*/) {
            output = output.write(92/*'\\'*/);
            escape = c;
            step = 2;
          } else if (c === 8/*'\b'*/) {
            output = output.write(92/*'\\'*/);
            escape = 98/*'b'*/;
            step = 2;
          } else if (c === 12/*'\f'*/) {
            output = output.write(92/*'\\'*/);
            escape = 102/*'f'*/;
            step = 2;
          } else if (c === 10/*'\n'*/) {
            output = output.write(92/*'\\'*/);
            escape = 110/*'n'*/;
            step = 2;
          } else if (c === 13/*'\r'*/) {
            output = output.write(92/*'\\'*/);
            escape = 114/*'r'*/;
            step = 2;
          } else if (c === 9/*'\t'*/) {
            output = output.write(92/*'\\'*/);
            escape = 116/*'t'*/;
            step = 2;
          } else if (c < 0x20) {
            output = output.write(92/*'\\'*/);
            escape = c;
            step = 3;
          } else {
            output = output.write(c);
          }
        } else {
          return Writer.end();
        }
      } else if (step === 2) {
        output = output.write(escape);
        escape = 0;
        step = 1;
      } else if (step === 3) {
        output = output.write(117/*'u'*/);
        step = 4;
      } else if (step === 4) {
        output = output.write(Base16.uppercase.encodeDigit((escape >>> 12) & 0xf));
        step = 5;
      } else if (step === 5) {
        output = output.write(Base16.uppercase.encodeDigit((escape >>> 8) & 0xf));
        step = 6;
      } else if (step === 6) {
        output = output.write(Base16.uppercase.encodeDigit((escape >>> 4) & 0xf));
        step = 7;
      } else if (step === 7) {
        output = output.write(Base16.uppercase.encodeDigit(escape & 0xf));
        escape = 0;
        step = 1;
      }
    }
    if (output.isDone()) {
      return Writer.error(new WriterException("truncated"));
    } else if (output.isError()) {
      return Writer.error(output.trap());
    }
    return new MarkupTextWriter(text, index, escape, step);
  }
}
