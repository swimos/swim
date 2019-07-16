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
import swim.dynamic.observable.function.GuestDidDrop;
import swim.dynamic.observable.function.GuestDidTake;
import swim.dynamic.observable.function.GuestWillDrop;
import swim.dynamic.observable.function.GuestWillTake;
import swim.observable.ObservableSortedMap;

public final class HostObservableSortedMap {
  private HostObservableSortedMap() {
    // static
  }

  public static final HostObjectType<ObservableSortedMap<Object, Object>> TYPE;

  static {
    final JavaHostObjectType<ObservableSortedMap<Object, Object>> type = new JavaHostObjectType<>(ObservableSortedMap.class);
    TYPE = type;
    type.inheritType(HostObservableMap.TYPE);
    // FIXME: type.inheritType(HostSortedMap.TYPE);
    type.addMember(new HostObservableSortedMapDrop());
    type.addMember(new HostObservableSortedMapTake());
    type.addMember(new HostObservableSortedMapWillDrop());
    type.addMember(new HostObservableSortedMapDidDrop());
    type.addMember(new HostObservableSortedMapWillTake());
    type.addMember(new HostObservableSortedMapDidTake());
  }
}

final class HostObservableSortedMapDrop implements HostMethod<ObservableSortedMap<Object, Object>> {
  @Override
  public String key() {
    return "drop";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableSortedMap<Object, Object> observable, Object... arguments) {
    observable.drop((int) arguments[0]);
    return null;
  }
}

final class HostObservableSortedMapTake implements HostMethod<ObservableSortedMap<Object, Object>> {
  @Override
  public String key() {
    return "take";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableSortedMap<Object, Object> observable, Object... arguments) {
    observable.take((int) arguments[0]);
    return null;
  }
}

final class HostObservableSortedMapWillDrop implements HostMethod<ObservableSortedMap<Object, Object>> {
  @Override
  public String key() {
    return "willDrop";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableSortedMap<Object, Object> observable, Object... arguments) {
    return observable.willDrop(new GuestWillDrop(bridge, arguments[0]));
  }
}

final class HostObservableSortedMapDidDrop implements HostMethod<ObservableSortedMap<Object, Object>> {
  @Override
  public String key() {
    return "didDrop";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableSortedMap<Object, Object> observable, Object... arguments) {
    return observable.didDrop(new GuestDidDrop(bridge, arguments[0]));
  }
}

final class HostObservableSortedMapWillTake implements HostMethod<ObservableSortedMap<Object, Object>> {
  @Override
  public String key() {
    return "willTake";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableSortedMap<Object, Object> observable, Object... arguments) {
    return observable.willTake(new GuestWillTake(bridge, arguments[0]));
  }
}

final class HostObservableSortedMapDidTake implements HostMethod<ObservableSortedMap<Object, Object>> {
  @Override
  public String key() {
    return "didTake";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableSortedMap<Object, Object> observable, Object... arguments) {
    return observable.didTake(new GuestDidTake(bridge, arguments[0]));
  }
}
