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

import {Unicode, Base16} from "@swim/codec";
import {Item, Value} from "@swim/structure";

export type GenericFamily = "serif"
                          | "sans-serif"
                          | "cursive"
                          | "fantasy"
                          | "monospace"
                          | "system-ui"
                          | "emoji"
                          | "math"
                          | "fangsong";

export type FontFamily = string | GenericFamily;

export const FontFamily = (function () {
  const FontFamily = {} as {
    fromValue(value: Value): FontFamily | FontFamily[] | null;

    format(family: FontFamily): string;
  };

  FontFamily.fromValue = function (value: Value): FontFamily | FontFamily[] | null {
    let family: FontFamily | FontFamily[] | null = null;
    value.forEach(function (item: Item): void {
      if (item instanceof Value) {
        const string = item.stringValue(void 0);
        if (string !== void 0) {
          if (family === null) {
            family = string;
          } else if (typeof family === "string") {
            family = [family, string];
          } else {
            family.push(string);
          }
        }
      }
    });
    return family;
  };

  FontFamily.format = function (family: FontFamily): string {
    const n = family.length;
    let isIdent: boolean;
    if (n > 0) {
      isIdent = Unicode.isAlpha(family.charCodeAt(0));
      for (let i = family.offsetByCodePoints(0, 1); isIdent && i < n; i = family.offsetByCodePoints(i, 1)) {
        const c = family.charCodeAt(i);
        isIdent = Unicode.isAlpha(c) || c === 45/*'-'*/;
      }
    } else {
      isIdent = false;
    }
    if (isIdent) {
      return family;
    } else {
      let output = Unicode.stringOutput();
      output = output.write(34/*'"'*/);
      for (let i = 0; i < n; i = family.offsetByCodePoints(i, 1)) {
        const c = family.charCodeAt(i);
        if (c === 10/*'\n'*/ || c === 34/*'"'*/ || c === 39/*'\''*/) {
          output = output.write(92/*'\\'*/).write(c);
        } else if (c >= 0x20) {
          output = output.write(c);
        } else {
          const base16 = Base16.uppercase;
          output = output.write(92/*'\\'*/).write(base16.encodeDigit(c >>> 20 & 0xf))
                                           .write(base16.encodeDigit(c >>> 16 & 0xf))
                                           .write(base16.encodeDigit(c >>> 12 & 0xf))
                                           .write(base16.encodeDigit(c >>>  8 & 0xf))
                                           .write(base16.encodeDigit(c >>>  4 & 0xf))
                                           .write(base16.encodeDigit(c        & 0xf));
        }
      }
      output = output.write(34/*'"'*/);
      return output.toString();
    }
  };

  return FontFamily;
})();
