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

import java.util.Iterator;
import swim.dynamic.Bridge;
import swim.dynamic.HostMethod;
import swim.dynamic.HostObjectType;
import swim.dynamic.JavaHostObjectType;
import swim.dynamic.java.lang.HostObject;

public final class HostIterator {
  private HostIterator() {
    // static
  }

  public static final HostObjectType<Iterator<Object>> TYPE;

  static {
    final JavaHostObjectType<Iterator<Object>> type = new JavaHostObjectType<>(Iterator.class);
    TYPE = type;
    type.inheritType(HostObject.TYPE);
    type.addMember(new HostIteratorHasNext());
    type.addMember(new HostIteratorNext());
    type.addMember(new HostIteratorRemove());
  }
}

final class HostIteratorHasNext implements HostMethod<Iterator<Object>> {
  @Override
  public String key() {
    return "hasNext";
  }

  @Override
  public Object invoke(Bridge bridge, Iterator<Object> iterator, Object... arguments) {
    return iterator.hasNext();
  }
}

final class HostIteratorNext implements HostMethod<Iterator<Object>> {
  @Override
  public String key() {
    return "next";
  }

  @Override
  public Object invoke(Bridge bridge, Iterator<Object> iterator, Object... arguments) {
    return iterator.next();
  }
}

final class HostIteratorRemove implements HostMethod<Iterator<Object>> {
  @Override
  public String key() {
    return "remove";
  }

  @Override
  public Object invoke(Bridge bridge, Iterator<Object> iterator, Object... arguments) {
    iterator.remove();
    return null;
  }
}
