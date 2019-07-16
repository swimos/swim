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
import {STreeContext} from "./STreeContext";
import {STree} from "./STree";
import {STreePage} from "./STreePage";

/** @hidden */
export class STreeNode<V, I> extends STreePage<V, I> {
  readonly _pages: STreePage<V, I>[];
  readonly _knots: number[];
  readonly _size: number;

  constructor(pages: STreePage<V, I>[], knots?: number[], size?: number) {
    super();
    this._pages = pages;
    if (knots === void 0 || size === void 0) {
      knots = new Array<number>(pages.length - 1);
      size = 0;
      for (let i = 0, n  = knots.length; i < n; i += 1) {
        size += pages[i].size;
        knots[i] = size;
      }
      size += pages[knots.length].size;
    }
    this._knots = knots;
    this._size = size;
  }

  get arity(): number {
    return this._pages.length;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  get(index: number): V | undefined {
    let x = this.lookup(index);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    const i = x === 0 ? index : index - this._knots[x - 1];
    return this._pages[x].get(i);
  }

  getEntry(index: number): [I, V] | undefined {
    let x = this.lookup(index);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    const i = x === 0 ? index : index - this._knots[x - 1];
    return this._pages[x].getEntry(i);
  }

  updated(index: number, newValue: V, tree: STreeContext<V, I>): STreeNode<V, I> {
    let x = this.lookup(index);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    const i = x === 0 ? index : index - this._knots[x - 1];
    const oldPage = this._pages[x];
    const newPage = oldPage.updated(i, newValue, tree);
    if (oldPage !== newPage) {
      if (oldPage.size !== newPage.size && tree.pageShouldSplit(newPage)) {
        return this.updatedPageSplit(x, newPage, oldPage);
      } else {
        return this.updatedPage(x, newPage, oldPage);
      }
    } else {
      return this;
    }
  }

  private updatedPage(x: number, newPage: STreePage<V, I>, oldPage: STreePage<V, I>): STreeNode<V, I> {
    const oldPages = this._pages;
    const newPages = oldPages.slice(0);
    newPages[x] = newPage;

    const oldKnots = this._knots;
    let newKnots: number[];
    let newSize: number;
    if (oldPages.length - 1 > 0) {
      newKnots = oldKnots.slice(0);
      if (x > 0) {
        newSize = oldKnots[x - 1];
      } else {
        newSize = 0;
      }
      for (let i = x; i < newKnots.length; i += 1) {
        newSize += newPages[i].size;
        newKnots[i] = newSize;
      }
      newSize += newPages[newKnots.length].size;
    } else {
      newKnots = [];
      newSize = 0;
    }

    return new STreeNode(newPages, newKnots, newSize);
  }

  private updatedPageSplit(x: number, newPage: STreePage<V, I>, oldPage: STreePage<V, I>): STreeNode<V, I> {
    const oldPages = this._pages;
    const newPages = new Array<STreePage<V, I>>(oldPages.length + 1);
    for (let i = 0; i < x; i += 1) {
      newPages[i] = oldPages[i];
    }

    const newLeftPage = newPage.splitLeft(newPage.arity >>> 1);
    const newRightPage = newPage.splitRight(newPage.arity >>> 1);
    newPages[x] = newLeftPage;
    newPages[x + 1] = newRightPage;
    for (let i = x + 1; i < oldPages.length; i += 1) {
      newPages[i + 1] = oldPages[i];
    }

    return new STreeNode(newPages);
  }

  private updatedPageMerge(x: number, newPage: STreeNode<V, I>, oldPage: STreePage<V, I>): STreeNode<V, I> {
    const oldPages = this._pages;
    const midPages = newPage._pages;
    const newPages = new Array<STreePage<V, I>>(oldPages.length + midPages.length - 1);
    for (let i = 0; i < x; i += 1) {
      newPages[i] = oldPages[i];
    }
    for (let i = 0; i < midPages.length; i += 1) {
      newPages[i + x] = midPages[i];
    }
    for (let i = x + 1; i < oldPages.length; i += 1) {
      newPages[i + midPages.length - 1] = oldPages[i];
    }

    return new STreeNode(newPages);
  }

  inserted(index: number, newValue: V, id: I | undefined, tree: STreeContext<V, I>): STreeNode<V, I> {
    let x = this.lookup(index);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    const subIndex = x === 0 ? index : index - this._knots[x - 1];
    const oldPage = this._pages[x];
    const newPage = oldPage.inserted(subIndex, newValue, id, tree);
    if (oldPage !== newPage) {
      if (tree.pageShouldSplit(newPage)) {
        return this.updatedPageSplit(x, newPage, oldPage);
      } else {
        return this.updatedPage(x, newPage, oldPage);
      }
    } else {
      return this;
    }
  }

  removed(index: number, tree: STreeContext<V, I>): STreePage<V, I> {
    let x = this.lookup(index);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    const subIndex = x === 0 ? index : index - this._knots[x - 1];
    const oldPage = this._pages[x];
    const newPage = oldPage.removed(subIndex, tree);
    if (oldPage !== newPage) {
      return this.replacedPage(x, newPage, oldPage, tree);
    } else {
      return this;
    }
  }

  private replacedPage(x: number, newPage: STreePage<V, I>, oldPage: STreePage<V, I>,
                       tree: STreeContext<V, I>): STreePage<V, I> {
    if (!newPage.isEmpty()) {
      if (newPage instanceof STreeNode && tree.pageShouldMerge(newPage)) {
        return this.updatedPageMerge(x, newPage, oldPage);
      } else {
        return this.updatedPage(x, newPage, oldPage);
      }
    } else if (this._pages.length > 2) {
      return this.removedPage(x, newPage, oldPage);
    } else if (this._pages.length > 1) {
      if (x === 0) {
        return this._pages[1];
      } else {
        return this._pages[0];
      }
    } else {
      return STreePage.empty();
    }
  }

  private removedPage(x: number, newPage: STreePage<V, I>, oldPage: STreePage<V, I>): STreeNode<V, I> {
    const oldPages = this._pages;
    const newPages = new Array<STreePage<V, I>>(oldPages.length - 1);
    for (let i = 0; i < x; i += 1) {
      newPages[i] = oldPages[i];
    }
    for (let i = x + 1; i < oldPages.length; i += 1) {
      newPages[i - 1] = oldPages[i];
    }

    const oldKnots = this._knots;
    const newKnots = new Array<number>(oldKnots.length - 1);
    let newSize: number;
    if (x > 0) {
      for (let i = 0; i < x; i += 1) {
        newKnots[i] = oldKnots[i];
      }
      newSize = oldKnots[x - 1];
    } else {
      newSize = 0;
    }
    for (let i = x; i < newKnots.length; i += 1) {
      newSize += newPages[i].size;
      newKnots[i] = newSize;
    }
    newSize += newPages[newKnots.length].size;

    return new STreeNode(newPages, newKnots, newSize);
  }

  drop(lower: number, tree: STreeContext<V, I>): STreePage<V, I> {
    if (lower > 0) {
      if (lower < this._size) {
        let x = this.lookup(lower);
        if (x >= 0) {
          x += 1;
        } else {
          x = -(x + 1);
        }
        lower = x === 0 ? lower : lower - this._knots[x - 1];
        const oldPages = this._pages;
        const n = oldPages.length - x;
        if (n > 1) {
          let newNode: STreeNode<V, I>;
          if (x > 0) {
            const newPages = new Array<STreePage<V, I>>(n);
            for (let i = 0; i < n; i += 1) {
              newPages[i] = oldPages[i + x];
            }
            newNode = new STreeNode(newPages);
          } else {
            newNode = this;
          }
          if (lower > 0) {
            const oldPage = oldPages[x];
            const newPage = oldPage.drop(lower, tree);
            return newNode.replacedPage(0, newPage, oldPage, tree);
          } else {
            return newNode;
          }
        } else {
          return oldPages[x].drop(lower, tree);
        }
      } else {
        return STreePage.empty();
      }
    } else {
      return this;
    }
  }

  take(upper: number, tree: STreeContext<V, I>): STreePage<V, I> {
    if (upper < this._size) {
      if (upper > 0) {
        let x = this.lookup(upper);
        if (x >= 0) {
          x += 1;
        } else {
          x = -(x + 1);
        }
        upper = x === 0 ? upper : upper - this._knots[x - 1];
        const oldPages = this._pages;
        const n = upper === 0 ? x : x + 1;
        if (n > 1) {
          let newNode: STreeNode<V, I>;
          if (x < oldPages.length) {
            const newPages = new Array<STreePage<V, I>>(n);
            for (let i = 0; i < n; i += 1) {
              newPages[i] = oldPages[i];
            }
            const newKnots = new Array<number>(n - 1);
            for (let i = 0; i < newKnots.length; i += 1) {
              newKnots[i] = this._knots[i];
            }
            const newSize = newKnots[n - 2] + newPages[n - 1].size;
            newNode = new STreeNode(newPages, newKnots, newSize);
          } else {
            newNode = this;
          }
          if (upper > 0) {
            const oldPage = oldPages[x];
            const newPage = oldPage.take(upper, tree);
            return newNode.replacedPage(x, newPage, oldPage, tree);
          } else {
            return newNode;
          }
        } else if (upper > 0) {
          return oldPages[0].take(upper, tree);
        } else {
          return oldPages[0];
        }
      } else {
        return STreePage.empty();
      }
    } else {
      return this;
    }
  }

  balanced(tree: STreeContext<V, I>): STreeNode<V, I> {
    if (this._pages.length > 1 && tree.pageShouldSplit(this)) {
      const x = this._knots.length >>> 1;
      return this.split(x);
    } else {
      return this;
    }
  }

  split(x: number): STreeNode<V, I> {
    const newPages = new Array<STreePage<V, I>>(2);
    const newLeftPage = this.splitLeft(x);
    const newRightPage = this.splitRight(x);
    newPages[0] = newLeftPage;
    newPages[1] = newRightPage;

    const newKnots = new Array<number>(1);
    newKnots[0] = newLeftPage._size;

    return new STreeNode(newPages, newKnots, this._size);
  }

  splitLeft(x: number): STreeNode<V, I> {
    const oldPages = this._pages;
    const newPages = new Array<STreePage<V, I>>(x + 1);
    for (let i = 0; i < x + 1; i += 1) {
      newPages[i] = oldPages[i];
    }

    const oldKnots = this._knots;
    const newKnots = new Array<number>(x);
    for (let i = 0; i < x; i += 1) {
      newKnots[i] = oldKnots[i];
    }

    let newSize = 0;
    for (let i = 0; i <= x; i += 1) {
      newSize += newPages[i].size;
    }

    return new STreeNode(newPages, newKnots, newSize);
  }

  splitRight(x: number): STreeNode<V, I> {
    const oldPages = this._pages;
    const y = oldPages.length - (x + 1);
    const newPages = new Array<STreePage<V, I>>(y);
    for (let i = 0; i < y; i += 1) {
      newPages[i] = oldPages[i + (x + 1)];
    }

    const newKnots = new Array<number>(y - 1);
    let newSize;
    if (y > 0) {
      newSize = newPages[0].size;
      for (let i = 1; i < y; i += 1) {
        newKnots[i - 1] = newSize;
        newSize += newPages[i].size;
      }
    } else {
      newSize = 0;
    }

    return new STreeNode(newPages, newKnots, newSize);
  }

  forEach<T, S>(callback: (this: S,
                           value: V,
                           index: number,
                           tree: STree<V, I>,
                           id: I) => T | void,
                thisArg: S,
                offset: number,
                tree: STree<V, I>): T | undefined {
    for (let i = 0; i < this._pages.length; i += 1) {
      const page = this._pages[i];
      const result = page.forEach(callback, thisArg, offset, tree);
      if (result !== void 0) {
        return result;
      }
      offset += page.size;
    }
    return void 0;
  }

  entries(): Cursor<[I, V]> {
    return new STree.NodeCursor(this._pages);
  }

  reverseEntries(): Cursor<[I, V]> {
    return new STree.NodeCursor(this._pages, this._size, this._pages.length);
  }

  private lookup(index: number): number {
    let lo = 0;
    let hi = this._knots.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1;
      if (index > this._knots[mid]) {
        lo = mid + 1;
      } else if (index < this._knots[mid]) {
        hi = mid - 1;
      } else {
        return mid;
      }
    }
    return -(lo + 1);
  }
}
STree.Node = STreeNode;
