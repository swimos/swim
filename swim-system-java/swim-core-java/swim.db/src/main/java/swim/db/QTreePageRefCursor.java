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
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Slot;
import swim.util.Cursor;

final class QTreePageRefCursor implements Cursor<Slot> {
  final QTreePageRef pageRef;
  final Record record;
  int index;

  QTreePageRefCursor(QTreePageRef pageRef, Record record, int index) {
    this.pageRef = pageRef;
    this.record = record;
    this.index = index;
  }

  QTreePageRefCursor(QTreePageRef pageRef, Record record) {
    this(pageRef, record, 0);
  }

  @Override
  public boolean isEmpty() {
    return this.index > this.record.size();
  }

  @Override
  public Slot head() {
    final Record record = this.record;
    final int index = this.index;
    if (index >= record.size()) {
      throw new NoSuchElementException();
    }
    final Item item = record.get(index);
    if (item instanceof Slot) {
      return (Slot) item;
    } else {
      return Slot.of(item.key(), item.toValue());
    }
  }

  @Override
  public void step() {
    final Record record = this.record;
    final int index = this.index;
    if (index >= record.size()) {
      throw new UnsupportedOperationException();
    }
    this.index = index + 1;
  }

  @Override
  public void skip(long count) {
    if (count < 0L) {
      throw new IllegalArgumentException();
    }
    this.index = Math.min(this.index + (int) count, this.record.size());
  }

  @Override
  public boolean hasNext() {
    return this.index < this.record.size();
  }

  @Override
  public long nextIndexLong() {
    return (long) nextIndex();
  }

  @Override
  public int nextIndex() {
    return this.index;
  }

  @Override
  public Slot next() {
    final Record record = this.record;
    final int index = this.index;
    if (index >= record.size()) {
      throw new NoSuchElementException();
    }
    final Item item = record.get(index);
    this.index = index + 1;
    if (item instanceof Slot) {
      return (Slot) item;
    } else {
      return Slot.of(item.key(), item.toValue());
    }
  }

  @Override
  public boolean hasPrevious() {
    return this.index >= 0;
  }

  @Override
  public long previousIndexLong() {
    return (long) previousIndex();
  }

  @Override
  public int previousIndex() {
    return this.index - 1;
  }

  @Override
  public Slot previous() {
    final int index = this.index - 1;
    if (index < 0) {
      throw new NoSuchElementException();
    }
    final Item item = this.record.get(index);
    this.index = index;
    if (item instanceof Slot) {
      return (Slot) item;
    } else {
      return Slot.of(item.key(), item.toValue());
    }
  }
}
