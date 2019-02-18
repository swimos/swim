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

package swim.store.mem;

import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.api.plane.PlaneContext;
import swim.collections.BTreeMap;
import swim.collections.HashTrieMap;
import swim.collections.STreeList;
import swim.math.Z2Form;
import swim.spatial.QTreeMap;
import swim.store.DataBinding;
import swim.store.ListDataBinding;
import swim.store.MapDataBinding;
import swim.store.SpatialDataBinding;
import swim.store.Storage;
import swim.store.ValueDataBinding;
import swim.structure.Record;
import swim.structure.Value;
import swim.uri.Uri;

public class MemStorage implements Storage {
  volatile HashTrieMap<Value, DataBinding> trees;

  public MemStorage() {
    this.trees = HashTrieMap.empty();
  }

  @Override
  public void init(PlaneContext planeContext, Value storeSettings) {

  }

  @Override
  public void init(String path, String basePath, PlaneContext planeContext) {

  }

  @Override
  public ListDataBinding openListData(Value name) {
    ListDataModel tree = null;
    do {
      final HashTrieMap<Value, DataBinding> oldTrees = this.trees;
      final DataBinding oldTree = oldTrees.get(name);
      if (oldTree != null) {
        tree = (ListDataModel) oldTree;
      } else {
        if (tree == null) {
          tree = new ListDataModel(name, new STreeList<Value>());
        }
        final HashTrieMap<Value, DataBinding> newTrees = oldTrees.updated(name, tree);
        if (TREES.compareAndSet(this, oldTrees, newTrees)) {
          break;
        }
      }
    } while (true);
    return tree;
  }

  @Override
  public ListDataBinding openListData(Uri nodeUri, Value name) {
    return openListData(treeName(nodeUri, name));
  }

  @Override
  public MapDataBinding openMapData(Value name) {
    MapDataModel tree = null;
    do {
      final HashTrieMap<Value, DataBinding> oldTrees = this.trees;
      final DataBinding oldTree = oldTrees.get(name);
      if (oldTree != null) {
        tree = (MapDataModel) oldTree;
      } else {
        if (tree == null) {
          tree = new MapDataModel(name, new BTreeMap<Value, Value, Value>());
        }
        final HashTrieMap<Value, DataBinding> newTrees = oldTrees.updated(name, tree);
        if (TREES.compareAndSet(this, oldTrees, newTrees)) {
          break;
        }
      }
    } while (true);
    return tree;
  }

  @Override
  public MapDataBinding openMapData(Uri nodeUri, Value name) {
    return openMapData(treeName(nodeUri, name));
  }

  @SuppressWarnings("unchecked")
  @Override
  public <S> SpatialDataBinding<S> openSpatialData(Value name, Z2Form<S> shapeForm) {
    SpatialDataModel<S> tree = null;
    do {
      final HashTrieMap<Value, DataBinding> oldTrees = this.trees;
      final DataBinding oldTree = oldTrees.get(name);
      if (oldTree != null) {
        tree = (SpatialDataModel<S>) oldTree;
      } else {
        if (tree == null) {
          tree = new SpatialDataModel<S>(name, new QTreeMap<Value, S, Value>(shapeForm));
        }
        final HashTrieMap<Value, DataBinding> newTrees = oldTrees.updated(name, tree);
        if (TREES.compareAndSet(this, oldTrees, newTrees)) {
          break;
        }
      }
    } while (true);
    return tree;
  }

  @Override
  public <S> SpatialDataBinding<S> openSpatialData(Uri nodeUri, Value name, Z2Form<S> shapeForm) {
    return openSpatialData(treeName(nodeUri, name), shapeForm);
  }

  @Override
  public ValueDataBinding openValueData(Value name) {
    ValueDataModel tree = null;
    do {
      final HashTrieMap<Value, DataBinding> oldTrees = this.trees;
      final DataBinding oldTree = oldTrees.get(name);
      if (oldTree != null) {
        tree = (ValueDataModel) oldTree;
      } else {
        if (tree == null) {
          tree = new ValueDataModel(name, Value.absent());
        }
        final HashTrieMap<Value, DataBinding> newTrees = oldTrees.updated(name, tree);
        if (TREES.compareAndSet(this, oldTrees, newTrees)) {
          break;
        }
      }
    } while (true);
    return tree;
  }

  @Override
  public ValueDataBinding openValueData(Uri nodeUri, Value name) {
    return openValueData(treeName(nodeUri, name));
  }

  @Override
  public void close() {

  }

  protected Value treeName(Uri nodeUri, Value name) {
    return Record.create(2).slot("node", nodeUri.toString()).slot("name", name).commit();
  }

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<MemStorage, HashTrieMap<Value, DataBinding>> TREES =
      AtomicReferenceFieldUpdater.newUpdater(MemStorage.class, (Class<HashTrieMap<Value, DataBinding>>) (Class<?>) HashTrieMap.class, "trees");
}
