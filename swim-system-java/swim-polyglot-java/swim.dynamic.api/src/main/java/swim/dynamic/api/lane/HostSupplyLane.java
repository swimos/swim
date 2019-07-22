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

import swim.api.lane.SupplyLane;
import swim.dynamic.Bridge;
import swim.dynamic.HostMethod;
import swim.dynamic.HostObjectType;
import swim.dynamic.JavaHostObjectType;
import swim.dynamic.api.warp.HostWarpLane;

public final class HostSupplyLane {
  private HostSupplyLane() {
    // static
  }

  public static final HostObjectType<SupplyLane<Object>> TYPE;

  static {
    final JavaHostObjectType<SupplyLane<Object>> type = new JavaHostObjectType<>(SupplyLane.class);
    TYPE = type;
    type.inheritType(HostWarpLane.TYPE);
    type.addMember(new HostSupplyLaneObserve());
    type.addMember(new HostSupplyLaneUnobserve());
    type.addMember(new HostSupplyLanePush());
  }
}

final class HostSupplyLaneObserve implements HostMethod<SupplyLane<Object>> {
  @Override
  public String key() {
    return "observe";
  }

  @Override
  public Object invoke(Bridge bridge, SupplyLane<Object> lane, Object... arguments) {
    final Object observer = arguments[0];
    // TODO: bridge observer callback members.
    lane.observe(observer);
    return this;
  }
}

final class HostSupplyLaneUnobserve implements HostMethod<SupplyLane<Object>> {
  @Override
  public String key() {
    return "unobserve";
  }

  @Override
  public Object invoke(Bridge bridge, SupplyLane<Object> lane, Object... arguments) {
    final Object observer = arguments[0];
    // TODO: bridge observer callback members.
    lane.unobserve(observer);
    return this;
  }
}

final class HostSupplyLanePush implements HostMethod<SupplyLane<Object>> {
  @Override
  public String key() {
    return "push";
  }

  @Override
  public Object invoke(Bridge bridge, SupplyLane<Object> lane, Object... arguments) {
    lane.push(arguments[0]);
    return null;
  }
}
