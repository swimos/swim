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

package swim.db;

import java.util.NoSuchElementException;
import swim.concurrent.Sync;
import swim.structure.Slot;
import swim.util.Cursor;

abstract class STreeNodeCursor implements Cursor<Slot> {
  final STreeNode page;
  long index;
  int childIndex;
  Cursor<Slot> childCursor;

  STreeNodeCursor(STreeNode page, long index, int childIndex) {
    this.page = page;
    this.index = index;
    this.childIndex = childIndex;
  }

  STreeNodeCursor(STreeNode page) {
    this(page, 0L, 0);
  }

  abstract Cursor<Slot> childCursor(STreePageRef childRef);

  @Override
  public final boolean isEmpty() {
    do {
      final Cursor<Slot> childCursor = this.childCursor;
      if (childCursor != null) {
        if (childCursor.hasNext()) {
          return false;
        } else {
          this.childCursor = null;
        }
      } else {
        final STreePageRef[] childRefs = this.page.childRefs;
        final int childIndex = this.childIndex;
        if (childIndex < childRefs.length) {
          this.childCursor = childCursor(childRefs[childIndex]);
          this.childIndex = childIndex + 1;
        } else {
          return true;
        }
      }
    } while (true);
  }

  @Override
  public final Slot head() {
    do {
      final Cursor<Slot> childCursor = this.childCursor;
      if (childCursor != null) {
        if (childCursor.hasNext()) {
          return childCursor.head();
        } else {
          this.childCursor = null;
        }
      } else {
        final STreePageRef[] childRefs = this.page.childRefs;
        final int childIndex = this.childIndex;
        if (childIndex < childRefs.length) {
          this.childCursor = childCursor(childRefs[childIndex]);
          this.childIndex = childIndex + 1;
        } else {
          throw new NoSuchElementException();
        }
      }
    } while (true);
  }

  @Override
  public final void step() {
    do {
      final Cursor<Slot> childCursor = this.childCursor;
      if (childCursor != null) {
        if (childCursor.hasNext()) {
          this.index += 1L;
          return;
        } else {
          this.childCursor = null;
        }
      } else {
        final STreePageRef[] childRefs = this.page.childRefs;
        final int childIndex = this.childIndex;
        if (childIndex < childRefs.length) {
          this.childCursor = childCursor(childRefs[childIndex]);
          this.childIndex = childIndex + 1;
        } else {
          throw new UnsupportedOperationException();
        }
      }
    } while (true);
  }

  @Override
  public final void skip(long count) {
    while (count > 0L) {
      final Cursor<Slot> childCursor = this.childCursor;
      if (childCursor != null) {
        if (childCursor.hasNext()) {
          this.index += 1L;
          count -= 1L;
          childCursor.next();
        } else {
          this.childCursor = null;
        }
      } else {
        final STreePageRef[] childRefs = this.page.childRefs;
        final int childIndex = this.childIndex;
        if (childIndex < childRefs.length) {
          final STreePageRef childRef = childRefs[childIndex];
          final long childSpan = childRef.span;
          this.childIndex = childIndex + 1;
          if (childSpan < count) {
            this.childCursor = childCursor(childRef);
            if (count > 0L) {
              this.index += count;
              this.childCursor.skip(count);
              count = 0L;
            }
            break;
          } else {
            this.index += childSpan;
            count -= childSpan;
          }
        } else {
          break;
        }
      }
    }
  }

  @Override
  public final boolean hasNext() {
    do {
      final Cursor<Slot> childCursor = this.childCursor;
      if (childCursor != null) {
        if (childCursor.hasNext()) {
          return true;
        } else {
          this.childCursor = null;
        }
      } else {
        final STreePageRef[] childRefs = this.page.childRefs;
        final int childIndex = this.childIndex;
        if (childIndex < childRefs.length) {
          this.childCursor = childCursor(childRefs[childIndex]);
          this.childIndex = childIndex + 1;
        } else {
          return false;
        }
      }
    } while (true);
  }

  @Override
  public final long nextIndexLong() {
    return this.index;
  }

  @Override
  public final Slot next() {
    do {
      final Cursor<Slot> childCursor = this.childCursor;
      if (childCursor != null) {
        if (childCursor.hasNext()) {
          this.index += 1L;
          return childCursor.next();
        } else {
          this.childCursor = null;
        }
      } else {
        final STreePageRef[] childRefs = this.page.childRefs;
        final int childIndex = this.childIndex;
        if (childIndex < childRefs.length) {
          this.childCursor = childCursor(childRefs[childIndex]);
          this.childIndex = childIndex + 1;
        } else {
          throw new NoSuchElementException();
        }
      }
    } while (true);
  }

  @Override
  public final boolean hasPrevious() {
    do {
      final Cursor<Slot> childCursor = this.childCursor;
      if (childCursor != null) {
        if (childCursor.hasPrevious()) {
          return true;
        } else {
          this.childCursor = null;
        }
      } else {
        final STreePageRef[] childRefs = this.page.childRefs;
        final int childIndex = this.childIndex - 1;
        if (childIndex >= 0) {
          this.childCursor = childCursor(childRefs[childIndex]);
          this.childIndex = childIndex;
        } else {
          return false;
        }
      }
    } while (true);
  }

  @Override
  public final long previousIndexLong() {
    return this.index - 1L;
  }

  @Override
  public final Slot previous() {
    do {
      final Cursor<Slot> childCursor = this.childCursor;
      if (childCursor != null) {
        if (childCursor.hasPrevious()) {
          this.index -= 1L;
          return childCursor.previous();
        } else {
          this.childCursor = null;
        }
      } else {
        final STreePageRef[] childRefs = this.page.childRefs;
        final int childIndex = this.childIndex - 1;
        if (childIndex < childRefs.length) {
          this.childCursor = childCursor(childRefs[childIndex]);
          this.childIndex = childIndex;
        } else {
          throw new NoSuchElementException();
        }
      }
    } while (true);
  }

  @Override
  public void load() throws InterruptedException {
    final Sync<Page> syncPage = new Sync<Page>();
    page.pageRef.loadTreeAsync(false, syncPage);
    syncPage.await(page.pageRef.settings().pageLoadTimeout);
  }
}
