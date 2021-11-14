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

/** @public */
export const Random = (function () {
  const Random = {} as {
    fillBytes(array: Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array): void;
  };

  if (typeof window !== "undefined" && window.crypto !== void 0) {
    Random.fillBytes = function (array: Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array): void {
      window.crypto.getRandomValues(array);
    };
  } else if (typeof window !== "undefined" && (window as any).msCrypto !== void 0) {
    Random.fillBytes = function (array: Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array): void {
      ((window as any).msCrypto as Crypto).getRandomValues(array);
    };
  } else {
    Random.fillBytes = function (array: Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array): void {
      if (array instanceof Int8Array) {
        for (let i = 0; i < array.length; i += 1) {
          array[i] = 128 - Math.round(Math.random() * 256);
        }
      } else if (array instanceof Uint8Array) {
        for (let i = 0; i < array.length; i += 1) {
          array[i] = Math.round(Math.random() * 256);
        }
      } else if (array instanceof Int16Array) {
        for (let i = 0; i < array.length; i += 1) {
          array[i] = 32768 - Math.round(Math.random() * 65536);
        }
      } else if (array instanceof Uint16Array) {
        for (let i = 0; i < array.length; i += 1) {
          array[i] = Math.round(Math.random() * 65536);
        }
      } else if (array instanceof Int32Array) {
        for (let i = 0; i < array.length; i += 1) {
          array[i] = 2147483648 - Math.round(Math.random() * 4294967296);
        }
      } else if (array instanceof Uint32Array) {
        for (let i = 0; i < array.length; i += 1) {
          array[i] = Math.round(Math.random() * 4294967296);
        }
      } else {
        throw new TypeError("" + array);
      }
    };
  }

  return Random;
})();
