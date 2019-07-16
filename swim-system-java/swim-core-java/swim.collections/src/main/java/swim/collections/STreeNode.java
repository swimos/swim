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
import swim.util.Cursor;

final class STreeNode<T> extends STreePage<T> {
  final STreePage<T>[] pages;
  final int[] knots;
  final int size;

  STreeNode(STreePage<T>[] pages, int[] knots, int size) {
    this.pages = pages;
    if (knots == null || size < 0) {
      knots = new int[pages.length - 1];
      size = 0;
      for (int i = 0, n = knots.length; i < n; i += 1) {
        size += pages[i].size();
        knots[i] = size;
      }
      size += pages[knots.length].size();
    }
    this.knots = knots;
    this.size = size;
  }

  STreeNode(STreePage<T>[] pages) {
    this(pages, null, -1);
  }

  @Override
  public boolean isEmpty() {
    return this.size == 0;
  }

  @Override
  public int size() {
    return this.size;
  }

  @Override
  public int arity() {
    return this.pages.length;
  }

  @Override
  public boolean contains(Object value) {
    final STreePage<T>[] pages = this.pages;
    for (int i = 0, n = pages.length; i < n; i += 1) {
      if (pages[i].contains(value)) {
        return true;
      }
    }
    return false;
  }

  @Override
  public int indexOf(Object object) {
    final STreePage<T>[] pages = this.pages;
    int k = 0;
    for (int x = 0, n = pages.length; x < n; x += 1) {
      final STreePage<T> page = pages[x];
      final int i = page.indexOf(object);
      if (i >= 0) {
        return k + i;
      }
      k += page.size();
    }
    return -1;
  }

  @Override
  public int lastIndexOf(Object object) {
    final STreePage<T>[] pages = this.pages;
    int k = this.size;
    for (int x = pages.length - 1; x >= 0; x -= 1) {
      final STreePage<T> page = pages[x];
      final int i = page.lastIndexOf(object);
      k -= page.size();
      if (i >= 0) {
        return k + 1;
      }
    }
    return -1;
  }

  @Override
  public T get(int index) {
    int x = lookup(index);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    final int i = x == 0 ? index : index - this.knots[x - 1];
    return this.pages[x].get(i);
  }

  @Override
  public Map.Entry<Object, T> getEntry(int index) {
    int x = lookup(index);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    final int i = x == 0 ? index : index - this.knots[x - 1];
    return this.pages[x].getEntry(i);
  }

  @Override
  public STreeNode<T> updated(int index, T newValue, STreeContext<T> tree) {
    int x = lookup(index);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    final int i = x == 0 ? index : index - this.knots[x - 1];
    final STreePage<T> oldPage = this.pages[x];
    final STreePage<T> newPage = oldPage.updated(i, newValue, tree);
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
  private STreeNode<T> updatedPage(int x, STreePage<T> newPage, STreePage<T> oldPage) {
    final STreePage<T>[] oldPages = this.pages;
    final int n = oldPages.length;
    final STreePage<T>[] newPages = (STreePage<T>[]) new STreePage<?>[n];
    System.arraycopy(oldPages, 0, newPages, 0, n);
    newPages[x] = newPage;

    final int[] oldKnots = this.knots;
    final int[] newKnots;
    int newSize;
    if (n - 1 > 0) {
      newKnots = new int[n - 1];
      if (x > 0) {
        System.arraycopy(oldKnots, 0, newKnots, 0, x);
        newSize = oldKnots[x - 1];
      } else {
        newSize = 0;
      }
      for (int i = x; i < n - 1; i += 1) {
        newSize += newPages[i].size();
        newKnots[i] = newSize;
      }
      newSize += newPages[n - 1].size();
    } else {
      newKnots = new int[0];
      newSize = 0;
    }

    return new STreeNode<T>(newPages, newKnots, newSize);
  }

  @SuppressWarnings("unchecked")
  private STreeNode<T> updatedPageSplit(int x, STreePage<T> newPage, STreePage<T> oldPage) {
    final STreePage<T>[] oldPages = this.pages;
    final int n = oldPages.length + 1;
    final STreePage<T>[] newPages = (STreePage<T>[]) new STreePage<?>[n];
    System.arraycopy(oldPages, 0, newPages, 0, x);

    final int y = newPage.arity() >>> 1;
    final STreePage<T> newLeftPage = newPage.splitLeft(y);
    final STreePage<T> newRightPage = newPage.splitRight(y);
    newPages[x] = newLeftPage;
    newPages[x + 1] = newRightPage;
    System.arraycopy(oldPages, x + 1, newPages, x + 2, n - (x + 2));

    return new STreeNode<T>(newPages);
  }

  @SuppressWarnings("unchecked")
  private STreeNode<T> updatedPageMerge(int x, STreeNode<T> newPage, STreePage<T> oldPage) {
    final STreePage<T>[] oldPages = this.pages;
    final STreePage<T>[] midPages = newPage.pages;
    final int k = midPages.length;
    final int n = oldPages.length + (k - 1);
    final STreePage<T>[] newPages = (STreePage<T>[]) new STreePage<?>[n];
    System.arraycopy(oldPages, 0, newPages, 0, x);
    System.arraycopy(midPages, 0, newPages, x, k);
    System.arraycopy(oldPages, x + 1, newPages, x + k, n - (x + k));

    return new STreeNode<T>(newPages);
  }

  @Override
  public STreeNode<T> inserted(int index, T newValue, Object id, STreeContext<T> tree) {
    int x = lookup(index);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    final int i = x == 0 ? index : index - this.knots[x - 1];
    final STreePage<T> oldPage = this.pages[x];
    final STreePage<T> newPage = oldPage.inserted(i, newValue, id, tree);
    if (oldPage != newPage) {
      if (tree.pageShouldSplit(newPage)) {
        return updatedPageSplit(x, newPage, oldPage);
      } else {
        return updatedPage(x, newPage, oldPage);
      }
    } else {
      return this;
    }
  }

  @Override
  public STreePage<T> removed(int index, STreeContext<T> tree) {
    int x = lookup(index);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    final int i = x == 0 ? index : index - this.knots[x - 1];
    final STreePage<T> oldPage = this.pages[x];
    final STreePage<T> newPage = oldPage.removed(i, tree);
    if (oldPage != newPage) {
      return replacedPage(x, newPage, oldPage, tree);
    } else {
      return this;
    }
  }

  private STreePage<T> replacedPage(int x, STreePage<T> newPage,
                                    STreePage<T> oldPage, STreeContext<T> tree) {
    if (!newPage.isEmpty()) {
      if (newPage instanceof STreeNode<?> && tree.pageShouldMerge(newPage)) {
        return updatedPageMerge(x, (STreeNode<T>) newPage, oldPage);
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
      return STreeLeaf.empty();
    }
  }

  @SuppressWarnings("unchecked")
  private STreeNode<T> removedPage(int x, STreePage<T> newPage, STreePage<T> oldPage) {
    final STreePage<T>[] oldPages = this.pages;
    final int n = oldPages.length - 1;
    final STreePage<T>[] newPages = (STreePage<T>[]) new STreePage<?>[n];
    System.arraycopy(oldPages, 0, newPages, 0, x);
    System.arraycopy(oldPages, x + 1, newPages, x, n - x);

    final int[] oldKnots = this.knots;
    final int[] newKnots = new int[n - 1];
    int newSize;
    if (x > 0) {
      System.arraycopy(oldKnots, 0, newKnots, 0, x);
      newSize = oldKnots[x - 1];
    } else {
      newSize = 0;
    }
    for (int i = x; i < n - 1; i += 1) {
      newSize += newPages[i].size();
      newKnots[i] = newSize;
    }
    newSize += newPages[n - 1].size();

    return new STreeNode<T>(newPages, newKnots, newSize);
  }

  @Override
  public STreePage<T> removed(Object value, STreeContext<T> tree) {
    final STreePage<T>[] pages = this.pages;
    for (int x = 0, n = pages.length; x < n; x += 1) {
      final STreePage<T> oldPage = pages[x];
      final STreePage<T> newPage = oldPage.removed(value, tree);
      if (oldPage != newPage) {
        return replacedPage(x, newPage, oldPage, tree);
      }
    }
    return this;
  }

  @SuppressWarnings("unchecked")
  @Override
  public STreePage<T> drop(int lower, STreeContext<T> tree) {
    if (lower > 0) {
      if (lower < this.size) {
        int x = lookup(lower);
        if (x >= 0) {
          x += 1;
        } else {
          x = -(x + 1);
        }
        final int i = x == 0 ? lower : lower - this.knots[x - 1];
        final STreePage<T>[] oldPages = this.pages;
        final int k = oldPages.length;
        final int n = k - x;
        if (n > 1) {
          final STreeNode<T> newNode;
          if (x > 0) {
            final STreePage<T>[] newPages = (STreePage<T>[]) new STreePage<?>[n];
            System.arraycopy(oldPages, x, newPages, 0, n);
            newNode = new STreeNode<T>(newPages);
          } else {
            newNode = this;
          }
          if (i > 0) {
            final STreePage<T> oldPage = oldPages[x];
            final STreePage<T> newPage = oldPage.drop(i, tree);
            return newNode.replacedPage(0, newPage, oldPage, tree);
          } else {
            return newNode;
          }
        } else {
          return oldPages[x].drop(i, tree);
        }
      } else {
        return STreeLeaf.empty();
      }
    } else {
      return this;
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public STreePage<T> take(int upper, STreeContext<T> tree) {
    if (upper < this.size) {
      if (upper > 0) {
        int x = lookup(upper);
        if (x >= 0) {
          x += 1;
        } else {
          x = -(x + 1);
        }
        final int i = x == 0 ? upper : upper - this.knots[x - 1];
        final STreePage<T>[] oldPages = this.pages;
        final int k = oldPages.length;
        final int n = i == 0 ? x : x + 1;
        if (n > 1) {
          final STreeNode<T> newNode;
          if (x < k) {
            final STreePage<T>[] newPages = (STreePage<T>[]) new STreePage<?>[n];
            System.arraycopy(oldPages, 0, newPages, 0, n);
            final int[] newKnots = new int[n - 1];
            System.arraycopy(this.knots, 0, newKnots, 0, n - 1);
            final int newSize = newKnots[n - 2] + newPages[n - 1].size();
            newNode = new STreeNode<T>(newPages, newKnots, newSize);
          } else {
            newNode = this;
          }
          if (i > 0) {
            final STreePage<T> oldPage = oldPages[x];
            final STreePage<T> newPage = oldPage.take(i, tree);
            return newNode.replacedPage(x, newPage, oldPage, tree);
          } else {
            return newNode;
          }
        } else if (i > 0) {
          return oldPages[0].take(i, tree);
        } else {
          return oldPages[0];
        }
      } else {
        return STreeLeaf.empty();
      }
    } else {
      return this;
    }
  }

  @Override
  public STreeNode<T> balanced(STreeContext<T> tree) {
    if (this.pages.length > 1 && tree.pageShouldSplit(this)) {
      final int x = this.knots.length >>> 1;
      return split(x);
    } else {
      return this;
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public STreeNode<T> split(int x) {
    final STreePage<T>[] newPages = (STreePage<T>[]) new STreePage<?>[2];
    final STreeNode<T> newLeftPage = splitLeft(x);
    final STreeNode<T> newRightPage = splitRight(x);
    newPages[0] = newLeftPage;
    newPages[1] = newRightPage;

    final int[] newKnots = new int[1];
    newKnots[0] = newLeftPage.size();

    return new STreeNode<T>(newPages, newKnots, this.size);
  }

  @SuppressWarnings("unchecked")
  @Override
  public STreeNode<T> splitLeft(int x) {
    final STreePage<T>[] oldPages = this.pages;
    final STreePage<T>[] newPages = (STreePage<T>[]) new STreePage<?>[x + 1];
    System.arraycopy(oldPages, 0, newPages, 0, x + 1);

    final int[] oldKnots = this.knots;
    final int[] newKnots = new int[x];
    System.arraycopy(oldKnots, 0, newKnots, 0, x);

    int newSize = 0;
    for (int i = 0; i <= x; i += 1) {
      newSize += newPages[i].size();
    }

    return new STreeNode<T>(newPages, newKnots, newSize);
  }

  @SuppressWarnings("unchecked")
  @Override
  public STreeNode<T> splitRight(int x) {
    final STreePage<T>[] oldPages = this.pages;
    final int y = oldPages.length - (x + 1);
    final STreePage<T>[] newPages = (STreePage<T>[]) new STreePage<?>[y];
    System.arraycopy(oldPages, x + 1, newPages, 0, y);

    final int[] newKnots = new int[y - 1];
    int newSize;
    if (y > 0) {
      newSize = newPages[0].size();
      for (int i = 1; i < y; i += 1) {
        newKnots[i - 1] = newSize;
        newSize += newPages[i].size();
      }
    } else {
      newSize = 0;
    }

    return new STreeNode<T>(newPages, newKnots, newSize);
  }

  @Override
  public void copyToArray(Object[] array, int offset) {
    final STreePage<T>[] pages = this.pages;
    for (int x = 0, n = pages.length; x < n; x += 1) {
      final STreePage<T> page = pages[x];
      page.copyToArray(array, offset);
      offset += page.size();
    }
  }

  @Override
  public Cursor<Map.Entry<Object, T>> entryIterator() {
    return new STreeNodeCursor<T>(this.pages);
  }

  @Override
  public Cursor<Map.Entry<Object, T>> reverseEntryIterator() {
    return new STreeNodeCursor<T>(this.pages, this.size, this.pages.length);
  }

  private int lookup(int index) {
    int lo = 0;
    int hi = this.knots.length - 1;
    while (lo <= hi) {
      final int mid = (lo + hi) >>> 1;
      if (index > this.knots[mid]) {
        lo = mid + 1;
      } else if (index < this.knots[mid]) {
        hi = mid - 1;
      } else {
        return mid;
      }
    }
    return -(lo + 1);
  }
}
