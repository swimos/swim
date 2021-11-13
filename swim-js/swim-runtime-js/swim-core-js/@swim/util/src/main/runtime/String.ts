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

if (String.prototype.codePointAt === void 0) {
  String.prototype.codePointAt = function (this: string, index: number): number | undefined {
    const size = this.length;
    index = index ? Number(index) : 0; // Coerce to number.
    if (index !== index) { // Convert NaN to zero.
      index = 0;
    }
    if (index >= 0 && index < size) {
      const c1 = this.charCodeAt(index);
      if (c1 <= 0xd7ff || c1 >= 0xe000) { // U+0000..U+D7FF | U+E000..U+FFFF
        return c1;
      } else if (c1 <= 0xdbff && index + 1 < size) {
        const c2 = this.charCodeAt(index + 1);
        if (c2 >= 0xdc00 && c2 <= 0xdfff) { // U+10000..U+10FFFF
          return ((c1 & 0x03ff) << 10 + c2 & 0x03ff) + 0x10000;
        }
      }
    }
    return void 0;
  };
}

if (String.prototype.offsetByCodePoints === void 0) {
  String.prototype.offsetByCodePoints = function (this: string, index: number, count: number): number {
    if (count > 0) {
      const size = this.length;
      while (count > 0 && index < size) {
        const c1 = this.charCodeAt(index);
        if (c1 <= 0xd7ff || c1 >= 0xe000) { // U+0000..U+D7FF | U+E000..U+FFFF
          index += 1;
        } else if (c1 <= 0xdbff && index + 1 < size) {
          const c2 = this.charCodeAt(index + 1);
          if (c2 >= 0xdc00 && c2 <= 0xdfff) { // U+10000..U+10FFFF
            index += 2;
          } else {
            index += 1;
          }
        } else {
          index += 1;
        }
        count -= 1;
      }
    } else if (count < 0) {
      while (count < 0 && index > 0) {
        const c2 = this.charCodeAt(index - 1);
        if (c2 <= 0xd7ff || c2 >= 0xe000) { // U+0000..U+D7FF | U+E000..U+FFFF
          index -= 1;
        } else if (c2 >= 0xdc00 && c2 <= 0xdfff && index - 1 > 0) {
          const c1 = this.charCodeAt(index - 2);
          if (c1 >= 0xd800 && c1 <= 0xdfff) { // U+10000..U+10FFFF
            index -= 2;
          } else {
            index -= 1;
          }
        } else {
          index -= 1;
        }
        count -= 1;
      }
    }
    return index;
  };
}
