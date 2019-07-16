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

import {Cursor} from "@swim/util";

/** @hidden */
export abstract class NodeCursor<T, P> extends Cursor<T> {
  /** @hidden */
  readonly _pages: P[];
  /** @hidden */
  _index: number;
  /** @hidden */
  _pageIndex: number;
  /** @hidden */
  _pageCursor: Cursor<T> | undefined;

  constructor(pages: P[], index: number = 0, pageIndex: number = 0, pageCursor?: Cursor<T>) {
    super();
    this._pages = pages;
    this._index = index;
    this._pageIndex = pageIndex;
    this._pageCursor = pageCursor;
  }

  protected abstract pageSize(page: P): number;

  protected abstract pageCursor(page: P): Cursor<T>;

  protected abstract reversePageCursor(page: P): Cursor<T>;

  isEmpty(): boolean {
    do {
      if (this._pageCursor) {
        if (!this._pageCursor.isEmpty()) {
          return false;
        } else {
          this._pageCursor = void 0;
        }
      } else if (this._pageIndex < this._pages.length) {
        this._pageCursor = this.pageCursor(this._pages[this._pageIndex]);
        this._pageIndex += 1;
      } else {
        this._pageIndex = this._pages.length;
        return true;
      }
    } while (true);
  }

  head(): T {
    do {
      if (this._pageCursor) {
        if (!this._pageCursor.isEmpty()) {
          return this._pageCursor.head();
        } else {
          this._pageCursor = void 0;
        }
      } else {
        if (this._pageIndex < this._pages.length) {
          this._pageCursor = this.pageCursor(this._pages[this._pageIndex]);
          this._pageIndex += 1;
        } else {
          this._pageIndex = this._pages.length;
          throw new Error("empty");
        }
      }
    } while (true);
  }

  step(): void {
    do {
      if (this._pageCursor) {
        if (!this._pageCursor.isEmpty()) {
          this._index += 1;
          return;
        } else {
          this._pageCursor = void 0;
        }
      } else {
        if (this._pageIndex < this._pages.length) {
          this._pageCursor = this.pageCursor(this._pages[this._pageIndex]);
          this._pageIndex += 1;
        } else {
          this._pageIndex = this._pages.length;
          throw new Error("empty");
        }
      }
    } while (true);
  }

  skip(count: number): void {
    while (count > 0) {
      if (this._pageCursor) {
        if (this._pageCursor.hasNext()) {
          this._index += 1;
          count -= 1;
          this._pageCursor.next();
        } else {
          this._pageCursor = void 0;
        }
      } else if (this._pageIndex < this._pages.length) {
        const page = this._pages[this._pageIndex];
        const pageSize = this.pageSize(page);
        this._pageIndex += 1;
        if (pageSize < count) {
          this._pageCursor = this.pageCursor(page);
          if (count > 0) {
            this._index += count;
            this._pageCursor!.skip(count);
            count = 0;
          }
          break;
        } else {
          this._index += pageSize;
          count -= pageSize;
        }
      } else {
        break;
      }
    }
  }

  hasNext(): boolean {
    do {
      if (this._pageCursor) {
        if (this._pageCursor.hasNext()) {
          return true;
        } else {
          this._pageCursor = void 0;
        }
      } else if (this._pageIndex < this._pages.length) {
        this._pageCursor = this.pageCursor(this._pages[this._pageIndex]);
        this._pageIndex += 1;
      } else {
        this._pageIndex = this._pages.length;
        return false;
      }
    } while (true);
  }

  nextIndex(): number {
    return this._index;
  }

  next(): {value?: T, done: boolean} {
    do {
      if (this._pageCursor) {
        if (this._pageCursor.hasNext()) {
          this._index += 1;
          return this._pageCursor.next();
        } else {
          this._pageCursor = void 0;
        }
      } else {
        if (this._pageIndex < this._pages.length) {
          this._pageCursor = this.pageCursor(this._pages[this._pageIndex]);
          this._pageIndex += 1;
        } else {
          this._pageIndex = this._pages.length;
          return {done: true};
        }
      }
    } while (true);
  }

  hasPrevious(): boolean {
    do {
      if (this._pageCursor) {
        if (this._pageCursor.hasPrevious()) {
          return true;
        } else {
          this._pageCursor = void 0;
        }
      } else if (this._pageIndex > 0) {
        this._pageCursor = this.reversePageCursor(this._pages[this._pageIndex - 1]);
        this._pageIndex -= 1;
      } else {
        this._pageIndex = 0;
        return false;
      }
    } while (true);
  }

  previousIndex(): number {
    return this._index - 1;
  }

  previous(): {value?: T, done: boolean} {
    do {
      if (this._pageCursor) {
        if (this._pageCursor.hasPrevious()) {
          this._index -= 1;
          return this._pageCursor.previous();
        } else {
          this._pageCursor = void 0;
        }
      } else if (this._pageIndex > 0) {
        this._pageCursor = this.reversePageCursor(this._pages[this._pageIndex - 1]);
        this._pageIndex -= 1;
      } else {
        this._pageIndex = 0;
        return {done: true};
      }
    } while (true);
  }

  set(newValue: T): void {
    this._pageCursor!.set(newValue);
  }

  delete(): void {
    this._pageCursor!.delete();
  }
}
