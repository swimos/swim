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

import org.graalvm.polyglot.Value;
import org.graalvm.polyglot.proxy.ProxyExecutable;
import org.graalvm.polyglot.proxy.ProxyObject;
import swim.dynamic.HostMethod;
import swim.vm.VmProxyArray;

public class JsHostMethod<T> implements ProxyExecutable, ProxyObject {
  final JsBridge bridge;
  final HostMethod<? super T> method;
  final T self;

  public JsHostMethod(JsBridge bridge, HostMethod<? super T> method, T self) {
    this.bridge = bridge;
    this.method = method;
    this.self = self;
  }

  @Override
  public Object execute(Value... guestArguments) {
    final int arity = guestArguments.length;
    final Object[] hostArguments = new Object[arity];
    for (int i = 0; i < arity; i += 1) {
      hostArguments[i] = this.bridge.guestToHost(guestArguments[i]);
    }
    final Object hostResult = this.method.invoke(this.bridge, this.self, hostArguments);
    final Object guestResult = this.bridge.hostToGuest(hostResult);
    return guestResult;
  }

  @Override
  public boolean hasMember(String key) {
    if ("__proto__".equals(key)) {
      return true;
    } else {
      return false;
    }
  }

  @Override
  public Object getMember(String key) {
    if ("__proto__".equals(key)) {
      return this.bridge.guestFunctionPrototype();
    } else {
      return null;
    }
  }

  @Override
  public void putMember(String key, Value guestValue) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean removeMember(String key) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Object getMemberKeys() {
    return new VmProxyArray(new String[] {"__proto__"});
  }
}
