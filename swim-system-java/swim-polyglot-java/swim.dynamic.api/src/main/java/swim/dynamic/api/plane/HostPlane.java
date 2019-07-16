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

package swim.dynamic.api.plane;

import swim.api.plane.Plane;
import swim.dynamic.Bridge;
import swim.dynamic.HostMethod;
import swim.dynamic.HostObjectType;
import swim.dynamic.JavaHostObjectType;
import swim.dynamic.java.lang.HostObject;

public final class HostPlane {
  private HostPlane() {
    // static
  }

  public static final HostObjectType<Plane> TYPE;

  static {
    final JavaHostObjectType<Plane> type = new JavaHostObjectType<>(Plane.class);
    TYPE = type;
    type.inheritType(HostObject.TYPE);
    type.addMember(new HostPlanePlaneContext());
  }
}

final class HostPlanePlaneContext implements HostMethod<Plane> {
  @Override
  public String key() {
    return "planeContext";
  }

  @Override
  public Object invoke(Bridge bridge, Plane plane, Object... arguments) {
    return plane.planeContext();
  }
}
