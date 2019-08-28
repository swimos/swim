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

public class QTreeMap<S> implements SpatialMap<Value, S, Value> {
  final Trunk<QTree> trunk;
  final Z2Form<S> shapeForm;

  public QTreeMap(Trunk<QTree> trunk, Z2Form<S> shapeForm) {
    this.trunk = trunk;
    this.shapeForm = shapeForm;
  }

  public final Trunk<QTree> trunk() {
    return this.trunk;
  }

  public final StoreSettings settings() {
    return this.trunk.settings();
  }

  public final Database database() {
    return this.trunk.database;
  }

  public final Value name() {
    return this.trunk.name;
  }

  public final QTree tree() {
    return this.trunk.tree;
  }

  public final TreeDelegate treeDelegate() {
    return tree().treeDelegate();
  }

  public void setTreeDelegate(TreeDelegate treeDelegate) {
    tree().setTreeDelegate(treeDelegate);
  }

  public Z2Form<S> shapeForm() {
    return this.shapeForm;
  }

  public boolean isResident() {
    return tree().isResident();
  }

  public QTreeMap<S> isResident(boolean isResident) {
    do {
      final long newVersion = this.trunk.version();
      final QTree oldTree = tree();
      final QTree newTree = oldTree.isResident(isResident);
      if (oldTree != newTree) {
        if (this.trunk.updateTree(oldTree, newTree, newVersion)) {
          break;
        }
      } else {
        break;
      }
    } while (true);
    return this;
  }

  public boolean isTransient() {
    return tree().isTransient();
  }

  public QTreeMap<S> isTransient(boolean isTransient) {
    do {
      final long newVersion = this.trunk.version();
      final QTree oldTree = tree();
      final QTree newTree = oldTree.isTransient(isTransient);
      if (oldTree != newTree) {
        if (this.trunk.updateTree(oldTree, newTree, newVersion)) {
          break;
        }
      } else {
        break;
      }
    } while (true);
    return this;
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

  public QTreeMapView<S> snapshot() {
    return new QTreeMapView<S>(tree(), shapeForm);
  }

  @Override
  public boolean isEmpty() {
    return tree().isEmpty();
  }

  @Override
  public int size() {
    return (int) tree().span();
  }

  public long span() {
    return tree().span();
  }

  public long treeSize() {
    return tree().treeSize();
  }

  @Override
  public boolean containsKey(Value key, S shape) {
    final Z2Form<S> shapeForm = this.shapeForm;
    final long x = BitInterval.span(shapeForm.getXMin(shape), shapeForm.getXMax(shape));
    final long y = BitInterval.span(shapeForm.getYMin(shape), shapeForm.getYMax(shape));
    int retries = 0;
    do {
      try {
        return tree().containsKey(key, x, y);
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public boolean containsKey(Object key) {
    if (key instanceof Value) {
      return containsKey((Value) key);
    }
    return false;
  }
  private boolean containsKey(Value key) {
    int retries = 0;
    do {
      try {
        return tree().containsKey(key);
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public boolean containsValue(Object value) {
    if (value instanceof Value) {
      return containsValue((Value) value);
    }
    return false;
  }
  private boolean containsValue(Value value) {
    int retries = 0;
    do {
      try {
        return tree().containsValue(value);
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Value get(Object key) {
    if (key instanceof Value) {
      return get((Value) key);
    }
    return Value.absent();
  }
  private Value get(Value key) {
    int retries = 0;
    do {
      try {
        return tree().get(key).body();
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Value get(Value key, S shape) {
    final Z2Form<S> shapeForm = this.shapeForm;
    final long x = BitInterval.span(shapeForm.getXMin(shape), shapeForm.getXMax(shape));
    final long y = BitInterval.span(shapeForm.getYMin(shape), shapeForm.getYMax(shape));
    int retries = 0;
    do {
      try {
        return tree().get(key, x, y).body();
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Value put(Value key, S shape, Value newValue) {
    final Z2Form<S> shapeForm = this.shapeForm;
    final long x = BitInterval.span(shapeForm.getXMin(shape), shapeForm.getXMax(shape));
    final long y = BitInterval.span(shapeForm.getYMin(shape), shapeForm.getYMax(shape));
    newValue = shapeForm.mold(shape).concat(newValue);
    int retries = 0;
    do {
      final long newVersion = this.trunk.version();
      final int newPost = this.trunk.post();
      try {
        final QTree oldTree = tree();
        final QTree newTree = oldTree.updated(key, x, y, newValue, newVersion, newPost);
        if (oldTree != newTree) {
          if (this.trunk.updateTree(oldTree, newTree, newVersion)) {
            final Value oldValue = oldTree.get(key, x, y);
            final TreeContext treeContext = newTree.treeContext();
            treeContext.qtreeDidUpdate(newTree, oldTree, key, x, y, newValue, oldValue);
            treeContext.treeDidChange(newTree, oldTree);
            return oldValue;
          }
        } else {
          return Value.absent();
        }
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Value move(Value key, S oldShape, S newShape, Value newValue) {
    final Z2Form<S> shapeForm = this.shapeForm;
    final long oldX = BitInterval.span(shapeForm.getXMin(oldShape), shapeForm.getXMax(oldShape));
    final long oldY = BitInterval.span(shapeForm.getYMin(oldShape), shapeForm.getYMax(oldShape));
    final long newX = BitInterval.span(shapeForm.getXMin(newShape), shapeForm.getXMax(newShape));
    final long newY = BitInterval.span(shapeForm.getYMin(newShape), shapeForm.getYMax(newShape));
    newValue = shapeForm.mold(newShape).concat(newValue);
    int retries = 0;
    do {
      final long newVersion = this.trunk.version();
      final int newPost = this.trunk.post();
      try {
        final QTree oldTree = tree();
        final QTree newTree = oldTree.moved(key, oldX, oldY, newX, newY, newValue, newVersion, newPost);
        if (oldTree != newTree) {
          if (this.trunk.updateTree(oldTree, newTree, newVersion)) {
            final Value oldValue = oldTree.get(key, oldX, oldY);
            final TreeContext treeContext = newTree.treeContext();
            treeContext.qtreeDidMove(newTree, oldTree, key, newX, newY, newValue, oldX, oldY, oldValue);
            treeContext.treeDidChange(newTree, oldTree);
            return oldValue;
          }
        } else {
          return Value.absent();
        }
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Value remove(Value key, S shape) {
    final Z2Form<S> shapeForm = this.shapeForm;
    final long x = BitInterval.span(shapeForm.getXMin(shape), shapeForm.getXMax(shape));
    final long y = BitInterval.span(shapeForm.getYMin(shape), shapeForm.getYMax(shape));
    int retries = 0;
    do {
      final long newVersion = this.trunk.version();
      final int newPost = this.trunk.post();
      try {
        final QTree oldTree = tree();
        final QTree newTree = oldTree.removed(key, x, y, newVersion, newPost);
        if (oldTree != newTree) {
          if (this.trunk.updateTree(oldTree, newTree, newVersion)) {
            final Value oldValue = oldTree.get(key, x, y);
            final TreeContext treeContext = newTree.treeContext();
            treeContext.qtreeDidRemove(newTree, oldTree, key, x, y, oldValue);
            treeContext.treeDidChange(newTree, oldTree);
            return oldValue;
          }
        } else {
          return Value.absent();
        }
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public void clear() {
    int retries = 0;
    do {
      final long newVersion = this.trunk.version();
      try {
        final QTree oldTree = tree();
        final QTree newTree = oldTree.cleared(newVersion);
        if (oldTree != newTree) {
          if (this.trunk.updateTree(oldTree, newTree, newVersion)) {
            final TreeContext treeContext = newTree.treeContext();
            treeContext.treeDidClear(newTree, oldTree);
            treeContext.treeDidChange(newTree, oldTree);
            return;
          }
        } else {
          return;
        }
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Cursor<Entry<Value, S, Value>> iterator(S shape) {
    int retries = 0;
    do {
      try {
        final Z2Form<S> shapeForm = this.shapeForm;
        final long x = BitInterval.span(shapeForm.getXMin(shape), shapeForm.getXMax(shape));
        final long y = BitInterval.span(shapeForm.getYMin(shape), shapeForm.getYMax(shape));
        return new QTreeShapeCursor<S>(tree().cursor(x, y), shapeForm, shape);
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Cursor<Entry<Value, S, Value>> iterator() {
    int retries = 0;
    do {
      try {
        return new QTreeEntryCursor<S>(tree().cursor(), this.shapeForm);
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Cursor<Value> keyIterator() {
    int retries = 0;
    do {
      try {
        return Cursor.keys(tree().cursor());
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Cursor<Value> valueIterator() {
    int retries = 0;
    do {
      try {
        return new QTreeValueCursor(tree().cursor());
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  public Cursor<Value> depthValueIterator(int maxDepth) {
    int retries = 0;
    do {
      try {
        return new QTreeValueCursor(tree().depthCursor(maxDepth));
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  protected void didFail(StoreException error) {
    System.err.println(error.getMessage());
    error.printStackTrace();
    clear();
  }

  public void loadAsync(Cont<QTreeMap<S>> cont) {
    try {
      final Cont<Tree> andThen = Conts.constant(cont, this);
      tree().loadAsync(andThen);
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        cont.trap(cause);
      } else {
        throw cause;
      }
    }
  }

  public QTreeMap<S> load() throws InterruptedException {
    tree().load();
    return this;
  }

  public void commitAsync(Commit commit) {
    try {
      this.trunk.commitAsync(commit);
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        commit.trap(cause);
      } else {
        throw cause;
      }
    }
  }

  public Chunk commit(Commit commit) throws InterruptedException {
    return this.trunk.commit(commit);
  }
}
