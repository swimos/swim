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

import {Cursor} from "./Cursor";

/** @hidden */
export class CursorEmpty<T> extends Cursor<T> {
  isEmpty(): boolean {
    return true;
  }

  head(): T {
    throw new Error("empty");
  }

  step(): void {
    throw new Error("empty");
  }

  skip(count: number): void {
    // nop
  }

  hasNext(): boolean {
    return false;
  }

  nextIndex(): number {
    return 0;
  }

  next(): {value?: T, done: boolean} {
    return {done: true};
  }

  hasPrevious(): boolean {
    return false;
  }

  previousIndex(): number {
    return -1;
  }

  previous(): {value?: T, done: boolean} {
    return {done: true};
  }
}
