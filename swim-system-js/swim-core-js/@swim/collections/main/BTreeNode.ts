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

import {Cursor} from "@swim/util";
import {BTreeContext} from "./BTreeContext";
import {BTree} from "./BTree";
import {BTreePage} from "./BTreePage";

/** @hidden */
export class BTreeNode<K, V, U> extends BTreePage<K, V, U> {
  readonly _pages: BTreePage<K, V, U>[];
  readonly _knots: K[];
  readonly _fold: U | undefined;
  readonly _size: number;

  constructor(pages: BTreePage<K, V, U>[], knots: K[], fold: U | undefined, size: number) {
    super();
    this._pages = pages;
    this._knots = knots;
    this._fold = fold;
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

  fold(): U | undefined {
    return this._fold;
  }

  minKey(): K {
    return this._pages[0].minKey();
  }

  maxKey(): K {
    return this._pages[this._pages.length - 1].maxKey();
  }

  has(key: K, tree: BTreeContext<K, V>): boolean {
    let xx = this.lookup(key, tree);
    if (xx > 0) {
      xx += 1;
    } else if (xx < 0) {
      xx = -(xx + 1);
    } else {
      return true;
    }
    return this._pages[xx].has(key, tree);
  }

  get(key: K, tree: BTreeContext<K, V>): V | undefined {
    let x = this.lookup(key, tree);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    return this._pages[x].get(key, tree);
  }

  getEntry(x: number): [K, V] | undefined {
    const pages = this._pages;
    for (let i = 0, n = pages.length; i < n; i += 1) {
      const page = pages[i];
      if (x < page.size) {
        return page.getEntry(x);
      } else {
        x -= page.size;
      }
    }
    return void 0;
  }

  firstEntry(): [K, V] | undefined {
    const pages = this._pages;
    if (pages.length !== 0) {
      return pages[0].firstEntry();
    } else {
      return void 0;
    }
  }

  lastEntry(): [K, V] | undefined {
    const pages = this._pages;
    if (pages.length !== 0) {
      return pages[pages.length - 1].lastEntry();
    } else {
      return void 0;
    }
  }

  nextEntry(key: K, tree: BTreeContext<K, V>): [K, V] | undefined {
    let x = this.lookup(key, tree);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    const pages = this._pages;
    let entry = pages[x].nextEntry(key, tree);
    if (entry === void 0 && x + 1 < pages.length) {
      entry = pages[x + 1].nextEntry(key, tree);
    }
    return entry;
  }

  previousEntry(key: K, tree: BTreeContext<K, V>): [K, V] | undefined {
    let x = this.lookup(key, tree);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    const pages = this._pages;
    let entry = pages[x].previousEntry(key, tree);
    if (entry === void 0 && x > 0) {
      entry = pages[x - 1].previousEntry(key, tree);
    }
    return entry;
  }

  updated(key: K, newValue: V, tree: BTreeContext<K, V>): BTreeNode<K, V, U> {
    let x = this.lookup(key, tree);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    const oldPage = this._pages[x];
    const newPage = oldPage.updated(key, newValue, tree);
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

  private updatedPage(x: number, newPage: BTreePage<K, V, U>, oldPage: BTreePage<K, V, U>): BTreeNode<K, V, U> {
    const oldPages = this._pages;
    const newPages = oldPages.slice(0);
    newPages[x] = newPage;

    const oldKnots = this._knots;
    let newKnots: K[];
    if (oldKnots.length > 0) {
      newKnots = oldKnots.slice(0);
      if (x > 0) {
        newKnots[x - 1] = newPage.minKey();
      }
    } else {
      newKnots = [];
    }

    const newSize = this._size - oldPage.size + newPage.size;
    return this.newNode(newPages, newKnots, void 0, newSize);
  }

  private updatedPageSplit(x: number, newPage: BTreePage<K, V, U>, oldPage: BTreePage<K, V, U>): BTreeNode<K, V, U> {
    const oldPages = this._pages;
    const newPages = new Array<BTreePage<K, V, U>>(oldPages.length + 1);
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

    const oldKnots = this._knots;
    const newKnots = new Array<K>(oldPages.length);
    if (x > 0) {
      for (let i = 0; i < x - 1; i += 1) {
        newKnots[i] = oldKnots[i];
      }
      newKnots[x - 1] = newLeftPage.minKey();
      newKnots[x] = newRightPage.minKey();
      for (let i = x; i < oldKnots.length; i += 1) {
        newKnots[i + 1] = oldKnots[i];
      }
    } else {
      newKnots[0] = newRightPage.minKey();
      for (let i = 0; i < oldKnots.length; i += 1) {
        newKnots[i + 1] = oldKnots[i];
      }
    }

    const newSize = this._size - oldPage.size + newPage.size;
    return this.newNode(newPages, newKnots, void 0, newSize);
  }

  private updatedPageMerge(x: number, newPage: BTreeNode<K, V, U>, oldPage: BTreePage<K, V, U>): BTreeNode<K, V, U> {
    const oldPages = this._pages;
    const midPages = newPage._pages;
    const newPages = new Array<BTreePage<K, V, U>>(oldPages.length + midPages.length - 1);
    for (let i = 0; i < x; i += 1) {
      newPages[i] = oldPages[i];
    }
    for (let i = 0; i < midPages.length; i += 1) {
      newPages[i + x] = midPages[i];
    }
    for (let i = x + 1; i < oldPages.length; i += 1) {
      newPages[i + midPages.length - 1] = oldPages[i];
    }

    const oldKnots = this._knots;
    const midKnots = newPage._knots;
    const newKnots = new Array<K>(newPages.length - 1);
    if (x > 0) {
      for (let i = 0; i < x - 1; i += 1) {
        newKnots[i] = oldKnots[i];
      }
      newKnots[x - 1] = midPages[0].minKey();
      for (let i = 0; i < midKnots.length; i += 1) {
        newKnots[i + x] = midKnots[i];
      }
      for (let i = x; i < oldKnots.length; i += 1) {
        newKnots[i + midKnots.length] = oldKnots[i];
      }
    } else {
      for (let i = 0; i < midKnots.length; i += 1) {
        newKnots[i] = midKnots[i];
      }
      newKnots[midKnots.length] = oldPages[1].minKey();
      for (let i = 1; i < oldKnots.length; i += 1) {
        newKnots[i + midKnots.length] = oldKnots[i];
      }
    }

    const newSize = this._size - oldPage.size + newPage.size;
    return this.newNode(newPages, newKnots, void 0, newSize);
  }

  removed(key: K, tree: BTreeContext<K, V>): BTreePage<K, V, U> {
    let x = this.lookup(key, tree);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    const oldPage = this._pages[x];
    const newPage = oldPage.removed(key, tree);
    if (oldPage !== newPage) {
      return this.replacedPage(x, newPage, oldPage, tree);
    } else {
      return this;
    }
  }

  private replacedPage(x: number, newPage: BTreePage<K, V, U>, oldPage: BTreePage<K, V, U>,
                       tree: BTreeContext<K, V>): BTreePage<K, V, U> {
    if (!newPage.isEmpty()) {
      if (newPage instanceof BTreeNode && tree.pageShouldMerge(newPage)) {
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
      return BTreePage.empty();
    }
  }

  private removedPage(x: number, newPage: BTreePage<K, V, U>, oldPage: BTreePage<K, V, U>): BTreeNode<K, V, U> {
    const oldPages = this._pages;
    const newPages = new Array<BTreePage<K, V, U>>(oldPages.length - 1);
    for (let i = 0; i < x; i += 1) {
      newPages[i] = oldPages[i];
    }
    for (let i = x + 1; i < oldPages.length; i += 1) {
      newPages[i - 1] = oldPages[i];
    }

    const oldKnots = this._knots;
    const newKnots = new Array<K>(oldKnots.length - 1);
    if (x > 0) {
      for (let i = 0; i < x - 1; i += 1) {
        newKnots[i] = oldKnots[i];
      }
      for (let i = x; i < oldKnots.length; i += 1) {
        newKnots[i - 1] = oldKnots[i];
      }
    } else {
      for (let i = 1; i < oldKnots.length; i += 1) {
        newKnots[i - 1] = oldKnots[i];
      }
    }

    const newSize = this._size - oldPage.size;
    return this.newNode(newPages, newKnots, void 0, newSize);
  }

  drop(lower: number, tree: BTreeContext<K, V>): BTreePage<K, V, U> {
    if (lower > 0) {
      let newSize = this._size;
      if (lower < newSize) {
        const oldPages = this._pages;
        let x = 0;
        while (x < oldPages.length) {
          const size = oldPages[x].size;
          if (size <= lower) {
            newSize -= size;
            lower -= size;
            x += 1;
          } else {
            break;
          }
        }
        const newArity = oldPages.length - x;
        if (newArity > 1) {
          let newNode: BTreeNode<K, V, U>;
          if (x > 0) {
            const newPages = new Array<BTreePage<K, V, U>>(newArity);
            for (let i = 0; i < newArity; i += 1) {
              newPages[i] = oldPages[i + x];
            }
            const newKnots = new Array<K>(newArity - 1);
            for (let i = 0; i < newKnots.length; i += 1) {
              newKnots[i] = this._knots[i + x];
            }
            newNode = this.newNode(newPages, newKnots, void 0, newSize);
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
        return BTreePage.empty();
      }
    } else {
      return this;
    }
  }

  take(upper: number, tree: BTreeContext<K, V>): BTreePage<K, V, U> {
    if (upper < this._size) {
      if (upper > 0) {
        const oldPages = this._pages;
        let x = 0;
        let newSize = 0;
        while (x < oldPages.length && upper > 0) {
          const size = oldPages[x].size;
          newSize += size;
          x += 1;
          if (size <= upper) {
            upper -= size;
          } else {
            break;
          }
        }
        const newArity = upper === 0 ? x : x + 1;
        if (newArity > 1) {
          let newNode: BTreeNode<K, V, U>;
          if (x < oldPages.length) {
            const newPages = new Array<BTreePage<K, V, U>>(newArity);
            for (let i = 0; i < newArity; i += 1) {
              newPages[i] = oldPages[i];
            }
            const newKnots = new Array<K>(newArity - 1);
            for (let i = 0; i < newKnots.length; i += 1) {
              newKnots[i] = this._knots[i];
            }
            newNode = this.newNode(newPages, newKnots, void 0, newSize);
          } else {
            newNode = this;
          }
          if (upper > 0) {
            const oldPage = oldPages[x - 1];
            const newPage = oldPage.take(upper, tree);
            return newNode.replacedPage(x - 1, newPage, oldPage, tree);
          } else {
            return newNode;
          }
        } else if (upper > 0) {
          return oldPages[0].take(upper, tree);
        } else {
          return oldPages[0];
        }
      } else {
        return BTreePage.empty();
      }
    } else {
      return this;
    }
  }

  balanced(tree: BTreeContext<K, V>): BTreeNode<K, V, U> {
    if (this._pages.length > 1 && tree.pageShouldSplit(this)) {
      const x = this._knots.length >>> 1;
      return this.split(x);
    } else {
      return this;
    }
  }

  split(x: number): BTreeNode<K, V, U> {
    const newPages = new Array<BTreePage<K, V, U>>(2);
    const newLeftPage = this.splitLeft(x);
    const newRightPage = this.splitRight(x);
    newPages[0] = newLeftPage;
    newPages[1] = newRightPage;

    const newKnots = new Array<K>(1);
    newKnots[0] = newRightPage.minKey();

    return this.newNode(newPages, newKnots, void 0, this._size);
  }

  splitLeft(x: number): BTreeNode<K, V, U> {
    const oldPages = this._pages;
    const newPages = new Array<BTreePage<K, V, U>>(x + 1);
    for (let i = 0; i < x + 1; i += 1) {
      newPages[i] = oldPages[i];
    }

    const oldKnots = this._knots;
    const newKnots = new Array<K>(x);
    for (let i = 0; i < x; i += 1) {
      newKnots[i] = oldKnots[i];
    }

    let newSize = 0;
    for (let i = 0; i <= x; i += 1) {
      newSize += newPages[i].size;
    }

    return this.newNode(newPages, newKnots, void 0, newSize);
  }

  splitRight(x: number): BTreeNode<K, V, U> {
    const oldPages = this._pages;
    const newArity = oldPages.length - (x + 1);
    const newPages = new Array<BTreePage<K, V, U>>(newArity);
    for (let i = 0; i < newArity; i += 1) {
      newPages[i] = oldPages[i + (x + 1)];
    }

    const oldKnots = this._knots;
    const newKnots = new Array<K>(newArity - 1);
    for (let i = 0; i < newKnots.length; i += 1) {
      newKnots[i] = oldKnots[i + (x + 1)];
    }

    let newSize = 0;
    for (let i = 0; i < newArity; i += 1) {
      newSize += newPages[i].size;
    }

    return this.newNode(newPages, newKnots, void 0, newSize);
  }

  reduced(identity: U, accumulator: (result: U, element: V) => U,
          combiner: (result: U, result2: U) => U): BTreeNode<K, V, U> {
    if (this._fold === void 0) {
      const oldPages = this._pages;
      const n = oldPages.length;
      const newPages = new Array<BTreePage<K, V, U>>(n);
      for (let i = 0; i < n; i += 1) {
        newPages[i] = oldPages[i].reduced(identity, accumulator, combiner);
      }
      // assert n > 0;
      let fold: U = newPages[0].fold()!;
      for (let i = 1; i < n; i += 1) {
        fold = combiner(fold, newPages[i].fold()!);
      }
      return this.newNode(newPages, this._knots, fold, this._size);
    } else {
      return this;
    }
  }

  forEach<T, S>(callback: (this: S, key: K, value: V) => T | void,
                thisArg: S): T | undefined {
    const pages = this._pages;
    for (let i = 0, n = pages.length; i < n; i += 1) {
      const result = pages[i].forEach(callback, thisArg);
      if (result !== void 0) {
        return result;
      }
    }
    return void 0;
  }

  forEachKey<T, S>(callback: (this: S, key: K) => T | void,
                   thisArg: S): T | undefined {
    const pages = this._pages;
    for (let i = 0, n = pages.length; i < n; i += 1) {
      const result = pages[i].forEachKey(callback, thisArg);
      if (result !== void 0) {
        return result;
      }
    }
    return void 0;
  }

  forEachValue<T, S>(callback: (this: S, value: V) => T | void,
                     thisArg: S): T | undefined {
    const pages = this._pages;
    for (let i = 0, n = pages.length; i < n; i += 1) {
      const result = pages[i].forEachValue(callback, thisArg);
      if (result !== void 0) {
        return result;
      }
    }
    return void 0;
  }

  entries(): Cursor<[K, V]> {
    return new BTree.NodeCursor(this._pages);
  }

  reverseEntries(): Cursor<[K, V]> {
    return new BTree.NodeCursor(this._pages, this._size, this._pages.length);
  }

  private lookup(key: K, tree: BTreeContext<K, V>): number {
    let lo = 0;
    let hi = this._knots.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1;
      const order = tree.compare(key, this._knots[mid]);
      if (order > 0) {
        lo = mid + 1;
      } else if (order < 0) {
        hi = mid - 1;
      } else {
        return mid;
      }
    }
    return -(lo + 1);
  }

  protected newNode(pages: BTreePage<K, V, U>[], knots: K[], fold: U | undefined, size: number): BTreeNode<K, V, U> {
    return new BTreeNode(pages, knots, fold, size);
  }
}
BTree.Node = BTreeNode;
