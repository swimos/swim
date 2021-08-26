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

import {Lazy} from "../lang/Lazy";
import type {Iterator} from "./Iterator";
import {CursorEmpty} from "../"; // forward import
import {CursorUnary} from "../"; // forward import
import {CursorArray} from "../"; // forward import

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

  @Lazy
  static empty<T>(): Cursor<T> {
    return new CursorEmpty();
  }

  static unary<T>(value: T): Cursor<T> {
    return new CursorUnary<T>(value);
  }

  static array<T>(array: ReadonlyArray<T>, index?: number, limit?: number): Cursor<T> {
    if (index === void 0) {
      index = 0;
    }
    if (limit === void 0) {
      limit = array.length;
    }
    return new CursorArray<T>(array, index, limit);
  }
}
