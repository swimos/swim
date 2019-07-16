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

package swim.dynamic;

import java.util.Collection;
import java.util.List;
import swim.collections.HashTrieMap;

public abstract class AbstractHostObjectType<T> extends AbstractHostType<T> implements HostObjectType<T> {
  @Override
  public abstract HostMember<? super T> getOwnMember(Bridge bridge, T self, String key);

  @Override
  public abstract Collection<HostMember<? super T>> ownMembers(Bridge bridge, T self);

  @Override
  public HostMember<? super T> getMember(Bridge bridge, T self, String key) {
    HostMember<? super T> member = getOwnMember(bridge, self, key);
    if (member == null) {
      final List<HostType<? super T>> baseTypes = baseTypes();
      for (int i = baseTypes.size() - 1; i >= 0; i -= 1) {
        final HostType<? super T> baseType = baseTypes.get(i);
        if (baseType instanceof HostObjectType<?>) {
          member = ((HostObjectType<? super T>) baseType).getOwnMember(bridge, self, key);
          if (member != null) {
            break;
          }
        }
      }
    }
    return member;
  }

  @Override
  public Collection<HostMember<? super T>> members(Bridge bridge, T self) {
    HashTrieMap<String, HostMember<? super T>> members = HashTrieMap.empty();
    final List<HostType<? super T>> baseTypes = baseTypes();
    for (int i = 0, n = baseTypes.size(); i < n; i += 1) {
      final HostType<? super T> baseType = baseTypes.get(i);
      if (baseType instanceof HostObjectType<?>) {
        for (HostMember<? super T> baseMember : ((HostObjectType<? super T>) baseType).ownMembers(bridge, self)) {
          members = members.updated(baseMember.key(), baseMember);
        }
      }
    }
    for (HostMember<? super T> member : ownMembers(bridge, self)) {
      members = members.updated(member.key(), member);
    }
    return members.values();
  }
}
