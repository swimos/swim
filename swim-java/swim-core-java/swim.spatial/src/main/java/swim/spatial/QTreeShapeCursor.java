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

package swim.spatial;

import swim.math.Z2Form;
import swim.util.Cursor;

final class QTreeShapeCursor<K, S, V> implements Cursor<SpatialMap.Entry<K, S, V>> {
  final Cursor<QTreeEntry<K, S, V>> inner;
  final Z2Form<S> shapeForm;
  final S shape;
  QTreeEntry<K, S, V> nextSlot;
  QTreeEntry<K, S, V> previousSlot;

  QTreeShapeCursor(Cursor<QTreeEntry<K, S, V>> inner, Z2Form<S> shapeForm, S shape) {
    this.inner = inner;
    this.shapeForm = shapeForm;
    this.shape = shape;
  }

  @Override
  public boolean isEmpty() {
    QTreeEntry<K, S, V> nextSlot = this.nextSlot;
    if (nextSlot == null) {
      final Z2Form<S> shapeForm = this.shapeForm;
      while (this.inner.hasNext()) {
        nextSlot = this.inner.next();
        if (shapeForm.intersects(this.shape, nextSlot.shape)) {
          this.nextSlot = nextSlot;
          return false;
        }
      }
      return true;
    }
    return false;
  }

  @Override
  public QTreeEntry<K, S, V> head() {
    QTreeEntry<K, S, V> nextSlot = this.nextSlot;
    if (nextSlot == null) {
      final Z2Form<S> shapeForm = this.shapeForm;
      do {
        nextSlot = this.inner.next();
        if (shapeForm.intersects(this.shape, nextSlot.shape)) {
          break;
        }
      } while (true);
    }
    this.previousSlot = null;
    this.nextSlot = nextSlot;
    return nextSlot;
  }

  @Override
  public void step() {
    QTreeEntry<K, S, V> nextSlot = this.nextSlot;
    if (nextSlot == null) {
      final Z2Form<S> shapeForm = this.shapeForm;
      do {
        nextSlot = this.inner.next();
        if (shapeForm.intersects(this.shape, nextSlot.shape)) {
          break;
        }
      } while (true);
    }
    this.previousSlot = nextSlot;
    this.nextSlot = null;
  }

  @Override
  public void skip(long count) {
    this.inner.skip(count);
  }

  @Override
  public boolean hasNext() {
    QTreeEntry<K, S, V> nextSlot = this.nextSlot;
    if (nextSlot == null) {
      final Z2Form<S> shapeForm = this.shapeForm;
      while (this.inner.hasNext()) {
        nextSlot = this.inner.next();
        if (shapeForm.intersects(this.shape, nextSlot.shape)) {
          this.nextSlot = nextSlot;
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
  public QTreeEntry<K, S, V> next() {
    QTreeEntry<K, S, V> nextSlot = this.nextSlot;
    if (nextSlot == null) {
      final Z2Form<S> shapeForm = this.shapeForm;
      do {
        nextSlot = this.inner.next();
        if (shapeForm.intersects(this.shape, nextSlot.shape)) {
          break;
        }
      } while (true);
    }
    this.previousSlot = nextSlot;
    this.nextSlot = null;
    return nextSlot;
  }

  @Override
  public boolean hasPrevious() {
    QTreeEntry<K, S, V> previousSlot = this.previousSlot;
    if (previousSlot == null) {
      final Z2Form<S> shapeForm = this.shapeForm;
      while (this.inner.hasPrevious()) {
        previousSlot = this.inner.previous();
        if (shapeForm.intersects(this.shape, previousSlot.shape)) {
          this.previousSlot = previousSlot;
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
  public QTreeEntry<K, S, V> previous() {
    QTreeEntry<K, S, V> previousSlot = this.previousSlot;
    if (previousSlot == null) {
      final Z2Form<S> shapeForm = this.shapeForm;
      do {
        previousSlot = this.inner.previous();
        if (shapeForm.intersects(this.shape, previousSlot.shape)) {
          break;
        }
      } while (true);
    }
    this.nextSlot = previousSlot;
    this.previousSlot = null;
    return previousSlot;
  }
}
