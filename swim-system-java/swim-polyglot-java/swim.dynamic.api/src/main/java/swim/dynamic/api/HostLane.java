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

package swim.dynamic.api;

import swim.api.Lane;
import swim.dynamic.Bridge;
import swim.dynamic.HostMethod;
import swim.dynamic.HostObjectType;
import swim.dynamic.JavaHostObjectType;
import swim.dynamic.java.lang.HostObject;

public final class HostLane {
  private HostLane() {
    // static
  }

  public static final HostObjectType<Lane> TYPE;

  static {
    final JavaHostObjectType<Lane> type = new JavaHostObjectType<>(Lane.class);
    TYPE = type;
    type.inheritType(HostObject.TYPE); // FIXME: replace with type.inheritType(HostLog.TYPE);
    type.addMember(new HostLaneHostUri());
    type.addMember(new HostLaneNodeUri());
    type.addMember(new HostLaneLaneUri());
    type.addMember(new HostLaneClose());
  }
}

final class HostLaneHostUri implements HostMethod<Lane> {
  @Override
  public String key() {
    return "hostUri";
  }

  @Override
  public Object invoke(Bridge bridge, Lane lane, Object... arguments) {
    return lane.hostUri();
  }
}

final class HostLaneNodeUri implements HostMethod<Lane> {
  @Override
  public String key() {
    return "nodeUri";
  }

  @Override
  public Object invoke(Bridge bridge, Lane lane, Object... arguments) {
    return lane.nodeUri();
  }
}

final class HostLaneLaneUri implements HostMethod<Lane> {
  @Override
  public String key() {
    return "laneUri";
  }

  @Override
  public Object invoke(Bridge bridge, Lane lane, Object... arguments) {
    return lane.laneUri();
  }
}

final class HostLaneClose implements HostMethod<Lane> {
  @Override
  public String key() {
    return "close";
  }

  @Override
  public Object invoke(Bridge bridge, Lane lane, Object... arguments) {
    lane.close();
    return null;
  }
}
