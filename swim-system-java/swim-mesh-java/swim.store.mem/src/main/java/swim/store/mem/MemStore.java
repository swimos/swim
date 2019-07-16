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

import java.util.Iterator;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.api.data.ListData;
import swim.api.data.MapData;
import swim.api.data.SpatialData;
import swim.api.data.ValueData;
import swim.collections.BTreeMap;
import swim.collections.HashTrieMap;
import swim.collections.STreeList;
import swim.math.R2Shape;
import swim.math.Z2Form;
import swim.spatial.GeoProjection;
import swim.spatial.QTreeMap;
import swim.store.DataBinding;
import swim.store.ListDataBinding;
import swim.store.MapDataBinding;
import swim.store.SpatialDataBinding;
import swim.store.StoreBinding;
import swim.store.StoreContext;
import swim.store.ValueDataBinding;
import swim.structure.Text;
import swim.structure.Value;

public class MemStore implements StoreBinding, StoreContext {
  protected StoreContext storeContext;
  volatile HashTrieMap<Value, StoreBinding> stores;
  volatile HashTrieMap<Value, DataBinding> trees;

  public MemStore() {
    this.stores = HashTrieMap.empty();
    this.trees = HashTrieMap.empty();
  }

  @Override
  public StoreContext storeContext() {
    return this.storeContext != null ? this.storeContext : this;
  }

  @Override
  public void setStoreContext(StoreContext storeContext) {
    this.storeContext = storeContext;
  }

  @Override
  public Iterator<DataBinding> dataBindings() {
    return this.trees.valueIterator();
  }

  @Override
  public void closeData(Value name) {
    do {
      final HashTrieMap<Value, DataBinding> oldTrees = this.trees;
      final HashTrieMap<Value, DataBinding> newTrees = oldTrees.removed(name);
      if (oldTrees != newTrees) {
        if (TREES.compareAndSet(this, oldTrees, newTrees)) {
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  @Override
  public void close() {
    // nop
  }

  @Override
  public StoreBinding openStore(Value name) {
    StoreBinding store = null;
    do {
      final HashTrieMap<Value, StoreBinding> oldStores = this.stores;
      final StoreBinding oldStore = oldStores.get(name);
      if (oldStore != null) {
        store = oldStore;
        break;
      } else {
        if (store == null) {
          store = new MemStore();
        }
        final HashTrieMap<Value, StoreBinding> newStores = oldStores.updated(name, store);
        if (STORES.compareAndSet(this, oldStores, newStores)) {
          break;
        }
      }
    } while (true);
    return store;
  }

  @Override
  public StoreBinding injectStore(StoreBinding storeBinding) {
    return storeBinding;
  }

  @Override
  public ListDataBinding openListData(Value name) {
    ListDataModel tree = null;
    do {
      final HashTrieMap<Value, DataBinding> oldTrees = this.trees;
      final DataBinding oldTree = oldTrees.get(name);
      if (oldTree != null) {
        tree = (ListDataModel) oldTree;
        break;
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
  public ListDataBinding injectListData(ListDataBinding dataBinding) {
    return dataBinding;
  }

  @Override
  public MapDataBinding openMapData(Value name) {
    MapDataModel tree = null;
    do {
      final HashTrieMap<Value, DataBinding> oldTrees = this.trees;
      final DataBinding oldTree = oldTrees.get(name);
      if (oldTree != null) {
        tree = (MapDataModel) oldTree;
        break;
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
  public MapDataBinding injectMapData(MapDataBinding dataBinding) {
    return dataBinding;
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
        break;
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
  public <S> SpatialDataBinding<S> injectSpatialData(SpatialDataBinding<S> dataBinding) {
    return dataBinding;
  }

  @Override
  public ValueDataBinding openValueData(Value name) {
    ValueDataModel tree = null;
    do {
      final HashTrieMap<Value, DataBinding> oldTrees = this.trees;
      final DataBinding oldTree = oldTrees.get(name);
      if (oldTree != null) {
        tree = (ValueDataModel) oldTree;
        break;
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
  public ValueDataBinding injectValueData(ValueDataBinding dataBinding) {
    return dataBinding;
  }

  @Override
  public ListData<Value> listData(Value name) {
    ListDataBinding dataBinding = openListData(name);
    dataBinding = injectListData(dataBinding);
    return dataBinding;
  }

  @Override
  public ListData<Value> listData(String name) {
    return listData(Text.from(name));
  }

  @Override
  public MapData<Value, Value> mapData(Value name) {
    MapDataBinding dataBinding = openMapData(name);
    dataBinding = injectMapData(dataBinding);
    return dataBinding;
  }

  @Override
  public MapData<Value, Value> mapData(String name) {
    return mapData(Text.from(name));
  }

  @Override
  public <S> SpatialData<Value, S, Value> spatialData(Value name, Z2Form<S> shapeForm) {
    SpatialDataBinding<S> dataBinding = openSpatialData(name, shapeForm);
    dataBinding = injectSpatialData(dataBinding);
    return dataBinding;
  }

  @Override
  public <S> SpatialData<Value, S, Value> spatialData(String name, Z2Form<S> shapeForm) {
    return spatialData(Text.from(name), shapeForm);
  }

  @Override
  public SpatialData<Value, R2Shape, Value> geospatialData(Value name) {
    return spatialData(name, GeoProjection.wgs84Form());
  }

  @Override
  public SpatialData<Value, R2Shape, Value> geospatialData(String name) {
    return geospatialData(Text.from(name));
  }

  @Override
  public ValueData<Value> valueData(Value name) {
    ValueDataBinding dataBinding = openValueData(name);
    dataBinding = injectValueData(dataBinding);
    return dataBinding;
  }

  @Override
  public ValueData<Value> valueData(String name) {
    return valueData(Text.from(name));
  }

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<MemStore, HashTrieMap<Value, StoreBinding>> STORES =
      AtomicReferenceFieldUpdater.newUpdater(MemStore.class, (Class<HashTrieMap<Value, StoreBinding>>) (Class<?>) HashTrieMap.class, "stores");

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<MemStore, HashTrieMap<Value, DataBinding>> TREES =
      AtomicReferenceFieldUpdater.newUpdater(MemStore.class, (Class<HashTrieMap<Value, DataBinding>>) (Class<?>) HashTrieMap.class, "trees");
}
