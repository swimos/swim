// Copyright 2015-2022 Swim.inc
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

import {Strings} from "@swim/util";
import type {Output} from "../output/Output";
import {Unicode} from "./Unicode";
import type {UtfErrorMode} from "./UtfErrorMode";
import {Utf8DecodedOutput} from "./Utf8DecodedOutput";
import {Utf8EncodedOutput} from "./Utf8EncodedOutput";

/**
 * UTF-8 [[Input]]/[[Output]] factory.
 * @public
 */
export const Utf8 = (function () {
  const Utf8 = {} as {
    /**
     * Returns the number of bytes in the UTF-8 encoding of the Unicode code
     * point `c`, handling invalid code unit sequences according to the
     * `errorMode` policy. Returns the size of the
     * [[UtfErrorMode.replacementChar]] for surrogates and invalid code points,
     * if [[UtfErrorMode.isReplacement]] is `true`; otherwise returns `0` for
     * surrogates and invalid code points. Uses the two byte modified UTF-8
     * encoding of the NUL character (`U+0000`), if [[UtfErrorMode.isNonZero]]
     * is `true`.
     */
    sizeOf(c: number | undefined, errorMode?: UtfErrorMode): number;

    /**
     * Returns the number of bytes in the UTF-8 encoding of the Unicode code
     * point `c`; returns the size of the Unicode replacement character (`U+FFFD`)
     * for surrogates and invalid code points.
     */
    sizeOf(c: number | undefined): number;

    /**
     * Returns the number of bytes in the UTF-8 encoding the given `string`,
     * handling invalid code unit sequences according to the `errorMode` policy.
     */
    sizeOf(string: string, errorMode?: UtfErrorMode): number;

    /**
     * Returns the number of bytes in the UTF-8 encoding the given `string`,
     * assuming the Unicode replacement character (`U+FFFD`) replaces unpaired
     * surrogates and invalid code points.
     */
    sizeOf(string: string): number;

    /**
     * Returns a new `Output` that accepts UTF-8 code unit sequences, and writes
     * writes decoded Unicode code points to the composed `output`, handling
     * invalid code unit sequences according to the `errorMode` policy.
     */
    decodedOutput<T>(output: Output<T>, errorMode?: UtfErrorMode): Output<T>;

    /**
     * Returns a new `Output` that accepts Unicode code points, and writes
     * encoded UTF-8 code unit sequences to the composed `output`, handling
     * invalid code unit sequences according to the `errorMode` policy.
     */
    encodedOutput<T>(output: Output<T>, errorMode?: UtfErrorMode): Output<T>;

    /**
     * Returns a new `Output` that accepts UTF-8 code unit sequences, and writes
     * decoded Unicode code points to a growable `string`, handling invalid code
     * unit sequences according to the [[UtfErrorMode.fatal]] policy. The
     * returned `Output` accepts an unbounded number of UTF-8 code units,
     * remaining permanently in the _cont_ state, and [[Output.bind binds]] a
     * `string` containing all decoded code points.
     */
    decodedString(): Output<string>;
  };

  Utf8.sizeOf = function (u: string | number | undefined, errorMode?: UtfErrorMode): number {
    if (typeof u === "number" || u === void 0) {
      if (typeof u === "number") {
        if (u === 0x0000 && errorMode !== void 0 && errorMode.isNonZero()) { // Modified UTF-8
          return 2; // U+0000 encoded as 0xC0, 0x80
        } else if (u >= 0x0000 && u <= 0x007F) { // U+0000..U+007F
          return 1;
        } else if (u >= 0x0080 && u <= 0x07FF) { // U+0080..U+07FF
          return 2;
        } else if (u >= 0x0800 && u <= 0xFFFF || // U+0800..U+D7FF
                   u >= 0xE000 && u <= 0xFFFF) { // U+E000..U+FFFF
          return 3;
        } else if (u >= 0x10000 && u <= 0x10FFFF) { // U+10000..U+10FFFF
          return 4;
        }
      }
      // surrogate or invalid code point
      if (errorMode === void 0) {
        return 3;
      } else if (errorMode.isReplacement()) {
        return Utf8.sizeOf(errorMode.replacementChar);
      } else {
        return 0;
      }
    } else if (typeof u === "string") {
      let size = 0;
      for (let i = 0, n = u.length; i < n; i = Strings.offsetByCodePoints(u, i, 1)) {
        size += Utf8.sizeOf(u.charCodeAt(i), errorMode);
      }
      return size;
    } else {
      throw new TypeError("" + u);
    }
  };

  Utf8.decodedOutput = function <T>(output: Output<T>, errorMode?: UtfErrorMode): Output<T> {
    return Utf8DecodedOutput.create(output, errorMode);
  };

  Utf8.encodedOutput = function <T>(output: Output<T>, errorMode?: UtfErrorMode): Output<T> {
    return Utf8EncodedOutput.create(output, errorMode);
  };

  Utf8.decodedString = function (): Output<string> {
    return Utf8.decodedOutput(Unicode.stringOutput());
  };

  return Utf8;
})();
