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

import swim.api.plane.PlaneContext;
import swim.math.Z2Form;
import swim.structure.Value;
import swim.uri.Uri;

public interface Storage {

  void init(PlaneContext planeContext, Value storeSettings);

  void init(String path, String basePath, PlaneContext planeContext);

  ListDataBinding openListData(Value name);

  ListDataBinding openListData(Uri nodeUri, Value name);

  MapDataBinding openMapData(Value name);

  MapDataBinding openMapData(Uri nodeUri, Value name);

  <S> SpatialDataBinding<S> openSpatialData(Value name, Z2Form<S> shapeForm);

  <S> SpatialDataBinding<S> openSpatialData(Uri nodeUri, Value name, Z2Form<S> shapeForm);

  ValueDataBinding openValueData(Value name);

  ValueDataBinding openValueData(Uri nodeUri, Value name);

  void close();
}
