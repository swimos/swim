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

package swim.dynamic.java.lang;

import swim.dynamic.Bridge;
import swim.dynamic.HostMethod;
import swim.dynamic.HostObjectType;
import swim.dynamic.JavaHostBuiltinType;

public final class HostObject {
  private HostObject() {
    // static
  }

  public static final HostObjectType<Object> TYPE;

  static {
    final JavaHostBuiltinType<Object> type = new JavaHostBuiltinType<>(Object.class);
    TYPE = type;
    type.addMember(new HostObjectEquals());
    type.addMember(new HostObjectHashCode());
    type.addMember(new HostObjectToString());
  }
}

final class HostObjectEquals implements HostMethod<Object> {
  @Override
  public String key() {
    return "equals";
  }

  @Override
  public Object invoke(Bridge bridge, Object object, Object... arguments) {
    return object.equals(arguments[0]);
  }
}

final class HostObjectHashCode implements HostMethod<Object> {
  @Override
  public String key() {
    return "hashCode";
  }

  @Override
  public Object invoke(Bridge bridge, Object object, Object... arguments) {
    return object.hashCode();
  }
}

final class HostObjectToString implements HostMethod<Object> {
  @Override
  public String key() {
    return "toString";
  }

  @Override
  public Object invoke(Bridge bridge, Object object, Object... arguments) {
    return object.toString();
  }
}
