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

import {UtfErrorMode} from "./UtfErrorMode";
import {OutputException} from "./OutputException";
import {AnyOutputSettings, OutputSettings} from "./OutputSettings";
import {Output} from "./Output";
import {Unicode} from "./Unicode";
import {Base16} from "./Base16";

/** @hidden */
export class Utf8DecodedOutput<T> extends Output<T> {
  /** @hidden */
  _output: Output<T>;
  /** @hidden */
  readonly _errorMode: UtfErrorMode;
  /** @hidden */
  _c1: number;
  /** @hidden */
  _c2: number;
  /** @hidden */
  _c3: number;
  /** @hidden */
  _have: number;

  constructor(output: Output<T>, errorMode: UtfErrorMode,
              c1: number = -1, c2: number = -1, c3: number = -1, have: number = 0) {
    super();
    this._output = output;
    this._errorMode = errorMode;
    this._c1 = c1;
    this._c2 = c2;
    this._c3 = c3;
    this._have = have;
  }

  isCont(): boolean {
    return this._output.isCont();
  }

  isFull(): boolean {
    return this._output.isFull();
  }

  isDone(): boolean {
    return this._output.isDone();
  }

  isError(): boolean {
    return this._output.isError();
  }

  isPart(): boolean;
  isPart(isPart: boolean): Output<T>;
  isPart(isPart?: boolean): boolean | Output<T> {
    if (isPart === void 0) {
      return this._output.isPart();
    } else {
      this._output = this._output.isPart(isPart);
      return this;
    }
  }

  write(token: number | string): Output<T> {
    if (typeof token === "number") {
      let c1 = this._c1;
      let c2 = this._c2;
      let c3 = this._c3;
      let c4 = -1;
      let have = this._have;

      if (token >= 0) {
        switch (have) {
          case 0:
            c1 = token & 0xff;
            have = 1;
            break;
          case 1:
            c2 = token & 0xff;
            have = 2;
            break;
          case 2:
            c3 = token & 0xff;
            have = 3;
            break;
          case 3:
            c4 = token & 0xff;
            have = 4;
            break;
          default:
            throw new Error("unreachable");
        }
      }

      if (c1 === 0 && this._errorMode.isNonZero()) { // invalid NUL byte
        return Output.error(new OutputException("unexpected NUL byte"));
      } else if (c1 >= 0 && c1 <= 0x7f) { // U+0000..U+007F
        this._output = this._output.write(c1);
        this._have = 0;
      } else if (c1 >= 0xc2 && c1 <= 0xf4) {
        if (c1 >= 0xc2 && c1 <= 0xdf && c2 >= 0x80 && c2 <= 0xbf) { // U+0080..U+07FF
          this._output = this._output.write((c1 & 0x1f) << 6 | c2 & 0x3f);
          this._c1 = -1;
          this._have = 0;
        } else if (c1 === 0xe0 && c2 >= 0xa0 && c2 <= 0xbf // U+0800..U+0FFF
                || c1 >= 0xe1 && c1 <= 0xec && c2 >= 0x80 && c2 <= 0xbf // U+1000..U+CFFF
                || c1 === 0xed && c2 >= 0x80 && c2 <= 0x9f // U+D000..U+D7FF
                || c1 >= 0xee && c1 <= 0xef && c2 >= 0x80 && c2 <= 0xbf) { // U+E000..U+FFFF
          if (c3 >= 0x80 && c3 <= 0xbf) {
            this._output = this._output.write((c1 & 0x0f) << 12 | (c2 & 0x3f) << 6 | c3 & 0x3f);
            this._c1 = -1;
            this._c2 = -1;
            this._have = 0;
          } else if (c3 >= 0) { // invalid c3
            if (this._errorMode.isFatal()) {
              return Output.error(new OutputException(Utf8DecodedOutput.invalid(c1, c2, c3)));
            }
            this._output = this._output.write(this._errorMode.replacementChar());
            this._c1 = c3;
            this._c2 = -1;
            this._have = 1;
          } else if (token < 0 || this._output.isDone()) { // incomplete c3
            return Output.error(new OutputException(Utf8DecodedOutput.invalid(c1, c2)));
          } else { // awaiting c3
            this._c2 = c2;
            this._have = 2;
          }
        } else if (c1 === 0xf0 && c2 >= 0x90 && c2 <= 0xbf // U+10000..U+3FFFF
                || c1 >= 0xf1 && c1 <= 0xf3 && c2 >= 0x80 && c2 <= 0xbf // U+40000..U+FFFFF
                || c1 === 0xf4 && c2 >= 0x80 && c2 <= 0x8f) { // U+100000..U+10FFFF
          if (c3 >= 0x80 && c3 <= 0xbf) {
            if (c4 >= 0x80 && c4 <= 0xbf) {
              this._have = 4;
              this._output = this._output.write((c1 & 0x07) << 18 | (c2 & 0x3f) << 12 | (c3 & 0x3f) << 6 | c4 & 0x3f);
              this._c1 = -1;
              this._c2 = -1;
              this._c3 = -1;
              this._have = 0;
            } else if (c4 >= 0) { // invalid c4
              if (this._errorMode.isFatal()) {
                return Output.error(new OutputException(Utf8DecodedOutput.invalid(c1, c2, c3, c4)));
              }
              this._output = this._output.write(this._errorMode.replacementChar());
              this._c1 = c4;
              this._c2 = -1;
              this._c3 = -1;
              this._have = 1;
            } else if (token < 0 || this._output.isDone()) { // incomplete c4
              return Output.error(new OutputException(Utf8DecodedOutput.invalid(c1, c2, c3)));
            } else { // awaiting c4
              this._c3 = c3;
              this._have = 3;
            }
          } else if (c3 >= 0) { // invalid c3
            if (this._errorMode.isFatal()) {
              return Output.error(new OutputException(Utf8DecodedOutput.invalid(c1, c2, c3)));
            }
            this._output = this._output.write(this._errorMode.replacementChar());
            this._c1 = c3;
            this._c2 = -1;
            this._have = 1;
          } else if (token < 0 || this._output.isDone()) { // incomplete c3
            return Output.error(new OutputException(Utf8DecodedOutput.invalid(c1, c2)));
          } else { // awaiting c3
            this._c2 = c2;
            this._have = 2;
          }
        } else if (c2 >= 0) { // invalid c2
          if (this._errorMode.isFatal()) {
            return Output.error(new OutputException(Utf8DecodedOutput.invalid(c1, c2)));
          }
          this._output = this._output.write(this._errorMode.replacementChar());
          this._c1 = c2;
          this._have = 1;
        } else if (token < 0 || this._output.isDone()) { // incomplete c2
          return Output.error(new OutputException(Utf8DecodedOutput.invalid(c1)));
        } else { // awaiting c2
          this._c1 = c1;
          this._have = 1;
        }
      } else if (c1 >= 0) { // invalid c1
        if (this._errorMode.isFatal()) {
          return Output.error(new OutputException(Utf8DecodedOutput.invalid(c1)));
        }
        this._output = this._output.write(this._errorMode.replacementChar());
        this._have = 0;
      }
      if (this._output.isError()) {
        return this._output;
      }
      return this;
    } else if (typeof token === "string") {
      this._output.write(token);
      return this;
    } else {
      throw new TypeError("" + token);
    }
  }

  static invalid(c1: number, c2?: number, c3?: number, c4?: number): string {
    let output = Unicode.stringOutput();
    output = output.write("invalid UTF-8 code unit sequence: ");
    Base16.uppercase().writeIntegerLiteral(c1, output, 2);
    if (c2 !== void 0) {
      output = output.write(' ');
      Base16.uppercase().writeIntegerLiteral(c2, output, 2);
      if (c3 !== void 0) {
        output = output.write(' ');
        Base16.uppercase().writeIntegerLiteral(c3, output, 2);
        if (c4 !== void 0) {
          output = output.write(' ');
          Base16.uppercase().writeIntegerLiteral(c4, output, 2);
        }
      }
    }
    return output.bind();
  }

  settings(): OutputSettings;
  settings(settings: AnyOutputSettings): Output<T>;
  settings(settings?: AnyOutputSettings): OutputSettings | Output<T> {
    if (settings === void 0) {
      return this._output.settings();
    } else {
      this._output.settings(settings);
      return this;
    }
  }

  bind(): T {
    if (this._have === 0) {
      return this._output.bind();
    } else {
      return this.write(-1).bind();
    }
  }

  trap(): Error {
    return this._output.trap();
  }

  clone(): Output<T> {
    return new Utf8DecodedOutput<T>(this._output.clone(), this._errorMode,
                                    this._c1, this._c2, this._c3, this._have);
  }
}
