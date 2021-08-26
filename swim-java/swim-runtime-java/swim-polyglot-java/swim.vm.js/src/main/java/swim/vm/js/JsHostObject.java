// Copyright 2015-2021 Swim Inc.
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

package swim.vm.js;

import java.util.Collection;
import org.graalvm.polyglot.Value;
import org.graalvm.polyglot.proxy.ProxyObject;
import swim.dynamic.HostField;
import swim.dynamic.HostMember;
import swim.dynamic.HostMethod;
import swim.dynamic.HostObjectType;
import swim.vm.VmHostProxy;
import swim.vm.VmProxyArray;

public class JsHostObject<T> extends VmHostProxy<T> implements ProxyObject {

  final JsBridge bridge;
  final HostObjectType<? super T> type;
  final T self;

  public JsHostObject(JsBridge bridge, HostObjectType<? super T> type, T self) {
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
    if ("__proto__".equals(key)) {
      return true;
    } else {
      final HostMember<? super T> hostMember = this.type.getMember(this.bridge, this.self, key);
      return hostMember != null;
    }
  }

  @Override
  public Object getMember(String key) {
    final Object guestMember;
    if ("__proto__".equals(key)) {
      guestMember = this.bridge.hostTypeToGuestPrototype(this.type);
    } else {
      final HostMember<? super T> hostMember = this.type.getMember(this.bridge, this.self, key);
      if (hostMember instanceof HostField<?>) {
        final Object hostValue = ((HostField<? super T>) hostMember).get(this.bridge, this.self);
        guestMember = this.bridge.hostToGuest(hostValue);
      } else if (hostMember instanceof HostMethod<?>) {
        guestMember = this.bridge.hostMethodToGuestMethod((HostMethod<? super T>) hostMember, this.self);
      } else {
        guestMember = null;
      }
    }
    return guestMember;
  }

  @Override
  public void putMember(String key, Value guestValue) {
    if ("__proto__".equals(key)) {
      throw new UnsupportedOperationException();
    } else {
      final HostMember<? super T> hostMember = this.type.getMember(this.bridge, this.self, key);
      if (hostMember instanceof HostField<?>) {
        final Object hostValue = this.bridge.guestToHost(guestValue);
        ((HostField<? super T>) hostMember).set(this.bridge, this.self, hostValue);
      } else {
        throw new UnsupportedOperationException();
      }
    }
  }

  @Override
  public boolean removeMember(String key) {
    if ("__proto__".equals(key)) {
      throw new UnsupportedOperationException();
    } else {
      final HostMember<? super T> hostMember = this.type.getMember(this.bridge, this.self, key);
      if (hostMember instanceof HostField<?>) {
        return ((HostField<? super T>) hostMember).remove(this.bridge, this.self);
      } else {
        throw new UnsupportedOperationException();
      }
    }
  }

  @Override
  public Object getMemberKeys() {
    final Collection<? extends HostMember<? super T>> hostMembers = this.type.members(this.bridge, this.self);
    final String[] memberKeys = new String[hostMembers.size() + 1];
    int i = 0;
    for (HostMember<? super T> hostMember : hostMembers) {
      memberKeys[i] = hostMember.key();
      i += 1;
    }
    memberKeys[i] = "__proto__";
    return new VmProxyArray(memberKeys);
  }

}
