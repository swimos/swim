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

package swim.vm;

import java.util.Collection;
import org.graalvm.polyglot.Value;
import org.graalvm.polyglot.proxy.ProxyObject;
import swim.dynamic.HostField;
import swim.dynamic.HostMember;
import swim.dynamic.HostMethod;
import swim.dynamic.HostObjectType;

public class VmHostObject<T> extends VmHostProxy<T> implements ProxyObject {
  final VmBridge bridge;
  final HostObjectType<? super T> type;
  final T self;

  public VmHostObject(VmBridge bridge, HostObjectType<? super T> type, T self) {
    this.bridge = bridge;
    this.type = type;
    this.self = self;
  }

  @Override
  public final T unwrap() {
    return this.self;
  }

  @Override
  public boolean hasMember(String key) {
    final HostMember<? super T> member = this.type.getMember(this.bridge, this.self, key);
    return member != null;
  }

  @Override
  public Object getMember(String key) {
    final HostMember<? super T> member = this.type.getMember(this.bridge, this.self, key);
    if (member instanceof HostField<?>) {
      final Object hostValue = ((HostField<? super T>) member).get(this.bridge, this.self);
      return this.bridge.hostToGuest(hostValue);
    } else if (member instanceof HostMethod<?>) {
      return this.bridge.hostMethodToGuestMethod((HostMethod<? super T>) member, this.self);
    } else {
      return null;
    }
  }

  @Override
  public void putMember(String key, Value guestValue) {
    final HostMember<? super T> member = this.type.getMember(this.bridge, this.self, key);
    if (member instanceof HostField<?>) {
      final Object hostValue = this.bridge.guestToHost(guestValue);
      ((HostField<? super T>) member).set(this.bridge, this.self, hostValue);
    } else {
      throw new UnsupportedOperationException();
    }
  }

  @Override
  public boolean removeMember(String key) {
    final HostMember<? super T> member = this.type.getMember(this.bridge, this.self, key);
    if (member instanceof HostField<?>) {
      return ((HostField<? super T>) member).remove(this.bridge, this.self);
    } else {
      throw new UnsupportedOperationException();
    }
  }

  @Override
  public Object getMemberKeys() {
    final Collection<? extends HostMember<? super T>> members = this.type.members(this.bridge, this.self);
    final String[] memberKeys = new String[members.size()];
    int i = 0;
    for (HostMember<? super T> member : members) {
      memberKeys[i] = member.key();
      i += 1;
    }
    return new VmProxyArray(memberKeys);
  }
}
