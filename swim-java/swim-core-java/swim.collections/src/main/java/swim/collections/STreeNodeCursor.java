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
import java.util.NoSuchElementException;
import swim.util.Cursor;

final class STreeNodeCursor<T> implements Cursor<Map.Entry<Object, T>> {
  final STreePage<T>[] pages;
  long index;
  int pageIndex;
  Cursor<Map.Entry<Object, T>> pageCursor;

  STreeNodeCursor(STreePage<T>[] pages, long index, int pageIndex, Cursor<Map.Entry<Object, T>> pageCursor) {
    this.pages = pages;
    this.index = index;
    this.pageIndex = pageIndex;
    this.pageCursor = pageCursor;
  }

  STreeNodeCursor(STreePage<T>[] pages, long index, int pageIndex) {
    this(pages, index, pageIndex, null);
  }

  STreeNodeCursor(STreePage<T>[] pages) {
    this(pages, 0L, 0, null);
  }

  long pageSize(STreePage<T> page) {
    return page.size();
  }

  Cursor<Map.Entry<Object, T>> pageCursor(STreePage<T> page) {
    return page.entryIterator();
  }

  Cursor<Map.Entry<Object, T>> reversePageCursor(STreePage<T> page) {
    return page.reverseEntryIterator();
  }

  @Override
  public boolean isEmpty() {
    do {
      if (this.pageCursor != null) {
        if (!this.pageCursor.isEmpty()) {
          return false;
        } else {
          this.pageCursor = null;
        }
      } else if (this.pageIndex < this.pages.length) {
        this.pageCursor = pageCursor(this.pages[this.pageIndex]);
        this.pageIndex += 1;
      } else {
        this.pageIndex = this.pages.length;
        return true;
      }
    } while (true);
  }

  @Override
  public Map.Entry<Object, T> head() {
    do {
      if (this.pageCursor != null) {
        if (!this.pageCursor.isEmpty()) {
          return this.pageCursor.head();
        } else {
          this.pageCursor = null;
        }
      } else {
        if (this.pageIndex < this.pages.length) {
          this.pageCursor = pageCursor(this.pages[this.pageIndex]);
          this.pageIndex += 1;
        } else {
          this.pageIndex = this.pages.length;
          throw new NoSuchElementException();
        }
      }
    } while (true);
  }

  @Override
  public void step() {
    do {
      if (this.pageCursor != null) {
        if (!this.pageCursor.isEmpty()) {
          this.index += 1L;
          return;
        } else {
          this.pageCursor = null;
        }
      } else {
        if (this.pageIndex < this.pages.length) {
          this.pageCursor = pageCursor(this.pages[this.pageIndex]);
          this.pageIndex += 1;
        } else {
          this.pageIndex = this.pages.length;
          throw new UnsupportedOperationException();
        }
      }
    } while (true);
  }

  @Override
  public void skip(long count) {
    while (count > 0L) {
      if (this.pageCursor != null) {
        if (this.pageCursor.hasNext()) {
          this.index += 1L;
          count -= 1L;
          this.pageCursor.next();
        } else {
          this.pageCursor = null;
        }
      } else if (this.pageIndex < this.pages.length) {
        final STreePage<T> page = this.pages[this.pageIndex];
        final long pageSize = pageSize(page);
        this.pageIndex += 1;
        if (pageSize < count) {
          this.pageCursor = pageCursor(page);
          if (count > 0L) {
            this.index += count;
            this.pageCursor.skip(count);
            count = 0L;
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

  @Override
  public boolean hasNext() {
    do {
      if (this.pageCursor != null) {
        if (this.pageCursor.hasNext()) {
          return true;
        } else {
          this.pageCursor = null;
        }
      } else if (this.pageIndex < this.pages.length) {
        this.pageCursor = pageCursor(this.pages[this.pageIndex]);
        this.pageIndex += 1;
      } else {
        this.pageIndex = this.pages.length;
        return false;
      }
    } while (true);
  }

  @Override
  public long nextIndexLong() {
    return this.index;
  }

  @Override
  public Map.Entry<Object, T> next() {
    do {
      if (this.pageCursor != null) {
        if (this.pageCursor.hasNext()) {
          this.index += 1;
          return this.pageCursor.next();
        } else {
          this.pageCursor = null;
        }
      } else {
        if (this.pageIndex < this.pages.length) {
          this.pageCursor = pageCursor(this.pages[this.pageIndex]);
          this.pageIndex += 1;
        } else {
          this.pageIndex = this.pages.length;
          throw new NoSuchElementException();
        }
      }
    } while (true);
  }

  @Override
  public boolean hasPrevious() {
    do {
      if (this.pageCursor != null) {
        if (this.pageCursor.hasPrevious()) {
          return true;
        } else {
          this.pageCursor = null;
        }
      } else if (this.pageIndex > 0) {
        this.pageCursor = reversePageCursor(this.pages[this.pageIndex - 1]);
        this.pageIndex -= 1;
      } else {
        this.pageIndex = 0;
        return false;
      }
    } while (true);
  }

  @Override
  public long previousIndexLong() {
    return this.index - 1L;
  }

  @Override
  public Map.Entry<Object, T> previous() {
    do {
      if (this.pageCursor != null) {
        if (this.pageCursor.hasPrevious()) {
          this.index -= 1;
          return this.pageCursor.previous();
        } else {
          this.pageCursor = null;
        }
      } else if (this.pageIndex > 0) {
        this.pageCursor = reversePageCursor(this.pages[this.pageIndex - 1]);
        this.pageIndex -= 1;
      } else {
        this.pageIndex = 0;
        throw new NoSuchElementException();
      }
    } while (true);
  }

  @Override
  public void set(Map.Entry<Object, T> newValue) {
    this.pageCursor.set(newValue);
  }

  @Override
  public void remove() {
    this.pageCursor.remove();
  }
}
