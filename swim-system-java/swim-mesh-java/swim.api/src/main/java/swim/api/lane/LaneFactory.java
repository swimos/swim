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

package swim.api.lane;

import swim.api.http.HttpLane;
import swim.api.ws.WsLane;
import swim.math.R2Shape;
import swim.math.Z2Form;

public interface LaneFactory {
  <V> CommandLane<V> commandLane();

  <V> DemandLane<V> demandLane();

  <K, V> DemandMapLane<K, V> demandMapLane();

  <V> HttpLane<V> httpLane();

  <L, K, V> JoinMapLane<L, K, V> joinMapLane();

  <K, V> JoinValueLane<K, V> joinValueLane();

  <V> ListLane<V> listLane();

  <K, V> MapLane<K, V> mapLane();

  <K, S, V> SpatialLane<K, S, V> spatialLane(Z2Form<S> shapeForm);

  <K, V> SpatialLane<K, R2Shape, V> geospatialLane();

  <V> SupplyLane<V> supplyLane();

  <V> ValueLane<V> valueLane();

  <I, O> WsLane<I, O> wsLane();
}
