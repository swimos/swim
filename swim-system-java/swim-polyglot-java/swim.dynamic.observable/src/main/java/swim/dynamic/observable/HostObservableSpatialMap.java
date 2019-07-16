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

package swim.dynamic.observable;

import swim.dynamic.Bridge;
import swim.dynamic.HostMethod;
import swim.dynamic.HostObjectType;
import swim.dynamic.JavaHostObjectType;
import swim.dynamic.java.lang.HostObject;
import swim.dynamic.observable.function.GuestDidClear;
import swim.dynamic.observable.function.GuestDidMoveShape;
import swim.dynamic.observable.function.GuestDidRemoveShape;
import swim.dynamic.observable.function.GuestDidUpdateShape;
import swim.dynamic.observable.function.GuestWillClear;
import swim.dynamic.observable.function.GuestWillMoveShape;
import swim.dynamic.observable.function.GuestWillRemoveShape;
import swim.dynamic.observable.function.GuestWillUpdateShape;
import swim.observable.ObservableSpatialMap;

public final class HostObservableSpatialMap {
  private HostObservableSpatialMap() {
    // static
  }

  public static final HostObjectType<ObservableSpatialMap<Object, Object, Object>> TYPE;

  static {
    final JavaHostObjectType<ObservableSpatialMap<Object, Object, Object>> type = new JavaHostObjectType<>(ObservableSpatialMap.class);
    TYPE = type;
    type.inheritType(HostObject.TYPE); // FIXME: replace with type.inheritType(HostSpatialMap.TYPE);
    type.addMember(new HostObservableSpatialMapWillUpdate());
    type.addMember(new HostObservableSpatialMapDidUpdate());
    type.addMember(new HostObservableSpatialMapWillMove());
    type.addMember(new HostObservableSpatialMapDidMove());
    type.addMember(new HostObservableSpatialMapWillRemove());
    type.addMember(new HostObservableSpatialMapDidRemove());
    type.addMember(new HostObservableSpatialMapWillClear());
    type.addMember(new HostObservableSpatialMapDidClear());
  }
}

final class HostObservableSpatialMapWillUpdate implements HostMethod<ObservableSpatialMap<Object, Object, Object>> {
  @Override
  public String key() {
    return "willUpdate";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableSpatialMap<Object, Object, Object> observable, Object... arguments) {
    return observable.willUpdate(new GuestWillUpdateShape<Object, Object, Object>(bridge, arguments[0]));
  }
}

final class HostObservableSpatialMapDidUpdate implements HostMethod<ObservableSpatialMap<Object, Object, Object>> {
  @Override
  public String key() {
    return "didUpdate";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableSpatialMap<Object, Object, Object> observable, Object... arguments) {
    return observable.didUpdate(new GuestDidUpdateShape<Object, Object, Object>(bridge, arguments[0]));
  }
}

final class HostObservableSpatialMapWillMove implements HostMethod<ObservableSpatialMap<Object, Object, Object>> {
  @Override
  public String key() {
    return "willMove";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableSpatialMap<Object, Object, Object> observable, Object... arguments) {
    return observable.willMove(new GuestWillMoveShape<Object, Object, Object>(bridge, arguments[0]));
  }
}

final class HostObservableSpatialMapDidMove implements HostMethod<ObservableSpatialMap<Object, Object, Object>> {
  @Override
  public String key() {
    return "didMove";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableSpatialMap<Object, Object, Object> observable, Object... arguments) {
    return observable.didMove(new GuestDidMoveShape<Object, Object, Object>(bridge, arguments[0]));
  }
}

final class HostObservableSpatialMapWillRemove implements HostMethod<ObservableSpatialMap<Object, Object, Object>> {
  @Override
  public String key() {
    return "willRemove";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableSpatialMap<Object, Object, Object> observable, Object... arguments) {
    return observable.willRemove(new GuestWillRemoveShape<Object, Object>(bridge, arguments[0]));
  }
}

final class HostObservableSpatialMapDidRemove implements HostMethod<ObservableSpatialMap<Object, Object, Object>> {
  @Override
  public String key() {
    return "didRemove";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableSpatialMap<Object, Object, Object> observable, Object... arguments) {
    return observable.didRemove(new GuestDidRemoveShape<Object, Object, Object>(bridge, arguments[0]));
  }
}

final class HostObservableSpatialMapWillClear implements HostMethod<ObservableSpatialMap<Object, Object, Object>> {
  @Override
  public String key() {
    return "willClear";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableSpatialMap<Object, Object, Object> observable, Object... arguments) {
    return observable.willClear(new GuestWillClear(bridge, arguments[0]));
  }
}

final class HostObservableSpatialMapDidClear implements HostMethod<ObservableSpatialMap<Object, Object, Object>> {
  @Override
  public String key() {
    return "didClear";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableSpatialMap<Object, Object, Object> observable, Object... arguments) {
    return observable.didClear(new GuestDidClear(bridge, arguments[0]));
  }
}
