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
import swim.dynamic.observable.function.GuestDidRemoveKey;
import swim.dynamic.observable.function.GuestDidUpdateKey;
import swim.dynamic.observable.function.GuestWillClear;
import swim.dynamic.observable.function.GuestWillRemoveKey;
import swim.dynamic.observable.function.GuestWillUpdateKey;
import swim.observable.ObservableMap;

public final class HostObservableMap {
  private HostObservableMap() {
    // static
  }

  public static final HostObjectType<ObservableMap<Object, Object>> TYPE;

  static {
    final JavaHostObjectType<ObservableMap<Object, Object>> type = new JavaHostObjectType<>(ObservableMap.class);
    TYPE = type;
    type.inheritType(HostObject.TYPE); // FIXME: replace with type.inheritType(HostMap.TYPE);
    type.addMember(new HostObservableMapWillUpdate());
    type.addMember(new HostObservableMapDidUpdate());
    type.addMember(new HostObservableMapWillRemove());
    type.addMember(new HostObservableMapDidRemove());
    type.addMember(new HostObservableMapWillClear());
    type.addMember(new HostObservableMapDidClear());
  }
}

final class HostObservableMapWillUpdate implements HostMethod<ObservableMap<Object, Object>> {
  @Override
  public String key() {
    return "willUpdate";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableMap<Object, Object> observable, Object... arguments) {
    return observable.willUpdate(new GuestWillUpdateKey<Object, Object>(bridge, arguments[0]));
  }
}

final class HostObservableMapDidUpdate implements HostMethod<ObservableMap<Object, Object>> {
  @Override
  public String key() {
    return "didUpdate";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableMap<Object, Object> observable, Object... arguments) {
    return observable.didUpdate(new GuestDidUpdateKey<Object, Object>(bridge, arguments[0]));
  }
}

final class HostObservableMapWillRemove implements HostMethod<ObservableMap<Object, Object>> {
  @Override
  public String key() {
    return "willRemove";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableMap<Object, Object> observable, Object... arguments) {
    return observable.willRemove(new GuestWillRemoveKey<Object>(bridge, arguments[0]));
  }
}

final class HostObservableMapDidRemove implements HostMethod<ObservableMap<Object, Object>> {
  @Override
  public String key() {
    return "didRemove";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableMap<Object, Object> observable, Object... arguments) {
    return observable.didRemove(new GuestDidRemoveKey<Object, Object>(bridge, arguments[0]));
  }
}

final class HostObservableMapWillClear implements HostMethod<ObservableMap<Object, Object>> {
  @Override
  public String key() {
    return "willClear";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableMap<Object, Object> observable, Object... arguments) {
    return observable.willClear(new GuestWillClear(bridge, arguments[0]));
  }
}

final class HostObservableMapDidClear implements HostMethod<ObservableMap<Object, Object>> {
  @Override
  public String key() {
    return "didClear";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableMap<Object, Object> observable, Object... arguments) {
    return observable.didClear(new GuestDidClear(bridge, arguments[0]));
  }
}
