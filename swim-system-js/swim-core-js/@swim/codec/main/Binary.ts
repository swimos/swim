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

import {AnyOutputSettings, OutputSettings} from "./OutputSettings";
import {Output} from "./Output";
import {OutputBuffer} from "./OutputBuffer";
import {Uint8ArrayOutput} from "./Uint8ArrayOutput";
import {ByteOutputUint8Array} from "./ByteOutputUint8Array";

/**
 * Byte [[Input]]/[[Output]] factory.
 *
 * The `Binary.uint8ArrayOutput(...)}` function returns an `Output` that writes
 * bytes to a growable array, and [[Output.bind binds]] a `Uint8Array`
 * containing all written bytes.
 */
export class Binary {
  private constructor() {
    // nop
  }

  static outputBuffer(array: Uint8Array, offset: number = 0, length: number = array.length): OutputBuffer<Uint8Array> {
    return new Uint8ArrayOutput(array, offset, offset + length);
  }

  /**
   * Returns a new `Output` that appends bytes to a growable array,
   * pre-allocated with space for `initialCapacity` bytes, if `initialCapacity`
   * is defined, using the given `settings`, if `settings` is defined.  The
   * returned `Output` accepts an unbounded number of bytes, remaining
   * permanently in the _cont_ state, and can [[Output.bind bind]] a
   * `Uint8Array` with the current output state at any time.
   */
  static uint8ArrayOutput(initialCapacity?: number, settings?: AnyOutputSettings): Output<Uint8Array>;
  /**
   * Returns a new `Output` that appends bytes to a growable array, using the
   * given `settings`.  The returned `Output` accepts an unbounded number of
   * bytes, remaining permanently in the _cont_ state, and can [[Output.bind
   * bind]] a `Uint8Array` array with the current output state at any time.
   */
  static uint8ArrayOutput(settings: AnyOutputSettings): Output<Uint8Array>;
  static uint8ArrayOutput(initialCapacity?: number | AnyOutputSettings,
                          settings?: AnyOutputSettings): Output<Uint8Array> {
    if (settings === void 0 && typeof initialCapacity !== "number") {
      settings = initialCapacity;
      initialCapacity = void 0;
    } else if (typeof initialCapacity !== "number") {
      initialCapacity = void 0;
    }
    let array: Uint8Array | null;
    if (typeof initialCapacity === "number") {
      array = new Uint8Array(initialCapacity);
    } else {
      array = null;
    }
    settings = OutputSettings.fromAny(settings);
    return new ByteOutputUint8Array(array, 0, settings);
  }
}
