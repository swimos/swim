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

import {Lazy, HashCode} from "@swim/util";
import type {Output} from "../output/Output";
import type {Debug} from "../format/Debug";
import {Format} from "../format/Format";
import {UtfErrorModeFatal} from "../"; // forward import
import {UtfErrorModeReplacement} from "../"; // forward import

/**
 * Unicode transformation format error handling mode.
 */
export abstract class UtfErrorMode implements HashCode, Debug {
  /**
   * Returns `true` if a Unicode decoding should abort with an error when an
   * invalid code unit sequence is encountered.
   */
  isFatal(): boolean {
    return false;
  }

  /**
   * Returns `true` if a Unicode decoding should substitute invalid code unit
   * sequences with a replacement character.
   */
  isReplacement(): boolean {
    return false;
  }

  /**
   * The Unicode code point of the replacement character used to substitute
   * for invalid code unit sequences.
   */
  abstract readonly replacementChar: number;

  /**
   * Returns `true` if Unicode decoding should abort with an error when a
   * `NUL` byte is encountered.
   */
  abstract isNonZero(): boolean;

  /**
   * Returns a `UtfErrorMode` that, if `isNonZero` is `true`, aborts when
   * Unicode decoding encounters a `NUL` byte.
   */
  abstract asNonZero(isNonZero: boolean): UtfErrorMode;

  abstract equals(that: unknown): boolean;

  abstract hashCode(): number;

  abstract debug(output: Output): void;

  toString(): string {
    return Format.debug(this);
  }

  /**
   * Returns a `UtfErrorMode` that aborts Unicode decoding with an error when
   * invalid code unit sequences are encountered.
   */
  @Lazy
  static fatal(): UtfErrorMode {
    return new UtfErrorModeFatal(false);
  }

  /**
   * Returns a `UtfErrorMode` that aborts Unicode decoding with an error when
   * invalid code unit sequences, and `NUL` bytes, are encountered.
   */
  @Lazy
  static fatalNonZero(): UtfErrorMode {
    return new UtfErrorModeFatal(true);
  }

  /**
   * Returns a `UtfErrorMode` that substitutes invalid code unit sequences
   * with the replacement character (`U+FFFD`).
   */
  @Lazy
  static replacement(): UtfErrorMode {
    return new UtfErrorModeReplacement(0xfffd, false);
  }

  /**
   * Returns a `UtfErrorMode` that substitutes invalid code unit sequences
   * with the replacement character (`U+FFFD`), and aborts decoding with an
   * error when `NUL` bytes are encountered.
   */
  @Lazy
  static replacementNonZero(): UtfErrorMode {
    return new UtfErrorModeReplacement(0xfffd, true);
  }
}
