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

import swim.math.Z2Form;
import swim.spatial.SpatialMap;
import swim.structure.Slot;
import swim.structure.Value;
import swim.util.Cursor;

final class QTreeEntryCursor<S> implements Cursor<SpatialMap.Entry<Value, S, Value>> {
  final Cursor<Slot> inner;
  final Z2Form<S> shapeForm;

  QTreeEntryCursor(Cursor<Slot> inner, Z2Form<S> shapeForm) {
    this.inner = inner;
    this.shapeForm = shapeForm;
  }

  @Override
  public boolean isEmpty() {
    return this.inner.isEmpty();
  }

  @Override
  public SpatialMap.Entry<Value, S, Value> head() {
    final Slot slot = this.inner.head();
    final Value key = slot.key();
    final S shape = this.shapeForm.cast(slot.toValue());
    final Value value = slot.toValue().body();
    return new SpatialMap.SimpleEntry<Value, S, Value>(key, shape, value);
  }

  @Override
  public void step() {
    this.inner.step();
  }

  @Override
  public void skip(long count) {
    this.inner.skip(count);
  }

  @Override
  public boolean hasNext() {
    return this.inner.hasNext();
  }

  @Override
  public long nextIndexLong() {
    return this.inner.nextIndexLong();
  }

  @Override
  public int nextIndex() {
    return this.inner.nextIndex();
  }

  @Override
  public SpatialMap.Entry<Value, S, Value> next() {
    final Slot slot = this.inner.next();
    final Value key = slot.key();
    final S shape = this.shapeForm.cast(slot.toValue());
    final Value value = slot.toValue().body();
    return new SpatialMap.SimpleEntry<Value, S, Value>(key, shape, value);
  }

  @Override
  public boolean hasPrevious() {
    return this.inner.hasPrevious();
  }

  @Override
  public long previousIndexLong() {
    return this.inner.previousIndexLong();
  }

  @Override
  public int previousIndex() {
    return this.inner.previousIndex();
  }

  @Override
  public SpatialMap.Entry<Value, S, Value> previous() {
    final Slot slot = this.inner.previous();
    final Value key = slot.key();
    final S shape = this.shapeForm.cast(slot.toValue());
    final Value value = slot.toValue().body();
    return new SpatialMap.SimpleEntry<Value, S, Value>(key, shape, value);
  }

  @Override
  public void load() throws InterruptedException {
    this.inner.load();
  }
}
