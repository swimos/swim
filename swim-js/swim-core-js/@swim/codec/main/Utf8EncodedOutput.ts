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

/** @hidden */
export class Utf8EncodedOutput<T> extends Output<T> {
  /** @hidden */
  _output: Output<T>;
  /** @hidden */
  readonly _errorMode: UtfErrorMode;
  /** @hidden */
  _c2: number;
  /** @hidden */
  _c3: number;
  /** @hidden */
  _c4: number;
  /** @hidden */
  _index: number;

  constructor(output: Output<T>, errorMode: UtfErrorMode, c2: number = 0,
              c3: number = 0, c4: number = 0, index: number = 4) {
    super();
    this._output = output;
    this._errorMode = errorMode;
    this._c2 = c2;
    this._c3 = c3;
    this._c4 = c4;
    this._index = index;
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
    return false;
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
      let c1 = 0;
      let c2 = this._c2;
      let c3 = this._c3;
      let c4 = this._c4;
      let index = this._index;
      while (index < 4) {
        if (this._output.isCont()) {
          switch (index) {
            case 1: this._output = this._output.write(c2); this._c2 = 0; break;
            case 2: this._output = this._output.write(c3); this._c3 = 0; break;
            case 3: this._output = this._output.write(c4); this._c4 = 0; break;
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
        if (this._errorMode.isFatal()) {
          return Output.error(new OutputException("invalid code point: " + token));
        } else {
          return this.write(this._errorMode.replacementChar());
        }
      }
      do {
        switch (index) {
          case 0: this._output = this._output.write(c1); break;
          case 1: this._output = this._output.write(c2); this._c2 = 0; break;
          case 2: this._output = this._output.write(c3); this._c3 = 0; break;
          case 3: this._output = this._output.write(c4); this._c4 = 0; break;
          default: throw new Error("unreachable");
        }
        index += 1;
      } while (index < 4 && this._output.isCont());
      if (index < 4) {
        if (index < 3) {
          if (index < 2) {
            this._c2 = c2;
          }
          this._c3 = c3;
        }
        this._c4 = c4;
      }
      this._index = index;
      return this;
    } else if (typeof token === "string") {
      this._output.write(token);
      return this;
    } else {
      throw new TypeError("" + token);
    }
  }

  flush(): Output<T> {
    let index = this._index;
    while (index < 4) {
      if (this._output.isCont()) {
        switch (index) {
          case 1: this._output = this._output.write(this._c2); this._c2 = 0; break;
          case 2: this._output = this._output.write(this._c3); this._c3 = 0; break;
          case 3: this._output = this._output.write(this._c4); this._c4 = 0; break;
          default: throw new Error("unreachable");
        }
        index += 1;
      } else {
        return Output.error(new OutputException("unable to flush buffered code units"));
      }
    }
    this._index = index;
    return this;
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
    return this._output.bind();
  }

  clone(): Output<T> {
    return new Utf8EncodedOutput<T>(this._output.clone(), this._errorMode,
                                    this._c2, this._c3, this._c4, this._index);
  }
}
