// Copyright 2015-2020 Swim inc.
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

import {OutputException} from "../output/OutputException";
import type {AnyOutputSettings, OutputSettings} from "../output/OutputSettings";
import {Output} from "../output/Output";
import {Unicode} from "./Unicode";
import {UtfErrorMode} from "./UtfErrorMode";
import {Base16} from "../number/Base16";

/** @hidden */
export class Utf8DecodedOutput<T> extends Output<T> {
  /** @hidden */
  declare readonly output: Output<T>;
  /** @hidden */
  declare readonly errorMode: UtfErrorMode;
  /** @hidden */
  c1: number;
  /** @hidden */
  c2: number;
  /** @hidden */
  c3: number;
  /** @hidden */
  have: number;

  constructor(output: Output<T>, errorMode: UtfErrorMode,
              c1: number, c2: number, c3: number, have: number) {
    super();
    Object.defineProperty(this, "output", {
      value: output,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "errorMode", {
      value: errorMode,
      enumerable: true,
      configurable: true,
    });
    this.c1 = c1;
    this.c2 = c2;
    this.c3 = c3;
    this.have = have;
  }

  isCont(): boolean {
    return this.output.isCont();
  }

  isFull(): boolean {
    return this.output.isFull();
  }

  isDone(): boolean {
    return this.output.isDone();
  }

  isError(): boolean {
    return this.output.isError();
  }

  isPart(): boolean {
    return this.output.isPart();
  }

  asPart(part: boolean): Output<T> {
    Object.defineProperty(this, "output", {
      value: this.output.asPart(part),
      enumerable: true,
      configurable: true,
    });
    return this;
  }

  write(token: number | string): Output<T> {
    if (typeof token === "number") {
      let c1 = this.c1;
      let c2 = this.c2;
      let c3 = this.c3;
      let c4 = -1;
      let have = this.have;

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

      if (c1 === 0 && this.errorMode.isNonZero()) { // invalid NUL byte
        return Output.error(new OutputException("unexpected NUL byte"));
      } else if (c1 >= 0 && c1 <= 0x7f) { // U+0000..U+007F
        Object.defineProperty(this, "output", {
          value: this.output.write(c1),
          enumerable: true,
          configurable: true,
        });
        this.have = 0;
      } else if (c1 >= 0xc2 && c1 <= 0xf4) {
        if (c1 >= 0xc2 && c1 <= 0xdf && c2 >= 0x80 && c2 <= 0xbf) { // U+0080..U+07FF
          Object.defineProperty(this, "output", {
            value: this.output.write((c1 & 0x1f) << 6 | c2 & 0x3f),
            enumerable: true,
            configurable: true,
          });
          this.c1 = -1;
          this.have = 0;
        } else if (c1 === 0xe0 && c2 >= 0xa0 && c2 <= 0xbf // U+0800..U+0FFF
                || c1 >= 0xe1 && c1 <= 0xec && c2 >= 0x80 && c2 <= 0xbf // U+1000..U+CFFF
                || c1 === 0xed && c2 >= 0x80 && c2 <= 0x9f // U+D000..U+D7FF
                || c1 >= 0xee && c1 <= 0xef && c2 >= 0x80 && c2 <= 0xbf) { // U+E000..U+FFFF
          if (c3 >= 0x80 && c3 <= 0xbf) {
            Object.defineProperty(this, "output", {
              value: this.output.write((c1 & 0x0f) << 12 | (c2 & 0x3f) << 6 | c3 & 0x3f),
              enumerable: true,
              configurable: true,
            });
            this.c1 = -1;
            this.c2 = -1;
            this.have = 0;
          } else if (c3 >= 0) { // invalid c3
            if (this.errorMode.isFatal()) {
              return Output.error(new OutputException(Utf8DecodedOutput.invalid(c1, c2, c3)));
            }
            Object.defineProperty(this, "output", {
              value: this.output.write(this.errorMode.replacementChar),
              enumerable: true,
              configurable: true,
            });
            this.c1 = c3;
            this.c2 = -1;
            this.have = 1;
          } else if (token < 0 || this.output.isDone()) { // incomplete c3
            return Output.error(new OutputException(Utf8DecodedOutput.invalid(c1, c2)));
          } else { // awaiting c3
            this.c2 = c2;
            this.have = 2;
          }
        } else if (c1 === 0xf0 && c2 >= 0x90 && c2 <= 0xbf // U+10000..U+3FFFF
                || c1 >= 0xf1 && c1 <= 0xf3 && c2 >= 0x80 && c2 <= 0xbf // U+40000..U+FFFFF
                || c1 === 0xf4 && c2 >= 0x80 && c2 <= 0x8f) { // U+100000..U+10FFFF
          if (c3 >= 0x80 && c3 <= 0xbf) {
            if (c4 >= 0x80 && c4 <= 0xbf) {
              this.have = 4;
              Object.defineProperty(this, "output", {
                value: this.output.write((c1 & 0x07) << 18 | (c2 & 0x3f) << 12 | (c3 & 0x3f) << 6 | c4 & 0x3f),
                enumerable: true,
                configurable: true,
              });
              this.c1 = -1;
              this.c2 = -1;
              this.c3 = -1;
              this.have = 0;
            } else if (c4 >= 0) { // invalid c4
              if (this.errorMode.isFatal()) {
                return Output.error(new OutputException(Utf8DecodedOutput.invalid(c1, c2, c3, c4)));
              }
              Object.defineProperty(this, "output", {
                value: this.output.write(this.errorMode.replacementChar),
                enumerable: true,
                configurable: true,
              });
              this.c1 = c4;
              this.c2 = -1;
              this.c3 = -1;
              this.have = 1;
            } else if (token < 0 || this.output.isDone()) { // incomplete c4
              return Output.error(new OutputException(Utf8DecodedOutput.invalid(c1, c2, c3)));
            } else { // awaiting c4
              this.c3 = c3;
              this.have = 3;
            }
          } else if (c3 >= 0) { // invalid c3
            if (this.errorMode.isFatal()) {
              return Output.error(new OutputException(Utf8DecodedOutput.invalid(c1, c2, c3)));
            }
            Object.defineProperty(this, "output", {
              value: this.output.write(this.errorMode.replacementChar),
              enumerable: true,
              configurable: true,
            });
            this.c1 = c3;
            this.c2 = -1;
            this.have = 1;
          } else if (token < 0 || this.output.isDone()) { // incomplete c3
            return Output.error(new OutputException(Utf8DecodedOutput.invalid(c1, c2)));
          } else { // awaiting c3
            this.c2 = c2;
            this.have = 2;
          }
        } else if (c2 >= 0) { // invalid c2
          if (this.errorMode.isFatal()) {
            return Output.error(new OutputException(Utf8DecodedOutput.invalid(c1, c2)));
          }
          Object.defineProperty(this, "output", {
            value: this.output.write(this.errorMode.replacementChar),
            enumerable: true,
            configurable: true,
          });
          this.c1 = c2;
          this.have = 1;
        } else if (token < 0 || this.output.isDone()) { // incomplete c2
          return Output.error(new OutputException(Utf8DecodedOutput.invalid(c1)));
        } else { // awaiting c2
          this.c1 = c1;
          this.have = 1;
        }
      } else if (c1 >= 0) { // invalid c1
        if (this.errorMode.isFatal()) {
          return Output.error(new OutputException(Utf8DecodedOutput.invalid(c1)));
        }
        Object.defineProperty(this, "output", {
          value: this.output.write(this.errorMode.replacementChar),
          enumerable: true,
          configurable: true,
        });
        this.have = 0;
      }
      if (this.output.isError()) {
        return this.output;
      }
      return this;
    } else if (typeof token === "string") {
      Object.defineProperty(this, "output", {
        value: this.output.write(token),
        enumerable: true,
        configurable: true,
      });
      return this;
    } else {
      throw new TypeError("" + token);
    }
  }

  static invalid(c1: number, c2?: number, c3?: number, c4?: number): string {
    let output = Unicode.stringOutput();
    output = output.write("invalid UTF-8 code unit sequence: ");
    const base16 = Base16.uppercase;
    base16.writeIntegerLiteral(c1, output, 2);
    if (c2 !== void 0) {
      output = output.write(' ');
      base16.writeIntegerLiteral(c2, output, 2);
      if (c3 !== void 0) {
        output = output.write(' ');
        base16.writeIntegerLiteral(c3, output, 2);
        if (c4 !== void 0) {
          output = output.write(' ');
          base16.writeIntegerLiteral(c4, output, 2);
        }
      }
    }
    return output.bind();
  }

  get settings(): OutputSettings {
    return this.output.settings;
  }

  withSettings(settings: AnyOutputSettings): Output<T> {
    Object.defineProperty(this, "output", {
      value: this.output.withSettings(settings),
      enumerable: true,
      configurable: true,
    });
    return this;
  }

  bind(): T {
    if (this.have === 0) {
      return this.output.bind();
    } else {
      return this.write(-1).bind();
    }
  }

  trap(): Error {
    return this.output.trap();
  }

  clone(): Output<T> {
    return new Utf8DecodedOutput(this.output.clone(), this.errorMode,
                                 this.c1, this.c2, this.c3, this.have);
  }

  static create<T>(output: Output<T>, errorMode?: UtfErrorMode): Output<T> {
    if (errorMode === void 0) {
      errorMode = UtfErrorMode.fatal();
    }
    return new Utf8DecodedOutput(output, errorMode, -1, -1, -1, 0);
  }
}
