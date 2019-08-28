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

package swim.store.db;

import java.util.Collections;
import java.util.Iterator;
import swim.api.data.ListData;
import swim.api.data.MapData;
import swim.api.data.SpatialData;
import swim.api.data.ValueData;
import swim.api.store.StoreException;
import swim.concurrent.MainStage;
import swim.concurrent.Stage;
import swim.db.BTreeMap;
import swim.db.QTreeMap;
import swim.db.STreeList;
import swim.db.Store;
import swim.db.UTreeValue;
import swim.math.R2Shape;
import swim.math.Z2Form;
import swim.spatial.GeoProjection;
import swim.store.DataBinding;
import swim.store.ListDataBinding;
import swim.store.MapDataBinding;
import swim.store.SpatialDataBinding;
import swim.store.StoreBinding;
import swim.store.StoreContext;
import swim.store.ValueDataBinding;
import swim.structure.Text;
import swim.structure.Value;

public class DbStore implements StoreBinding, StoreContext {
  protected final Store store;
  protected final Value name;
  protected StoreContext storeContext;

  public DbStore(Store store, Value name) {
    this.store = store;
    this.name = name;
  }

  @Override
  public StoreContext storeContext() {
    return this.storeContext != null ? this.storeContext : this;
  }

  @Override
  public void setStoreContext(StoreContext storeContext) {
    this.storeContext = storeContext;
  }

  protected Value storeName(Value name) {
    return this.name.concat(name);
  }

  protected Value treeName(Value name) {
    return this.name.concat(name);
  }

  @Override
  public Iterator<DataBinding> dataBindings() {
    return Collections.emptyIterator(); // TODO
  }

  @Override
  public void closeData(Value name) {
    final Value treeName = treeName(name);
    this.store.database().closeTrunk(treeName);
  }

  @Override
  public void close() {
    if (!this.name.isDefined()) {
      try {
        this.store.close();
        final Stage stage = this.store.stage();
        if (stage instanceof MainStage) {
          ((MainStage) stage).stop();
        }
      } catch (InterruptedException cause) {
        throw new StoreException(cause);
      }
    }
  }

  @Override
  public StoreBinding openStore(Value name) {
    final Value storeName = storeName(name);
    return new DbStore(this.store, storeName);
  }

  @Override
  public StoreBinding injectStore(StoreBinding storeBinding) {
    return storeBinding;
  }

  @Override
  public ListDataBinding openListData(Value name) {
    final Value treeName = treeName(name);
    final STreeList stree = this.store.database().openSTreeList(treeName);
    return new ListDataModel(treeName, stree);
  }

  @Override
  public ListDataBinding injectListData(ListDataBinding dataBinding) {
    return dataBinding;
  }

  @Override
  public MapDataBinding openMapData(Value name) {
    final Value treeName = treeName(name);
    final BTreeMap btree = this.store.database().openBTreeMap(treeName);
    return new MapDataModel(treeName, btree);
  }

  @Override
  public MapDataBinding injectMapData(MapDataBinding dataBinding) {
    return dataBinding;
  }

  @Override
  public <S> SpatialDataBinding<S> openSpatialData(Value name, Z2Form<S> shapeForm) {
    final Value treeName = treeName(name);
    final QTreeMap<S> qtree = this.store.database().openQTreeMap(treeName, shapeForm);
    return new SpatialDataModel<S>(treeName, qtree);
  }

  @Override
  public <S> SpatialDataBinding<S> injectSpatialData(SpatialDataBinding<S> dataBinding) {
    return dataBinding;
  }

  @Override
  public ValueDataBinding openValueData(Value name) {
    final Value treeName = treeName(name);
    final UTreeValue utree = this.store.database().openUTreeValue(treeName);
    return new ValueDataModel(treeName, utree);
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
}
