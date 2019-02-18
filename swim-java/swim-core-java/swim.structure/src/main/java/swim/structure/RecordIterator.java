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

package swim.structure;

import java.util.ListIterator;
import java.util.NoSuchElementException;

final class RecordIterator implements ListIterator<Item> {
  final Record record;
  int index;
  final int fromIndex;
  final int toIndex;
  int direction;

  RecordIterator(Record record, int index, int fromIndex, int toIndex) {
    this.record = record;
    this.index = index;
    this.fromIndex = fromIndex;
    this.toIndex = toIndex;
    this.direction = 0;
  }

  RecordIterator(Record record, int index) {
    this.record = record;
    this.index = index;
    this.fromIndex = 0;
    this.toIndex = record.size();
    this.direction = 0;
  }

  RecordIterator(Record record) {
    this.record = record;
    this.index = 0;
    this.fromIndex = 0;
    this.toIndex = record.size();
    this.direction = 0;
  }

  @Override
  public boolean hasNext() {
    return this.index < this.toIndex;
  }

  @Override
  public int nextIndex() {
    return this.index - this.fromIndex;
  }

  @Override
  public Item next() {
    final int i = this.index;
    if (i < this.fromIndex || i >= this.toIndex) {
      throw new NoSuchElementException();
    }
    final Item item = this.record.get(i);
    this.index = i + 1;
    this.direction = 1;
    return item;
  }

  @Override
  public boolean hasPrevious() {
    return this.index > this.fromIndex;
  }

  @Override
  public int previousIndex() {
    return this.index - this.fromIndex - 1;
  }

  @Override
  public Item previous() {
    final int i = this.index - 1;
    if (i < this.fromIndex || i >= this.toIndex) {
      throw new NoSuchElementException();
    }
    this.index = i;
    this.direction = -1;
    return this.record.get(i);
  }

  @Override
  public void add(Item newItem) {
    final int i = this.index;
    this.record.add(i, newItem);
    this.index = i + 1;
    this.direction = 0;
  }

  @Override
  public void set(Item newItem) {
    if (direction == 0) {
      throw new IllegalStateException();
    }
    if (direction > 0) {
      this.record.set(index - 1, newItem);
    } else {
      this.record.set(index, newItem);
    }
  }

  @Override
  public void remove() {
    if (direction == 0) {
      throw new IllegalStateException();
    }
    if (direction > 0) {
      this.index -= 1;
    }
    this.record.remove(this.index);
    this.direction = 0;
  }
}
