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

import java.util.List;
import swim.dynamic.Bridge;
import swim.dynamic.HostField;
import swim.dynamic.HostObjectType;
import swim.dynamic.JavaHostObjectType;

public final class HostList {
  private HostList() {
    // static
  }

  public static final HostObjectType<List<Object>> TYPE;

  static {
    final JavaHostObjectType<List<Object>> type = new JavaHostObjectType<>(List.class);
    TYPE = type;
    type.inheritType(HostCollection.TYPE);
    type.addMember(new HostListlength());
  }
}

final class HostListlength implements HostField<List<Object>> {
  @Override
  public String key() {
    return "length";
  }

  @Override
  public Object get(Bridge bridge, List<Object> list) {
    return list.size();
  }
}
