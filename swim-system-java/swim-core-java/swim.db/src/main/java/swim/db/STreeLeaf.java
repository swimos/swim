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

public final class STreeLeaf extends STreePage {
  final STreePageRef pageRef;
  final long version;
  final Slot[] slots;

  protected STreeLeaf(STreePageRef pageRef, long version, Slot[] slots) {
    this.pageRef = pageRef;
    this.version = version;
    this.slots = slots;
  }

  @Override
  public boolean isLeaf() {
    return true;
  }

  @Override
  public STreePageRef pageRef() {
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
  public STreePageRef getChildRef(int index) {
    throw new IndexOutOfBoundsException(Integer.toString(index));
  }

  @Override
  public STreePage getChild(int index) {
    throw new IndexOutOfBoundsException(Integer.toString(index));
  }

  @Override
  public boolean contains(Value value) {
    final Slot[] slots = this.slots;
    for (int i = 0, n = slots.length; i < n; i += 1) {
      if (value.equals(slots[i].value())) {
        return true;
      }
    }
    return false;
  }

  @Override
  public Slot getSlot(int x) {
    return this.slots[x];
  }

  @Override
  public Value get(long index) {
    if (0L <= index && index < this.slots.length) {
      return this.slots[(int) index].value();
    } else {
      return Value.absent();
    }
  }

  @Override
  public Slot getEntry(long index) {
    if (0L <= index && index < this.slots.length) {
      return this.slots[(int) index];
    } else {
      return null;
    }
  }

  @Override
  public STreePage updated(long index, Value newValue, long newVersion) {
    if (0L <= index && index < this.slots.length) {
      return updatedSlot((int) index, newValue, newVersion);
    } else {
      throw new IndexOutOfBoundsException();
    }
  }

  STreeLeaf updatedSlot(int index, Value newValue, long newVersion) {
    final Slot[] oldSlots = this.slots;
    final Slot oldSlot = oldSlots[index];
    if (!newValue.equals(oldSlot.value())) {
      final int n = oldSlots.length;
      final Slot[] newSlots = new Slot[n];
      System.arraycopy(oldSlots, 0, newSlots, 0, n);
      newSlots[index] = oldSlot.updatedValue(newValue).commit();
      return create(this.pageRef.context, this.pageRef.stem, newVersion, Value.absent(), newSlots);
    } else {
      return this;
    }
  }

  @Override
  public STreePage inserted(long index, Value key, Value newValue, long newVersion) {
    if (0L <= index && index <= this.slots.length) {
      return insertedSlot((int) index, key, newValue, newVersion);
    } else {
      throw new IndexOutOfBoundsException();
    }
  }

  STreeLeaf insertedSlot(int index, Value key, Value newValue, long newVersion) {
    final Slot[] oldSlots = this.slots;
    final int n = oldSlots.length + 1;
    final Slot[] newSlots = new Slot[n];
    System.arraycopy(oldSlots, 0, newSlots, 0, index);
    newSlots[index] = Slot.of(key, newValue).commit();
    System.arraycopy(oldSlots, index, newSlots, index + 1, n - (index + 1));
    return create(this.pageRef.context, this.pageRef.stem, newVersion, Value.absent(), newSlots);
  }

  @Override
  public STreeLeaf removed(long index, long newVersion) {
    if (0L <= index && index < this.slots.length) {
      if (this.slots.length > 1) {
        return removedSlot((int) index, newVersion);
      } else {
        return empty(this.pageRef.context, this.pageRef.stem, newVersion);
      }
    } else {
      throw new IndexOutOfBoundsException();
    }
  }

  STreeLeaf removedSlot(int index, long newVersion) {
    final Slot[] oldSlots = this.slots;
    final int n = oldSlots.length - 1;
    final Slot[] newSlots = new Slot[n];
    System.arraycopy(oldSlots, 0, newSlots, 0, index);
    System.arraycopy(oldSlots, index + 1, newSlots, index, n - index);
    return create(this.pageRef.context, this.pageRef.stem, newVersion, Value.absent(), newSlots);
  }

  @Override
  public STreeLeaf removed(Object object, long newVersion) {
    final int i = (int) indexOf(object);
    if (i >= 0) {
      if (this.slots.length > 1) {
        return removedSlot(i, newVersion);
      } else {
        return empty(this.pageRef.context, this.pageRef.stem, newVersion);
      }
    } else {
      return this;
    }
  }

  @Override
  public STreePage drop(long lower, long newVersion) {
    if (lower > 0L) {
      final Slot[] slots = this.slots;
      final int k = slots.length;
      if (lower < k) {
        final int x = (int) lower;
        final int n = k - x;
        final Slot[] newSlots = new Slot[n];
        System.arraycopy(slots, x, newSlots, 0, n);
        return create(this.pageRef.context, this.pageRef.stem, newVersion, Value.absent(), newSlots);
      } else {
        return empty(this.pageRef.context, this.pageRef.stem, newVersion);
      }
    } else {
      return this;
    }
  }

  @Override
  public STreePage take(long upper, long newVersion) {
    final Slot[] slots = this.slots;
    if (upper < slots.length) {
      if (upper > 0L) {
        final int n = (int) upper;
        final Slot[] newSlots = new Slot[n];
        System.arraycopy(slots, 0, newSlots, 0, n);
        return create(this.pageRef.context, this.pageRef.stem, newVersion, Value.absent(), newSlots);
      } else {
        return empty(this.pageRef.context, this.pageRef.stem, newVersion);
      }
    } else {
      return this;
    }
  }

  @Override
  public long indexOf(Object object) {
    final Slot[] slots = this.slots;
    for (int i = 0, n = slots.length; i < n; i += 1) {
      if (object.equals(slots[i])) {
        return i;
      }
    }
    return -1L;
  }

  @Override
  public long lastIndexOf(Object object) {
    final Slot[] slots = this.slots;
    for (int i = slots.length - 1; i >= 0; i -= 1) {
      if (object.equals(slots[i])) {
        return i;
      }
    }
    return -1L;
  }

  @Override
  public void copyToArray(Object[] array, int offset) {
    final Slot[] slots = this.slots;
    System.arraycopy(slots, 0, array, offset, slots.length);
  }

  @Override
  public STreePage balanced(long newVersion) {
    final int n = this.slots.length;
    if (n > 1 && this.pageRef.context.pageShouldSplit(this)) {
      final int x = n >>> 1;
      return split(x, newVersion);
    } else {
      return this;
    }
  }

  @Override
  public STreeNode split(int x, long newVersion) {
    final STreePageRef[] newChildRefs = new STreePageRef[2];
    final STreeLeaf newLeftPage = splitLeft(x, newVersion);
    final STreeLeaf newRightPage = splitRight(x, newVersion);
    newChildRefs[0] = newLeftPage.pageRef();
    newChildRefs[1] = newRightPage.pageRef();

    final long[] newKnotIndexes = new long[1];
    newKnotIndexes[0] = x;

    return STreeNode.create(this.pageRef.context, this.pageRef.stem, newVersion,
                            this.slots.length, Value.absent(), newChildRefs, newKnotIndexes);
  }

  @Override
  public STreeLeaf splitLeft(int x, long newVersion) {
    final Slot[] oldSlots = this.slots;
    final Slot[] newSlots = new Slot[x];
    System.arraycopy(oldSlots, 0, newSlots, 0, x);
    return create(this.pageRef.context, this.pageRef.stem, newVersion, Value.absent(), newSlots);
  }

  @Override
  public STreeLeaf splitRight(int x, long newVersion) {
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
  void memoizeSize(STreePageRef pageRef) {
    int pageSize = 12; // "@sleaf(stem:"
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
    return Record.create(1).attr("sleaf", header);
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
  public STreeLeaf reduced(Value identity, CombinerFunction<? super Value, Value> accumulator,
                           CombinerFunction<Value, Value> combiner, long newVersion) {
    final Slot[] slots = this.slots;
    Value fold = identity;
    for (int i = 0, n = slots.length; i < n; i += 1) {
      fold = accumulator.combine(fold, slots[i].value());
    }
    return create(this.pageRef.context, this.pageRef.stem, newVersion, fold, slots);
  }

  @Override
  public STreeLeaf evacuated(int post, long version) {
    final int oldPost = this.pageRef.post;
    if (oldPost != 0 && oldPost < post) {
      return create(this.pageRef.context, this.pageRef.stem, version, this.pageRef.fold, this.slots);
    } else {
      return this;
    }
  }

  @Override
  public STreeLeaf committed(int zone, long base, long version) {
    return create(this.pageRef.context, this.pageRef.stem, version, zone, base, this.pageRef.fold, this.slots);
  }

  @Override
  public STreeLeaf uncommitted(long version) {
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
  public Cursor<Slot> cursor() {
    return Cursor.array(this.slots);
  }

  @Override
  public Cursor<Slot> depthCursor(int maxDepth) {
    return cursor();
  }

  @Override
  public Cursor<Slot> deltaCursor(long sinceVersion) {
    if (sinceVersion <= version) {
      return cursor();
    } else {
      return Cursor.empty();
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

  public static STreeLeaf create(PageContext context, int stem, long version,
                                 int zone, long base, Value fold, Slot[] slots) {
    final STreePageRef pageRef = new STreePageRef(context, PageType.LEAF, stem, zone,
                                                  zone, base, slots.length, fold);
    final STreeLeaf page = new STreeLeaf(pageRef, version, slots);
    pageRef.page = page;
    return page;
  }

  public static STreeLeaf create(PageContext context, int stem, long version,
                                 Value fold, Slot[] slots) {
    return create(context, stem, version, 0, 0L, fold, slots);
  }

  public static STreeLeaf empty(PageContext context, int stem, long version) {
    return create(context, stem, version, 0, 0L, Value.absent(), EMPTY_SLOTS);
  }

  public static STreeLeaf fromValue(STreePageRef pageRef, Value value) {
    Throwable cause = null;
    try {
      final Value header = value.header("sleaf");
      final long version = header.get("v").longValue();
      final Record tail = value.tail();
      final Slot[] slots = new Slot[tail.size()];
      tail.toArray(slots);
      return new STreeLeaf(pageRef, version, slots);
    } catch (Throwable error) {
      if (Conts.isNonFatal(error)) {
        cause = error;
      } else {
        throw error;
      }
    }
    final Output<String> message = Unicode.stringOutput("Malformed sleaf: ");
    Recon.write(value, message);
    throw new StoreException(message.bind(), cause);
  }
}
