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
import swim.dynamic.observable.function.GuestDidSet;
import swim.dynamic.observable.function.GuestWillSet;
import swim.observable.ObservableValue;

public final class HostObservableValue {
  private HostObservableValue() {
    // static
  }

  public static final HostObjectType<ObservableValue<Object>> TYPE;

  static {
    final JavaHostObjectType<ObservableValue<Object>> type = new JavaHostObjectType<>(ObservableValue.class);
    TYPE = type;
    type.inheritType(HostObject.TYPE);
    type.addMember(new HostObservableValueGet());
    type.addMember(new HostObservableValueSet());
    type.addMember(new HostObservableValueWillSet());
    type.addMember(new HostObservableValueDidSet());
  }
}

final class HostObservableValueGet implements HostMethod<ObservableValue<Object>> {
  @Override
  public String key() {
    return "get";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableValue<Object> observable, Object... arguments) {
    return observable.get();
  }
}

final class HostObservableValueSet implements HostMethod<ObservableValue<Object>> {
  @Override
  public String key() {
    return "set";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableValue<Object> observable, Object... arguments) {
    return observable.set(arguments[0]);
  }
}

final class HostObservableValueWillSet implements HostMethod<ObservableValue<Object>> {
  @Override
  public String key() {
    return "willSet";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableValue<Object> observable, Object... arguments) {
    return observable.willSet(new GuestWillSet<Object>(bridge, arguments[0]));
  }
}

final class HostObservableValueDidSet implements HostMethod<ObservableValue<Object>> {
  @Override
  public String key() {
    return "didSet";
  }

  @Override
  public Object invoke(Bridge bridge, ObservableValue<Object> observable, Object... arguments) {
    return observable.didSet(new GuestDidSet<Object>(bridge, arguments[0]));
  }
}
