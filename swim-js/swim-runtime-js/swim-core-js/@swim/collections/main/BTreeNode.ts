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

import type {Cursor} from "@swim/util";
import type {BTreeContext} from "./BTreeContext";
import {BTreePage} from "./BTreePage";
import {BTreeNodeCursor} from "./"; // forward import

/** @internal */
export class BTreeNode<K, V, U> extends BTreePage<K, V, U> {
  constructor(pages: ReadonlyArray<BTreePage<K, V, U>>, knots: ReadonlyArray<K>,
              fold: U | undefined, size: number) {
    super();
    this.pages = pages;
    this.knots = knots;
    this.fold = fold;
    this.size = size;
  }

  /** @internal */
  readonly pages: ReadonlyArray<BTreePage<K, V, U>>;

  /** @internal */
  readonly knots: ReadonlyArray<K>;

  override get arity(): number {
    return this.pages.length;
  }

  override readonly size: number;

  override isEmpty(): boolean {
    return this.size === 0;
  }

  override readonly fold: U | undefined;

  override minKey(): K {
    return this.pages[0]!.minKey();
  }

  override maxKey(): K {
    return this.pages[this.pages.length - 1]!.maxKey();
  }

  override has(key: K, tree: BTreeContext<K, V>): boolean {
    let xx = this.lookup(key, tree);
    if (xx > 0) {
      xx += 1;
    } else if (xx < 0) {
      xx = -(xx + 1);
    } else {
      return true;
    }
    return this.pages[xx]!.has(key, tree);
  }

  override get(key: K, tree: BTreeContext<K, V>): V | undefined {
    let x = this.lookup(key, tree);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    return this.pages[x]!.get(key, tree);
  }

  override getEntry(x: number): [K, V] | undefined {
    const pages = this.pages;
    for (let i = 0, n = pages.length; i < n; i += 1) {
      const page = pages[i]!;
      if (x < page.size) {
        return page.getEntry(x);
      } else {
        x -= page.size;
      }
    }
    return void 0;
  }

  override firstEntry(): [K, V] | undefined {
    const pages = this.pages;
    if (pages.length !== 0) {
      return pages[0]!.firstEntry();
    } else {
      return void 0;
    }
  }

  override lastEntry(): [K, V] | undefined {
    const pages = this.pages;
    if (pages.length !== 0) {
      return pages[pages.length - 1]!.lastEntry();
    } else {
      return void 0;
    }
  }

  override nextEntry(key: K, tree: BTreeContext<K, V>): [K, V] | undefined {
    let x = this.lookup(key, tree);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    const pages = this.pages;
    let entry = pages[x]!.nextEntry(key, tree);
    if (entry === void 0 && x + 1 < pages.length) {
      entry = pages[x + 1]!.nextEntry(key, tree);
    }
    return entry;
  }

  override previousEntry(key: K, tree: BTreeContext<K, V>): [K, V] | undefined {
    let x = this.lookup(key, tree);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    const pages = this.pages;
    let entry = pages[x]!.previousEntry(key, tree);
    if (entry === void 0 && x > 0) {
      entry = pages[x - 1]!.previousEntry(key, tree);
    }
    return entry;
  }

  override updated(key: K, newValue: V, tree: BTreeContext<K, V>): BTreeNode<K, V, U> {
    let x = this.lookup(key, tree);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    const oldPage = this.pages[x]!;
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

  /** @internal */
  updatedPage(x: number, newPage: BTreePage<K, V, U>, oldPage: BTreePage<K, V, U>): BTreeNode<K, V, U> {
    const oldPages = this.pages;
    const newPages = oldPages.slice(0);
    newPages[x] = newPage;

    const oldKnots = this.knots;
    let newKnots: K[];
    if (oldKnots.length > 0) {
      newKnots = oldKnots.slice(0);
      if (x > 0) {
        newKnots[x - 1] = newPage.minKey();
      }
    } else {
      newKnots = [];
    }

    const newSize = this.size - oldPage.size + newPage.size;
    return new BTreeNode(newPages, newKnots, void 0, newSize);
  }

  /** @internal */
  updatedPageSplit(x: number, newPage: BTreePage<K, V, U>, oldPage: BTreePage<K, V, U>): BTreeNode<K, V, U> {
    const oldPages = this.pages;
    const newPages = new Array<BTreePage<K, V, U>>(oldPages.length + 1);
    for (let i = 0; i < x; i += 1) {
      newPages[i] = oldPages[i]!;
    }

    const newLeftPage = newPage.splitLeft(newPage.arity >>> 1);
    const newRightPage = newPage.splitRight(newPage.arity >>> 1);
    newPages[x] = newLeftPage;
    newPages[x + 1] = newRightPage;
    for (let i = x + 1; i < oldPages.length; i += 1) {
      newPages[i + 1] = oldPages[i]!;
    }

    const oldKnots = this.knots;
    const newKnots = new Array<K>(oldPages.length);
    if (x > 0) {
      for (let i = 0; i < x - 1; i += 1) {
        newKnots[i] = oldKnots[i]!;
      }
      newKnots[x - 1] = newLeftPage.minKey();
      newKnots[x] = newRightPage.minKey();
      for (let i = x; i < oldKnots.length; i += 1) {
        newKnots[i + 1] = oldKnots[i]!;
      }
    } else {
      newKnots[0] = newRightPage.minKey();
      for (let i = 0; i < oldKnots.length; i += 1) {
        newKnots[i + 1] = oldKnots[i]!;
      }
    }

    const newSize = this.size - oldPage.size + newPage.size;
    return new BTreeNode(newPages, newKnots, void 0, newSize);
  }

  /** @internal */
  updatedPageMerge(x: number, newPage: BTreeNode<K, V, U>, oldPage: BTreePage<K, V, U>): BTreeNode<K, V, U> {
    const oldPages = this.pages;
    const midPages = newPage.pages;
    const newPages = new Array<BTreePage<K, V, U>>(oldPages.length + midPages.length - 1);
    for (let i = 0; i < x; i += 1) {
      newPages[i] = oldPages[i]!;
    }
    for (let i = 0; i < midPages.length; i += 1) {
      newPages[i + x] = midPages[i]!;
    }
    for (let i = x + 1; i < oldPages.length; i += 1) {
      newPages[i + midPages.length - 1] = oldPages[i]!;
    }

    const oldKnots = this.knots;
    const midKnots = newPage.knots;
    const newKnots = new Array<K>(newPages.length - 1);
    if (x > 0) {
      for (let i = 0; i < x - 1; i += 1) {
        newKnots[i] = oldKnots[i]!;
      }
      newKnots[x - 1] = midPages[0]!.minKey();
      for (let i = 0; i < midKnots.length; i += 1) {
        newKnots[i + x] = midKnots[i]!;
      }
      for (let i = x; i < oldKnots.length; i += 1) {
        newKnots[i + midKnots.length] = oldKnots[i]!;
      }
    } else {
      for (let i = 0; i < midKnots.length; i += 1) {
        newKnots[i] = midKnots[i]!;
      }
      newKnots[midKnots.length] = oldPages[1]!.minKey();
      for (let i = 1; i < oldKnots.length; i += 1) {
        newKnots[i + midKnots.length] = oldKnots[i]!;
      }
    }

    const newSize = this.size - oldPage.size + newPage.size;
    return new BTreeNode(newPages, newKnots, void 0, newSize);
  }

  override removed(key: K, tree: BTreeContext<K, V>): BTreePage<K, V, U> {
    let x = this.lookup(key, tree);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    const oldPage = this.pages[x]!;
    const newPage = oldPage.removed(key, tree);
    if (oldPage !== newPage) {
      return this.replacedPage(x, newPage, oldPage, tree);
    } else {
      return this;
    }
  }

  /** @internal */
  replacedPage(x: number, newPage: BTreePage<K, V, U>, oldPage: BTreePage<K, V, U>,
               tree: BTreeContext<K, V>): BTreePage<K, V, U> {
    if (!newPage.isEmpty()) {
      if (newPage instanceof BTreeNode && tree.pageShouldMerge(newPage)) {
        return this.updatedPageMerge(x, newPage, oldPage);
      } else {
        return this.updatedPage(x, newPage, oldPage);
      }
    } else if (this.pages.length > 2) {
      return this.removedPage(x, newPage, oldPage);
    } else if (this.pages.length > 1) {
      if (x === 0) {
        return this.pages[1]!;
      } else {
        return this.pages[0]!;
      }
    } else {
      return BTreePage.empty();
    }
  }

  /** @internal */
  removedPage(x: number, newPage: BTreePage<K, V, U>, oldPage: BTreePage<K, V, U>): BTreeNode<K, V, U> {
    const oldPages = this.pages;
    const newPages = new Array<BTreePage<K, V, U>>(oldPages.length - 1);
    for (let i = 0; i < x; i += 1) {
      newPages[i] = oldPages[i]!;
    }
    for (let i = x + 1; i < oldPages.length; i += 1) {
      newPages[i - 1] = oldPages[i]!;
    }

    const oldKnots = this.knots;
    const newKnots = new Array<K>(oldKnots.length - 1);
    if (x > 0) {
      for (let i = 0; i < x - 1; i += 1) {
        newKnots[i] = oldKnots[i]!;
      }
      for (let i = x; i < oldKnots.length; i += 1) {
        newKnots[i - 1] = oldKnots[i]!;
      }
    } else {
      for (let i = 1; i < oldKnots.length; i += 1) {
        newKnots[i - 1] = oldKnots[i]!;
      }
    }

    const newSize = this.size - oldPage.size;
    return new BTreeNode(newPages, newKnots, void 0, newSize);
  }

  override drop(lower: number, tree: BTreeContext<K, V>): BTreePage<K, V, U> {
    if (lower > 0) {
      let newSize = this.size;
      if (lower < newSize) {
        const oldPages = this.pages;
        let x = 0;
        while (x < oldPages.length) {
          const size = oldPages[x]!.size;
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
              newPages[i] = oldPages[i + x]!;
            }
            const newKnots = new Array<K>(newArity - 1);
            for (let i = 0; i < newKnots.length; i += 1) {
              newKnots[i] = this.knots[i + x]!;
            }
            newNode = new BTreeNode(newPages, newKnots, void 0, newSize);
          } else {
            newNode = this;
          }
          if (lower > 0) {
            const oldPage = oldPages[x]!;
            const newPage = oldPage.drop(lower, tree);
            return newNode.replacedPage(0, newPage, oldPage, tree);
          } else {
            return newNode;
          }
        } else {
          return oldPages[x]!.drop(lower, tree);
        }
      } else {
        return BTreePage.empty();
      }
    } else {
      return this;
    }
  }

  override take(upper: number, tree: BTreeContext<K, V>): BTreePage<K, V, U> {
    if (upper < this.size) {
      if (upper > 0) {
        const oldPages = this.pages;
        let x = 0;
        let newSize = 0;
        while (x < oldPages.length && upper > 0) {
          const size = oldPages[x]!.size;
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
              newPages[i] = oldPages[i]!;
            }
            const newKnots = new Array<K>(newArity - 1);
            for (let i = 0; i < newKnots.length; i += 1) {
              newKnots[i] = this.knots[i]!;
            }
            newNode = new BTreeNode(newPages, newKnots, void 0, newSize);
          } else {
            newNode = this;
          }
          if (upper > 0) {
            const oldPage = oldPages[x - 1]!;
            const newPage = oldPage.take(upper, tree);
            return newNode.replacedPage(x - 1, newPage, oldPage, tree);
          } else {
            return newNode;
          }
        } else if (upper > 0) {
          return oldPages[0]!.take(upper, tree);
        } else {
          return oldPages[0]!;
        }
      } else {
        return BTreePage.empty();
      }
    } else {
      return this;
    }
  }

  override balanced(tree: BTreeContext<K, V>): BTreeNode<K, V, U> {
    if (this.pages.length > 1 && tree.pageShouldSplit(this)) {
      const x = this.knots.length >>> 1;
      return this.split(x);
    } else {
      return this;
    }
  }

  override split(x: number): BTreeNode<K, V, U> {
    const newPages = new Array<BTreePage<K, V, U>>(2);
    const newLeftPage = this.splitLeft(x);
    const newRightPage = this.splitRight(x);
    newPages[0] = newLeftPage;
    newPages[1] = newRightPage;

    const newKnots = new Array<K>(1);
    newKnots[0] = newRightPage.minKey();

    return new BTreeNode(newPages, newKnots, void 0, this.size);
  }

  override splitLeft(x: number): BTreeNode<K, V, U> {
    const oldPages = this.pages;
    const newPages = new Array<BTreePage<K, V, U>>(x + 1);
    for (let i = 0; i < x + 1; i += 1) {
      newPages[i] = oldPages[i]!;
    }

    const oldKnots = this.knots;
    const newKnots = new Array<K>(x);
    for (let i = 0; i < x; i += 1) {
      newKnots[i] = oldKnots[i]!;
    }

    let newSize = 0;
    for (let i = 0; i <= x; i += 1) {
      newSize += newPages[i]!.size;
    }

    return new BTreeNode(newPages, newKnots, void 0, newSize);
  }

  override splitRight(x: number): BTreeNode<K, V, U> {
    const oldPages = this.pages;
    const newArity = oldPages.length - (x + 1);
    const newPages = new Array<BTreePage<K, V, U>>(newArity);
    for (let i = 0; i < newArity; i += 1) {
      newPages[i] = oldPages[i + (x + 1)]!;
    }

    const oldKnots = this.knots;
    const newKnots = new Array<K>(newArity - 1);
    for (let i = 0; i < newKnots.length; i += 1) {
      newKnots[i] = oldKnots[i + (x + 1)]!;
    }

    let newSize = 0;
    for (let i = 0; i < newArity; i += 1) {
      newSize += newPages[i]!.size;
    }

    return new BTreeNode(newPages, newKnots, void 0, newSize);
  }

  override reduced(identity: U, accumulator: (result: U, element: V) => U,
                   combiner: (result: U, result2: U) => U): BTreeNode<K, V, U> {
    if (this.fold === void 0) {
      const oldPages = this.pages;
      const n = oldPages.length;
      const newPages = new Array<BTreePage<K, V, U>>(n);
      for (let i = 0; i < n; i += 1) {
        newPages[i] = oldPages[i]!.reduced(identity, accumulator, combiner);
      }
      // assert n > 0;
      let fold: U = newPages[0]!.fold!;
      for (let i = 1; i < n; i += 1) {
        fold = combiner(fold, newPages[i]!.fold!);
      }
      return new BTreeNode(newPages, this.knots, fold, this.size);
    } else {
      return this;
    }
  }

  override forEach<T, S>(callback: (this: S, key: K, value: V) => T | void,
                         thisArg: S): T | undefined {
    const pages = this.pages;
    for (let i = 0, n = pages.length; i < n; i += 1) {
      const result = pages[i]!.forEach(callback, thisArg);
      if (result !== void 0) {
        return result;
      }
    }
    return void 0;
  }

  override forEachKey<T, S>(callback: (this: S, key: K) => T | void,
                            thisArg: S): T | undefined {
    const pages = this.pages;
    for (let i = 0, n = pages.length; i < n; i += 1) {
      const result = pages[i]!.forEachKey(callback, thisArg);
      if (result !== void 0) {
        return result;
      }
    }
    return void 0;
  }

  override forEachValue<T, S>(callback: (this: S, value: V) => T | void,
                              thisArg: S): T | undefined {
    const pages = this.pages;
    for (let i = 0, n = pages.length; i < n; i += 1) {
      const result = pages[i]!.forEachValue(callback, thisArg);
      if (result !== void 0) {
        return result;
      }
    }
    return void 0;
  }

  override entries(): Cursor<[K, V]> {
    return new BTreeNodeCursor(this.pages);
  }

  override reverseEntries(): Cursor<[K, V]> {
    return new BTreeNodeCursor(this.pages, this.size, this.pages.length);
  }

  /** @internal */
  lookup(key: K, tree: BTreeContext<K, V>): number {
    let lo = 0;
    let hi = this.knots.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1;
      const order = tree.compare(key, this.knots[mid]!);
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
}
