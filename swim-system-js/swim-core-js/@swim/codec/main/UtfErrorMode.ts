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

import {HashCode, Murmur3} from "@swim/util";
import {Output} from "./Output";
import {Format} from "./Format";
import {Debug} from "./Debug";

/**
 * Unicode transformation format error handling mode.
 */
export abstract class UtfErrorMode implements HashCode, Debug {
  /**
   * Returns {@code true} if a Unicode decoding should abort with an error when
   * an invalid code unit sequence is encountered.
   */
  isFatal(): boolean {
    return false;
  }

  /**
   * Returns {@code true} if a Unicode decoding should substitute invalid code
   * unit sequences with a replacement character.
   */
  isReplacement(): boolean {
    return false;
  }

  /**
   * Returns the Unicode code point of the replacement character to substitute
   * for invalid code unit sequences.  Defaults to {@code U+FFFD}.
   */
  replacementChar(): number {
    return 0xfffd;
  }

  /**
   * Returns {@code true} if Unicode decoding should abort with an error when
   * a {@code NUL} byte is encountered.
   */
  abstract isNonZero(): boolean;

  /**
   * Returns a {@code UtfErrorMode} that, if {@code isNonZero} is {@code true},
   * aborts when Unicode decoding encounters a {@code NUL} byte.
   */
  abstract isNonZero(isNonZero: boolean): UtfErrorMode;

  abstract equals(that: unknown): boolean;

  abstract hashCode(): number;

  abstract debug(output: Output): void;

  toString(): string {
    return Format.debug(this);
  }

  private static _fatal?: UtfErrorMode;
  private static _fatalNonZero?: UtfErrorMode;
  private static _replacement?: UtfErrorMode;
  private static _replacementNonZero?: UtfErrorMode;

  /**
   * Returns a {@code UtfErrorMode} that aborts Unicode decoding with an error
   * when invalid code unit sequences are encountered.
   */
  static fatal(): UtfErrorMode {
    if (!UtfErrorMode._fatal) {
      UtfErrorMode._fatal = new UtfFatalErrorMode(false);
    }
    return UtfErrorMode._fatal;
  }

  /**
   * Returns a {@code UtfErrorMode} that aborts Unicode decoding with an error
   * when invalid code unit sequences, and {@code NUL} bytes, are encountered.
   */
  static fatalNonZero(): UtfErrorMode {
    if (!UtfErrorMode._fatalNonZero) {
      UtfErrorMode._fatalNonZero = new UtfFatalErrorMode(true);
    }
    return UtfErrorMode._fatalNonZero;
  }

  /**
   * Returns a {@code UtfErrorMode} that substitutes invalid code unit
   * sequences with the replacement character ({@code U+FFFD}).
   */
  static replacement(): UtfErrorMode;

  /**
   * Returns a {@code UtfErrorMode} that substitutes invalid code unit
   * sequences with the given {@code replacementChar}.
   */
  static replacement(replacementChar: number): UtfErrorMode;

  static replacement(replacementChar?: number): UtfErrorMode {
    if (replacementChar === void 0 || replacementChar === 0xfffd) {
      if (!UtfErrorMode._replacement) {
        UtfErrorMode._replacement = new UtfReplacementErrorMode(0xfffd, false);
      }
      return UtfErrorMode._replacement;
    } else {
      return new UtfReplacementErrorMode(replacementChar, false);
    }
  }

  /**
   * Returns a {@code UtfErrorMode} that substitutes invalid code unit
   * sequences with the replacement character ({@code U+FFFD}), and aborts
   * decoding with an error when {@code NUL} bytes are encountered.
   */
  static replacementNonZero(): UtfErrorMode;

  /**
   * Returns a {@code UtfErrorMode} that substitutes invalid code unit
   * sequences with the given {@code replacementChar}, and aborts decoding
   * with an error when {@code NUL} bytes are encountered.
   */
  static replacementNonZero(replacementChar: number): UtfErrorMode;

  static replacementNonZero(replacementChar?: number): UtfErrorMode {
    if (replacementChar === void 0 || replacementChar === 0xfffd) {
      if (!UtfErrorMode._replacementNonZero) {
        UtfErrorMode._replacementNonZero = new UtfReplacementErrorMode(0xfffd, true);
      }
      return UtfErrorMode._replacementNonZero;
    } else {
      return new UtfReplacementErrorMode(replacementChar, true);
    }
  }
}

/** @hidden */
class UtfFatalErrorMode extends UtfErrorMode {
  /** @hidden */
  private readonly _isNonZero: boolean;

  constructor(isNonZero: boolean) {
    super();
    this._isNonZero = isNonZero;
  }

  isFatal(): boolean {
    return true;
  }

  isNonZero(): boolean;
  isNonZero(isNonZero: boolean): UtfErrorMode;
  isNonZero(isNonZero?: boolean): boolean | UtfErrorMode {
    if (isNonZero === void 0) {
      return this._isNonZero;
    } else if (isNonZero) {
      return UtfErrorMode.fatalNonZero();
    } else {
      return UtfErrorMode.fatal();
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof UtfFatalErrorMode) {
      return this._isNonZero === that._isNonZero;
    }
    return false;
  }

  hashCode(): number {
    if (UtfFatalErrorMode._hashSeed === void 0) {
      UtfFatalErrorMode._hashSeed = Murmur3.seed(UtfFatalErrorMode);
    }
    return Murmur3.mash(Murmur3.mix(UtfFatalErrorMode._hashSeed,
        Murmur3.hash(this._isNonZero)));
  }

  debug(output: Output): void {
    output = output.write("UtfErrorMode").write(46/*'.'*/)
        .write(this.isNonZero ? "fatalNonZero" : "fatal")
        .write(40/*'('*/).write(41/*')'*/);
  }

  private static _hashSeed?: number;
}

/** @hidden */
class UtfReplacementErrorMode extends UtfErrorMode {
  private readonly _replacementChar: number;
  private readonly _isNonZero: boolean;

  /** @hidden */
  constructor(replacementChar: number, isNonZero: boolean) {
    super();
    this._replacementChar = replacementChar;
    this._isNonZero = isNonZero;
  }

  isReplacement(): boolean {
    return true;
  }

  replacementChar(): number {
    return this._replacementChar;
  }

  isNonZero(): boolean;
  isNonZero(isNonZero: boolean): UtfErrorMode;
  isNonZero(isNonZero?: boolean): boolean | UtfErrorMode {
    if (isNonZero === void 0) {
      return this._isNonZero;
    } else if (this._replacementChar === 0xfffd) {
      if (isNonZero) {
        return UtfErrorMode.replacementNonZero();
      } else {
        return UtfErrorMode.replacement();
      }
    } else {
      return new UtfReplacementErrorMode(this._replacementChar, isNonZero);
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof UtfReplacementErrorMode) {
      return this.replacementChar === that.replacementChar
          && this.isNonZero === that.isNonZero;
    }
    return false;
  }

  hashCode(): number {
    if (UtfReplacementErrorMode._hashSeed === void 0) {
      UtfReplacementErrorMode._hashSeed = Murmur3.seed(UtfReplacementErrorMode);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(UtfReplacementErrorMode._hashSeed,
        this._replacementChar), Murmur3.hash(this._isNonZero)));
  }

  debug(output: Output): void {
    output = output.write("UtfErrorMode").write(46/*'.'*/)
        .write(this._isNonZero ? "replacementNonZero" : "replacement")
        .write(40/*'('*/);
    if (this._replacementChar !== 0xfffd) {
      Format.debugChar(this._replacementChar, output);
    }
    output = output.write(41/*')'*/);
  }

  private static _hashSeed?: number;
}
