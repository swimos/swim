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

package swim.dynamic.structure;

import swim.dynamic.Bridge;
import swim.dynamic.HostMethod;
import swim.dynamic.HostObjectType;
import swim.dynamic.HostStaticMethod;
import swim.dynamic.JavaHostClassType;
import swim.dynamic.java.lang.HostObject;
import swim.structure.Item;

public final class HostItem {
  private HostItem() {
    // static
  }

  public static final HostObjectType<Item> TYPE;

  static {
    final JavaHostClassType<Item> type = new JavaHostClassType<>(Item.class);
    TYPE = type;
    type.extendType(HostObject.TYPE);
    type.addMember(new HostItemIsDefined());
    type.addMember(new HostItemIsDistinct());
    type.addMember(new HostItemIsConstant());
    type.addMember(new HostItemStringValue());
    type.addMember(new HostItemNumberValue());
    type.addMember(new HostItemBooleanValue());
    type.addStaticMember(new HostItemAbsent());
    type.addStaticMember(new HostItemExtant());
  }
}

final class HostItemIsDefined implements HostMethod<Item> {
  @Override
  public String key() {
    return "isDefined";
  }

  @Override
  public Object invoke(Bridge bridge, Item item, Object... arguments) {
    return item.isDefined();
  }
}

final class HostItemIsDistinct implements HostMethod<Item> {
  @Override
  public String key() {
    return "isDistinct";
  }

  @Override
  public Object invoke(Bridge bridge, Item item, Object... arguments) {
    return item.isDistinct();
  }
}

final class HostItemIsConstant implements HostMethod<Item> {
  @Override
  public String key() {
    return "isConstant";
  }

  @Override
  public Object invoke(Bridge bridge, Item item, Object... arguments) {
    return item.isConstant();
  }
}

final class HostItemStringValue implements HostMethod<Item> {
  @Override
  public String key() {
    return "stringValue";
  }

  @Override
  public Object invoke(Bridge bridge, Item item, Object... arguments) {
    if (arguments.length == 0) {
      return item.stringValue();
    } else {
      return item.stringValue((String) arguments[0]);
    }
  }
}

final class HostItemNumberValue implements HostMethod<Item> {
  @Override
  public String key() {
    return "numberValue";
  }

  @Override
  public Object invoke(Bridge bridge, Item item, Object... arguments) {
    if (arguments.length == 0) {
      return item.numberValue();
    } else {
      return item.numberValue((Number) arguments[0]);
    }
  }
}

final class HostItemBooleanValue implements HostMethod<Item> {
  @Override
  public String key() {
    return "booleanValue";
  }

  @Override
  public Object invoke(Bridge bridge, Item item, Object... arguments) {
    if (arguments.length == 0) {
      return item.booleanValue();
    } else {
      return item.booleanValue((Boolean) arguments[0]);
    }
  }
}

final class HostItemAbsent implements HostStaticMethod {
  @Override
  public String key() {
    return "absent";
  }

  @Override
  public Object invoke(Bridge bridge, Object... arguments) {
    return Item.absent();
  }
}

final class HostItemExtant implements HostStaticMethod {
  @Override
  public String key() {
    return "extant";
  }

  @Override
  public Object invoke(Bridge bridge, Object... arguments) {
    return Item.extant();
  }
}
