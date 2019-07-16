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

import java.util.Iterator;
import org.graalvm.polyglot.Value;
import org.graalvm.polyglot.proxy.ProxyObject;
import swim.collections.HashTrieMap;
import swim.vm.VmProxyArray;

public class JsGuestModuleObject implements ProxyObject {
  final JsGuestModule module;
  HashTrieMap<String, Value> dynamicMembers;

  public JsGuestModuleObject(JsGuestModule module) {
    this.module = module;
    this.dynamicMembers = HashTrieMap.empty();
  }

  public final JsGuestModule module() {
    return this.module;
  }

  @Override
  public boolean hasMember(String key) {
    if ("id".equals(key)) {
      return true;
    } else if ("exports".equals(key)) {
      return true;
    } else {
      return hasDynamicMember(key);
    }
  }

  protected boolean hasDynamicMember(String key) {
    return this.dynamicMembers.containsKey(key);
  }

  @Override
  public Object getMember(String key) {
    if ("id".equals(key)) {
      return this.module.moduleId.toString();
    } else if ("exports".equals(key)) {
      return this.module.moduleExports;
    } else {
      return getDynamicMember(key);
    }
  }

  protected Object getDynamicMember(String key) {
    return this.dynamicMembers.get(key);
  }

  @Override
  public void putMember(String key, Value value) {
    if ("id".equals(key)) {
      throw new UnsupportedOperationException();
    } else if ("exports".equals(key)) {
      this.module.setModuleExports(value);
    } else {
      putDynamicMember(key, value);
    }
  }

  protected void putDynamicMember(String key, Value value) {
    this.dynamicMembers = this.dynamicMembers.updated(key, value);
  }

  @Override
  public boolean removeMember(String key) {
    if ("id".equals(key)) {
      throw new UnsupportedOperationException();
    } else if ("exports".equals(key)) {
      throw new UnsupportedOperationException();
    } else {
      return removeDynamicMember(key);
    }
  }

  protected boolean removeDynamicMember(String key) {
    final HashTrieMap<String, Value> oldDynamicMembers = this.dynamicMembers;
    final HashTrieMap<String, Value> newDynamicMembers = oldDynamicMembers.removed(key);
    if (oldDynamicMembers != newDynamicMembers) {
      this.dynamicMembers = newDynamicMembers;
      return true;
    } else {
      return false;
    }
  }

  @Override
  public Object getMemberKeys() {
    final HashTrieMap<String, Value> dynamicMembers = this.dynamicMembers;
    final String[] memberKeys = new String[2 + dynamicMembers.size()];
    memberKeys[0] = "id";
    memberKeys[1] = "exports";
    final Iterator<String> dynamicMemberKeyIterator = dynamicMembers.keyIterator();
    int i = 2;
    while (dynamicMemberKeyIterator.hasNext()) {
      memberKeys[i] = dynamicMemberKeyIterator.next();
      i += 1;
    }
    return new VmProxyArray(memberKeys);
  }
}
