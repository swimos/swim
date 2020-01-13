// Copyright 2015-2020 SWIM.AI inc.
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

import {AnyOutputSettings, OutputSettings} from "./OutputSettings";
import {Output} from "./Output";

/** @hidden */
export class StringOutput extends Output<string> {
  /** @hidden */
  _string: string;
  /** @hidden */
  _settings: OutputSettings;

  constructor(string: string, settings: OutputSettings) {
    super();
    this._string = string;
    this._settings = settings;
  }

  isCont(): boolean {
    return true;
  }

  isFull(): boolean {
    return false;
  }

  isDone(): boolean {
    return false;
  }

  isError(): boolean {
    return false;
  }

  isPart(): boolean;
  isPart(isPart: boolean): Output<string>;
  isPart(isPart?: boolean): boolean | Output<string> {
    if (isPart === void 0) {
      return false;
    } else {
      return this;
    }
  }

  write(token: number | string): Output<string> {
    if (typeof token === "number") {
      if ((token >= 0x0000 && token <= 0xd7ff)
          || (token >= 0xe000 && token <= 0xffff)) { // U+0000..U+D7FF | U+E000..U+FFFF
        token = String.fromCharCode(token);
      } else if (token >= 0x10000 && token <= 0x10ffff) { // U+10000..U+10FFFF
        const u = token - 0x10000;
        token = String.fromCharCode(0xd800 | (u >>> 10), 0xdc00 | (u & 0x3ff));
      } else { // invalid code point
        token = "\ufffd";
      }
    }
    this._string += token;
    return this;
  }

  writeln(string?: string): Output<string> {
    if (string === void 0) {
      this._string = this._string.concat(this._settings._lineSeparator);
      return this;
    } else {
      this._string = this._string.concat(string).concat(this._settings._lineSeparator);
      return this;
    }
  }

  settings(): OutputSettings;
  settings(settings: AnyOutputSettings): Output<string>;
  settings(settings?: AnyOutputSettings): OutputSettings | Output<string> {
    if (settings === void 0) {
      return this._settings;
    } else {
      this._settings = OutputSettings.fromAny(settings);
      return this;
    }
  }

  bind(): string {
    return this._string;
  }

  clone(): Output<string> {
    return new StringOutput(this._string, this._settings);
  }

  toString(): string {
    return this._string;
  }
}
