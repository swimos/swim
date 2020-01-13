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

/**
 * Endianness of multi-byte datums.
 */
export const enum ByteOrder {
  /**
   * Most significant byte first.
   */
  BigEndian = "BE",
  /**
   * Least significant byte first.
   */
  LittleEndian = "LE",
}

function nativeOrder(): ByteOrder {
  const bom = new ArrayBuffer(2);
  new Uint16Array(bom)[0] = 0xfeff;
  const b = new Uint8Array(bom);
  if (b[0] === 0xfe && b[1] === 0xff) {
    return ByteOrder.BigEndian;
  } else if (b[0] === 0xff && b[1] === 0xfe) {
    return ByteOrder.LittleEndian;
  } else {
    throw new Error();
  }
}

/**
 * `ByteOrder` of the host machine.
 */
export const NativeOrder: ByteOrder = nativeOrder();
