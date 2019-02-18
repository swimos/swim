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

package swim.collections;

import java.util.Map;
import swim.util.CombinerFunction;
import swim.util.OrderedMapCursor;

class BTreeNode<K, V, U> extends BTreePage<K, V, U> {
  final BTreePage<K, V, U>[] pages;
  final K[] knots;
  final U fold;
  final int size;

  BTreeNode(BTreePage<K, V, U>[] pages, K[] knots, U fold, int size) {
    this.pages = pages;
    this.knots = knots;
    this.fold = fold;
    this.size = size;
  }

  @Override
  public final boolean isEmpty() {
    return this.size == 0;
  }

  @Override
  public final int size() {
    return this.size;
  }

  @Override
  public final int arity() {
    return this.pages.length;
  }

  @Override
  public final U fold() {
    return this.fold;
  }

  @Override
  public final K minKey() {
    return this.pages[0].minKey();
  }

  @Override
  public final K maxKey() {
    return this.pages[this.pages.length - 1].maxKey();
  }

  @Override
  public final boolean containsKey(Object key, BTreeContext<K, V> tree) {
    int x = lookup(key, tree);
    if (x > 0) {
      x += 1;
    } else if (x < 0) {
      x = -(x + 1);
    } else {
      return true;
    }
    return this.pages[x].containsKey(key, tree);
  }

  @Override
  public final boolean containsValue(Object value) {
    final BTreePage<K, V, U>[] pages = this.pages;
    for (int i = 0, n = pages.length; i < n; i += 1) {
      if (pages[i].containsValue(value)) {
        return true;
      }
    }
    return false;
  }

  @Override
  public final int indexOf(Object key, BTreeContext<K, V> tree) {
    int x = lookup(key, tree);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    int count = 0;
    for (int i = 0; i < x; i += 1) {
      count += this.pages[x].size();
    }
    final int index = this.pages[x].indexOf(key, tree);
    if (index >= 0) {
      return count + index;
    } else {
      return index - count;
    }
  }

  @Override
  public final V get(Object key, BTreeContext<K, V> tree) {
    int x = lookup(key, tree);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    return this.pages[x].get(key, tree);
  }

  @Override
  public final Map.Entry<K, V> getEntry(Object key, BTreeContext<K, V> tree) {
    int x = lookup(key, tree);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    return this.pages[x].getEntry(key, tree);
  }

  @Override
  public final Map.Entry<K, V> getIndex(int index) {
    final BTreePage<K, V, U>[] pages = this.pages;
    for (int i = 0, n = pages.length; i < n; i += 1) {
      final BTreePage<K, V, U> page = pages[i];
      if (index < page.size()) {
        return page.getIndex(index);
      } else {
        index -= page.size();
      }
    }
    return null;
  }

  @Override
  public final Map.Entry<K, V> firstEntry() {
    final BTreePage<K, V, U>[] pages = this.pages;
    if (pages.length != 0) {
      return pages[0].firstEntry();
    } else {
      return null;
    }
  }

  @Override
  public final Map.Entry<K, V> lastEntry() {
    final BTreePage<K, V, U>[] pages = this.pages;
    if (pages.length != 0) {
      return pages[pages.length - 1].lastEntry();
    } else {
      return null;
    }
  }

  @Override
  public final Map.Entry<K, V> nextEntry(K key, BTreeContext<K, V> tree) {
    int x = lookup(key, tree);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    final BTreePage<K, V, U>[] pages = this.pages;
    Map.Entry<K, V> entry = pages[x].nextEntry(key, tree);
    if (entry == null && x + 1 < pages.length) {
      entry = pages[x + 1].nextEntry(key, tree);
    }
    return entry;
  }

  @Override
  public final Map.Entry<K, V> previousEntry(K key, BTreeContext<K, V> tree) {
    int x = lookup(key, tree);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    final BTreePage<K, V, U>[] pages = this.pages;
    Map.Entry<K, V> entry = pages[x].previousEntry(key, tree);
    if (entry == null && x > 0) {
      entry = pages[x - 1].previousEntry(key, tree);
    }
    return entry;
  }

  @Override
  public final BTreeNode<K, V, U> updated(K key, V newValue, BTreeContext<K, V> tree) {
    int x = lookup(key, tree);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    final BTreePage<K, V, U> oldPage = this.pages[x];
    final BTreePage<K, V, U> newPage = oldPage.updated(key, newValue, tree);
    if (oldPage != newPage) {
      if (oldPage.size() != newPage.size() && tree.pageShouldSplit(newPage)) {
        return updatedPageSplit(x, newPage, oldPage);
      } else {
        return updatedPage(x, newPage, oldPage);
      }
    } else {
      return this;
    }
  }

  @SuppressWarnings("unchecked")
  private BTreeNode<K, V, U> updatedPage(int x, BTreePage<K, V, U> newPage, BTreePage<K, V, U> oldPage) {
    final BTreePage<K, V, U>[] oldPages = this.pages;
    final int n = oldPages.length;
    final BTreePage<K, V, U>[] newPages = (BTreePage<K, V, U>[]) new BTreePage<?, ?, ?>[n];
    System.arraycopy(oldPages, 0, newPages, 0, n);
    newPages[x] = newPage;

    final K[] oldKnots = this.knots;
    final K[] newKnots;
    if (n - 1 > 0) {
      newKnots = (K[]) new Object[n - 1];
      System.arraycopy(oldKnots, 0, newKnots, 0, n - 1);
      if (x > 0) {
        newKnots[x - 1] = newPage.minKey();
      }
    } else {
      newKnots = (K[]) new Object[0];
    }

    final int newSize = this.size - oldPage.size() + newPage.size();
    return newNode(newPages, newKnots, null, newSize);
  }

  @SuppressWarnings("unchecked")
  private BTreeNode<K, V, U> updatedPageSplit(int x, BTreePage<K, V, U> newPage, BTreePage<K, V, U> oldPage) {
    final BTreePage<K, V, U>[] oldPages = this.pages;
    final int n = oldPages.length + 1;
    final BTreePage<K, V, U>[] newPages = (BTreePage<K, V, U>[]) new BTreePage<?, ?, ?>[n];
    System.arraycopy(oldPages, 0, newPages, 0, x);

    final int y = newPage.arity() >>> 1;
    final BTreePage<K, V, U> newLeftPage = newPage.splitLeft(y);
    final BTreePage<K, V, U> newRightPage = newPage.splitRight(y);
    newPages[x] = newLeftPage;
    newPages[x + 1] = newRightPage;
    System.arraycopy(oldPages, x + 1, newPages, x + 2, n - (x + 2));

    final K[] oldKnots = this.knots;
    final K[] newKnots = (K[]) new Object[n - 1];
    if (x > 0) {
      System.arraycopy(oldKnots, 0, newKnots, 0, x - 1);
      newKnots[x - 1] = newLeftPage.minKey();
      newKnots[x] = newRightPage.minKey();
      System.arraycopy(oldKnots, x, newKnots, x + 1, n - (x + 2));
    } else {
      newKnots[0] = newRightPage.minKey();
      System.arraycopy(oldKnots, 0, newKnots, 1, n - 2);
    }

    final int newSize = this.size - oldPage.size() + newPage.size();
    return newNode(newPages, newKnots, null, newSize);
  }

  @SuppressWarnings("unchecked")
  private BTreeNode<K, V, U> updatedPageMerge(int x, BTreeNode<K, V, U> newPage, BTreePage<K, V, U> oldPage) {
    final BTreePage<K, V, U>[] oldPages = this.pages;
    final BTreePage<K, V, U>[] midPages = newPage.pages;
    final int k = midPages.length;
    final int n = oldPages.length + (k - 1);
    final BTreePage<K, V, U>[] newPages = (BTreePage<K, V, U>[]) new BTreePage<?, ?, ?>[n];
    System.arraycopy(oldPages, 0, newPages, 0, x);
    System.arraycopy(midPages, 0, newPages, x, k);
    System.arraycopy(oldPages, x + 1, newPages, x + k, n - (x + k));

    final K[] oldKnots = this.knots;
    final K[] midKnots = newPage.knots;
    final K[] newKnots = (K[]) new Object[n - 1];
    if (x > 0) {
      System.arraycopy(oldKnots, 0, newKnots, 0, x - 1);
      newKnots[x - 1] = midPages[0].minKey();
      System.arraycopy(midKnots, 0, newKnots, x, k - 1);
      System.arraycopy(oldKnots, x, newKnots, x + (k - 1), n - (x + k));
    } else {
      System.arraycopy(midKnots, 0, newKnots, 0, k - 1);
      newKnots[midKnots.length] = oldPages[1].minKey();
      System.arraycopy(oldKnots, 1, newKnots, k, n - k - 1);
    }

    final int newSize = this.size - oldPage.size() + newPage.size();
    return newNode(newPages, newKnots, null, newSize);
  }

  @Override
  public final BTreePage<K, V, U> removed(Object key, BTreeContext<K, V> tree) {
    int x = lookup(key, tree);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    final BTreePage<K, V, U> oldPage = this.pages[x];
    final BTreePage<K, V, U> newPage = oldPage.removed(key, tree);
    if (oldPage != newPage) {
      return replacedPage(x, newPage, oldPage, tree);
    } else {
      return this;
    }
  }

  private BTreePage<K, V, U> replacedPage(int x, BTreePage<K, V, U> newPage,
                                          BTreePage<K, V, U> oldPage, BTreeContext<K, V> tree) {
    if (!newPage.isEmpty()) {
      if (newPage instanceof BTreeNode<?, ?, ?> && tree.pageShouldMerge(newPage)) {
        return updatedPageMerge(x, (BTreeNode<K, V, U>) newPage, oldPage);
      } else {
        return updatedPage(x, newPage, oldPage);
      }
    } else if (this.pages.length > 2) {
      return removedPage(x, newPage, oldPage);
    } else if (this.pages.length > 1) {
      if (x == 0) {
        return this.pages[1];
      } else {
        return this.pages[0];
      }
    } else {
      return BTreeLeaf.empty();
    }
  }

  @SuppressWarnings("unchecked")
  private BTreeNode<K, V, U> removedPage(int x, BTreePage<K, V, U> newPage, BTreePage<K, V, U> oldPage) {
    final BTreePage<K, V, U>[] oldPages = this.pages;
    final int n = oldPages.length - 1;
    final BTreePage<K, V, U>[] newPages = (BTreePage<K, V, U>[]) new BTreePage<?, ?, ?>[n];
    System.arraycopy(oldPages, 0, newPages, 0, x);
    System.arraycopy(oldPages, x + 1, newPages, x, n - x);

    final K[] oldKnots = this.knots;
    final K[] newKnots = (K[]) new Object[n - 1];
    if (x > 0) {
      System.arraycopy(oldKnots, 0, newKnots, 0, x - 1);
      System.arraycopy(oldKnots, x, newKnots, x - 1, n - x);
    } else {
      System.arraycopy(oldKnots, 1, newKnots, 0, n - 1);
    }

    final int newSize = this.size - oldPage.size();
    return newNode(newPages, newKnots, null, newSize);
  }

  @SuppressWarnings("unchecked")
  @Override
  public final BTreePage<K, V, U> drop(int lower, BTreeContext<K, V> tree) {
    if (lower > 0) {
      int newSize = this.size;
      if (lower < newSize) {
        final BTreePage<K, V, U>[] oldPages = this.pages;
        final int k = oldPages.length;
        int x = 0;
        while (x < k) {
          final int childSize = oldPages[x].size();
          if (childSize <= lower) {
            newSize -= childSize;
            lower -= childSize;
            x += 1;
          } else {
            break;
          }
        }
        final int n = k - x;
        if (n > 1) {
          final BTreeNode<K, V, U> newNode;
          if (x > 0) {
            final BTreePage<K, V, U>[] newPages = (BTreePage<K, V, U>[]) new BTreePage<?, ?, ?>[n];
            System.arraycopy(oldPages, x, newPages, 0, n);
            final K[] newKnots = (K[]) new Object[n - 1];
            System.arraycopy(this.knots, x, newKnots, 0, n - 1);
            for (int i = 0; i < newKnots.length; i += 1) {
              newKnots[i] = this.knots[i + x];
            }
            newNode = newNode(newPages, newKnots, null, newSize);
          } else {
            newNode = this;
          }
          if (lower > 0) {
            final BTreePage<K, V, U> oldPage = oldPages[x];
            final BTreePage<K, V, U> newPage = oldPage.drop(lower, tree);
            return newNode.replacedPage(0, newPage, oldPage, tree);
          } else {
            return newNode;
          }
        } else {
          return oldPages[x].drop(lower, tree);
        }
      } else {
        return BTreeLeaf.empty();
      }
    } else {
      return this;
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public final BTreePage<K, V, U> take(int upper, BTreeContext<K, V> tree) {
    if (upper < this.size) {
      if (upper > 0) {
        final BTreePage<K, V, U>[] oldPages = this.pages;
        final int k = oldPages.length;
        int x = 0;
        int newSize = 0;
        while (x < k && upper > 0) {
          final int childSize = oldPages[x].size();
          newSize += childSize;
          x += 1;
          if (childSize <= upper) {
            upper -= childSize;
          } else {
            break;
          }
        }
        final int n = upper == 0 ? x : x + 1;
        if (n > 1) {
          final BTreeNode<K, V, U> newNode;
          if (x < k) {
            final BTreePage<K, V, U>[] newPages = (BTreePage<K, V, U>[]) new BTreePage<?, ?, ?>[n];
            System.arraycopy(oldPages, 0, newPages, 0, n);
            final K[] newKnots = (K[]) new Object[n - 1];
            System.arraycopy(this.knots, 0, newKnots, 0, n - 1);
            newNode = newNode(newPages, newKnots, null, newSize);
          } else {
            newNode = this;
          }
          if (upper > 0) {
            final BTreePage<K, V, U> oldPage = oldPages[x - 1];
            final BTreePage<K, V, U> newPage = oldPage.take(upper, tree);
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
        return BTreeLeaf.empty();
      }
    } else {
      return this;
    }
  }

  @Override
  public final BTreeNode<K, V, U> balanced(BTreeContext<K, V> tree) {
    if (this.pages.length > 1 && tree.pageShouldSplit(this)) {
      final int x = this.knots.length >>> 1;
      return split(x);
    } else {
      return this;
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public final BTreeNode<K, V, U> split(int x) {
    final BTreePage<K, V, U>[] newPages = (BTreePage<K, V, U>[]) new BTreePage<?, ?, ?>[2];
    final BTreeNode<K, V, U> newLeftPage = splitLeft(x);
    final BTreeNode<K, V, U> newRightPage = splitRight(x);
    newPages[0] = newLeftPage;
    newPages[1] = newRightPage;

    final K[] newKnots = (K[]) new Object[1];
    newKnots[0] = newRightPage.minKey();

    return newNode(newPages, newKnots, null, this.size);
  }

  @SuppressWarnings("unchecked")
  @Override
  public final BTreeNode<K, V, U> splitLeft(int x) {
    final BTreePage<K, V, U>[] oldPages = this.pages;
    final BTreePage<K, V, U>[] newPages = (BTreePage<K, V, U>[]) new BTreePage<?, ?, ?>[x + 1];
    System.arraycopy(oldPages, 0, newPages, 0, x + 1);

    final K[] oldKnots = this.knots;
    final K[] newKnots = (K[]) new Object[x];
    System.arraycopy(oldKnots, 0, newKnots, 0, x);

    int newSize = 0;
    for (int i = 0; i <= x; i += 1) {
      newSize += newPages[i].size();
    }

    return newNode(newPages, newKnots, null, newSize);
  }

  @SuppressWarnings("unchecked")
  @Override
  public final BTreeNode<K, V, U> splitRight(int x) {
    final BTreePage<K, V, U>[] oldPages = this.pages;
    final int y = oldPages.length - (x + 1);
    final BTreePage<K, V, U>[] newPages = (BTreePage<K, V, U>[]) new BTreePage<?, ?, ?>[y];
    System.arraycopy(oldPages, x + 1, newPages, 0, y);

    final K[] oldKnots = this.knots;
    final K[] newKnots = (K[]) new Object[y - 1];
    System.arraycopy(oldKnots, x + 1, newKnots, 0, y - 1);

    int newSize = 0;
    for (int i = 0; i < y; i += 1) {
      newSize += newPages[i].size();
    }

    return newNode(newPages, newKnots, null, newSize);
  }

  @SuppressWarnings("unchecked")
  @Override
  public final BTreeNode<K, V, U> reduced(U identity, CombinerFunction<? super V, U> accumulator,
                                          CombinerFunction<U, U> combiner) {
    if (this.fold == null) {
      final BTreePage<K, V, U>[] oldPages = this.pages;
      final int n = oldPages.length;
      final BTreePage<K, V, U>[] newPages = (BTreePage<K, V, U>[]) new BTreePage<?, ?, ?>[n];
      for (int i = 0; i < n; i += 1) {
        newPages[i] = oldPages[i].reduced(identity, accumulator, combiner);
      }
      // assert n > 0;
      U fold = newPages[0].fold();
      for (int i = 1; i < n; i += 1) {
        fold = combiner.combine(fold, newPages[i].fold());
      }
      return newNode(newPages, this.knots, fold, this.size);
    } else {
      return this;
    }
  }

  @Override
  public final OrderedMapCursor<K, V> iterator() {
    return new BTreeNodeCursor<K, V, U>(this.pages);
  }

  @Override
  public final OrderedMapCursor<K, V> lastIterator() {
    return new BTreeNodeCursor<K, V, U>(this.pages, this.size, this.pages.length);
  }

  protected final int lookup(Object key, BTreeContext<K, V> tree) {
    int lo = 0;
    int hi = this.knots.length - 1;
    while (lo <= hi) {
      final int mid = (lo + hi) >>> 1;
      final int order = tree.compareKey(key, this.knots[mid]);
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

  protected BTreeNode<K, V, U> newNode(BTreePage<K, V, U>[] pages, K[] knots, U fold, int size) {
    return new BTreeNode<K, V, U>(pages, knots, fold, size);
  }
}
