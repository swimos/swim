// Copyright 2015-2019 SWIM.AI inc.
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

/** @hidden */
const crypto = (
  typeof window !== "undefined" &&
  (window.crypto || (window as any).msCrypto)
) as RandomSource | undefined;

/** @hidden */
function fillBytesCrypto(typedArray: Int8Array | Uint8Array
                                   | Int16Array | Uint16Array
                                   | Int32Array | Uint32Array): void {
  crypto!.getRandomValues(typedArray);
}

/** @hidden */
function fillBytesMath(typedArray: Int8Array | Uint8Array
                                 | Int16Array | Uint16Array
                                 | Int32Array | Uint32Array): void {
  if (typedArray instanceof Int8Array) {
    for (let i = 0; i < typedArray.length; i += 1) {
      typedArray[i] = 128 - Math.round(Math.random() * 256);
    }
  } else if (typedArray instanceof Uint8Array) {
    for (let i = 0; i < typedArray.length; i += 1) {
      typedArray[i] = Math.round(Math.random() * 256);
    }
  } else if (typedArray instanceof Int16Array) {
    for (let i = 0; i < typedArray.length; i += 1) {
      typedArray[i] = 32768 - Math.round(Math.random() * 65536);
    }
  } else if (typedArray instanceof Uint16Array) {
    for (let i = 0; i < typedArray.length; i += 1) {
      typedArray[i] = Math.round(Math.random() * 65536);
    }
  } else if (typedArray instanceof Int32Array) {
    for (let i = 0; i < typedArray.length; i += 1) {
      typedArray[i] = 2147483648 - Math.round(Math.random() * 4294967296);
    }
  } else if (typedArray instanceof Uint32Array) {
    for (let i = 0; i < typedArray.length; i += 1) {
      typedArray[i] = Math.round(Math.random() * 4294967296);
    }
  } else {
    throw new TypeError("" + typedArray);
  }
}

/** @hidden */
export class Random {
  private constructor() {
  }

  static fillBytes = crypto ? fillBytesCrypto : fillBytesMath;
}
