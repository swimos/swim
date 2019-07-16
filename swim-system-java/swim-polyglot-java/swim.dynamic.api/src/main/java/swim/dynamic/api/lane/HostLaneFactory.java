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

package swim.dynamic.api.lane;

import swim.api.lane.LaneFactory;
import swim.dynamic.Bridge;
import swim.dynamic.HostMethod;
import swim.dynamic.HostObjectType;
import swim.dynamic.JavaHostObjectType;
import swim.dynamic.java.lang.HostObject;
import swim.math.Z2Form;
import swim.structure.Form;

public final class HostLaneFactory {
  private HostLaneFactory() {
    // static
  }

  public static final HostObjectType<LaneFactory> TYPE;

  static {
    final JavaHostObjectType<LaneFactory> type = new JavaHostObjectType<>(LaneFactory.class);
    TYPE = type;
    type.inheritType(HostObject.TYPE);
    type.addMember(new HostLaneFactoryCommandLane());
    type.addMember(new HostLaneFactoryDemandLane());
    type.addMember(new HostLaneFactoryDemandMapLane());
    type.addMember(new HostLaneFactoryJoinMapLane());
    type.addMember(new HostLaneFactoryJoinValueLane());
    type.addMember(new HostLaneFactoryListLane());
    type.addMember(new HostLaneFactoryMapLane());
    type.addMember(new HostLaneFactorySpatialLane());
    type.addMember(new HostLaneFactoryGeospatialLane());
    type.addMember(new HostLaneFactorySupplyLane());
    type.addMember(new HostLaneFactoryValueLane());
  }
}

final class HostLaneFactoryCommandLane implements HostMethod<LaneFactory> {
  @Override
  public String key() {
    return "commandLane";
  }

  @Override
  public Object invoke(Bridge bridge, LaneFactory laneFactory, Object... arguments) {
    return laneFactory.commandLane()
                      .valueForm(Form.forValue());
  }
}

final class HostLaneFactoryDemandLane implements HostMethod<LaneFactory> {
  @Override
  public String key() {
    return "demandLane";
  }

  @Override
  public Object invoke(Bridge bridge, LaneFactory laneFactory, Object... arguments) {
    return laneFactory.demandLane()
                      .valueForm(Form.forValue());
  }
}

final class HostLaneFactoryDemandMapLane implements HostMethod<LaneFactory> {
  @Override
  public String key() {
    return "demandMapLane";
  }

  @Override
  public Object invoke(Bridge bridge, LaneFactory laneFactory, Object... arguments) {
    return laneFactory.demandMapLane()
                      .keyForm(Form.forValue())
                      .valueForm(Form.forValue());
  }
}

final class HostLaneFactoryJoinMapLane implements HostMethod<LaneFactory> {
  @Override
  public String key() {
    return "joinMapLane";
  }

  @Override
  public Object invoke(Bridge bridge, LaneFactory laneFactory, Object... arguments) {
    return laneFactory.joinMapLane()
                      .linkForm(Form.forValue())
                      .keyForm(Form.forValue())
                      .valueForm(Form.forValue());
  }
}

final class HostLaneFactoryJoinValueLane implements HostMethod<LaneFactory> {
  @Override
  public String key() {
    return "joinValueLane";
  }

  @Override
  public Object invoke(Bridge bridge, LaneFactory laneFactory, Object... arguments) {
    return laneFactory.joinValueLane()
                      .keyForm(Form.forValue())
                      .valueForm(Form.forValue());
  }
}

final class HostLaneFactoryListLane implements HostMethod<LaneFactory> {
  @Override
  public String key() {
    return "listLane";
  }

  @Override
  public Object invoke(Bridge bridge, LaneFactory laneFactory, Object... arguments) {
    return laneFactory.listLane()
                      .valueForm(Form.forValue());
  }
}

final class HostLaneFactoryMapLane implements HostMethod<LaneFactory> {
  @Override
  public String key() {
    return "mapLane";
  }

  @Override
  public Object invoke(Bridge bridge, LaneFactory laneFactory, Object... arguments) {
    return laneFactory.mapLane()
                      .keyForm(Form.forValue())
                      .valueForm(Form.forValue());
  }
}

final class HostLaneFactorySpatialLane implements HostMethod<LaneFactory> {
  @Override
  public String key() {
    return "spatialLane";
  }

  @SuppressWarnings("unchecked")
  @Override
  public Object invoke(Bridge bridge, LaneFactory laneFactory, Object... arguments) {
    return laneFactory.spatialLane((Z2Form<Object>) arguments[0])
                      .keyForm(Form.forValue())
                      .valueForm(Form.forValue());
  }
}

final class HostLaneFactoryGeospatialLane implements HostMethod<LaneFactory> {
  @Override
  public String key() {
    return "geospatialLane";
  }

  @Override
  public Object invoke(Bridge bridge, LaneFactory laneFactory, Object... arguments) {
    return laneFactory.geospatialLane()
                      .keyForm(Form.forValue())
                      .valueForm(Form.forValue());
  }
}

final class HostLaneFactorySupplyLane implements HostMethod<LaneFactory> {
  @Override
  public String key() {
    return "supplyLane";
  }

  @Override
  public Object invoke(Bridge bridge, LaneFactory laneFactory, Object... arguments) {
    return laneFactory.supplyLane()
                      .valueForm(Form.forValue());
  }
}

final class HostLaneFactoryValueLane implements HostMethod<LaneFactory> {
  @Override
  public String key() {
    return "valueLane";
  }

  @Override
  public Object invoke(Bridge bridge, LaneFactory laneFactory, Object... arguments) {
    return laneFactory.valueLane()
                      .valueForm(Form.forValue());
  }
}
