// Copyright 2015-2021 Swim.inc
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
export const ByteOrder = (function () {
  const ByteOrder = {} as {
    /**
     * Most significant byte first.
     */
    readonly BigEndian: ByteOrder;

    /**
     * Least significant byte first.
     */
    readonly LittleEndian: ByteOrder;

    /**
     * `ByteOrder` of the host machine.
     */
    readonly NativeOrder: ByteOrder;
  };

  Object.defineProperty(ByteOrder, "BigEndian", {
    value: "BE",
    enumerable: true,
  });

  Object.defineProperty(ByteOrder, "LittleEndian", {
    value: "LE",
    enumerable: true,
  });

  Object.defineProperty(ByteOrder, "NativeOrder", {
    get(): ByteOrder {
      let nativeEndian: ByteOrder;
      const bom = new ArrayBuffer(2);
      new Uint16Array(bom)[0] = 0xfeff;
      const b = new Uint8Array(bom);
      if (b[0] === 0xfe && b[1] === 0xff) {
        nativeEndian = ByteOrder.BigEndian;
      } else if (b[0] === 0xff && b[1] === 0xfe) {
        nativeEndian = ByteOrder.LittleEndian;
      } else {
        throw new Error();
      }
      Object.defineProperty(ByteOrder, "NativeOrder", {
        value: nativeEndian,
        enumerable: true,
      });
      return nativeEndian;
    },
    configurable: true,
    enumerable: true,
  });

  return ByteOrder;
})();
