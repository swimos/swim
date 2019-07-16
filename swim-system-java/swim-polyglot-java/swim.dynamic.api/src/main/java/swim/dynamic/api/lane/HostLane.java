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

import swim.api.lane.Lane;
import swim.dynamic.Bridge;
import swim.dynamic.HostMethod;
import swim.dynamic.HostObjectType;
import swim.dynamic.JavaHostObjectType;
import swim.dynamic.api.function.GuestDidCommand;
import swim.dynamic.api.function.GuestWillCommand;
import swim.dynamic.api.lane.function.GuestDidEnter;
import swim.dynamic.api.lane.function.GuestDidLeave;
import swim.dynamic.api.lane.function.GuestDidUplink;
import swim.dynamic.api.lane.function.GuestWillEnter;
import swim.dynamic.api.lane.function.GuestWillLeave;
import swim.dynamic.api.lane.function.GuestWillUplink;
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
    type.addMember(new HostLaneWillCommand());
    type.addMember(new HostLaneDidCommand());
    type.addMember(new HostLaneWillUplink());
    type.addMember(new HostLaneDidUplink());
    type.addMember(new HostLaneWillEnter());
    type.addMember(new HostLaneDidEnter());
    type.addMember(new HostLaneWillLeave());
    type.addMember(new HostLaneDidLeave());
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

final class HostLaneWillCommand implements HostMethod<Lane> {
  @Override
  public String key() {
    return "willCommand";
  }

  @Override
  public Object invoke(Bridge bridge, Lane lane, Object... arguments) {
    return lane.willCommand(new GuestWillCommand(bridge, arguments[0]));
  }
}

final class HostLaneDidCommand implements HostMethod<Lane> {
  @Override
  public String key() {
    return "didCommand";
  }

  @Override
  public Object invoke(Bridge bridge, Lane lane, Object... arguments) {
    return lane.didCommand(new GuestDidCommand(bridge, arguments[0]));
  }
}

final class HostLaneWillUplink implements HostMethod<Lane> {
  @Override
  public String key() {
    return "willUplink";
  }

  @Override
  public Object invoke(Bridge bridge, Lane lane, Object... arguments) {
    return lane.willUplink(new GuestWillUplink(bridge, arguments[0]));
  }
}

final class HostLaneDidUplink implements HostMethod<Lane> {
  @Override
  public String key() {
    return "didUplink";
  }

  @Override
  public Object invoke(Bridge bridge, Lane lane, Object... arguments) {
    return lane.didUplink(new GuestDidUplink(bridge, arguments[0]));
  }
}

final class HostLaneWillEnter implements HostMethod<Lane> {
  @Override
  public String key() {
    return "willEnter";
  }

  @Override
  public Object invoke(Bridge bridge, Lane lane, Object... arguments) {
    return lane.willEnter(new GuestWillEnter(bridge, arguments[0]));
  }
}

final class HostLaneDidEnter implements HostMethod<Lane> {
  @Override
  public String key() {
    return "didEnter";
  }

  @Override
  public Object invoke(Bridge bridge, Lane lane, Object... arguments) {
    return lane.didEnter(new GuestDidEnter(bridge, arguments[0]));
  }
}

final class HostLaneWillLeave implements HostMethod<Lane> {
  @Override
  public String key() {
    return "willLeave";
  }

  @Override
  public Object invoke(Bridge bridge, Lane lane, Object... arguments) {
    return lane.willLeave(new GuestWillLeave(bridge, arguments[0]));
  }
}

final class HostLaneDidLeave implements HostMethod<Lane> {
  @Override
  public String key() {
    return "didLeave";
  }

  @Override
  public Object invoke(Bridge bridge, Lane lane, Object... arguments) {
    return lane.didLeave(new GuestDidLeave(bridge, arguments[0]));
  }
}
