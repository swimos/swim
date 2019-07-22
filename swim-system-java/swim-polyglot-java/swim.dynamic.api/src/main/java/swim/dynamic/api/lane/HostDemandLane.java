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

import swim.api.lane.DemandLane;
import swim.dynamic.Bridge;
import swim.dynamic.HostMethod;
import swim.dynamic.HostObjectType;
import swim.dynamic.JavaHostObjectType;
import swim.dynamic.api.lane.function.GuestOnCue;
import swim.dynamic.api.warp.HostWarpLane;

public final class HostDemandLane {
  private HostDemandLane() {
    // static
  }

  public static final HostObjectType<DemandLane<Object>> TYPE;

  static {
    final JavaHostObjectType<DemandLane<Object>> type = new JavaHostObjectType<>(DemandLane.class);
    TYPE = type;
    type.inheritType(HostWarpLane.TYPE);
    type.addMember(new HostDemandLaneObserve());
    type.addMember(new HostDemandLaneUnobserve());
    type.addMember(new HostDemandLaneOnCue());
    type.addMember(new HostDemandLaneCue());
  }
}

final class HostDemandLaneObserve implements HostMethod<DemandLane<Object>> {
  @Override
  public String key() {
    return "observe";
  }

  @Override
  public Object invoke(Bridge bridge, DemandLane<Object> lane, Object... arguments) {
    final Object observer = arguments[0];
    // TODO: bridge observer callback members.
    lane.observe(observer);
    return this;
  }
}

final class HostDemandLaneUnobserve implements HostMethod<DemandLane<Object>> {
  @Override
  public String key() {
    return "unobserve";
  }

  @Override
  public Object invoke(Bridge bridge, DemandLane<Object> lane, Object... arguments) {
    final Object observer = arguments[0];
    // TODO: bridge observer callback members.
    lane.unobserve(observer);
    return this;
  }
}

final class HostDemandLaneOnCue implements HostMethod<DemandLane<Object>> {
  @Override
  public String key() {
    return "onCue";
  }

  @Override
  public Object invoke(Bridge bridge, DemandLane<Object> lane, Object... arguments) {
    return lane.onCue(new GuestOnCue<Object>(bridge, arguments[0]));
  }
}

final class HostDemandLaneCue implements HostMethod<DemandLane<Object>> {
  @Override
  public String key() {
    return "cue";
  }

  @Override
  public Object invoke(Bridge bridge, DemandLane<Object> lane, Object... arguments) {
    lane.cue();
    return null;
  }
}
