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
import {UtfErrorMode} from "./UtfErrorMode";

/** @hidden */
export class Utf8EncodedOutput<T> extends Output<T> {
  /** @hidden */
  declare readonly output: Output<T>;
  /** @hidden */
  declare readonly errorMode: UtfErrorMode;
  /** @hidden */
  c2: number;
  /** @hidden */
  c3: number;
  /** @hidden */
  c4: number;
  /** @hidden */
  index: number;

  constructor(output: Output<T>, errorMode: UtfErrorMode, c2: number,
              c3: number, c4: number, index: number) {
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
    this.c2 = c2;
    this.c3 = c3;
    this.c4 = c4;
    this.index = index;
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
    return false;
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
      let c1 = 0;
      let c2 = this.c2;
      let c3 = this.c3;
      let c4 = this.c4;
      let output = this.output;
      let index = this.index;
      while (index < 4) {
        if (output.isCont()) {
          switch (index) {
            case 1: output = output.write(c2); this.c2 = 0; break;
            case 2: output = output.write(c3); this.c3 = 0; break;
            case 3: output = output.write(c4); this.c4 = 0; break;
            default: throw new Error("unreachable");
          }
          index += 1;
        } else {
          return Output.error(new OutputException("unable to flush buffered code units"));
        }
      }
      if (token >= 0 && token <= 0x7f) { // U+0000..U+007F
        c4 = token;
        index = 3;
      } else if (token >= 0x80 && token <= 0x7ff) { // U+0080..U+07FF
        c3 = 0xc0 | (token >>> 6);
        c4 = 0x80 | (token & 0x3f);
        index = 2;
      } else if (token >= 0x0800 && token <= 0xffff || // U+0800..U+D7FF
                 token >= 0xe000 && token <= 0xffff) { // U+E000..U+FFFF
        c2 = 0xe0 | (token  >>> 12);
        c3 = 0x80 | ((token >>>  6) & 0x3f);
        c4 = 0x80 | (token & 0x3f);
        index = 1;
      } else if (token >= 0x10000 && token <= 0x10ffff) { // U+10000..U+10FFFF
        c1 = 0xf0 | (token  >>> 18);
        c2 = 0x80 | ((token >>> 12) & 0x3f);
        c3 = 0x80 | ((token >>>  6) & 0x3f);
        c4 = 0x80 | (token & 0x3f);
        index = 0;
      } else { // surrogate or invalid code point
        if (this.errorMode.isFatal()) {
          return Output.error(new OutputException("invalid code point: " + token));
        } else {
          return this.write(this.errorMode.replacementChar);
        }
      }
      do {
        switch (index) {
          case 0: output = output.write(c1); break;
          case 1: output = output.write(c2); this.c2 = 0; break;
          case 2: output = output.write(c3); this.c3 = 0; break;
          case 3: output = output.write(c4); this.c4 = 0; break;
          default: throw new Error("unreachable");
        }
        Object.defineProperty(this, "output", {
          value: output,
          enumerable: true,
          configurable: true,
        });
        index += 1;
      } while (index < 4 && output.isCont());
      if (index < 4) {
        if (index < 3) {
          if (index < 2) {
            this.c2 = c2;
          }
          this.c3 = c3;
        }
        this.c4 = c4;
      }
      Object.defineProperty(this, "output", {
        value: output,
        enumerable: true,
        configurable: true,
      });
      this.index = index;
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

  flush(): Output<T> {
    let output = this.output;
    let index = this.index;
    while (index < 4) {
      if (output.isCont()) {
        switch (index) {
          case 1: output = output.write(this.c2); this.c2 = 0; break;
          case 2: output = output.write(this.c3); this.c3 = 0; break;
          case 3: output = output.write(this.c4); this.c4 = 0; break;
          default: throw new Error("unreachable");
        }
        index += 1;
      } else {
        return Output.error(new OutputException("unable to flush buffered code units"));
      }
    }
    Object.defineProperty(this, "output", {
      value: output,
      enumerable: true,
      configurable: true,
    });
    this.index = index;
    return this;
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
    return this.output.bind();
  }

  clone(): Output<T> {
    return new Utf8EncodedOutput(this.output.clone(), this.errorMode,
                                 this.c2, this.c3, this.c4, this.index);
  }

  static create<T>(output: Output<T>, errorMode?: UtfErrorMode): Output<T> {
    if (errorMode === void 0) {
      errorMode = UtfErrorMode.fatal();
    }
    return new Utf8EncodedOutput(output, errorMode, 0, 0, 0, 4);
  }
}
