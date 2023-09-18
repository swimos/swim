// Copyright 2015-2023 Nstream, inc.
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
import org.graalvm.polyglot.proxy.ProxyInstantiable;
import org.graalvm.polyglot.proxy.ProxyObject;
import swim.dynamic.HostClassType;
import swim.dynamic.HostConstructor;
import swim.dynamic.HostStaticField;
import swim.dynamic.HostStaticMember;
import swim.dynamic.HostStaticMethod;
import swim.vm.VmProxyArray;

public class JsHostClass implements ProxyObject, ProxyInstantiable {

  final JsBridge bridge;
  final HostClassType<?> type;

  public JsHostClass(JsBridge bridge, HostClassType<?> type) {
    this.bridge = bridge;
    this.type = type;
  }

  @Override
  public boolean hasMember(String key) {
    if ("__proto__".equals(key)) {
      return true;
    } else if ("prototype".equals(key)) {
      return true;
    } else {
      final HostStaticMember staticMember = this.type.getStaticMember(this.bridge, key);
      return staticMember != null;
    }
  }

  @Override
  public Object getMember(String key) {
    final Object guestMember;
    if ("__proto__".equals(key)) {
      guestMember = this.bridge.guestFunctionPrototype();
    } else if ("prototype".equals(key)) {
      guestMember = this.bridge.hostTypeToGuestPrototype(this.type);
    } else {
      final HostStaticMember staticMember = this.type.getStaticMember(this.bridge, key);
      if (staticMember instanceof HostStaticField) {
        final Object hostValue = ((HostStaticField) staticMember).get(this.bridge);
        guestMember = this.bridge.hostToGuest(hostValue);
      } else if (staticMember instanceof HostStaticMethod) {
        guestMember = this.bridge.hostStaticMethodToGuestStaticMethod((HostStaticMethod) staticMember);
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
    } else if ("prototype".equals(key)) {
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
    if ("prototype".equals(key)) {
      throw new UnsupportedOperationException();
    } else if ("__proto__".equals(key)) {
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
    final String[] staticMemberKeys = new String[staticMembers.size() + 2];
    int i = 0;
    for (HostStaticMember staticMember : staticMembers) {
      staticMemberKeys[i] = staticMember.key();
      i += 1;
    }
    staticMemberKeys[i] = "__proto__";
    staticMemberKeys[i + 1] = "prototype";
    return new VmProxyArray(staticMemberKeys);
  }

  @Override
  public Object newInstance(Value... guestArguments) {
    final HostConstructor constructor = this.type.constructor(this.bridge);
    if (constructor != null) {
      final int arity = guestArguments.length;
      final Object[] hostArguments = new Object[arity];
      for (int i = 0; i < arity; i += 1) {
        hostArguments[i] = this.bridge.guestToHost(guestArguments[i]);
      }
      final Object hostInstance = constructor.newInstance(this.bridge, hostArguments);
      final Object guestInstance = this.bridge.hostToGuest(hostInstance);
      return guestInstance;
    } else {
      throw new UnsupportedOperationException();
    }
  }

  @Override
  public String toString() {
    return '[' + "JsHostClass " + this.type.hostClass().getName() + ']';
  }

}
