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

package swim.dynamic.java.util;

import java.util.Collection;
import swim.dynamic.Bridge;
import swim.dynamic.HostMethod;
import swim.dynamic.HostObjectType;
import swim.dynamic.JavaHostObjectType;
import swim.dynamic.java.lang.HostIterable;

public final class HostCollection {
  private HostCollection() {
    // static
  }

  public static final HostObjectType<Collection<Object>> TYPE;

  static {
    final JavaHostObjectType<Collection<Object>> type = new JavaHostObjectType<>(Collection.class);
    TYPE = type;
    type.inheritType(HostIterable.TYPE);
    type.addMember(new HostCollectionIsEmpty());
  }
}

final class HostCollectionIsEmpty implements HostMethod<Collection<Object>> {
  @Override
  public String key() {
    return "isEmpty";
  }

  @Override
  public Object invoke(Bridge bridge, Collection<Object> collection, Object... arguments) {
    return collection.isEmpty();
  }
}
