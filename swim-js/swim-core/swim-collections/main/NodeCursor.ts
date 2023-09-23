// Copyright 2015-2023 Nstream, inc.
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

/** @internal */
export abstract class NodeCursor<T, P> extends Cursor<T> {
  constructor(pages: readonly P[], index: number,
              childIndex: number, childCursor: Cursor<T> | null) {
    super();
    this.pages = pages;
    this.index = index;
    this.childIndex = childIndex;
    this.childCursor = childCursor;
  }

  /** @internal */
  readonly pages: readonly P[];

  /** @internal */
  index: number;

  /** @internal */
  childIndex: number;

  /** @internal */
  childCursor: Cursor<T> | null;

  protected abstract pageSize(page: P): number;

  protected abstract pageCursor(page: P): Cursor<T>;

  protected abstract reversePageCursor(page: P): Cursor<T>;

  override isEmpty(): boolean {
    do {
      if (this.childCursor !== null) {
        if (!this.childCursor.isEmpty()) {
          return false;
        }
        this.childCursor = null;
      } else if (this.childIndex < this.pages.length) {
        this.childCursor = this.pageCursor(this.pages[this.childIndex]!);
        this.childIndex += 1;
      } else {
        this.childIndex = this.pages.length;
        return true;
      }
    } while (true);
  }

  override head(): T {
    do {
      if (this.childCursor !== null) {
        if (!this.childCursor.isEmpty()) {
          return this.childCursor.head();
        }
        this.childCursor = null;
      } else if (this.childIndex < this.pages.length) {
        this.childCursor = this.pageCursor(this.pages[this.childIndex]!);
        this.childIndex += 1;
      } else {
        this.childIndex = this.pages.length;
        throw new Error("empty");
      }
    } while (true);
  }

  override step(): void {
    do {
      if (this.childCursor !== null) {
        if (!this.childCursor.isEmpty()) {
          this.index += 1;
          return;
        }
        this.childCursor = null;
      } else if (this.childIndex < this.pages.length) {
        this.childCursor = this.pageCursor(this.pages[this.childIndex]!);
        this.childIndex += 1;
      } else {
        this.childIndex = this.pages.length;
        throw new Error("empty");
      }
    } while (true);
  }

  override skip(count: number): void {
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
        }
        this.index += pageSize;
        count -= pageSize;
      } else {
        break;
      }
    }
  }

  override hasNext(): boolean {
    do {
      if (this.childCursor !== null) {
        if (this.childCursor.hasNext()) {
          return true;
        }
        this.childCursor = null;
      } else if (this.childIndex < this.pages.length) {
        this.childCursor = this.pageCursor(this.pages[this.childIndex]!);
        this.childIndex += 1;
      } else {
        this.childIndex = this.pages.length;
        return false;
      }
    } while (true);
  }

  override nextIndex(): number {
    return this.index;
  }

  override next(): IteratorResult<T> {
    do {
      if (this.childCursor !== null) {
        if (this.childCursor.hasNext()) {
          this.index += 1;
          return this.childCursor.next();
        }
        this.childCursor = null;
      } else if (this.childIndex < this.pages.length) {
        this.childCursor = this.pageCursor(this.pages[this.childIndex]!);
        this.childIndex += 1;
      } else {
        this.childIndex = this.pages.length;
        return {done: true, value: void 0};
      }
    } while (true);
  }

  override hasPrevious(): boolean {
    do {
      if (this.childCursor !== null) {
        if (this.childCursor.hasPrevious()) {
          return true;
        }
        this.childCursor = null;
      } else if (this.childIndex > 0) {
        this.childCursor = this.reversePageCursor(this.pages[this.childIndex - 1]!);
        this.childIndex -= 1;
      } else {
        this.childIndex = 0;
        return false;
      }
    } while (true);
  }

  override previousIndex(): number {
    return this.index - 1;
  }

  override previous(): IteratorResult<T> {
    do {
      if (this.childCursor !== null) {
        if (this.childCursor.hasPrevious()) {
          this.index -= 1;
          return this.childCursor.previous();
        }
        this.childCursor = null;
      } else if (this.childIndex > 0) {
        this.childCursor = this.reversePageCursor(this.pages[this.childIndex - 1]!);
        this.childIndex -= 1;
      } else {
        this.childIndex = 0;
        return {done: true, value: void 0};
      }
    } while (true);
  }

  override set(newValue: T): void {
    this.childCursor!.set(newValue);
  }

  override delete(): void {
    this.childCursor!.delete();
  }
}
