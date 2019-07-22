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

import swim.api.lane.JoinValueLane;
import swim.dynamic.Bridge;
import swim.dynamic.HostMethod;
import swim.dynamic.HostObjectType;
import swim.dynamic.JavaHostObjectType;
import swim.dynamic.api.lane.function.GuestDidDownlinkValue;
import swim.dynamic.api.lane.function.GuestWillDownlinkValue;
import swim.dynamic.api.warp.HostWarpLane;
import swim.dynamic.java.lang.HostIterable;
import swim.dynamic.observable.HostObservableMap;

public final class HostJoinValueLane {
  private HostJoinValueLane() {
    // static
  }

  public static final HostObjectType<JoinValueLane<Object, Object>> TYPE;

  static {
    final JavaHostObjectType<JoinValueLane<Object, Object>> type = new JavaHostObjectType<>(JoinValueLane.class);
    TYPE = type;
    type.inheritType(HostWarpLane.TYPE);
    type.inheritType(HostIterable.TYPE);
    type.inheritType(HostObservableMap.TYPE);
    type.addMember(new HostJoinValueLaneIsResident());
    type.addMember(new HostJoinValueLaneIsTransient());
    type.addMember(new HostJoinValueLaneObserve());
    type.addMember(new HostJoinValueLaneUnobserve());
    type.addMember(new HostJoinValueLaneWillDownlink());
    type.addMember(new HostJoinValueLaneDidDownlink());
    type.addMember(new HostJoinValueLaneDownlink());
    type.addMember(new HostJoinValueLaneGetDownlink());
  }
}

final class HostJoinValueLaneIsResident implements HostMethod<JoinValueLane<Object, Object>> {
  @Override
  public String key() {
    return "isResident";
  }

  @Override
  public Object invoke(Bridge bridge, JoinValueLane<Object, Object> lane, Object... arguments) {
    final Object isResident = arguments.length == 0 ? null : arguments[0];
    if (isResident == null) {
      return lane.isResident();
    } else {
      return lane.isResident((boolean) isResident);
    }
  }
}

final class HostJoinValueLaneIsTransient implements HostMethod<JoinValueLane<Object, Object>> {
  @Override
  public String key() {
    return "isTransient";
  }

  @Override
  public Object invoke(Bridge bridge, JoinValueLane<Object, Object> lane, Object... arguments) {
    final Object isTransient = arguments.length == 0 ? null : arguments[0];
    if (isTransient == null) {
      return lane.isTransient();
    } else {
      return lane.isTransient((boolean) isTransient);
    }
  }
}

final class HostJoinValueLaneObserve implements HostMethod<JoinValueLane<Object, Object>> {
  @Override
  public String key() {
    return "observe";
  }

  @Override
  public Object invoke(Bridge bridge, JoinValueLane<Object, Object> lane, Object... arguments) {
    final Object observer = arguments[0];
    // TODO: bridge observer callback members.
    lane.observe(observer);
    return this;
  }
}

final class HostJoinValueLaneUnobserve implements HostMethod<JoinValueLane<Object, Object>> {
  @Override
  public String key() {
    return "unobserve";
  }

  @Override
  public Object invoke(Bridge bridge, JoinValueLane<Object, Object> lane, Object... arguments) {
    final Object observer = arguments[0];
    // TODO: bridge observer callback members.
    lane.unobserve(observer);
    return this;
  }
}

final class HostJoinValueLaneWillDownlink implements HostMethod<JoinValueLane<Object, Object>> {
  @Override
  public String key() {
    return "willDownlink";
  }

  @Override
  public Object invoke(Bridge bridge, JoinValueLane<Object, Object> lane, Object... arguments) {
    return lane.willDownlink(new GuestWillDownlinkValue<Object>(bridge, arguments[0]));
  }
}

final class HostJoinValueLaneDidDownlink implements HostMethod<JoinValueLane<Object, Object>> {
  @Override
  public String key() {
    return "didDownlink";
  }

  @Override
  public Object invoke(Bridge bridge, JoinValueLane<Object, Object> lane, Object... arguments) {
    return lane.didDownlink(new GuestDidDownlinkValue<Object>(bridge, arguments[0]));
  }
}

final class HostJoinValueLaneDownlink implements HostMethod<JoinValueLane<Object, Object>> {
  @Override
  public String key() {
    return "downlink";
  }

  @Override
  public Object invoke(Bridge bridge, JoinValueLane<Object, Object> lane, Object... arguments) {
    return lane.downlink(arguments[0]);
  }
}

final class HostJoinValueLaneGetDownlink implements HostMethod<JoinValueLane<Object, Object>> {
  @Override
  public String key() {
    return "getDownlink";
  }

  @Override
  public Object invoke(Bridge bridge, JoinValueLane<Object, Object> lane, Object... arguments) {
    return lane.getDownlink(arguments[0]);
  }
}
