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

public final class BTreeLeaf extends BTreePage {
  final BTreePageRef pageRef;
  final long version;
  final Slot[] slots;

  protected BTreeLeaf(BTreePageRef pageRef, long version, Slot[] slots) {
    this.pageRef = pageRef;
    this.version = version;
    this.slots = slots;
  }

  @Override
  public boolean isLeaf() {
    return true;
  }

  @Override
  public BTreePageRef pageRef() {
    return this.pageRef;
  }

  @Override
  public PageType pageType() {
    return PageType.LEAF;
  }

  @Override
  public long version() {
    return this.version;
  }

  @Override
  public boolean isEmpty() {
    return this.slots.length == 0;
  }

  @Override
  public int arity() {
    return this.slots.length;
  }

  @Override
  public int childCount() {
    return 0;
  }

  @Override
  public BTreePageRef getChildRef(int index) {
    throw new IndexOutOfBoundsException(Integer.toString(index));
  }

  @Override
  public BTreePage getChild(int index) {
    throw new IndexOutOfBoundsException(Integer.toString(index));
  }

  @Override
  public Slot getSlot(int x) {
    return this.slots[x];
  }

  @Override
  public Value getKey(int x) {
    return this.slots[x].key();
  }

  @Override
  public Value minKey() {
    return this.slots[0].key();
  }

  @Override
  public Value maxKey() {
    return this.slots[this.slots.length - 1].key();
  }

  int lookup(Value key) {
    final Slot[] slots = this.slots;
    int low = 0;
    int high = slots.length - 1;
    while (low <= high) {
      final int x = (low + high) >>> 1;
      final int order = key.compareTo(slots[x].key());
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
  public long indexOf(Value key) {
    return (long) lookup(key);
  }

  @Override
  public boolean containsKey(Value key) {
    return lookup(key) >= 0;
  }

  @Override
  public boolean containsValue(Value value) {
    final Slot[] slots = this.slots;
    for (int i = 0, n = slots.length; i < n; i += 1) {
      if (value.equals(slots[i].value())) {
        return true;
      }
    }
    return false;
  }

  @Override
  public Value get(Value key) {
    final int x = lookup(key);
    if (x >= 0) {
      return this.slots[x].value();
    } else {
      return Value.absent();
    }
  }

  @Override
  public Slot getEntry(Value key) {
    final int x = lookup(key);
    if (x >= 0) {
      return this.slots[x];
    } else {
      return null;
    }
  }

  @Override
  public Slot getIndex(long index) {
    if (0L <= index && index < this.slots.length) {
      return this.slots[(int) index];
    } else {
      return null;
    }
  }

  @Override
  public Slot firstEntry(Value key) {
    int x = lookup(key);
    if (x >= 0) {
      return this.slots[x];
    } else {
      x = -(x + 1);
      if (0 <= x && x < this.slots.length) {
        return this.slots[x];
      } else {
        return null;
      }
    }
  }

  @Override
  public Slot firstEntry() {
    if (this.slots.length != 0) {
      return this.slots[0];
    } else {
      return null;
    }
  }

  @Override
  public Slot lastEntry() {
    if (this.slots.length != 0) {
      return this.slots[this.slots.length - 1];
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
    if (0 <= x && x < this.slots.length) {
      return this.slots[x];
    } else {
      return null;
    }
  }

  @Override
  public Slot previousEntry(Value key) {
    int x = lookup(key);
    if (x >= 0) {
      x -= 1;
    } else {
      x = -(x + 2);
    }
    if (0 <= x && x < this.slots.length) {
      return this.slots[x];
    } else {
      return null;
    }
  }

  @Override
  public BTreePage updated(Value key, Value newValue, long newVersion) {
    int x = lookup(key);
    if (x >= 0) {
      return updatedSlot(x, key, newValue, newVersion);
    } else {
      x = -(x + 1);
      return insertedSlot(x, key, newValue, newVersion);
    }
  }

  BTreeLeaf updatedSlot(int x, Value key, Value newValue, long newVersion) {
    final Slot[] oldSlots = this.slots;
    final Slot oldSlot = oldSlots[x];
    if (!newValue.equals(oldSlot.value())) {
      final int n = oldSlots.length;
      final Slot[] newSlots = new Slot[n];
      System.arraycopy(oldSlots, 0, newSlots, 0, n);
      newSlots[x] = Slot.of(key, newValue).commit();
      return create(this.pageRef.context, this.pageRef.stem, newVersion, Value.absent(), newSlots);
    } else {
      return this;
    }
  }

  BTreeLeaf insertedSlot(int x, Value key, Value newValue, long newVersion) {
    final Slot[] oldSlots = this.slots;
    final int n = oldSlots.length + 1;
    final Slot[] newSlots = new Slot[n];
    System.arraycopy(oldSlots, 0, newSlots, 0, x);
    newSlots[x] = Slot.of(key, newValue).commit();
    System.arraycopy(oldSlots, x, newSlots, x + 1, n - (x + 1));
    return create(this.pageRef.context, this.pageRef.stem, newVersion, Value.absent(), newSlots);
  }

  @Override
  public BTreeLeaf removed(Value key, long newVersion) {
    final int x = lookup(key);
    if (x >= 0) {
      if (this.slots.length > 1) {
        return removedSlot(x, newVersion);
      } else {
        return empty(this.pageRef.context, this.pageRef.stem, newVersion);
      }
    } else {
      return this;
    }
  }

  BTreeLeaf removedSlot(int x, long newVersion) {
    final Slot[] oldSlots = this.slots;
    final int n = oldSlots.length - 1;
    final Slot[] newSlots = new Slot[n];
    System.arraycopy(oldSlots, 0, newSlots, 0, x);
    System.arraycopy(oldSlots, x + 1, newSlots, x, n - x);
    return create(this.pageRef.context, this.pageRef.stem, newVersion, Value.absent(), newSlots);
  }

  @Override
  public BTreePage drop(long lower, long newVersion) {
    if (lower > 0L) {
      final Slot[] oldSlots = this.slots;
      final int k = oldSlots.length;
      if (lower < k) {
        final int x = (int) lower;
        final int n = k - x;
        final Slot[] newSlots = new Slot[n];
        System.arraycopy(oldSlots, x, newSlots, 0, n);
        return create(this.pageRef.context, this.pageRef.stem, newVersion, Value.absent(), newSlots);
      } else {
        return empty(this.pageRef.context, this.pageRef.stem, newVersion);
      }
    } else {
      return this;
    }
  }

  @Override
  public BTreePage take(long upper, long newVersion) {
    final Slot[] oldSlots = this.slots;
    if (upper < oldSlots.length) {
      if (upper > 0L) {
        final int n = (int) upper;
        final Slot[] newSlots = new Slot[n];
        System.arraycopy(oldSlots, 0, newSlots, 0, n);
        return create(this.pageRef.context, this.pageRef.stem, newVersion, Value.absent(), newSlots);
      } else {
        return empty(this.pageRef.context, this.pageRef.stem, newVersion);
      }
    } else {
      return this;
    }
  }

  @Override
  public BTreePage balanced(long newVersion) {
    final int n = this.slots.length;
    if (n > 1 && this.pageRef.context.pageShouldSplit(this)) {
      final int x = n >>> 1;
      return split(x, newVersion);
    } else {
      return this;
    }
  }

  @Override
  public BTreeNode split(int x, long newVersion) {
    final BTreePageRef[] newChildRefs = new BTreePageRef[2];
    final BTreeLeaf newLeftPage = splitLeft(x, newVersion);
    final BTreeLeaf newRightPage = splitRight(x, newVersion);
    newChildRefs[0] = newLeftPage.pageRef();
    newChildRefs[1] = newRightPage.pageRef();

    final Value[] newKnotKeys = new Value[1];
    newKnotKeys[0] = newRightPage.minKey();

    return BTreeNode.create(this.pageRef.context, this.pageRef.stem, newVersion,
                            this.slots.length, Value.absent(), newChildRefs, newKnotKeys);
  }

  @Override
  public BTreeLeaf splitLeft(int x, long newVersion) {
    final Slot[] oldSlots = this.slots;
    final Slot[] newSlots = new Slot[x];
    System.arraycopy(oldSlots, 0, newSlots, 0, x);
    return create(this.pageRef.context, this.pageRef.stem, newVersion, Value.absent(), newSlots);
  }

  @Override
  public BTreeLeaf splitRight(int x, long newVersion) {
    final Slot[] oldSlots = this.slots;
    final int y = oldSlots.length - x;
    final Slot[] newSlots = new Slot[y];
    System.arraycopy(oldSlots, x, newSlots, 0, y);
    return create(this.pageRef.context, this.pageRef.stem, newVersion, Value.absent(), newSlots);
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
    int pageSize = 12; // "@bleaf(stem:"
    pageSize += Recon.sizeOf(Num.from(this.pageRef.stem));
    pageSize += 3; // ",v:"
    pageSize += Recon.sizeOf(Num.from(this.version));
    pageSize += 1; // ')'

    final Slot[] slots = this.slots;
    final int n = slots.length;
    if (n > 0) {
      pageSize += 1; // '{'
      pageSize += Recon.sizeOf(slots[0]);
      for (int i = 1; i < n; i += 1) {
        pageSize += 1; // ','
        pageSize += Recon.sizeOf(slots[i]);
      }
      pageSize += 1; // '}'
    }

    pageSize += 1; // '\n'
    pageRef.pageSize = pageSize; // Must match bytes written by writePage
    pageRef.diffSize = pageSize; // Must match bytes written by writeDiff
    pageRef.treeSize = pageSize;
  }

  @Override
  public Value toHeader() {
    final Record header = Record.create(2)
        .slot("stem", this.pageRef.stem)
        .slot("v", this.version);
    return Record.create(1).attr("bleaf", header);
  }

  @Override
  public Value toValue() {
    final Record record = (Record) toHeader();
    final Slot[] slots = this.slots;
    for (int i = 0, n = slots.length; i < n; i += 1) {
      record.add(slots[i]);
    }
    return record;
  }

  @Override
  public BTreeLeaf reduced(Value identity, CombinerFunction<? super Value, Value> accumulator,
                           CombinerFunction<Value, Value> combiner, long newVersion) {
    final Slot[] slots = this.slots;
    Value fold = identity;
    for (int i = 0, n = slots.length; i < n; i += 1) {
      fold = accumulator.combine(fold, slots[i].value());
    }
    return create(this.pageRef.context, this.pageRef.stem, newVersion, fold, slots);
  }

  @Override
  public BTreeLeaf evacuated(int post, long version) {
    final int oldPost = this.pageRef.post;
    if (oldPost != 0 && oldPost < post) {
      return create(this.pageRef.context, this.pageRef.stem, version, this.pageRef.fold, this.slots);
    } else {
      return this;
    }
  }

  @Override
  public BTreeLeaf committed(int zone, long base, long version) {
    return create(this.pageRef.context, this.pageRef.stem, version, zone, base, this.pageRef.fold, this.slots);
  }

  @Override
  public BTreeLeaf uncommitted(long version) {
    return create(this.pageRef.context, this.pageRef.stem, version, this.pageRef.fold, this.slots);
  }

  @Override
  public void writePage(Output<?> output) {
    Recon.write(toHeader(), output);
    writePageContent(output);
    output.write('\n');
  }

  void writePageContent(Output<?> output) {
    final Slot[] slots = this.slots;
    final int n = slots.length;
    if (n > 0) {
      output.write('{');
      Recon.write(slots[0], output);
      for (int i = 1; i < n; i += 1) {
        output.write(',');
        Recon.write(slots[i], output);
      }
      output.write('}');
    }
  }

  @Override
  public void writeDiff(Output<?> output) {
    writePage(output);
  }

  @Override
  public void loadTreeAsync(PageLoader pageLoader, Cont<Page> cont) {
    try {
      // Call continuation on fresh stack
      this.pageRef.context.stage().execute(Conts.async(cont, this));
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
    // nop
  }

  @Override
  public OrderedMapCursor<Value, Value> cursor() {
    return new BTreeLeafCursor(this.slots, 0, this.slots.length);
  }

  @Override
  public OrderedMapCursor<Value, Value> depthCursor(int maxDepth) {
    return cursor();
  }

  @Override
  public OrderedMapCursor<Value, Value> deltaCursor(long sinceVersion) {
    if (sinceVersion <= version) {
      return cursor();
    } else {
      return new BTreeLeafCursor(EMPTY_SLOTS, 0, 0);
    }
  }

  @Override
  public String toString() {
    final Output<String> output = Unicode.stringOutput(pageSize() - 1); // ignore trailing '\n'
    Recon.write(toHeader(), output);
    writePageContent(output);
    return output.bind();
  }

  static final Slot[] EMPTY_SLOTS = new Slot[0];

  public static BTreeLeaf create(PageContext context, int stem, long version,
                                 int zone, long base, Value fold, Slot[] slots) {
    final BTreePageRef pageRef = new BTreePageRef(context, PageType.LEAF, stem, zone,
                                                  zone, base, slots.length, fold);
    final BTreeLeaf page = new BTreeLeaf(pageRef, version, slots);
    pageRef.page = page;
    return page;
  }

  public static BTreeLeaf create(PageContext context, int stem, long version,
                                 Value fold, Slot[] slots) {
    return create(context, stem, version, 0, 0L, fold, slots);
  }

  public static BTreeLeaf empty(PageContext context, int stem, long version) {
    return create(context, stem, version, 0, 0L, Value.absent(), EMPTY_SLOTS);
  }

  public static BTreeLeaf fromValue(BTreePageRef pageRef, Value value) {
    Throwable cause = null;
    try {
      final Value header = value.header("bleaf");
      final long version = header.get("v").longValue();
      final Record tail = value.tail();
      final Slot[] slots = new Slot[tail.size()];
      tail.toArray(slots);
      return new BTreeLeaf(pageRef, version, slots);
    } catch (Throwable error) {
      if (Conts.isNonFatal(error)) {
        cause = error;
      } else {
        throw error;
      }
    }
    final Output<String> message = Unicode.stringOutput("Malformed bleaf: ");
    Recon.write(value, message);
    throw new StoreException(message.bind(), cause);
  }
}
