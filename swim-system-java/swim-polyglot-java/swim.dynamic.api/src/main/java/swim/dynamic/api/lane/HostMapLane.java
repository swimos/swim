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

import swim.api.lane.MapLane;
import swim.dynamic.Bridge;
import swim.dynamic.HostMethod;
import swim.dynamic.HostObjectType;
import swim.dynamic.JavaHostObjectType;
import swim.dynamic.api.warp.HostWarpLane;
import swim.dynamic.observable.HostObservableSortedMap;

public final class HostMapLane {
  private HostMapLane() {
    // static
  }

  public static final HostObjectType<MapLane<Object, Object>> TYPE;

  static {
    final JavaHostObjectType<MapLane<Object, Object>> type = new JavaHostObjectType<>(MapLane.class);
    TYPE = type;
    type.inheritType(HostWarpLane.TYPE);
    type.inheritType(HostObservableSortedMap.TYPE);
    type.addMember(new HostMapLaneIsResident());
    type.addMember(new HostMapLaneIsTransient());
    type.addMember(new HostMapLaneObserve());
    type.addMember(new HostMapLaneUnobserve());
  }
}

final class HostMapLaneIsResident implements HostMethod<MapLane<Object, Object>> {
  @Override
  public String key() {
    return "isResident";
  }

  @Override
  public Object invoke(Bridge bridge, MapLane<Object, Object> lane, Object... arguments) {
    final Object isResident = arguments.length == 0 ? null : arguments[0];
    if (isResident == null) {
      return lane.isResident();
    } else {
      return lane.isResident((boolean) isResident);
    }
  }
}

final class HostMapLaneIsTransient implements HostMethod<MapLane<Object, Object>> {
  @Override
  public String key() {
    return "isTransient";
  }

  @Override
  public Object invoke(Bridge bridge, MapLane<Object, Object> lane, Object... arguments) {
    final Object isTransient = arguments.length == 0 ? null : arguments[0];
    if (isTransient == null) {
      return lane.isTransient();
    } else {
      return lane.isTransient((boolean) isTransient);
    }
  }
}

final class HostMapLaneObserve implements HostMethod<MapLane<Object, Object>> {
  @Override
  public String key() {
    return "observe";
  }

  @Override
  public Object invoke(Bridge bridge, MapLane<Object, Object> lane, Object... arguments) {
    final Object observer = arguments[0];
    // TODO: bridge observer callback members.
    lane.observe(observer);
    return this;
  }
}

final class HostMapLaneUnobserve implements HostMethod<MapLane<Object, Object>> {
  @Override
  public String key() {
    return "unobserve";
  }

  @Override
  public Object invoke(Bridge bridge, MapLane<Object, Object> lane, Object... arguments) {
    final Object observer = arguments[0];
    // TODO: bridge observer callback members.
    lane.unobserve(observer);
    return this;
  }
}
