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

import java.util.Map;
import swim.dynamic.Bridge;
import swim.dynamic.HostField;
import swim.dynamic.HostMethod;
import swim.dynamic.HostObjectType;
import swim.dynamic.PolyglotHostObjectType;
import swim.dynamic.java.lang.HostObject;

public final class HostMap {
  private HostMap() {
    // static
  }

  public static final HostObjectType<Map<Object, Object>> TYPE;

  static {
    final PolyglotHostObjectType<Map<Object, Object>> type = new PolyglotHostObjectType<>(Map.class);
    TYPE = type;
    type.inheritType(HostObject.TYPE);
    type.addMember(new HostMapIsEmpty());
    type.addMember(new HostMapSize());
    type.addSpecializedMember("js", new HostMapJsHas());
    type.addUnspecializedMember(new HostMapContainsKey());
  }
}

final class HostMapIsEmpty implements HostMethod<Map<Object, Object>> {
  @Override
  public String key() {
    return "isEmpty";
  }

  @Override
  public Object invoke(Bridge bridge, Map<Object, Object> map, Object... arguments) {
    return map.isEmpty();
  }
}

final class HostMapSize implements HostField<Map<Object, Object>> {
  @Override
  public String key() {
    return "size";
  }

  @Override
  public Object get(Bridge bridge, Map<Object, Object> map) {
    return map.size();
  }
}

final class HostMapJsHas implements HostMethod<Map<Object, Object>> {
  @Override
  public String key() {
    return "has";
  }

  @Override
  public Object invoke(Bridge bridge, Map<Object, Object> map, Object... arguments) {
    return map.containsKey(arguments[0]);
  }
}

final class HostMapContainsKey implements HostMethod<Map<Object, Object>> {
  @Override
  public String key() {
    return "containsKey";
  }

  @Override
  public Object invoke(Bridge bridge, Map<Object, Object> map, Object... arguments) {
    return map.containsKey(arguments[0]);
  }
}
