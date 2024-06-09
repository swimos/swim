// Copyright 2015-2024 Nstream, inc.
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

/**
 * Endianness of multi-byte words.
 * @public
 */
export type ByteOrder = "BE" | "LE";

/** @public */
export const ByteOrder = {
  /**
   * The `ByteOrder` where the most significant byte comes first.
   */
  get BigEndian(): ByteOrder {
    return "BE";
  },

  /**
   * The `ByteOrder` where the least significant byte comes first.
   */
  get LittleEndian(): ByteOrder {
    return "LE";
  },

  /**
   * Memoized `NativeOrder`.
   * @internal
   */
  NativeEndian: void 0 as ByteOrder | undefined,

  /**
   * The `ByteOrder` of the host machine.
   */
  get NativeOrder(): ByteOrder {
    if (this.NativeEndian === void 0) {
      const bom = new ArrayBuffer(2);
      new Uint16Array(bom)[0] = 0xfeff;
      const b = new Uint8Array(bom);
      if (b[0] === 0xfe && b[1] === 0xff) {
        this.NativeEndian = this.BigEndian;
      } else if (b[0] === 0xff && b[1] === 0xfe) {
        this.NativeEndian = this.LittleEndian;
      } else {
        throw new Error();
      }
    }
    return this.NativeEndian;
  }
};
