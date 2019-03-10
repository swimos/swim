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

package swim.store;

import java.util.Iterator;
import swim.api.data.ListData;
import swim.api.data.MapData;
import swim.api.data.SpatialData;
import swim.api.data.ValueData;
import swim.math.R2Shape;
import swim.math.Z2Form;
import swim.spatial.GeoProjection;
import swim.structure.Text;
import swim.structure.Value;

public class StoreProxy implements StoreBinding, StoreContext {
  protected final StoreBinding storeBinding;
  protected StoreContext storeContext;

  public StoreProxy(StoreBinding storeBinding) {
    this.storeBinding = storeBinding;
  }

  public final StoreBinding storeBinding() {
    return this.storeBinding;
  }

  @Override
  public final StoreContext storeContext() {
    return this.storeContext;
  }

  @Override
  public void setStoreContext(StoreContext storeContext) {
    this.storeContext = storeContext;
    this.storeBinding.setStoreContext(this);
  }

  @Override
  public Iterator<DataBinding> dataBindings() {
    return this.storeBinding.dataBindings();
  }

  @Override
  public void closeData(Value name) {
    this.storeBinding.closeData(name);
  }

  @Override
  public void close() {
    this.storeContext.close();
  }

  @Override
  public StoreBinding openStore(Value name) {
    return this.storeContext.openStore(name);
  }

  @Override
  public StoreBinding injectStore(StoreBinding storeBinding) {
    return this.storeContext.injectStore(storeBinding);
  }

  @Override
  public ListDataBinding openListData(Value name) {
    return this.storeContext.openListData(name);
  }

  @Override
  public ListDataBinding injectListData(ListDataBinding dataBinding) {
    return this.storeContext.injectListData(dataBinding);
  }

  @Override
  public MapDataBinding openMapData(Value name) {
    return this.storeContext.openMapData(name);
  }

  @Override
  public MapDataBinding injectMapData(MapDataBinding dataBinding) {
    return this.storeContext.injectMapData(dataBinding);
  }

  @Override
  public <S> SpatialDataBinding<S> openSpatialData(Value name, Z2Form<S> shapeForm) {
    return this.storeContext.openSpatialData(name, shapeForm);
  }

  @Override
  public <S> SpatialDataBinding<S> injectSpatialData(SpatialDataBinding<S> dataBinding) {
    return this.storeContext.injectSpatialData(dataBinding);
  }

  @Override
  public ValueDataBinding openValueData(Value name) {
    return this.storeContext.openValueData(name);
  }

  @Override
  public ValueDataBinding injectValueData(ValueDataBinding dataBinding) {
    return this.storeContext.injectValueData(dataBinding);
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
