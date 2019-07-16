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
import swim.dynamic.JavaHostObjectType;

public final class HostIterable {
  private HostIterable() {
    // static
  }

  public static final HostObjectType<Iterable<Object>> TYPE;

  static {
    final JavaHostObjectType<Iterable<Object>> type = new JavaHostObjectType<>(Iterable.class);
    TYPE = type;
    type.inheritType(HostObject.TYPE);
    type.addMember(new HostIterableIterator());
  }
}

final class HostIterableIterator implements HostMethod<Iterable<Object>> {
  @Override
  public String key() {
    return "iterator";
  }

  @Override
  public Object invoke(Bridge bridge, Iterable<Object> iterable, Object... arguments) {
    return iterable.iterator();
  }
}
