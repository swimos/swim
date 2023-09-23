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

import {ByteOrder} from "./ByteOrder";
import {Strings} from "./"; // forward import

/**
 * 32-bit [MurmurHash](https://en.wikipedia.org/wiki/MurmurHash) algorithm,
 * version 3.
 * @public
 */
export const Murmur3 = {
  /**
   * Mixes a new hash `value` into the accumulated hash `code`,
   * and returns the accumulated hash value.
   */
  mix(code: number, value: number): number {
    value = ((value & 0xffff) * 0xcc9e2d51) + (((value >>> 16) * 0xcc9e2d51 & 0xffff) << 16) & 0xffffffff;
    value = this.rotl(value, 15);
    value = ((value & 0xffff) * 0x1b873593) + (((value >>> 16) * 0x1b873593 & 0xffff) << 16) & 0xffffffff;
    code ^= value;
    code = this.rotl(code, 13);
    code = ((code & 0xffff) * 5) + (((code >>> 16) * 5 & 0xffff) << 16) & 0xffffffff;
    code = ((code & 0xffff) + 0x6b64) + (((code >>> 16) + 0xe654 & 0xffff) << 16);
    return code;
  },

  /**
   * Mixes each consecutive 4-byte word of `array` into `code`,
   * and returns the accumulated hash value.
   */
  mixUint8Array(code: number, array: Uint8Array): number {
    if (ByteOrder.NativeOrder === ByteOrder.BigEndian) {
      return this.mixUint8ArrayBE(code, array);
    } else if (ByteOrder.NativeOrder === ByteOrder.LittleEndian) {
      return this.mixUInt8ArrayLE(code, array);
    }
    throw new Error();
  },

  /** @internal */
  mixUint8ArrayBE(code: number, array: Uint8Array): number {
    let offset = 0;
    const limit = array.length;
    while (offset + 3 < limit) {
      const word = (array[offset    ]! & 0xff) << 24 | (array[offset + 1]! & 0xff) << 16
                 | (array[offset + 2]! & 0xff) <<  8 |  array[offset + 3]! & 0xff;
      code = this.mix(code, word);
      offset += 4;
    }
    if (offset < limit) {
      let word = (array[offset]! & 0xff) << 24;
      if (offset + 1 < limit) {
        word |= (array[offset + 1]! & 0xff) << 16;
        if (offset + 2 < limit) {
          word |= (array[offset + 2]! & 0xff) << 8;
          //assert offset + 3 === limit;
        }
      }
      word = ((word & 0xffff) * 0xcc9e2d51) + (((word >>> 16) * 0xcc9e2d51 & 0xffff) << 16) & 0xffffffff;
      word = this.rotl(word, 15);
      word = ((word & 0xffff) * 0x1b873593) + (((word >>> 16) * 0x1b873593 & 0xffff) << 16) & 0xffffffff;
      code ^= word;
    }
    return code ^ limit;
  },

  /** @internal */
  mixUInt8ArrayLE(code: number, array: Uint8Array): number {
    let offset = 0;
    const limit = array.length;
    while (offset + 3 < limit) {
      const word =  array[offset    ]! & 0xff        | (array[offset + 1]! & 0xff) <<  8
                 | (array[offset + 2]! & 0xff) << 16 | (array[offset + 3]! & 0xff) << 24;
      code = this.mix(code, word);
      offset += 4;
    }
    if (offset < limit) {
      let word = array[offset]! & 0xff;
      if (offset + 1 < limit) {
        word |= (array[offset + 1]! & 0xff) << 8;
        if (offset + 2 < limit) {
          word |= (array[offset + 2]! & 0xff) << 16;
          //assert offset + 3 === limit;
        }
      }
      word = ((word & 0xffff) * 0xcc9e2d51) + (((word >>> 16) * 0xcc9e2d51 & 0xffff) << 16) & 0xffffffff;
      word = this.rotl(word, 15);
      word = ((word & 0xffff) * 0x1b873593) + (((word >>> 16) * 0x1b873593 & 0xffff) << 16) & 0xffffffff;
      code ^= word;
    }
    return code ^ limit;
  },

  /**
   * Mixes each consecutive 4-byte word of the UTF-8 encoding of `string`
   * into `code`, and returns the accumulated hash value.
   */
  mixString(code: number, string: string): number {
    if (ByteOrder.NativeOrder === ByteOrder.BigEndian) {
      return this.mixStringBE(code, string);
    } else if (ByteOrder.NativeOrder === ByteOrder.LittleEndian) {
      return this.mixStringLE(code, string);
    }
    throw new Error();
  },

  /** @internal */
  mixStringBE(code: number, string: string): number {
    let word = 0;
    let k = 32;
    let i = 0;
    const n = string.length;
    let utf8Length = 0;
    while (i < n) {
      let c = string.codePointAt(i);
      if (c === void 0) {
        c = string.charCodeAt(i);
      }
      if (c >= 0 && c <= 0x7f) { // U+0000..U+007F
        k -= 8;
        word |= c << k;
        if (k === 0) { code = this.mix(code, word); word = 0; k = 32; }
        utf8Length += 1;
      } else if (c >= 0x80 && c <= 0x7ff) { // U+0080..U+07FF
        k -= 8;
        word |= (0xc0 | (c >>> 6)) << k;
        if (k === 0) { code = this.mix(code, word); word = 0; k = 32; }
        k -= 8;
        word |= (0x80 | (c & 0x3f)) << k;
        if (k === 0) { code = this.mix(code, word); word = 0; k = 32; }
        utf8Length += 2;
      } else if (c >= 0x0800 && c <= 0xffff || // U+0800..U+D7FF
                 c >= 0xe000 && c <= 0xffff) { // U+E000..U+FFFF
        k -= 8;
        word |= (0xe0 | (c  >>> 12)) << k;
        if (k === 0) { code = this.mix(code, word); word = 0; k = 32; }
        k -= 8;
        word |= (0x80 | ((c >>>  6) & 0x3f)) << k;
        if (k === 0) { code = this.mix(code, word); word = 0; k = 32; }
        k -= 8;
        word |= (0x80 | (c & 0x3f)) << k;
        if (k === 0) { code = this.mix(code, word); word = 0; k = 32; }
        utf8Length += 3;
      } else if (c >= 0x10000 && c <= 0x10ffff) { // U+10000..U+10FFFF
        k -= 8;
        word |= (0xf0 | (c  >>> 18)) << k;
        if (k === 0) { code = this.mix(code, word); word = 0; k = 32; }
        k -= 8;
        word |= (0x80 | ((c >>> 12) & 0x3f)) << k;
        if (k === 0) { code = this.mix(code, word); word = 0; k = 32; }
        k -= 8;
        word |= (0x80 | ((c >>>  6) & 0x3f)) << k;
        if (k === 0) { code = this.mix(code, word); word = 0; k = 32; }
        k -= 8;
        word |= (0x80 | (c & 0x3f)) << k;
        if (k === 0) { code = this.mix(code, word); word = 0; k = 32; }
        utf8Length += 4;
      } else { // surrogate or invalid code point
        k -= 8;
        word |= 0xef << k;
        if (k === 0) { code = this.mix(code, word); word = 0; k = 32; }
        k -= 8;
        word |= 0xbf << k;
        if (k === 0) { code = this.mix(code, word); word = 0; k = 32; }
        k -= 8;
        word |= 0xbd << k;
        if (k === 0) { code = this.mix(code, word); word = 0; k = 32; }
        utf8Length += 3;
      }
      i = Strings.offsetByCodePoints(string, i, 1);
    }
    if (k !== 32) {
      word = ((word & 0xffff) * 0xcc9e2d51) + (((word >>> 16) * 0xcc9e2d51 & 0xffff) << 16) & 0xffffffff;
      word = this.rotl(word, 15);
      word = ((word & 0xffff) * 0x1b873593) + (((word >>> 16) * 0x1b873593 & 0xffff) << 16) & 0xffffffff;
      code ^= word;
    }
    return code ^ utf8Length;
  },

  /** @internal */
  mixStringLE(code: number, string: string): number {
    let word = 0;
    let k = 0;
    let i = 0;
    const n = string.length;
    let utf8Length = 0;
    while (i < n) {
      let c = string.codePointAt(i);
      if (c === void 0) {
        c = string.charCodeAt(i);
      }
      if (c >= 0 && c <= 0x7f) { // U+0000..U+007F
        word |= c << k;
        k += 8;
        if (k === 32) { code = this.mix(code, word); word = 0; k = 0; }
        utf8Length += 1;
      } else if (c >= 0x80 && c <= 0x7ff) { // U+0080..U+07FF
        word |= (0xc0 | (c >>> 6)) << k;
        k += 8;
        if (k === 32) { code = this.mix(code, word); word = 0; k = 0; }
        word |= (0x80 | (c & 0x3f)) << k;
        k += 8;
        if (k === 32) { code = this.mix(code, word); word = 0; k = 0; }
        utf8Length += 2;
      } else if (c >= 0x0800 && c <= 0xffff || // U+0800..U+D7FF
                 c >= 0xe000 && c <= 0xffff) { // U+E000..U+FFFF
        word |= (0xe0 | (c  >>> 12)) << k;
        k += 8;
        if (k === 32) { code = this.mix(code, word); word = 0; k = 0; }
        word |= (0x80 | ((c >>>  6) & 0x3f)) << k;
        k += 8;
        if (k === 32) { code = this.mix(code, word); word = 0; k = 0; }
        word |= (0x80 | (c & 0x3f)) << k;
        k += 8;
        if (k === 32) { code = this.mix(code, word); word = 0; k = 0; }
        utf8Length += 3;
      } else if (c >= 0x10000 && c <= 0x10ffff) { // U+10000..U+10FFFF
        word |= (0xf0 | (c  >>> 18)) << k;
        k += 8;
        if (k === 32) { code = this.mix(code, word); word = 0; k = 0; }
        word |= (0x80 | ((c >>> 12) & 0x3f)) << k;
        k += 8;
        if (k === 32) { code = this.mix(code, word); word = 0; k = 0; }
        word |= (0x80 | ((c >>>  6) & 0x3f)) << k;
        k += 8;
        if (k === 32) { code = this.mix(code, word); word = 0; k = 0; }
        word |= (0x80 | (c & 0x3f)) << k;
        k += 8;
        if (k === 32) { code = this.mix(code, word); word = 0; k = 0; }
        utf8Length += 4;
      } else { // surrogate or invalid code point
        word |= 0xef << k;
        k += 8;
        if (k === 32) { code = this.mix(code, word); word = 0; k = 0; }
        word |= 0xbf << k;
        k += 8;
        if (k === 32) { code = this.mix(code, word); word = 0; k = 0; }
        word |= 0xbd << k;
        k += 8;
        if (k === 32) { code = this.mix(code, word); word = 0; k = 0; }
        utf8Length += 3;
      }
      i = Strings.offsetByCodePoints(string, i, 1);
    }
    if (k !== 32) {
      word = ((word & 0xffff) * 0xcc9e2d51) + (((word >>> 16) * 0xcc9e2d51 & 0xffff) << 16) & 0xffffffff;
      word = this.rotl(word, 15);
      word = ((word & 0xffff) * 0x1b873593) + (((word >>> 16) * 0x1b873593 & 0xffff) << 16) & 0xffffffff;
      code ^= word;
    }
    return code ^ utf8Length;
  },

  /**
   * Finalizes the given hash `code`.
   */
  mash(code: number): number {
    code ^= code >>> 16;
    code = ((code & 0xffff) * 0x85ebca6b) + (((code >>> 16) * 0x85ebca6b & 0xffff) << 16) & 0xffffffff;
    code ^= code >>> 13;
    code = ((code & 0xffff) * 0xc2b2ae35) + (((code >>> 16) * 0xc2b2ae35 & 0xffff) << 16) & 0xffffffff;
    code ^= code >>> 16;
    return code >>> 0;
  },

  /** @internal */
  rotl(value: number, distance: number): number {
    return (value << distance) | (value >>> (32 - distance));
  },
};
