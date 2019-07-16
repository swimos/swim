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
import swim.dynamic.HostStaticField;
import swim.dynamic.HostStaticMember;
import swim.dynamic.HostStaticMethod;
import swim.dynamic.HostType;
import swim.vm.VmProxyArray;

public class JsHostType implements ProxyObject {
  final JsBridge bridge;
  final HostType<?> type;

  public JsHostType(JsBridge bridge, HostType<?> type) {
    this.bridge = bridge;
    this.type = type;
  }

  @Override
  public boolean hasMember(String key) {
    if ("__proto__".equals(key)) {
      return true;
    } else {
      final HostStaticMember staticMember = this.type.getStaticMember(this.bridge, key);
      return staticMember != null;
    }
  }

  @Override
  public Object getMember(String key) {
    if ("__proto__".equals(key)) {
      return this.bridge.guestObjectPrototype();
    } else {
      final HostStaticMember staticMember = this.type.getStaticMember(this.bridge, key);
      if (staticMember instanceof HostStaticField) {
        final Object hostValue = ((HostStaticField) staticMember).get(this.bridge);
        return this.bridge.hostToGuest(hostValue);
      } else if (staticMember instanceof HostStaticMethod) {
        return this.bridge.hostStaticMethodToGuestStaticMethod((HostStaticMethod) staticMember);
      } else {
        return null;
      }
    }
  }

  @Override
  public void putMember(String key, Value guestValue) {
    if ("__proto__".equals(key)) {
      throw new UnsupportedOperationException();
    } else {
      final HostStaticMember staticMember = this.type.getStaticMember(this.bridge, key);
      if (staticMember instanceof HostStaticField) {
        final Object hostValue = this.bridge.guestToHost(guestValue);
        ((HostStaticField) staticMember).set(this.bridge, hostValue);
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
      final HostStaticMember staticMember = this.type.getStaticMember(this.bridge, key);
      if (staticMember instanceof HostStaticField) {
        return ((HostStaticField) staticMember).remove(this.bridge);
      } else {
        throw new UnsupportedOperationException();
      }
    }
  }

  @Override
  public Object getMemberKeys() {
    final Collection<? extends HostStaticMember> staticMembers = this.type.staticMembers(this.bridge);
    final String[] staticMemberKeys = new String[staticMembers.size() + 1];
    int i = 0;
    for (HostStaticMember staticMember : staticMembers) {
      staticMemberKeys[i] = staticMember.key();
      i += 1;
    }
    staticMemberKeys[i] = "__proto__";
    return new VmProxyArray(staticMemberKeys);
  }

  @Override
  public String toString() {
    return '[' + "JsHostType " + this.type.hostClass().getName() + ']';
  }
}
