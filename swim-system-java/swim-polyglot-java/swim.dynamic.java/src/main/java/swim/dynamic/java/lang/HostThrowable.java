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

public final class HostThrowable {
  private HostThrowable() {
    // static
  }

  public static final HostObjectType<Throwable> TYPE;

  static {
    final JavaHostObjectType<Throwable> type = new JavaHostObjectType<>(Throwable.class);
    TYPE = type;
    type.extendType(HostObject.TYPE);
    type.addMember(new HostThrowableGetMessage());
    type.addMember(new HostThrowableGetCause());
  }
}

final class HostThrowableGetMessage implements HostMethod<Throwable> {
  @Override
  public String key() {
    return "getMessage";
  }

  @Override
  public Object invoke(Bridge bridge, Throwable throwable, Object... arguments) {
    return throwable.getMessage();
  }
}

final class HostThrowableGetCause implements HostMethod<Throwable> {
  @Override
  public String key() {
    return "getCause";
  }

  @Override
  public Object invoke(Bridge bridge, Throwable throwable, Object... arguments) {
    return throwable.getCause();
  }
}
