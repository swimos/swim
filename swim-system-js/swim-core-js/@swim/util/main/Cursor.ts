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

import {Iterator} from "./Iterator";
import {CursorEmpty} from "./CursorEmpty";
import {CursorUnary} from "./CursorUnary";
import {CursorArray} from "./CursorArray";

export abstract class Cursor<T> implements Iterator<T> {
  abstract isEmpty(): boolean;

  abstract head(): T;

  abstract step(): void;

  abstract skip(count: number): void;

  abstract hasNext(): boolean;

  abstract nextIndex(): number;

  abstract next(): {value?: T, done: boolean};

  abstract hasPrevious(): boolean;

  abstract previousIndex(): number;

  abstract previous(): {value?: T, done: boolean};

  set(newValue: T): void {
    throw new Error("immutable");
  }

  delete(): void {
    throw new Error("immutable");
  }

  private static _empty?: Cursor<any>;
  static empty<T>(): Cursor<T> {
    if (Cursor._empty === void 0) {
      Cursor._empty = new Cursor.Empty();
    }
    return Cursor._empty;
  }

  static unary<T>(value: T): Cursor<T> {
    return new Cursor.Unary<T>(value);
  }

  static array<T>(array: ReadonlyArray<T>, index: number = 0, limit: number = array.length): Cursor<T> {
    return new Cursor.Array<T>(array, index, limit);
  }

  // Forward type declarations
  /** @hidden */
  static Empty: typeof CursorEmpty; // defined by CursorEmpty
  /** @hidden */
  static Unary: typeof CursorUnary; // defined by CursorUnary
  /** @hidden */
  static Array: typeof CursorArray; // defined by CursorArray
}
