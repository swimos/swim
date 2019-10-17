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

import swim.api.lane.DemandMapLane;
import swim.dynamic.Bridge;
import swim.dynamic.HostMethod;
import swim.dynamic.HostObjectType;
import swim.dynamic.JavaHostObjectType;
import swim.dynamic.api.lane.function.GuestOnCueKey;
import swim.dynamic.api.lane.function.GuestOnSyncKeys;
import swim.dynamic.api.warp.HostWarpLane;

public final class HostDemandMapLane {
  private HostDemandMapLane() {
    // static
  }

  public static final HostObjectType<DemandMapLane<Object, Object>> TYPE;

  static {
    final JavaHostObjectType<DemandMapLane<Object, Object>> type = new JavaHostObjectType<>(DemandMapLane.class);
    TYPE = type;
    type.inheritType(HostWarpLane.TYPE);
    type.addMember(new HostDemandMapLaneObserve());
    type.addMember(new HostDemandMapLaneUnobserve());
    type.addMember(new HostDemandMapLaneOnCue());
    type.addMember(new HostDemandMapLaneOnSync());
    type.addMember(new HostDemandMapLaneCue());
    type.addMember(new HostDemandMapLaneRemove());
  }
}

final class HostDemandMapLaneObserve implements HostMethod<DemandMapLane<Object, Object>> {
  @Override
  public String key() {
    return "observe";
  }

  @Override
  public Object invoke(Bridge bridge, DemandMapLane<Object, Object> lane, Object... arguments) {
    final Object observer = arguments[0];
    // TODO: bridge observer callback members.
    lane.observe(observer);
    return this;
  }
}

final class HostDemandMapLaneUnobserve implements HostMethod<DemandMapLane<Object, Object>> {
  @Override
  public String key() {
    return "unobserve";
  }

  @Override
  public Object invoke(Bridge bridge, DemandMapLane<Object, Object> lane, Object... arguments) {
    final Object observer = arguments[0];
    // TODO: bridge observer callback members.
    lane.unobserve(observer);
    return this;
  }
}

final class HostDemandMapLaneOnCue implements HostMethod<DemandMapLane<Object, Object>> {
  @Override
  public String key() {
    return "onCue";
  }

  @Override
  public Object invoke(Bridge bridge, DemandMapLane<Object, Object> lane, Object... arguments) {
    return lane.onCue(new GuestOnCueKey<Object, Object>(bridge, arguments[0]));
  }
}

final class HostDemandMapLaneOnSync implements HostMethod<DemandMapLane<Object, Object>> {
  @Override
  public String key() {
    return "onSync";
  }

  @Override
  public Object invoke(Bridge bridge, DemandMapLane<Object, Object> lane, Object... arguments) {
    return lane.onSync(new GuestOnSyncKeys<Object>(bridge, arguments[0]));
  }
}

final class HostDemandMapLaneCue implements HostMethod<DemandMapLane<Object, Object>> {
  @Override
  public String key() {
    return "cue";
  }

  @Override
  public Object invoke(Bridge bridge, DemandMapLane<Object, Object> lane, Object... arguments) {
    lane.cue(arguments[0]);
    return null;
  }
}

final class HostDemandMapLaneRemove implements HostMethod<DemandMapLane<Object, Object>> {
  @Override
  public String key() {
    return "remove";
  }

  @Override
  public Object invoke(Bridge bridge, DemandMapLane<Object, Object> lane, Object... arguments) {
    lane.remove(arguments[0]);
    return null;
  }
}
