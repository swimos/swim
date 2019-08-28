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

import swim.concurrent.Cont;
import swim.concurrent.Conts;
import swim.math.Z2Form;
import swim.spatial.BitInterval;
import swim.spatial.SpatialMap;
import swim.spatial.SpatialValueMap;
import swim.structure.Form;
import swim.structure.Value;
import swim.util.Cursor;

public class QTreeMapView<S> implements SpatialMap<Value, S, Value> {
  protected final QTree tree;
  protected final Z2Form<S> shapeForm;

  public QTreeMapView(QTree tree, Z2Form<S> shapeForm) {
    this.tree = tree;
    this.shapeForm = shapeForm;
  }

  public QTree getTree() {
    return this.tree;
  }

  public Z2Form<S> shapeForm() {
    return this.shapeForm;
  }

  public void loadAsync(Cont<QTreeMapView<S>> cont) {
    try {
      final Cont<Tree> andThen = Conts.constant(cont, this);
      this.tree.loadAsync(andThen);
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        cont.trap(cause);
      } else {
        throw cause;
      }
    }
  }

  public QTreeMapView<S> load() throws InterruptedException {
    this.tree.load();
    return this;
  }

  public boolean isResident() {
    return this.tree.isResident();
  }

  public boolean isTransient() {
    return this.tree.isTransient();
  }

  public <K> SpatialValueMap<K, S, Value> keyForm(Form<K> keyForm) {
    return new SpatialValueMap<K, S, Value>(this, keyForm, Form.forValue());
  }

  public <K> SpatialValueMap<K, S, Value> keyClass(Class<K> keyClass) {
    return keyForm(Form.<K>forClass(keyClass));
  }

  public <V> SpatialValueMap<Value, S, V> valueForm(Form<V> valueForm) {
    return new SpatialValueMap<Value, S, V>(this, Form.forValue(), valueForm);
  }

  public <V> SpatialValueMap<Value, S, V> valueClass(Class<V> valueClass) {
    return valueForm(Form.<V>forClass(valueClass));
  }

  @Override
  public boolean isEmpty() {
    return this.tree.isEmpty();
  }

  @Override
  public int size() {
    return (int) this.tree.span();
  }

  @Override
  public boolean containsKey(Value key, S shape) {
    final Z2Form<S> shapeForm = this.shapeForm;
    final long x = BitInterval.span(shapeForm.getXMin(shape), shapeForm.getXMax(shape));
    final long y = BitInterval.span(shapeForm.getYMin(shape), shapeForm.getYMax(shape));
    return this.tree.containsKey(key, x, y);
  }

  @Override
  public boolean containsKey(Object value) {
    if (value instanceof Value) {
      return this.tree.containsKey((Value) value);
    }
    return false;
  }

  @Override
  public boolean containsValue(Object value) {
    if (value instanceof Value) {
      return this.tree.containsValue((Value) value);
    }
    return false;
  }

  @Override
  public Value get(Object key) {
    if (key instanceof Value) {
      return this.tree.get((Value) key).body();
    }
    return Value.absent();
  }

  @Override
  public Value get(Value key, S shape) {
    final Z2Form<S> shapeForm = this.shapeForm;
    final long x = BitInterval.span(shapeForm.getXMin(shape), shapeForm.getXMax(shape));
    final long y = BitInterval.span(shapeForm.getYMin(shape), shapeForm.getYMax(shape));
    return this.tree.get(key, x, y).body();
  }

  @Override
  public Value put(Value key, S shape, Value newValue) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Value move(Value key, S oldShape, S newShape, Value newValue) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Value remove(Value key, S shape) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void clear() {
    throw new UnsupportedOperationException();
  }

  @Override
  public Cursor<Entry<Value, S, Value>> iterator(S shape) {
    final Z2Form<S> shapeForm = this.shapeForm;
    final long x = BitInterval.span(shapeForm.getXMin(shape), shapeForm.getXMax(shape));
    final long y = BitInterval.span(shapeForm.getYMin(shape), shapeForm.getYMax(shape));
    return new QTreeShapeCursor<S>(this.tree.cursor(x, y), shapeForm, shape);
  }

  @Override
  public Cursor<Entry<Value, S, Value>> iterator() {
    return new QTreeEntryCursor<S>(this.tree.cursor(), this.shapeForm);
  }

  @Override
  public Cursor<Value> keyIterator() {
    return Cursor.keys(this.tree.cursor());
  }

  @Override
  public Cursor<Value> valueIterator() {
    return new QTreeValueCursor(this.tree.cursor());
  }
}
