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

import {Cursor} from "@swim/util";

/** @hidden */
export abstract class NodeCursor<T, P> extends Cursor<T> {
  /** @hidden */
  declare readonly pages: ReadonlyArray<P>;
  /** @hidden */
  index: number;
  /** @hidden */
  childIndex: number;
  /** @hidden */
  childCursor: Cursor<T> | null;

  constructor(pages: ReadonlyArray<P>, index: number,
              childIndex: number, childCursor: Cursor<T> | null) {
    super();
    Object.defineProperty(this, "pages", {
      value: pages,
      enumerable: true,
    });
    this.index = index;
    this.childIndex = childIndex;
    this.childCursor = childCursor;
  }

  protected abstract pageSize(page: P): number;

  protected abstract pageCursor(page: P): Cursor<T>;

  protected abstract reversePageCursor(page: P): Cursor<T>;

  isEmpty(): boolean {
    do {
      if (this.childCursor !== null) {
        if (!this.childCursor.isEmpty()) {
          return false;
        } else {
          this.childCursor = null;
        }
      } else if (this.childIndex < this.pages.length) {
        this.childCursor = this.pageCursor(this.pages[this.childIndex]!);
        this.childIndex += 1;
      } else {
        this.childIndex = this.pages.length;
        return true;
      }
    } while (true);
  }

  head(): T {
    do {
      if (this.childCursor !== null) {
        if (!this.childCursor.isEmpty()) {
          return this.childCursor.head();
        } else {
          this.childCursor = null;
        }
      } else {
        if (this.childIndex < this.pages.length) {
          this.childCursor = this.pageCursor(this.pages[this.childIndex]!);
          this.childIndex += 1;
        } else {
          this.childIndex = this.pages.length;
          throw new Error("empty");
        }
      }
    } while (true);
  }

  step(): void {
    do {
      if (this.childCursor !== null) {
        if (!this.childCursor.isEmpty()) {
          this.index += 1;
          return;
        } else {
          this.childCursor = null;
        }
      } else {
        if (this.childIndex < this.pages.length) {
          this.childCursor = this.pageCursor(this.pages[this.childIndex]!);
          this.childIndex += 1;
        } else {
          this.childIndex = this.pages.length;
          throw new Error("empty");
        }
      }
    } while (true);
  }

  skip(count: number): void {
    while (count > 0) {
      if (this.childCursor !== null) {
        if (this.childCursor.hasNext()) {
          this.index += 1;
          count -= 1;
          this.childCursor.next();
        } else {
          this.childCursor = null;
        }
      } else if (this.childIndex < this.pages.length) {
        const page = this.pages[this.childIndex]!;
        const pageSize = this.pageSize(page);
        this.childIndex += 1;
        if (pageSize < count) {
          this.childCursor = this.pageCursor(page);
          if (count > 0) {
            this.index += count;
            this.childCursor!.skip(count);
            count = 0;
          }
          break;
        } else {
          this.index += pageSize;
          count -= pageSize;
        }
      } else {
        break;
      }
    }
  }

  hasNext(): boolean {
    do {
      if (this.childCursor !== null) {
        if (this.childCursor.hasNext()) {
          return true;
        } else {
          this.childCursor = null;
        }
      } else if (this.childIndex < this.pages.length) {
        this.childCursor = this.pageCursor(this.pages[this.childIndex]!);
        this.childIndex += 1;
      } else {
        this.childIndex = this.pages.length;
        return false;
      }
    } while (true);
  }

  nextIndex(): number {
    return this.index;
  }

  next(): {value?: T, done: boolean} {
    do {
      if (this.childCursor !== null) {
        if (this.childCursor.hasNext()) {
          this.index += 1;
          return this.childCursor.next();
        } else {
          this.childCursor = null;
        }
      } else {
        if (this.childIndex < this.pages.length) {
          this.childCursor = this.pageCursor(this.pages[this.childIndex]!);
          this.childIndex += 1;
        } else {
          this.childIndex = this.pages.length;
          return {done: true};
        }
      }
    } while (true);
  }

  hasPrevious(): boolean {
    do {
      if (this.childCursor !== null) {
        if (this.childCursor.hasPrevious()) {
          return true;
        } else {
          this.childCursor = null;
        }
      } else if (this.childIndex > 0) {
        this.childCursor = this.reversePageCursor(this.pages[this.childIndex - 1]!);
        this.childIndex -= 1;
      } else {
        this.childIndex = 0;
        return false;
      }
    } while (true);
  }

  previousIndex(): number {
    return this.index - 1;
  }

  previous(): {value?: T, done: boolean} {
    do {
      if (this.childCursor !== null) {
        if (this.childCursor.hasPrevious()) {
          this.index -= 1;
          return this.childCursor.previous();
        } else {
          this.childCursor = null;
        }
      } else if (this.childIndex > 0) {
        this.childCursor = this.reversePageCursor(this.pages[this.childIndex - 1]!);
        this.childIndex -= 1;
      } else {
        this.childIndex = 0;
        return {done: true};
      }
    } while (true);
  }

  set(newValue: T): void {
    this.childCursor!.set(newValue);
  }

  delete(): void {
    this.childCursor!.delete();
  }
}
