// Copyright 2015-2023 Nstream, inc.
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

import type {Mutable} from "@swim/util";
import type {OutputSettingsLike} from "../output/OutputSettings";
import {OutputSettings} from "../output/OutputSettings";
import {Output} from "../output/Output";

/** @internal */
export class StringOutput extends Output<string> {
  constructor(string: string, settings: OutputSettings) {
    super();
    this.string = string;
    this.settings = settings;
  }

  /** @internal */
  readonly string: string;

  override isCont(): boolean {
    return true;
  }

  override isFull(): boolean {
    return false;
  }

  override isDone(): boolean {
    return false;
  }

  override isError(): boolean {
    return false;
  }

  override isPart(): boolean {
    return false;
  }

  override asPart(part: boolean): Output<string> {
    return this;
  }

  override write(token: number | string): Output<string> {
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
    (this as Mutable<this>).string += token;
    return this;
  }

  override writeln(string?: string): Output<string> {
    if (string !== void 0) {
      (this as Mutable<this>).string = this.string.concat(string);
    }
    (this as Mutable<this>).string = this.string.concat(this.settings.lineSeparator);
    return this;
  }

  override readonly settings: OutputSettings;

  override withSettings(settings: OutputSettingsLike): Output<string> {
    settings = OutputSettings.fromLike(settings);
    (this as Mutable<this>).settings = settings;
    return this;
  }

  override bind(): string {
    return this.string;
  }

  override clone(): Output<string> {
    return new StringOutput(this.string, this.settings);
  }

  override toString(): string {
    return this.string;
  }
}
