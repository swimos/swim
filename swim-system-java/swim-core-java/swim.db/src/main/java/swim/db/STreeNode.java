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

import swim.codec.Output;
import swim.codec.Unicode;
import swim.concurrent.Cont;
import swim.concurrent.Conts;
import swim.recon.Recon;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Value;
import swim.util.CombinerFunction;
import swim.util.Cursor;

public final class STreeNode extends STreePage {
  final STreePageRef pageRef;
  final long version;
  final STreePageRef[] childRefs;
  final long[] knotIndexes;

  protected STreeNode(STreePageRef pageRef, long version,
                      STreePageRef[] childRefs, long[] knotIndexes) {
    this.pageRef = pageRef;
    this.version = version;
    this.childRefs = childRefs;
    this.knotIndexes = knotIndexes;
  }

  @Override
  public boolean isNode() {
    return true;
  }

  @Override
  public STreePageRef pageRef() {
    return this.pageRef;
  }

  @Override
  public PageType pageType() {
    return PageType.NODE;
  }

  @Override
  public long version() {
    return this.version;
  }

  @Override
  public boolean isEmpty() {
    return this.pageRef.span == 0;
  }

  @Override
  public int arity() {
    return this.knotIndexes.length;
  }

  @Override
  public int childCount() {
    return this.childRefs.length;
  }

  @Override
  public STreePageRef getChildRef(int index) {
    return this.childRefs[index];
  }

  @Override
  public STreePage getChild(int index) {
    try {
      return this.childRefs[index].page();
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        throw new StoreException(toDebugString(), cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public boolean contains(Value value) {
    try {
      final STreePageRef[] childRefs = this.childRefs;
      for (int i = 0, n = childRefs.length; i < n; i += 1) {
        if (childRefs[i].page().contains(value)) {
          return true;
        }
      }
      return false;
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        throw new StoreException(toDebugString(), cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public Slot getSlot(int x) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Value get(long index) {
    int x = lookup(index);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    final long i = x == 0 ? index : index - this.knotIndexes[x - 1];
    return getChild(x).get(i);
  }

  @Override
  public Slot getEntry(long index) {
    int x = lookup(index);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    final long i = x == 0 ? index : index - this.knotIndexes[x - 1];
    return getChild(x).getEntry(i);
  }

  int lookup(long index) {
    final long[] knotIndexes = this.knotIndexes;
    int low = 0;
    int high = knotIndexes.length - 1;
    while (low <= high) {
      final int x = (low + high) >>> 1;
      final int order = Long.compare(index, knotIndexes[x]);
      if (order > 0) {
        low = x + 1;
      } else if (order < 0) {
        high = x - 1;
      } else {
        return x;
      }
    }
    return -(low + 1);
  }

  @Override
  public STreePage updated(long index, Value newValue, long newVersion) {
    int x = lookup(index);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    final long i = x == 0 ? index : index - this.knotIndexes[x - 1];
    final STreePage oldPage = getChild(x);
    final STreePage newPage = oldPage.updated(i, newValue, newVersion);
    if (oldPage != newPage) {
      if (oldPage.span() != newPage.span() && this.pageRef.context.pageShouldSplit(newPage)) {
        return updatedPageSplit(x, newPage, oldPage, newVersion);
      } else {
        return updatedPage(x, newPage, oldPage, newVersion);
      }
    } else {
      return this;
    }
  }

  STreeNode updatedPage(int x, STreePage newPage, STreePage oldPage, long newVersion) {
    final STreePageRef[] oldChildRefs = this.childRefs;
    final int n = oldChildRefs.length;
    final STreePageRef[] newChildRefs = new STreePageRef[n];
    System.arraycopy(oldChildRefs, 0, newChildRefs, 0, n);
    newChildRefs[x] = newPage.pageRef();

    final long[] oldKnotIndexes = this.knotIndexes;
    final long[] newKnotIndexes;
    long newSpan;
    if (n - 1 > 0) {
      newKnotIndexes = new long[n - 1];
      if (x > 0) {
        System.arraycopy(oldKnotIndexes, 0, newKnotIndexes, 0, x);
        newSpan = oldKnotIndexes[x - 1];
      } else {
        newSpan = 0L;
      }
      for (int i = x; i < n - 1; i += 1) {
        newSpan += newChildRefs[i].span;
        newKnotIndexes[i] = newSpan;
      }
      newSpan += newChildRefs[n - 1].span;
    } else {
      newKnotIndexes = EMPTY_KNOT_INDEXES;
      newSpan = 0L;
    }

    return create(this.pageRef.context, this.pageRef.stem, newVersion,
                  newSpan, Value.absent(), newChildRefs, newKnotIndexes);
  }

  STreeNode updatedPageSplit(int x, STreePage newPage, STreePage oldPage, long newVersion) {
    final STreePageRef[] oldChildRefs = this.childRefs;
    final int n = oldChildRefs.length + 1;
    final STreePageRef[] newChildRefs = new STreePageRef[n];
    System.arraycopy(oldChildRefs, 0, newChildRefs, 0, x);

    final int y = newPage.arity() >>> 1;
    final STreePage newLeftPage = newPage.splitLeft(y, newVersion);
    final STreePage newRightPage = newPage.splitRight(y, newVersion);
    newChildRefs[x] = newLeftPage.pageRef();
    newChildRefs[x + 1] = newRightPage.pageRef();
    System.arraycopy(oldChildRefs, x + 1, newChildRefs, x + 2, n - (x + 2));

    return create(this.pageRef.context, this.pageRef.stem, newVersion, Value.absent(), newChildRefs);
  }

  STreeNode updatedPageMerge(int x, STreeNode newPage, STreePage oldPage, long newVersion) {
    final STreePageRef[] oldChildRefs = this.childRefs;
    final STreePageRef[] mergePages = newPage.childRefs;
    final int k = mergePages.length;
    final int n = oldChildRefs.length + (k - 1);
    final STreePageRef[] newChildRefs = new STreePageRef[n];
    System.arraycopy(oldChildRefs, 0, newChildRefs, 0, x);
    System.arraycopy(mergePages, 0, newChildRefs, x, k);
    System.arraycopy(oldChildRefs, x + 1, newChildRefs, x + k, n - (x + k));

    return create(this.pageRef.context, this.pageRef.stem, newVersion, Value.absent(), newChildRefs);
  }

  @Override
  public STreePage inserted(long index, Value key, Value newValue, long newVersion) {
    int x = lookup(index);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    final long i = x == 0 ? index : index - this.knotIndexes[x - 1];
    final STreePage oldPage = getChild(x);
    final STreePage newPage = oldPage.inserted(i, key, newValue, newVersion);
    if (oldPage != newPage) {
      if (this.pageRef.context.pageShouldSplit(newPage)) {
        return updatedPageSplit(x, newPage, oldPage, newVersion);
      } else {
        return updatedPage(x, newPage, oldPage, newVersion);
      }
    } else {
      return this;
    }
  }

  @Override
  public STreePage removed(long index, long newVersion) {
    int x = lookup(index);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    final long i = x == 0 ? index : index - this.knotIndexes[x - 1];
    final STreePage oldPage = getChild(x);
    final STreePage newPage = oldPage.removed(i, newVersion);
    if (oldPage != newPage) {
      return replacedPage(x, newPage, oldPage, newVersion);
    } else {
      return this;
    }
  }

  STreePage replacedPage(int x, STreePage newPage, STreePage oldPage, long newVersion) {
    if (!newPage.isEmpty()) {
      if (newPage.isNode() && this.pageRef.context.pageShouldMerge(newPage)) {
        return updatedPageMerge(x, (STreeNode) newPage, oldPage, newVersion);
      } else {
        return updatedPage(x, newPage, oldPage, newVersion);
      }
    } else if (this.childRefs.length > 2) {
      return removedPage(x, newPage, oldPage, newVersion);
    } else if (this.childRefs.length > 1) {
      if (x == 0) {
        return getChild(1);
      } else {
        return getChild(0);
      }
    } else {
      return STreeLeaf.empty(this.pageRef.context, this.pageRef.stem, newVersion);
    }
  }

  STreeNode removedPage(int x, STreePage newPage, STreePage oldPage, long newVersion) {
    final STreePageRef[] oldChildRefs = this.childRefs;
    final int n = oldChildRefs.length - 1;
    final STreePageRef[] newChildRefs = new STreePageRef[n];
    System.arraycopy(oldChildRefs, 0, newChildRefs, 0, x);
    System.arraycopy(oldChildRefs, x + 1, newChildRefs, x, n - x);

    final long[] oldKnotIndexes = this.knotIndexes;
    final long[] newKnotIndexes = new long[n - 1];
    long newSpan;
    if (x > 0) {
      System.arraycopy(oldKnotIndexes, 0, newKnotIndexes, 0, x);
      newSpan = oldKnotIndexes[x - 1];
    } else {
      newSpan = 0L;
    }
    for (int i = x; i < n - 1; i += 1) {
      newSpan += newChildRefs[i].span;
      newKnotIndexes[i] = newSpan;
    }
    newSpan += newChildRefs[n - 1].span;

    return create(this.pageRef.context, this.pageRef.stem, newVersion,
                  newSpan, Value.absent(), newChildRefs, newKnotIndexes);
  }

  @Override
  public STreePage removed(Object object, long newVersion) {
    try {
      final STreePageRef[] childRefs = this.childRefs;
      for (int x = 0, n = childRefs.length; x < n; x += 1) {
        final STreePage oldPage = childRefs[x].page();
        final STreePage newPage = oldPage.removed(object, newVersion);
        if (oldPage != newPage) {
          return replacedPage(x, newPage, oldPage, newVersion);
        }
      }
      return this;
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        throw new StoreException(toDebugString(), cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public STreePage drop(long lower, long newVersion) {
    try {
      if (lower > 0L) {
        if (lower < span()) {
          int x = lookup(lower);
          if (x >= 0) {
            x += 1;
          } else {
            x = -(x + 1);
          }
          final long i = x == 0 ? lower : lower - this.knotIndexes[x - 1];
          final STreePageRef[] oldChildRefs = this.childRefs;
          final int k = oldChildRefs.length;
          final int n = k - x;
          if (n > 1) {
            final STreeNode newNode;
            if (x > 0) {
              final STreePageRef[] newChildRefs = new STreePageRef[n];
              System.arraycopy(oldChildRefs, x, newChildRefs, 0, n);
              newNode = create(this.pageRef.context, this.pageRef.stem, newVersion,
                               Value.absent(), newChildRefs);
            } else {
              newNode = this;
            }
            if (i > 0L) {
              final STreePage oldPage = oldChildRefs[x].page();
              final STreePage newPage = oldPage.drop(i, newVersion);
              return newNode.replacedPage(0, newPage, oldPage, newVersion);
            } else {
              return newNode;
            }
          } else {
            return oldChildRefs[x].page().drop(i, newVersion);
          }
        } else {
          return STreeLeaf.empty(this.pageRef.context, this.pageRef.stem, newVersion);
        }
      } else {
        return this;
      }
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        throw new StoreException(toDebugString(), cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public STreePage take(long upper, long newVersion) {
    try {
      if (upper < span()) {
        if (upper > 0L) {
          int x = lookup(upper);
          if (x >= 0) {
            x += 1;
          } else {
            x = -(x + 1);
          }
          final long i = x == 0 ? upper : upper - this.knotIndexes[x - 1];
          final STreePageRef[] oldChildRefs = this.childRefs;
          final int k = oldChildRefs.length;
          final int n = i == 0 ? x : x + 1;
          if (n > 1) {
            final STreeNode newNode;
            if (x < k) {
              final STreePageRef[] newChildRefs = new STreePageRef[n];
              System.arraycopy(oldChildRefs, 0, newChildRefs, 0, n);
              final long[] newKnotIndexes = new long[n - 1];
              System.arraycopy(this.knotIndexes, 0, newKnotIndexes, 0, n - 1);
              final long newSpan = newKnotIndexes[n - 2] + newChildRefs[n - 1].span;
              newNode = create(this.pageRef.context, this.pageRef.stem, newVersion,
                               newSpan, Value.absent(), newChildRefs, newKnotIndexes);
            } else {
              newNode = this;
            }
            if (i > 0L) {
              final STreePage oldPage = oldChildRefs[x].page();
              final STreePage newPage = oldPage.take(i, newVersion);
              return newNode.replacedPage(x, newPage, oldPage, newVersion);
            } else {
              return newNode;
            }
          } else if (i > 0L) {
            return oldChildRefs[0].page().take(i, newVersion);
          } else {
            return oldChildRefs[0].page();
          }
        } else {
          return STreeLeaf.empty(this.pageRef.context, this.pageRef.stem, newVersion);
        }
      } else {
        return this;
      }
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        throw new StoreException(toDebugString(), cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public long indexOf(Object object) {
    try {
      final STreePageRef[] childRefs = this.childRefs;
      long k = 0;
      for (int x = 0, n = childRefs.length; x < n; x += 1) {
        final STreePage page = childRefs[x].page();
        final long i = page.indexOf(object);
        if (i >= 0L) {
          return k + i;
        }
        k += page.span();
      }
      return -1L;
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        throw new StoreException(toDebugString(), cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public long lastIndexOf(Object object) {
    try {
      final STreePageRef[] childRefs = this.childRefs;
      long k = span();
      for (int x = childRefs.length - 1; x >= 0; x -= 1) {
        final STreePage page = childRefs[x].page();
        final long i = page.lastIndexOf(object);
        k -= page.span();
        if (i >= 0L) {
          return k + 1;
        }
      }
      return -1L;
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        throw new StoreException(toDebugString(), cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public void copyToArray(Object[] array, int offset) {
    try {
      final STreePageRef[] childRefs = this.childRefs;
      for (int x = 0, n = childRefs.length; x < n; x += 1) {
        final STreePage page = childRefs[x].page();
        page.copyToArray(array, offset);
        offset += page.span();
      }
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        throw new StoreException(toDebugString(), cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public STreeNode balanced(long newVersion) {
    if (this.childRefs.length > 1 && this.pageRef.context.pageShouldSplit(this)) {
      final int x = this.knotIndexes.length >>> 1;
      return split(x, newVersion);
    } else {
      return this;
    }
  }

  @Override
  public STreeNode split(int x, long newVersion) {
    final STreePageRef[] newChildRefs = new STreePageRef[2];
    final STreeNode newLeftPage = splitLeft(x, newVersion);
    final STreeNode newRightPage = splitRight(x, newVersion);
    newChildRefs[0] = newLeftPage.pageRef();
    newChildRefs[1] = newRightPage.pageRef();

    final long[] newKnotIndexes = new long[1];
    newKnotIndexes[0] = newLeftPage.span();

    return create(this.pageRef.context, this.pageRef.stem, newVersion,
                  this.pageRef.span, Value.absent(), newChildRefs, newKnotIndexes);
  }

  @Override
  public STreeNode splitLeft(int x, long newVersion) {
    final STreePageRef[] oldChildRefs = this.childRefs;
    final STreePageRef[] newChildRefs = new STreePageRef[x + 1];
    System.arraycopy(oldChildRefs, 0, newChildRefs, 0, x + 1);

    final long[] oldKnotIndexes = this.knotIndexes;
    final long[] newKnotIndexes = new long[x];
    System.arraycopy(oldKnotIndexes, 0, newKnotIndexes, 0, x);

    long newSpan = 0L;
    for (int i = 0; i <= x; i += 1) {
      newSpan += newChildRefs[i].span;
    }

    return create(this.pageRef.context, this.pageRef.stem, newVersion,
                  newSpan, Value.absent(), newChildRefs, newKnotIndexes);
  }

  @Override
  public STreeNode splitRight(int x, long newVersion) {
    final STreePageRef[] oldChildRefs = this.childRefs;
    final int y = oldChildRefs.length - (x + 1);
    final STreePageRef[] newChildRefs = new STreePageRef[y];
    System.arraycopy(oldChildRefs, x + 1, newChildRefs, 0, y);

    final long[] newKnotIndexes = new long[y - 1];
    long newSpan;
    if (y > 0) {
      newSpan = newChildRefs[0].span;
      for (int i = 1; i < y; i += 1) {
        newKnotIndexes[i - 1] = newSpan;
        newSpan += newChildRefs[i].span;
      }
    } else {
      newSpan = 0L;
    }

    return create(this.pageRef.context, this.pageRef.stem, newVersion,
                  newSpan, Value.absent(), newChildRefs, newKnotIndexes);
  }

  @Override
  public int pageSize() {
    return this.pageRef.pageSize();
  }

  @Override
  public int diffSize() {
    return this.pageRef.diffSize();
  }

  @Override
  public long treeSize() {
    return this.pageRef.treeSize();
  }

  @Override
  void memoizeSize(STreePageRef pageRef) {
    int pageSize = 12; // "@snode(stem:"
    pageSize += Recon.sizeOf(Num.from(this.pageRef.stem));
    pageSize += 3; // ",v:"
    pageSize += Recon.sizeOf(Num.from(this.version));
    pageSize += 1; // ')'

    final STreePageRef[] childRefs = this.childRefs;
    final int n = childRefs.length;
    final long[] knotIndexes = this.knotIndexes;
    int diffSize = 0;
    long treeSize = 0L;
    if (n > 0) {
      pageSize += 1; // '{'
      for (int i = 0; i < n; i += 1) {
        if (i > 0) {
          final long index = knotIndexes[i - 1];
          pageSize += 9; // ",@knot(i:"
          pageSize += Recon.sizeOf(Num.from(index));
          pageSize += 2; // "),"
        }
        final STreePageRef childRef = childRefs[i];
        pageSize += childRef.pageRefSize();
        if (this.version == childRef.softVersion()) {
          diffSize += childRef.diffSize();
        }
        treeSize += childRef.treeSize();
      }
      pageSize += 1; // '}'
      pageSize += 1; // '\n'
    }
    diffSize += pageSize;
    treeSize += pageSize;

    pageRef.pageSize = pageSize; // Must match bytes written by writePage
    pageRef.diffSize = diffSize; // Must match bytes written by writeDiff
    pageRef.treeSize = treeSize;
  }

  @Override
  public Value toHeader() {
    final Record header = Record.create(2)
        .slot("stem", this.pageRef.stem)
        .slot("v", this.version);
    return Record.create(1).attr("snode", header);
  }

  @Override
  public Value toValue() {
    final Record record = (Record) toHeader();
    final STreePageRef[] childRefs = this.childRefs;
    final long[] knotIndexes = this.knotIndexes;
    for (int i = 0, n = childRefs.length; i < n; i += 1) {
      if (i > 0) {
        record.add(Record.create(1).attr("knot", Record.create(1).slot("i", knotIndexes[i - 1])));
      }
      record.add(childRefs[i].toValue());
    }
    return record;
  }

  @Override
  public STreeNode reduced(Value identity, CombinerFunction<? super Value, Value> accumulator,
                           CombinerFunction<Value, Value> combiner, long newVersion) {
    final STreePageRef[] oldChildRefs = this.childRefs;
    final int n = oldChildRefs.length;
    final STreePageRef[] newChildRefs = new STreePageRef[n];
    for (int i = 0; i < n; i += 1) {
      newChildRefs[i] = oldChildRefs[i].reduced(identity, accumulator, combiner, newVersion);
    }
    // assert n > 0;
    Value fold = newChildRefs[0].fold();
    for (int i = 1; i < n; i += 1) {
      fold = combiner.combine(fold, newChildRefs[i].fold());
    }
    return create(this.pageRef.context, this.pageRef.stem, newVersion,
                  this.pageRef.span, fold, newChildRefs, this.knotIndexes);
  }

  @Override
  public STreeNode evacuated(int post, long version) {
    final int oldPost = this.pageRef.post;
    if (oldPost != 0 && oldPost < post) {
      final STreePageRef[] oldChildRefs = this.childRefs;
      final int n = oldChildRefs.length;
      final STreePageRef[] newChildRefs = new STreePageRef[n];
      for (int i = 0; i < n; i += 1) {
        final STreePageRef oldChildRef = oldChildRefs[i];
        final STreePageRef newChildRef = oldChildRef.evacuated(post, version);
        newChildRefs[i] = newChildRef;
        if (oldChildRef != newChildRef) {
          i += 1;
          if (i < n) {
            System.arraycopy(oldChildRefs, i, newChildRefs, i, n - i);
          }
          return create(this.pageRef.context, this.pageRef.stem, version,
                        this.pageRef.span, this.pageRef.fold, newChildRefs, this.knotIndexes);
        }
      }
    }
    return this;
  }

  @Override
  public STreeNode committed(int zone, long base, long version) {
    final STreePageRef[] oldChildRefs = this.childRefs;
    final int n = oldChildRefs.length;
    final STreePageRef[] newChildRefs = new STreePageRef[n];

    long step = base;
    for (int i = 0; i < n; i += 1) {
      final STreePageRef oldChildRef = oldChildRefs[i];
      if (!oldChildRef.isCommitted()) {
        final STreePageRef newChildRef = oldChildRef.committed(zone, step, version);
        newChildRefs[i] = newChildRef;
        step += newChildRef.diffSize();
      } else {
        newChildRefs[i] = oldChildRef;
      }
    }

    return create(this.pageRef.context, this.pageRef.stem, version, zone, step,
                  this.pageRef.span, this.pageRef.fold, newChildRefs, this.knotIndexes);
  }

  @Override
  public STreeNode uncommitted(long version) {
    final STreePageRef[] oldChildRefs = this.childRefs;
    final int n = oldChildRefs.length;
    final STreePageRef[] newChildRefs = new STreePageRef[n];
    for (int i = 0; i < n; i += 1) {
      newChildRefs[i] = oldChildRefs[i].uncommitted(version);
    }
    return create(this.pageRef.context, this.pageRef.stem, version,
                  this.pageRef.span, this.pageRef.fold, newChildRefs, this.knotIndexes);
  }

  @Override
  public void writePage(Output<?> output) {
    Recon.write(toHeader(), output);
    writePageContent(output);
    output.write('\n');
  }

  void writePageContent(Output<?> output) {
    final STreePageRef[] childRefs = this.childRefs;
    final int n = childRefs.length;
    final long[] knotIndexes = this.knotIndexes;
    if (n > 0) {
      output.write('{');
      for (int i = 0; i < n; i += 1) {
        if (i > 0) {
          output.write(',').write('@').write('k').write('n').write('o').write('t')
                .write('(').write('i').write(':');
          Recon.write(Num.from(knotIndexes[i - 1]), output);
          output.write(')').write(',');
        }
        childRefs[i].writePageRef(output);
      }
      output.write('}');
    }
  }

  @Override
  public void writeDiff(Output<?> output) {
    final STreePageRef[] childRefs = this.childRefs;
    for (int i = 0, n = childRefs.length; i < n; i += 1) {
      final STreePageRef childRef = childRefs[i];
      if (this.version == childRef.softVersion()) {
        childRef.writeDiff(output);
      }
    }
    writePage(output);
  }

  @Override
  public void loadTreeAsync(PageLoader pageLoader, Cont<Page> cont) {
    try {
      final STreePageRef[] childRefs = this.childRefs;
      if (childRefs.length > 0) {
        childRefs[0].loadTreeAsync(pageLoader, new LoadSubtree(pageLoader, this, 1, cont));
      } else {
        // Call continuation on fresh stack
        this.pageRef.context.stage().execute(Conts.async(cont, this));
      }
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        cont.trap(cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public void soften(long version) {
    final STreePageRef[] childRefs = this.childRefs;
    for (int i = 0, n = childRefs.length; i < n; i += 1) {
      childRefs[i].soften(version);
    }
  }

  @Override
  public Cursor<Slot> cursor() {
    return new STreeNodeDepthCursor(this, Integer.MAX_VALUE);
  }

  @Override
  public Cursor<Slot> depthCursor(int maxDepth) {
    return new STreeNodeDepthCursor(this, maxDepth);
  }

  @Override
  public Cursor<Slot> deltaCursor(long sinceVersion) {
    return new STreeNodeDeltaCursor(this, sinceVersion);
  }

  @Override
  public String toString() {
    final Output<String> output = Unicode.stringOutput(pageSize() - 1); // ignore trailing '\n'
    Recon.write(toHeader(), output);
    writePageContent(output);
    return output.bind();
  }

  static final STreePageRef[] EMPTY_CHILD_REFS = new STreePageRef[0];
  static final long[] EMPTY_KNOT_INDEXES = new long[0];

  public static STreeNode create(PageContext context, int stem, long version,
                                 int post, int zone, long base, long span, Value fold,
                                 STreePageRef[] childRefs, long[] knotIndexes) {
    final STreePageRef pageRef = new STreePageRef(context, PageType.NODE, stem,
                                                  post, zone, base, span, fold);
    final STreeNode page = new STreeNode(pageRef, version, childRefs, knotIndexes);
    pageRef.page = page;
    return page;
  }

  public static STreeNode create(PageContext context, int stem, long version,
                                 int zone, long base, long span, Value fold,
                                 STreePageRef[] childRefs, long[] knotIndexes) {
    int post = zone;
    for (int i = 0, n = childRefs.length; i < n; i += 1) {
      final int childPost = childRefs[i].post;
      if (childPost != 0) {
        post = post == 0 ? childPost : Math.min(post, childPost);
      }
    }
    return create(context, stem, version, post, zone, base, span, fold, childRefs, knotIndexes);
  }

  public static STreeNode create(PageContext context, int stem, long version, long span,
                                 Value fold, STreePageRef[] childRefs, long[] knotIndexes) {
    return create(context, stem, version, 0, 0L, span, fold, childRefs, knotIndexes);
  }

  public static STreeNode create(PageContext context, int stem, long version,
                                 Value fold, STreePageRef[] childRefs) {
    final int n = childRefs.length - 1;
    final long[] knotIndexes = new long[n];
    int post = 0;
    long span = 0;
    for (int i = 0; i < n; i += 1) {
      final STreePageRef childRef = childRefs[i];
      final int childPost = childRef.post;
      if (childPost != 0) {
        post = post == 0 ? childPost : Math.min(post, childPost);
      }
      span += childRef.span;
      knotIndexes[i] = span;
    }
    span += childRefs[n].span;
    return create(context, stem, version, post, 0, 0L, span, fold, childRefs, knotIndexes);
  }

  public static STreeNode fromValue(STreePageRef pageRef, Value value) {
    Throwable cause = null;
    try {
      final Value header = value.header("snode");
      final long version = header.get("v").longValue();
      final Record tail = value.tail();
      final int n = tail.size() >>> 1;
      final STreePageRef[] childRefs = new STreePageRef[n + 1];
      final long[] knotIndexes = new long[n];
      childRefs[0] = STreePageRef.fromValue(pageRef.context, pageRef.stem,
                                            tail.get(0).toValue());
      for (int i = 1; i <= n; i += 1) {
        knotIndexes[i - 1] = tail.get(2 * i - 1).header("knot").get("i").longValue();
        childRefs[i] = STreePageRef.fromValue(pageRef.context, pageRef.stem,
                                              tail.get(2 * i).toValue());
      }
      return new STreeNode(pageRef, version, childRefs, knotIndexes);
    } catch (Throwable error) {
      if (Conts.isNonFatal(error)) {
        cause = error;
      } else {
        throw error;
      }
    }
    final Output<String> message = Unicode.stringOutput("Malformed snode: ");
    Recon.write(value, message);
    throw new StoreException(message.bind(), cause);
  }
}
