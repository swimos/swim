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

package swim.dynamic.api;

import swim.api.Link;
import swim.dynamic.Bridge;
import swim.dynamic.HostMethod;
import swim.dynamic.HostObjectType;
import swim.dynamic.JavaHostObjectType;
import swim.dynamic.java.lang.HostObject;

public final class HostLink {
  private HostLink() {
    // static
  }

  public static final HostObjectType<Link> TYPE;

  static {
    final JavaHostObjectType<Link> type = new JavaHostObjectType<>(Link.class);
    TYPE = type;
    type.inheritType(HostObject.TYPE); // FIXME: replace with type.inheritType(HostLog.TYPE);
    type.addMember(new HostLinkHostUri());
    type.addMember(new HostLinkNodeUri());
    type.addMember(new HostLinkLaneUri());
  }
}

final class HostLinkHostUri implements HostMethod<Link> {
  @Override
  public String key() {
    return "hostUri";
  }

  @Override
  public Object invoke(Bridge bridge, Link link, Object... arguments) {
    return link.hostUri();
  }
}

final class HostLinkNodeUri implements HostMethod<Link> {
  @Override
  public String key() {
    return "nodeUri";
  }

  @Override
  public Object invoke(Bridge bridge, Link link, Object... arguments) {
    return link.nodeUri();
  }
}

final class HostLinkLaneUri implements HostMethod<Link> {
  @Override
  public String key() {
    return "laneUri";
  }

  @Override
  public Object invoke(Bridge bridge, Link link, Object... arguments) {
    return link.laneUri();
  }
}
