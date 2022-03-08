// Copyright 2015-2022 Swim.inc
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
import swim.dynamic.HostClassType;
import swim.dynamic.HostField;
import swim.dynamic.HostMember;
import swim.dynamic.HostMethod;
import swim.vm.VmProxyArray;

public class JsHostPrototype implements ProxyObject {

  final JsBridge bridge;
  final HostClassType<?> type;

  public JsHostPrototype(JsBridge bridge, HostClassType<?> type) {
    this.bridge = bridge;
    this.type = type;
  }

  @Override
  public boolean hasMember(String key) {
    if ("__proto__".equals(key)) {
      return true;
    } else if ("constructor".equals(key)) {
      return true;
    } else {
      final HostMember<?> hostMember = this.type.getMember(this.bridge, null, key);
      return hostMember != null;
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public Object getMember(String key) {
    final Object guestMember;
    if ("__proto__".equals(key)) {
      guestMember = this.bridge.hostTypeToGuestPrototype(this.type.superType());
    } else if ("constructor".equals(key)) {
      guestMember = this.bridge.hostTypeToGuestType(this.type);
    } else {
      final HostMember<?> hostMember = this.type.getMember(this.bridge, null, key);
      if (hostMember instanceof HostField<?>) {
        final Object hostValue = ((HostField<?>) hostMember).get(this.bridge, null);
        guestMember = this.bridge.hostToGuest(hostValue);
      } else if (hostMember instanceof HostMethod<?>) {
        guestMember = this.bridge.hostMethodToGuestMethod((HostMethod<Object>) hostMember, null);
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
    } else if ("constructor".equals(key)) {
      throw new UnsupportedOperationException();
    } else {
      final HostMember<?> hostMember = this.type.getMember(this.bridge, null, key);
      if (hostMember instanceof HostField<?>) {
        final Object hostValue = this.bridge.guestToHost(guestValue);
        ((HostField<?>) hostMember).set(this.bridge, null, hostValue);
      } else {
        throw new UnsupportedOperationException();
      }
    }
  }

  @Override
  public boolean removeMember(String key) {
    if ("__proto__".equals(key)) {
      throw new UnsupportedOperationException();
    } else if ("constructor".equals(key)) {
      throw new UnsupportedOperationException();
    } else {
      final HostMember<?> hostMember = this.type.getMember(this.bridge, null, key);
      if (hostMember instanceof HostField<?>) {
        return ((HostField<?>) hostMember).remove(this.bridge, null);
      } else {
        throw new UnsupportedOperationException();
      }
    }
  }

  @Override
  public Object getMemberKeys() {
    final Collection<? extends HostMember<?>> hostMembers = this.type.members(this.bridge, null);
    final String[] memberKeys = new String[hostMembers.size() + 2];
    int i = 0;
    for (HostMember<?> hostMember : hostMembers) {
      memberKeys[i] = hostMember.key();
      i += 1;
    }
    memberKeys[i] = "__proto__";
    memberKeys[i + 1] = "constructor";
    return new VmProxyArray(memberKeys);
  }

  @Override
  public String toString() {
    return '[' + "JsHostPrototype " + this.type.hostClass().getName() + ']';
  }

}
