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
import swim.dynamic.observable.function.GuestDidDrop;
import swim.dynamic.observable.function.GuestDidMoveIndex;
import swim.dynamic.observable.function.GuestDidRemoveIndex;
import swim.dynamic.observable.function.GuestDidTake;
import swim.dynamic.observable.function.GuestDidUpdateIndex;
import swim.dynamic.observable.function.GuestWillClear;
import swim.dynamic.observable.function.GuestWillDrop;
import swim.dynamic.observable.function.GuestWillMoveIndex;
import swim.dynamic.observable.function.GuestWillRemoveIndex;
import swim.dynamic.observable.function.GuestWillTake;
import swim.dynamic.observable.function.GuestWillUpdateIndex;
import swim.observable.ObservableList;

public final class HostObservableList {
  private HostObservableList() {
    // static
  }

  public static final HostObjectType<ObservableList<Object>> TYPE;

  static {
    final JavaHostObjectType<ObservableList<Object>> type = new JavaHostObjectType<>(ObservableList.class);
    TYPE = type;
    type.inheritType(HostObject.TYPE); // FIXME: replace with type.inheritType(HostList.TYPE);
    type.addMember(new HostObservableListDrop());
    type.addMember(new HostObservableListTake());
    type.addMember(new HostObservableListMove());
    type.addMember(new HostObservableListWillUpdate());
    type.addMember(new HostObservableListDidUpdate());
    type.addMember(new HostObservableListWillMove());
    type.addMember(new HostObservableListDidMove());
    type.addMember(new HostObservableListWillRemove());
    type.addMember(new HostObservableListDidRemove());
    type.addMember(new HostObservableListWillDrop());
    type.addMember(new HostObservableListDidDrop());
    type.addMember(new HostObservableListWillTake());
    type.addMember(new HostObservableListDidTake());
    type.addMember(new HostObservableListWillClear());
    type.addMember(new HostObservableListDidClear());
  }
}

final class HostObservableListDrop implements HostMethod<ObservableList<Object>> {
  @Override
  public String key() {
    return "drop";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableList<Object> observable, Object... arguments) {
    observable.drop((int) arguments[0]);
    return null;
  }
}

final class HostObservableListTake implements HostMethod<ObservableList<Object>> {
  @Override
  public String key() {
    return "take";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableList<Object> observable, Object... arguments) {
    observable.take((int) arguments[0]);
    return null;
  }
}

final class HostObservableListMove implements HostMethod<ObservableList<Object>> {
  @Override
  public String key() {
    return "move";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableList<Object> observable, Object... arguments) {
    observable.move((int) arguments[0], (int) arguments[1]);
    return null;
  }
}

final class HostObservableListWillUpdate implements HostMethod<ObservableList<Object>> {
  @Override
  public String key() {
    return "willUpdate";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableList<Object> observable, Object... arguments) {
    return observable.willUpdate(new GuestWillUpdateIndex<Object>(bridge, arguments[0]));
  }
}

final class HostObservableListDidUpdate implements HostMethod<ObservableList<Object>> {
  @Override
  public String key() {
    return "didUpdate";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableList<Object> observable, Object... arguments) {
    return observable.didUpdate(new GuestDidUpdateIndex<Object>(bridge, arguments[0]));
  }
}

final class HostObservableListWillMove implements HostMethod<ObservableList<Object>> {
  @Override
  public String key() {
    return "willMove";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableList<Object> observable, Object... arguments) {
    return observable.willMove(new GuestWillMoveIndex<Object>(bridge, arguments[0]));
  }
}

final class HostObservableListDidMove implements HostMethod<ObservableList<Object>> {
  @Override
  public String key() {
    return "didMove";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableList<Object> observable, Object... arguments) {
    return observable.didMove(new GuestDidMoveIndex<Object>(bridge, arguments[0]));
  }
}

final class HostObservableListWillRemove implements HostMethod<ObservableList<Object>> {
  @Override
  public String key() {
    return "willRemove";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableList<Object> observable, Object... arguments) {
    return observable.willRemove(new GuestWillRemoveIndex(bridge, arguments[0]));
  }
}

final class HostObservableListDidRemove implements HostMethod<ObservableList<Object>> {
  @Override
  public String key() {
    return "didRemove";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableList<Object> observable, Object... arguments) {
    return observable.didRemove(new GuestDidRemoveIndex<Object>(bridge, arguments[0]));
  }
}

final class HostObservableListWillDrop implements HostMethod<ObservableList<Object>> {
  @Override
  public String key() {
    return "willDrop";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableList<Object> observable, Object... arguments) {
    return observable.willDrop(new GuestWillDrop(bridge, arguments[0]));
  }
}

final class HostObservableListDidDrop implements HostMethod<ObservableList<Object>> {
  @Override
  public String key() {
    return "didDrop";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableList<Object> observable, Object... arguments) {
    return observable.didDrop(new GuestDidDrop(bridge, arguments[0]));
  }
}

final class HostObservableListWillTake implements HostMethod<ObservableList<Object>> {
  @Override
  public String key() {
    return "willTake";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableList<Object> observable, Object... arguments) {
    return observable.willTake(new GuestWillTake(bridge, arguments[0]));
  }
}

final class HostObservableListDidTake implements HostMethod<ObservableList<Object>> {
  @Override
  public String key() {
    return "didTake";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableList<Object> observable, Object... arguments) {
    return observable.didTake(new GuestDidTake(bridge, arguments[0]));
  }
}

final class HostObservableListWillClear implements HostMethod<ObservableList<Object>> {
  @Override
  public String key() {
    return "willClear";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableList<Object> observable, Object... arguments) {
    return observable.willClear(new GuestWillClear(bridge, arguments[0]));
  }
}

final class HostObservableListDidClear implements HostMethod<ObservableList<Object>> {
  @Override
  public String key() {
    return "didClear";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableList<Object> observable, Object... arguments) {
    return observable.didClear(new GuestDidClear(bridge, arguments[0]));
  }
}
