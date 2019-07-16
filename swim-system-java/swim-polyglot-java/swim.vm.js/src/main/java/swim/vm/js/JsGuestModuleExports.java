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

public class JsGuestModuleExports implements ProxyObject {
  final JsGuestModule module;
  HashTrieMap<String, Value> members;

  public JsGuestModuleExports(JsGuestModule module) {
    this.module = module;
    this.members = HashTrieMap.empty();
  }

  public final JsGuestModule module() {
    return this.module;
  }

  @Override
  public boolean hasMember(String key) {
    return this.members.containsKey(key);
  }

  @Override
  public Object getMember(String key) {
    return this.members.get(key);
  }

  @Override
  public void putMember(String key, Value value) {
    this.members = this.members.updated(key, value);
  }

  @Override
  public boolean removeMember(String key) {
    final HashTrieMap<String, Value> oldMembers = this.members;
    final HashTrieMap<String, Value> newMembers = oldMembers.removed(key);
    if (oldMembers != newMembers) {
      this.members = newMembers;
      return true;
    } else {
      return false;
    }
  }

  @Override
  public Object getMemberKeys() {
    final HashTrieMap<String, Value> members = this.members;
    final String[] memberKeys = new String[members.size()];
    final Iterator<String> memberKeyIterator = members.keyIterator();
    int i = 0;
    while (memberKeyIterator.hasNext()) {
      memberKeys[i] = memberKeyIterator.next();
      i += 1;
    }
    return new VmProxyArray(memberKeys);
  }
}
