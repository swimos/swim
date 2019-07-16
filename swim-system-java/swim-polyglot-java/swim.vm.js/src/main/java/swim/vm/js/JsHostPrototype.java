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
    if ("constructor".equals(key)) {
      return true;
    } else if ("__proto__".equals(key)) {
      return true;
    } else {
      final HostMember<?> member = this.type.getMember(this.bridge, null, key);
      return member != null;
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public Object getMember(String key) {
    if ("constructor".equals(key)) {
      return this.bridge.hostTypeToGuestType(this.type);
    } else if ("__proto__".equals(key)) {
      return this.bridge.hostTypeToGuestPrototype(this.type.superType());
    } else {
      final HostMember<?> member = this.type.getMember(this.bridge, null, key);
      if (member instanceof HostField<?>) {
        final Object hostValue = ((HostField<?>) member).get(this.bridge, null);
        return this.bridge.hostToGuest(hostValue);
      } else if (member instanceof HostMethod<?>) {
        return this.bridge.hostMethodToGuestMethod((HostMethod<Object>) member, null);
      } else {
        return null;
      }
    }
  }

  @Override
  public void putMember(String key, Value guestValue) {
    if ("constructor".equals(key)) {
      throw new UnsupportedOperationException();
    } else if ("__proto__".equals(key)) {
      throw new UnsupportedOperationException();
    } else {
      final HostMember<?> member = this.type.getMember(this.bridge, null, key);
      if (member instanceof HostField<?>) {
        final Object hostValue = this.bridge.guestToHost(guestValue);
        ((HostField<?>) member).set(this.bridge, null, hostValue);
      } else {
        throw new UnsupportedOperationException();
      }
    }
  }

  @Override
  public boolean removeMember(String key) {
    if ("constructor".equals(key)) {
      throw new UnsupportedOperationException();
    } else if ("__proto__".equals(key)) {
      throw new UnsupportedOperationException();
    } else {
      final HostMember<?> member = this.type.getMember(this.bridge, null, key);
      if (member instanceof HostField<?>) {
        return ((HostField<?>) member).remove(this.bridge, null);
      } else {
        throw new UnsupportedOperationException();
      }
    }
  }

  @Override
  public Object getMemberKeys() {
    final Collection<? extends HostMember<?>> members = this.type.members(this.bridge, null);
    final String[] memberKeys = new String[members.size() + 2];
    int i = 0;
    for (HostMember<?> member : members) {
      memberKeys[i] = member.key();
      i += 1;
    }
    memberKeys[i] = "constructor";
    memberKeys[i + 1] = "__proto__";
    return new VmProxyArray(memberKeys);
  }

  @Override
  public String toString() {
    return '[' + "JsHostPrototype " + this.type.hostClass().getName() + ']';
  }
}
