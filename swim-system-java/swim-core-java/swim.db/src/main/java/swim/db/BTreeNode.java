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
import swim.util.OrderedMapCursor;

public final class BTreeNode extends BTreePage {
  final BTreePageRef pageRef;
  final long version;
  final BTreePageRef[] childRefs;
  final Value[] knotKeys;

  protected BTreeNode(BTreePageRef pageRef, long version,
                      BTreePageRef[] childRefs, Value[] knotKeys) {
    this.pageRef = pageRef;
    this.version = version;
    this.childRefs = childRefs;
    this.knotKeys = knotKeys;
    for (int i = 0; i < childRefs.length; i += 1) {
      if (childRefs[i] == null) {
        throw new AssertionError();
      }
    }
  }

  @Override
  public boolean isNode() {
    return true;
  }

  @Override
  public BTreePageRef pageRef() {
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
    return this.knotKeys.length;
  }

  @Override
  public int childCount() {
    return this.childRefs.length;
  }

  @Override
  public BTreePageRef getChildRef(int index) {
    return this.childRefs[index];
  }

  @Override
  public BTreePage getChild(int index) {
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
  public Slot getSlot(int x) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Value getKey(int x) {
    return this.knotKeys[x];
  }

  @Override
  public Value minKey() {
    return getChild(0).minKey();
  }

  @Override
  public Value maxKey() {
    return getChild(this.childRefs.length - 1).maxKey();
  }

  int lookup(Value key) {
    final Value[] knotKeys = this.knotKeys;
    int low = 0;
    int high = knotKeys.length - 1;
    while (low <= high) {
      final int x = (low + high) >>> 1;
      final int order = key.compareTo(knotKeys[x]);
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
  public boolean containsKey(Value key) {
    int x = lookup(key);
    if (x > 0) {
      x += 1;
    } else if (x < 0) {
      x = -(x + 1);
    } else {
      return true;
    }
    return getChild(x).containsKey(key);
  }

  @Override
  public boolean containsValue(Value value) {
    try {
      final BTreePageRef[] childRefs = this.childRefs;
      for (int i = 0, n = childRefs.length; i < n; i += 1) {
        if (childRefs[i].page().containsValue(value)) {
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
  public long indexOf(Value key) {
    int x = lookup(key);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    long count = 0L;
    for (int i = 0; i < x; i += 1) {
      count += this.childRefs[x].span();
    }
    try {
      final long index = this.childRefs[x].page().indexOf(key);
      if (index >= 0) {
        return count + index;
      } else {
        return index - count;
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
  public Value get(Value key) {
    int x = lookup(key);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    return getChild(x).get(key);
  }

  @Override
  public Slot getEntry(Value key) {
    int x = lookup(key);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    return getChild(x).getEntry(key);
  }

  @Override
  public Slot getIndex(long index) {
    final BTreePageRef[] childRefs = this.childRefs;
    for (int i = 0, n = childRefs.length; i < n; i += 1) {
      final BTreePageRef childRef = childRefs[i];
      final long k = childRef.span();
      if (index < k) {
        try {
          return childRef.page().getIndex(index);
        } catch (Throwable cause) {
          if (Conts.isNonFatal(cause)) {
            throw new StoreException(toDebugString(), cause);
          } else {
            throw cause;
          }
        }
      } else {
        index -= k;
      }
    }
    return null;
  }

  @Override
  public Slot firstEntry(Value key) {
    int x = lookup(key);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    try {
      return this.childRefs[x].page().firstEntry(key);
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        throw new StoreException(toDebugString(), cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public Slot firstEntry() {
    final BTreePageRef[] childRefs = this.childRefs;
    if (childRefs.length != 0) {
      try {
        return childRefs[0].page().firstEntry();
      } catch (Throwable cause) {
        if (Conts.isNonFatal(cause)) {
          throw new StoreException(toDebugString(), cause);
        } else {
          throw cause;
        }
      }
    } else {
      return null;
    }
  }

  @Override
  public Slot lastEntry() {
    final BTreePageRef[] childRefs = this.childRefs;
    if (childRefs.length != 0) {
      try {
        return childRefs[childRefs.length - 1].page().lastEntry();
      } catch (Throwable cause) {
        if (Conts.isNonFatal(cause)) {
          throw new StoreException(toDebugString(), cause);
        } else {
          throw cause;
        }
      }
    } else {
      return null;
    }
  }

  @Override
  public Slot nextEntry(Value key) {
    int x = lookup(key);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    final BTreePageRef[] childRefs = this.childRefs;
    try {
      Slot entry = childRefs[x].page().nextEntry(key);
      if (entry == null && x + 1 < childRefs.length) {
        entry = childRefs[x + 1].page().nextEntry(key);
      }
      return entry;
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        throw new StoreException(toDebugString(), cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public Slot previousEntry(Value key) {
    int x = lookup(key);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    final BTreePageRef[] childRefs = this.childRefs;
    try {
      Slot entry = childRefs[x].page().previousEntry(key);
      if (entry == null && x > 0) {
        entry = childRefs[x - 1].page().previousEntry(key);
      }
      return entry;
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        throw new StoreException(toDebugString(), cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public BTreePage updated(Value key, Value newValue, long newVersion) {
    int x = lookup(key);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    final BTreePage oldPage = getChild(x);
    final BTreePage newPage = oldPage.updated(key, newValue, newVersion);
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

  BTreeNode updatedPage(int x, BTreePage newPage, BTreePage oldPage, long newVersion) {
    final BTreePageRef[] oldChildRefs = this.childRefs;
    final int n = oldChildRefs.length;
    final BTreePageRef[] newChildRefs = new BTreePageRef[n];
    System.arraycopy(oldChildRefs, 0, newChildRefs, 0, n);
    newChildRefs[x] = newPage.pageRef();

    final Value[] oldKnotKeys = this.knotKeys;
    final Value[] newKnotKeys;
    if (n - 1 > 0) {
      newKnotKeys = new Value[n - 1];
      System.arraycopy(oldKnotKeys, 0, newKnotKeys, 0, n - 1);
      if (x > 0) {
        newKnotKeys[x - 1] = newPage.minKey();
      }
    } else {
      newKnotKeys = EMPTY_KNOT_KEYS;
    }

    final long newSpan = this.pageRef.span - oldPage.span() + newPage.span();
    return create(this.pageRef.context, this.pageRef.stem, newVersion,
                  newSpan, Value.absent(), newChildRefs, newKnotKeys);
  }

  BTreeNode updatedPageSplit(int x, BTreePage newPage, BTreePage oldPage, long newVersion) {
    final BTreePageRef[] oldChildRefs = this.childRefs;
    final int n = oldChildRefs.length + 1;
    final BTreePageRef[] newChildRefs = new BTreePageRef[n];
    System.arraycopy(oldChildRefs, 0, newChildRefs, 0, x);

    final int y = newPage.arity() >>> 1;
    final BTreePage newLeftPage = newPage.splitLeft(y, newVersion);
    final BTreePage newRightPage = newPage.splitRight(y, newVersion);
    newChildRefs[x] = newLeftPage.pageRef();
    newChildRefs[x + 1] = newRightPage.pageRef();
    System.arraycopy(oldChildRefs, x + 1, newChildRefs, x + 2, n - (x + 2));

    final Value[] oldKnotKeys = this.knotKeys;
    final Value[] newKnotKeys = new Value[n - 1];
    if (x > 0) {
      System.arraycopy(oldKnotKeys, 0, newKnotKeys, 0, x - 1);
      newKnotKeys[x - 1] = newLeftPage.minKey();
      newKnotKeys[x] = newRightPage.minKey();
      System.arraycopy(oldKnotKeys, x, newKnotKeys, x + 1, n - (x + 2));
    } else {
      newKnotKeys[0] = newRightPage.minKey();
      System.arraycopy(oldKnotKeys, 0, newKnotKeys, 1, n - 2);
    }

    final long newSpan = this.pageRef.span - oldPage.span() + newPage.span();
    return create(this.pageRef.context, this.pageRef.stem, newVersion,
                  newSpan, Value.absent(), newChildRefs, newKnotKeys);
  }

  BTreeNode updatedPageMerge(int x, BTreeNode newPage, BTreePage oldPage, long newVersion) {
    try {
      final BTreePageRef[] oldChildRefs = this.childRefs;
      final BTreePageRef[] mergePages = newPage.childRefs;
      final int k = mergePages.length;
      final int n = oldChildRefs.length + (k - 1);
      final BTreePageRef[] newChildRefs = new BTreePageRef[n];
      System.arraycopy(oldChildRefs, 0, newChildRefs, 0, x);
      System.arraycopy(mergePages, 0, newChildRefs, x, k);
      System.arraycopy(oldChildRefs, x + 1, newChildRefs, x + k, n - (x + k));

      final Value[] oldKnotKeys = this.knotKeys;
      final Value[] mergeKeys = newPage.knotKeys;
      final Value[] newKnotKeys = new Value[n - 1];
      if (x > 0) {
        System.arraycopy(oldKnotKeys, 0, newKnotKeys, 0, x - 1);
        newKnotKeys[x - 1] = mergePages[0].page().minKey();
        System.arraycopy(mergeKeys, 0, newKnotKeys, x, k - 1);
        System.arraycopy(oldKnotKeys, x, newKnotKeys, x + (k - 1), n - (x + k));
      } else {
        System.arraycopy(mergeKeys, 0, newKnotKeys, 0, k - 1);
        newKnotKeys[k - 1] = oldChildRefs[1].page().minKey();
        System.arraycopy(oldKnotKeys, 1, newKnotKeys, k, n - k - 1);
      }

      final long newSpan = this.pageRef.span - oldPage.span() + newPage.span();
      return create(this.pageRef.context, this.pageRef.stem, newVersion,
                    newSpan, Value.absent(), newChildRefs, newKnotKeys);
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        throw new StoreException(toDebugString(), cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public BTreePage removed(Value key, long newVersion) {
    int x = lookup(key);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    final BTreePage oldPage = getChild(x);
    final BTreePage newPage = oldPage.removed(key, newVersion);
    if (oldPage != newPage) {
      return replacedPage(x, newPage, oldPage, newVersion);
    } else {
      return this;
    }
  }

  BTreePage replacedPage(int x, BTreePage newPage, BTreePage oldPage, long newVersion) {
    if (!newPage.isEmpty()) {
      if (newPage.isNode() && this.pageRef.context.pageShouldMerge(newPage)) {
        return updatedPageMerge(x, (BTreeNode) newPage, oldPage, newVersion);
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
      return BTreeLeaf.empty(this.pageRef.context, this.pageRef.stem, newVersion);
    }
  }

  BTreeNode removedPage(int x, BTreePage newPage, BTreePage oldPage, long newVersion) {
    final BTreePageRef[] oldChildRefs = this.childRefs;
    final int n = oldChildRefs.length - 1;
    final BTreePageRef[] newChildRefs = new BTreePageRef[n];
    System.arraycopy(oldChildRefs, 0, newChildRefs, 0, x);
    System.arraycopy(oldChildRefs, x + 1, newChildRefs, x, n - x);

    final Value[] oldKnotKeys = this.knotKeys;
    final Value[] newKnotKeys = new Value[n - 1];
    if (x > 0) {
      System.arraycopy(oldKnotKeys, 0, newKnotKeys, 0, x - 1);
      System.arraycopy(oldKnotKeys, x, newKnotKeys, x - 1, n - x);
    } else {
      System.arraycopy(oldKnotKeys, 1, newKnotKeys, 0, n - 1);
    }

    final long newSpan = this.pageRef.span - oldPage.span();
    return create(this.pageRef.context, this.pageRef.stem, newVersion,
                  newSpan, Value.absent(), newChildRefs, newKnotKeys);
  }

  @Override
  public BTreePage drop(long lower, long newVersion) {
    try {
      if (lower > 0L) {
        long newSpan = span();
        if (lower < newSpan) {
          final BTreePageRef[] oldChildRefs = this.childRefs;
          final int k = oldChildRefs.length;
          int x = 0;
          while (x < k) {
            final long childSpan = oldChildRefs[x].span();
            if (childSpan <= lower) {
              newSpan -= childSpan;
              lower -= childSpan;
              x += 1;
            } else {
              break;
            }
          }
          final int n = k - x;
          if (n > 1) {
            final BTreeNode newNode;
            if (x > 0) {
              final BTreePageRef[] newChildRefs = new BTreePageRef[n];
              System.arraycopy(oldChildRefs, x, newChildRefs, 0, n);
              final Value[] newKnotKeys = new Value[n - 1];
              System.arraycopy(this.knotKeys, x, newKnotKeys, 0, n - 1);
              newNode = create(this.pageRef.context, this.pageRef.stem, newVersion,
                               newSpan, Value.absent(), newChildRefs, newKnotKeys);
            } else {
              newNode = this;
            }
            if (lower > 0L) {
              final BTreePage oldPage = oldChildRefs[x].page();
              final BTreePage newPage = oldPage.drop(lower, newVersion);
              return newNode.replacedPage(0, newPage, oldPage, newVersion);
            } else {
              return newNode;
            }
          } else {
            return oldChildRefs[x].page().drop(lower, newVersion);
          }
        } else {
          return BTreeLeaf.empty(this.pageRef.context, this.pageRef.stem, newVersion);
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
  public BTreePage take(long upper, long newVersion) {
    try {
      if (upper < span()) {
        if (upper > 0L) {
          final BTreePageRef[] oldChildRefs = this.childRefs;
          final int k = oldChildRefs.length;
          int x = 0;
          long newSpan = 0L;
          while (x < k && upper > 0L) {
            final long childSpan = oldChildRefs[x].span();
            newSpan += childSpan;
            x += 1;
            if (childSpan <= upper) {
              upper -= childSpan;
            } else {
              break;
            }
          }
          final int n = upper == 0 ? x : x + 1;
          if (n > 1) {
            final BTreeNode newNode;
            if (x < k) {
              final BTreePageRef[] newChildRefs = new BTreePageRef[n];
              System.arraycopy(oldChildRefs, 0, newChildRefs, 0, n);
              final Value[] newKnotKeys = new Value[n - 1];
              System.arraycopy(this.knotKeys, 0, newKnotKeys, 0, n - 1);
              newNode = create(this.pageRef.context, this.pageRef.stem, newVersion,
                               newSpan, Value.absent(), newChildRefs, newKnotKeys);
            } else {
              newNode = this;
            }
            if (upper > 0L) {
              final BTreePage oldPage = oldChildRefs[x - 1].page();
              final BTreePage newPage = oldPage.take(upper, newVersion);
              return newNode.replacedPage(x - 1, newPage, oldPage, newVersion);
            } else {
              return newNode;
            }
          } else if (upper > 0L) {
            return oldChildRefs[0].page().take(upper, newVersion);
          } else {
            return oldChildRefs[0].page();
          }
        } else {
          return BTreeLeaf.empty(this.pageRef.context, this.pageRef.stem, newVersion);
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
  public BTreeNode balanced(long newVersion) {
    if (this.childRefs.length > 1 && this.pageRef.context.pageShouldSplit(this)) {
      final int x = this.knotKeys.length >>> 1;
      return split(x, newVersion);
    } else {
      return this;
    }
  }

  @Override
  public BTreeNode split(int x, long newVersion) {
    final BTreePageRef[] newChildRefs = new BTreePageRef[2];
    final BTreeNode newLeftPage = splitLeft(x, newVersion);
    final BTreeNode newRightPage = splitRight(x, newVersion);
    newChildRefs[0] = newLeftPage.pageRef();
    newChildRefs[1] = newRightPage.pageRef();

    final Value[] newKnotKeys = new Value[1];
    newKnotKeys[0] = newRightPage.minKey();

    return create(this.pageRef.context, this.pageRef.stem, newVersion,
                  this.pageRef.span, Value.absent(), newChildRefs, newKnotKeys);
  }

  @Override
  public BTreeNode splitLeft(int x, long newVersion) {
    final BTreePageRef[] oldChildRefs = this.childRefs;
    final BTreePageRef[] newChildRefs = new BTreePageRef[x + 1];
    System.arraycopy(oldChildRefs, 0, newChildRefs, 0, x + 1);

    final Value[] oldKnotKeys = this.knotKeys;
    final Value[] newKnotKeys = new Value[x];
    System.arraycopy(oldKnotKeys, 0, newKnotKeys, 0, x);

    long newSpan = 0L;
    for (int i = 0; i <= x; i += 1) {
      newSpan += newChildRefs[i].span();
    }

    return create(this.pageRef.context, this.pageRef.stem, newVersion,
                  newSpan, Value.absent(), newChildRefs, newKnotKeys);
  }

  @Override
  public BTreeNode splitRight(int x, long newVersion) {
    final BTreePageRef[] oldChildRefs = this.childRefs;
    final int y = oldChildRefs.length - (x + 1);
    final BTreePageRef[] newChildRefs = new BTreePageRef[y];
    System.arraycopy(oldChildRefs, x + 1, newChildRefs, 0, y);

    final Value[] oldKnotKeys = this.knotKeys;
    final Value[] newKnotKeys = new Value[y - 1];
    System.arraycopy(oldKnotKeys, x + 1, newKnotKeys, 0, y - 1);

    long newSpan = 0L;
    for (int i = 0; i < y; i += 1) {
      newSpan += newChildRefs[i].span();
    }

    return create(this.pageRef.context, this.pageRef.stem, newVersion,
                  newSpan, Value.absent(), newChildRefs, newKnotKeys);
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
  void memoizeSize(BTreePageRef pageRef) {
    int pageSize = 12; // "@bnode(stem:"
    pageSize += Recon.sizeOf(Num.from(this.pageRef.stem));
    pageSize += 3; // ",v:"
    pageSize += Recon.sizeOf(Num.from(this.version));
    pageSize += 1; // ')'

    final BTreePageRef[] childRefs = this.childRefs;
    final int n = childRefs.length;
    final Value[] knotKeys = this.knotKeys;
    int diffSize = 0;
    long treeSize = 0L;
    if (n > 0) {
      pageSize += 1; // '{'
      for (int i = 0; i < n; i += 1) {
        if (i > 0) {
          final Value key = knotKeys[i - 1];
          pageSize += 11; // ",@knot(key:"
          pageSize += Recon.sizeOf(key);
          pageSize += 2; // "),"
        }
        final BTreePageRef childRef = childRefs[i];
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
    return Record.create(1).attr("bnode", header);
  }

  @Override
  public Value toValue() {
    final Record record = (Record) toHeader();
    final BTreePageRef[] childRefs = this.childRefs;
    final Value[] knotKeys = this.knotKeys;
    for (int i = 0, n = childRefs.length; i < n; i += 1) {
      if (i > 0) {
        record.add(Record.create(1).attr("knot", Record.create(1).slot("key", knotKeys[i - 1])));
      }
      record.add(childRefs[i].toValue());
    }
    return record;
  }

  @Override
  public BTreeNode reduced(Value identity, CombinerFunction<? super Value, Value> accumulator,
                           CombinerFunction<Value, Value> combiner, long newVersion) {
    final BTreePageRef[] oldChildRefs = this.childRefs;
    final int n = oldChildRefs.length;
    final BTreePageRef[] newChildRefs = new BTreePageRef[n];
    for (int i = 0; i < n; i += 1) {
      newChildRefs[i] = oldChildRefs[i].reduced(identity, accumulator, combiner, newVersion);
    }
    // assert n > 0;
    Value fold = newChildRefs[0].fold();
    for (int i = 1; i < n; i += 1) {
      fold = combiner.combine(fold, newChildRefs[i].fold());
    }
    return create(this.pageRef.context, this.pageRef.stem, newVersion,
                  this.pageRef.span, fold, newChildRefs, this.knotKeys);
  }

  @Override
  public BTreeNode evacuated(int post, long version) {
    final int oldPost = this.pageRef.post;
    if (oldPost != 0 && oldPost < post) {
      final BTreePageRef[] oldChildRefs = this.childRefs;
      final int n = oldChildRefs.length;
      final BTreePageRef[] newChildRefs = new BTreePageRef[n];
      for (int i = 0; i < n; i += 1) {
        final BTreePageRef oldChildRef = oldChildRefs[i];
        final BTreePageRef newChildRef = oldChildRef.evacuated(post, version);
        newChildRefs[i] = newChildRef;
        if (oldChildRef != newChildRef) {
          i += 1;
          if (i < n) {
            System.arraycopy(oldChildRefs, i, newChildRefs, i, n - i);
          }
          return create(this.pageRef.context, this.pageRef.stem, version,
                        this.pageRef.span, this.pageRef.fold, newChildRefs, this.knotKeys);
        }
      }
    }
    return this;
  }

  @Override
  public BTreeNode committed(int zone, long base, long version) {
    final BTreePageRef[] oldChildRefs = this.childRefs;
    final int n = oldChildRefs.length;
    final BTreePageRef[] newChildRefs = new BTreePageRef[n];

    long step = base;
    for (int i = 0; i < n; i += 1) {
      final BTreePageRef oldChildRef = oldChildRefs[i];
      if (!oldChildRef.isCommitted()) {
        final BTreePageRef newChildRef = oldChildRef.committed(zone, step, version);
        newChildRefs[i] = newChildRef;
        step += newChildRef.diffSize();
      } else {
        newChildRefs[i] = oldChildRef;
      }
    }

    return create(this.pageRef.context, this.pageRef.stem, version, zone, step,
                  this.pageRef.span, this.pageRef.fold, newChildRefs, this.knotKeys);
  }

  @Override
  public BTreeNode uncommitted(long version) {
    final BTreePageRef[] oldChildRefs = this.childRefs;
    final int n = oldChildRefs.length;
    final BTreePageRef[] newChildRefs = new BTreePageRef[n];
    for (int i = 0; i < n; i += 1) {
      newChildRefs[i] = oldChildRefs[i].uncommitted(version);
    }
    return create(this.pageRef.context, this.pageRef.stem, version,
                  this.pageRef.span, this.pageRef.fold, newChildRefs, this.knotKeys);
  }

  @Override
  public void writePage(Output<?> output) {
    Recon.write(toHeader(), output);
    writePageContent(output);
    output.write('\n');
  }

  void writePageContent(Output<?> output) {
    final BTreePageRef[] childRefs = this.childRefs;
    final int n = childRefs.length;
    final Value[] knotKeys = this.knotKeys;
    if (n > 0) {
      output.write('{');
      for (int i = 0; i < n; i += 1) {
        if (i > 0) {
          output.write(',').write('@').write('k').write('n').write('o').write('t')
                .write('(').write('k').write('e').write('y').write(':');
          Recon.write(knotKeys[i - 1], output);
          output.write(')').write(',');
        }
        childRefs[i].writePageRef(output);
      }
      output.write('}');
    }
  }

  @Override
  public void writeDiff(Output<?> output) {
    final BTreePageRef[] childRefs = this.childRefs;
    for (int i = 0, n = childRefs.length; i < n; i += 1) {
      final BTreePageRef childRef = childRefs[i];
      if (this.version == childRef.softVersion()) {
        childRef.writeDiff(output);
      }
    }
    writePage(output);
  }

  @Override
  public void loadTreeAsync(PageLoader pageLoader, Cont<Page> cont) {
    try {
      final BTreePageRef[] childRefs = this.childRefs;
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
    final BTreePageRef[] childRefs = this.childRefs;
    for (int i = 0, n = childRefs.length; i < n; i += 1) {
      childRefs[i].soften(version);
    }
  }

  @Override
  public OrderedMapCursor<Value, Value> cursor() {
    return new BTreeNodeDepthCursor(this, Integer.MAX_VALUE);
  }

  @Override
  public OrderedMapCursor<Value, Value> depthCursor(int maxDepth) {
    return new BTreeNodeDepthCursor(this, maxDepth);
  }

  @Override
  public OrderedMapCursor<Value, Value> deltaCursor(long sinceVersion) {
    return new BTreeNodeDeltaCursor(this, sinceVersion);
  }

  @Override
  public String toString() {
    final Output<String> output = Unicode.stringOutput(pageSize() - 1); // ignore trailing '\n'
    Recon.write(toHeader(), output);
    writePageContent(output);
    return output.bind();
  }

  static final BTreePageRef[] EMPTY_CHILD_REFS = new BTreePageRef[0];
  static final Value[] EMPTY_KNOT_KEYS = new Value[0];

  public static BTreeNode create(PageContext context, int stem, long version,
                                 int post, int zone, long base, long span, Value fold,
                                 BTreePageRef[] childRefs, Value[] knotKeys) {
    final BTreePageRef pageRef = new BTreePageRef(context, PageType.NODE, stem,
                                                  post, zone, base, span, fold);
    final BTreeNode page = new BTreeNode(pageRef, version, childRefs, knotKeys);
    pageRef.page = page;
    return page;
  }

  public static BTreeNode create(PageContext context, int stem, long version,
                                 int zone, long base, long span, Value fold,
                                 BTreePageRef[] childRefs, Value[] knotKeys) {
    int post = zone;
    for (int i = 0, n = childRefs.length; i < n; i += 1) {
      final int childPost = childRefs[i].post;
      if (childPost != 0) {
        post = post == 0 ? childPost : Math.min(post, childPost);
      }
    }
    return create(context, stem, version, post, zone, base, span, fold, childRefs, knotKeys);
  }

  public static BTreeNode create(PageContext context, int stem, long version, long span,
                                 Value fold, BTreePageRef[] childRefs, Value[] knotKeys) {
    return create(context, stem, version, 0, 0L, span, fold, childRefs, knotKeys);
  }

  public static BTreeNode fromValue(BTreePageRef pageRef, Value value) {
    Throwable cause = null;
    try {
      final Value header = value.header("bnode");
      final long version = header.get("v").longValue();
      final Record tail = value.tail();
      final int n = tail.size() >>> 1;
      final BTreePageRef[] childRefs = new BTreePageRef[n + 1];
      final Value[] knotKeys = new Value[n];
      childRefs[0] = BTreePageRef.fromValue(pageRef.context, pageRef.stem,
                                            tail.get(0).toValue());
      for (int i = 1; i <= n; i += 1) {
        knotKeys[i - 1] = tail.get(2 * i - 1).header("knot").get("key");
        childRefs[i] = BTreePageRef.fromValue(pageRef.context, pageRef.stem,
                                              tail.get(2 * i).toValue());
      }
      return new BTreeNode(pageRef, version, childRefs, knotKeys);
    } catch (Throwable error) {
      if (Conts.isNonFatal(error)) {
        cause = error;
      } else {
        throw error;
      }
    }
    final Output<String> message = Unicode.stringOutput("Malformed bnode: ");
    Recon.write(value, message);
    throw new StoreException(message.bind(), cause);
  }
}
