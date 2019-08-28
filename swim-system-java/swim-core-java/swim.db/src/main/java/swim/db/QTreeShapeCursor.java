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

final class QTreeShapeCursor<S> implements Cursor<SpatialMap.Entry<Value, S, Value>> {
  final Cursor<Slot> inner;
  final Z2Form<S> shapeForm;
  final S shape;
  Slot nextSlot;
  S nextShape;
  Slot previousSlot;
  S previousShape;

  QTreeShapeCursor(Cursor<Slot> inner, Z2Form<S> shapeForm, S shape) {
    this.inner = inner;
    this.shapeForm = shapeForm;
    this.shape = shape;
  }

  @Override
  public boolean isEmpty() {
    Slot nextSlot = this.nextSlot;
    S nextShape = this.nextShape;
    if (nextSlot == null) {
      final Z2Form<S> shapeForm = this.shapeForm;
      while (this.inner.hasNext()) {
        nextSlot = this.inner.next();
        nextShape = shapeForm.cast(nextSlot.toValue());
        if (shapeForm.intersects(this.shape, nextShape)) {
          this.nextSlot = nextSlot;
          this.nextShape = nextShape;
          return false;
        }
      }
      return true;
    }
    return false;
  }

  @Override
  public SpatialMap.Entry<Value, S, Value> head() {
    Slot nextSlot = this.nextSlot;
    S nextShape = this.nextShape;
    if (nextSlot == null) {
      final Z2Form<S> shapeForm = this.shapeForm;
      do {
        nextSlot = this.inner.next();
        nextShape = shapeForm.cast(nextSlot.toValue());
        if (shapeForm.intersects(this.shape, nextShape)) {
          break;
        }
      } while (true);
    }
    this.previousSlot = null;
    this.previousShape = null;
    this.nextSlot = nextSlot;
    this.nextShape = nextShape;
    final Value nextKey = nextSlot.key();
    final Value nextValue = nextSlot.toValue().body();
    return new SpatialMap.SimpleEntry<Value, S, Value>(nextKey, nextShape, nextValue);
  }

  @Override
  public void step() {
    Slot nextSlot = this.nextSlot;
    S nextShape = this.nextShape;
    if (nextSlot == null) {
      final Z2Form<S> shapeForm = this.shapeForm;
      do {
        nextSlot = this.inner.next();
        nextShape = shapeForm.cast(nextSlot.toValue());
        if (shapeForm.intersects(this.shape, nextShape)) {
          break;
        }
      } while (true);
    }
    this.previousSlot = nextSlot;
    this.previousShape = nextShape;
    this.nextSlot = null;
    this.nextShape = null;
  }

  @Override
  public void skip(long count) {
    this.inner.skip(count);
  }

  @Override
  public boolean hasNext() {
    Slot nextSlot = this.nextSlot;
    S nextShape = this.nextShape;
    if (nextSlot == null) {
      final Z2Form<S> shapeForm = this.shapeForm;
      while (this.inner.hasNext()) {
        nextSlot = this.inner.next();
        nextShape = shapeForm.cast(nextSlot.toValue());
        if (shapeForm.intersects(this.shape, nextShape)) {
          this.nextSlot = nextSlot;
          this.nextShape = nextShape;
          return true;
        }
      }
      return false;
    }
    return true;
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
    Slot nextSlot = this.nextSlot;
    S nextShape = this.nextShape;
    if (nextSlot == null) {
      final Z2Form<S> shapeForm = this.shapeForm;
      do {
        nextSlot = this.inner.next();
        nextShape = shapeForm.cast(nextSlot.toValue());
        if (shapeForm.intersects(this.shape, nextShape)) {
          break;
        }
      } while (true);
    }
    this.previousSlot = nextSlot;
    this.previousShape = nextShape;
    this.nextSlot = null;
    this.nextShape = null;
    final Value nextKey = nextSlot.key();
    final Value nextValue = nextSlot.toValue().body();
    return new SpatialMap.SimpleEntry<Value, S, Value>(nextKey, nextShape, nextValue);
  }

  @Override
  public boolean hasPrevious() {
    Slot previousSlot = this.previousSlot;
    S previousShape = this.previousShape;
    if (previousSlot == null) {
      final Z2Form<S> shapeForm = this.shapeForm;
      while (this.inner.hasPrevious()) {
        previousSlot = this.inner.previous();
        previousShape = shapeForm.cast(previousSlot.toValue());
        if (shapeForm.intersects(this.shape, previousShape)) {
          this.previousSlot = previousSlot;
          this.previousShape = previousShape;
          return true;
        }
      }
      return false;
    }
    return true;
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
    Slot previousSlot = this.previousSlot;
    S previousShape = this.previousShape;
    if (previousSlot == null) {
      final Z2Form<S> shapeForm = this.shapeForm;
      do {
        previousSlot = this.inner.previous();
        previousShape = shapeForm.cast(previousSlot.toValue());
        if (shapeForm.intersects(this.shape, previousShape)) {
          break;
        }
      } while (true);
    }
    this.nextSlot = previousSlot;
    this.nextShape = previousShape;
    this.previousSlot = null;
    this.previousShape = null;
    final Value previousKey = previousSlot.key();
    final Value previousValue = previousSlot.toValue().body();
    return new SpatialMap.SimpleEntry<Value, S, Value>(previousKey, previousShape, previousValue);
  }

  @Override
  public void load() throws InterruptedException {
    this.inner.load();
  }
}
