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

package swim.dynamic.api.warp;

import swim.api.warp.WarpLane;
import swim.dynamic.Bridge;
import swim.dynamic.HostMethod;
import swim.dynamic.HostObjectType;
import swim.dynamic.JavaHostObjectType;
import swim.dynamic.api.HostLane;
import swim.dynamic.api.warp.function.GuestDidCommand;
import swim.dynamic.api.warp.function.GuestDidEnter;
import swim.dynamic.api.warp.function.GuestDidLeave;
import swim.dynamic.api.warp.function.GuestDidUplink;
import swim.dynamic.api.warp.function.GuestWillCommand;
import swim.dynamic.api.warp.function.GuestWillEnter;
import swim.dynamic.api.warp.function.GuestWillLeave;
import swim.dynamic.api.warp.function.GuestWillUplink;

public final class HostWarpLane {
  private HostWarpLane() {
    // static
  }

  public static final HostObjectType<WarpLane> TYPE;

  static {
    final JavaHostObjectType<WarpLane> type = new JavaHostObjectType<>(WarpLane.class);
    TYPE = type;
    type.inheritType(HostLane.TYPE);
    type.addMember(new HostWarpLaneWillCommand());
    type.addMember(new HostWarpLaneDidCommand());
    type.addMember(new HostWarpLaneWillUplink());
    type.addMember(new HostWarpLaneDidUplink());
    type.addMember(new HostWarpLaneWillEnter());
    type.addMember(new HostWarpLaneDidEnter());
    type.addMember(new HostWarpLaneWillLeave());
    type.addMember(new HostWarpLaneDidLeave());
  }
}

final class HostWarpLaneWillCommand implements HostMethod<WarpLane> {
  @Override
  public String key() {
    return "willCommand";
  }

  @Override
  public Object invoke(Bridge bridge, WarpLane lane, Object... arguments) {
    return lane.willCommand(new GuestWillCommand(bridge, arguments[0]));
  }
}

final class HostWarpLaneDidCommand implements HostMethod<WarpLane> {
  @Override
  public String key() {
    return "didCommand";
  }

  @Override
  public Object invoke(Bridge bridge, WarpLane lane, Object... arguments) {
    return lane.didCommand(new GuestDidCommand(bridge, arguments[0]));
  }
}

final class HostWarpLaneWillUplink implements HostMethod<WarpLane> {
  @Override
  public String key() {
    return "willUplink";
  }

  @Override
  public Object invoke(Bridge bridge, WarpLane lane, Object... arguments) {
    return lane.willUplink(new GuestWillUplink(bridge, arguments[0]));
  }
}

final class HostWarpLaneDidUplink implements HostMethod<WarpLane> {
  @Override
  public String key() {
    return "didUplink";
  }

  @Override
  public Object invoke(Bridge bridge, WarpLane lane, Object... arguments) {
    return lane.didUplink(new GuestDidUplink(bridge, arguments[0]));
  }
}

final class HostWarpLaneWillEnter implements HostMethod<WarpLane> {
  @Override
  public String key() {
    return "willEnter";
  }

  @Override
  public Object invoke(Bridge bridge, WarpLane lane, Object... arguments) {
    return lane.willEnter(new GuestWillEnter(bridge, arguments[0]));
  }
}

final class HostWarpLaneDidEnter implements HostMethod<WarpLane> {
  @Override
  public String key() {
    return "didEnter";
  }

  @Override
  public Object invoke(Bridge bridge, WarpLane lane, Object... arguments) {
    return lane.didEnter(new GuestDidEnter(bridge, arguments[0]));
  }
}

final class HostWarpLaneWillLeave implements HostMethod<WarpLane> {
  @Override
  public String key() {
    return "willLeave";
  }

  @Override
  public Object invoke(Bridge bridge, WarpLane lane, Object... arguments) {
    return lane.willLeave(new GuestWillLeave(bridge, arguments[0]));
  }
}

final class HostWarpLaneDidLeave implements HostMethod<WarpLane> {
  @Override
  public String key() {
    return "didLeave";
  }

  @Override
  public Object invoke(Bridge bridge, WarpLane lane, Object... arguments) {
    return lane.didLeave(new GuestDidLeave(bridge, arguments[0]));
  }
}
