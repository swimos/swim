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

import {Strings} from "@swim/util";
import {Output, WriterException, Writer, Utf8, Base16} from "@swim/codec";

/** @internal */
export class StringWriter extends Writer {
  private readonly string: string;
  private readonly index: number | undefined;
  private readonly escape: number | undefined;
  private readonly step: number | undefined;

  constructor(string: string, index?: number, escape?: number, step?: number) {
    super();
    this.string = string;
    this.index = index;
    this.escape = escape;
    this.step = step;
  }

  override pull(output: Output): Writer {
    return StringWriter.write(output, this.string, this.index, this.escape, this.step);
  }

  static sizeOf(string: string): number {
    let size = 0;
    size += 1; // '"';
    for (let i = 0, n = string.length; i < n; i = Strings.offsetByCodePoints(string, i, 1)) {
      let c = string.codePointAt(i);
      if (c === void 0) {
        c = string.charCodeAt(i);
      }
      if (c === 34/*'"'*/ || c === 92/*'\\'*/ || c === 8/*'\b'*/ || c === 12/*'\f'*/
          || c === 10/*'\n'*/ || c === 13/*'\r'*/ || c === 9/*'\t'*/) {
        size += 2;
      } else if (c < 0x20) {
        size += 6;
      } else {
        size += Utf8.sizeOf(c);
      }
    }
    size += 1; // '"';
    return size;
  }

  static write(output: Output, string: string, index: number = 0, escape: number = 0,
               step: number = 1): Writer {
    if (step === 1 && output.isCont()) {
      output = output.write(34/*'"'*/);
      step = 2;
    }
    const length = string.length;
    while (step >= 2 && step <= 8 && output.isCont()) {
      if (step === 2) {
        if (index < length) {
          let c = string.codePointAt(index);
          if (c === void 0) {
            c = string.charCodeAt(index);
          }
          index = Strings.offsetByCodePoints(string, index, 1);
          if (c === 34/*'"'*/ || c === 92/*'\\'*/) {
            output = output.write(92/*'\\'*/);
            escape = c;
            step = 3;
          } else if (c === 8/*'\b'*/) {
            output = output.write(92/*'\\'*/);
            escape = 98/*'b'*/;
            step = 3;
          } else if (c === 12/*'\f'*/) {
            output = output.write(92/*'\\'*/);
            escape = 102/*'f'*/;
            step = 3;
          } else if (c === 10/*'\n'*/) {
            output = output.write(92/*'\\'*/);
            escape = 110/*'n'*/;
            step = 3;
          } else if (c === 13/*'\r'*/) {
            output = output.write(92/*'\\'*/);
            escape = 114/*'r'*/;
            step = 3;
          } else if (c === 9/*'\t'*/) {
            output = output.write(92/*'\\'*/);
            escape = 116/*'t'*/;
            step = 3;
          } else if (c < 0x20) {
            output = output.write('\\');
            escape = c;
            step = 4;
          } else {
            output = output.write(c);
          }
        } else {
          step = 9;
          break;
        }
      } else if (step === 3) {
        output = output.write(escape);
        escape = 0;
        step = 2;
      } else if (step === 4) {
        output = output.write(117/*'u'*/);
        step = 5;
      } else if (step === 5) {
        output = output.write(Base16.uppercase.encodeDigit((escape >>> 12) & 0xf));
        step = 6;
      } else if (step === 6) {
        output = output.write(Base16.uppercase.encodeDigit((escape >>> 8) & 0xf));
        step = 7;
      } else if (step === 7) {
        output = output.write(Base16.uppercase.encodeDigit((escape >>> 4) & 0xf));
        step = 8;
      } else if (step === 8) {
        output = output.write(Base16.uppercase.encodeDigit(escape & 0xf));
        escape = 0;
        step = 2;
      }
    }
    if (step === 9 && output.isCont()) {
      output = output.write(34/*'"'*/);
      return Writer.end();
    }
    if (output.isDone()) {
      return Writer.error(new WriterException("truncated"));
    } else if (output.isError()) {
      return Writer.error(output.trap());
    }
    return new StringWriter(string, index, escape, step);
  }
}
