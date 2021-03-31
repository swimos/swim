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

import {AnyOutputSettings, OutputSettings} from "../output/OutputSettings";
import {Output} from "../output/Output";

/** @hidden */
export class StringOutput extends Output<string> {
  /** @hidden */
  declare readonly string: string;

  constructor(string: string, settings: OutputSettings) {
    super();
    Object.defineProperty(this, "string", {
      value: string,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "settings", {
      value: settings,
      enumerable: true,
      configurable: true,
    });
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

  isPart(): boolean {
    return false;
  }

  asPart(part: boolean): Output<string> {
    return this;
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
    Object.defineProperty(this, "string", {
      value: this.string + token,
      enumerable: true,
      configurable: true,
    });
    return this;
  }

  writeln(string?: string): Output<string> {
    if (string === void 0) {
      Object.defineProperty(this, "string", {
        value: this.string.concat(this.settings.lineSeparator),
        enumerable: true,
        configurable: true,
      });
      return this;
    } else {
      Object.defineProperty(this, "string", {
        value: this.string.concat(string).concat(this.settings.lineSeparator),
        enumerable: true,
        configurable: true,
      });
      return this;
    }
  }

  declare readonly settings: OutputSettings;

  withSettings(settings: AnyOutputSettings): Output<string> {
    settings = OutputSettings.fromAny(settings);
    Object.defineProperty(this, "settings", {
      value: settings,
      enumerable: true,
      configurable: true,
    });
    return this;
  }

  bind(): string {
    return this.string;
  }

  clone(): Output<string> {
    return new StringOutput(this.string, this.settings);
  }

  toString(): string {
    return this.string;
  }
}
