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

public abstract class AbstractHostType<T> implements HostType<T> {
  @Override
  public String typeName() {
    return hostClass().getSimpleName();
  }

  @Override
  public abstract Class<?> hostClass();

  @Override
  public boolean isBuiltin() {
    return false;
  }

  @Override
  public abstract HostType<? super T> superType();

  @Override
  public abstract List<HostType<? super T>> baseTypes();

  @Override
  public boolean inheritsType(HostType<?> superType) {
    if (superType == this) {
      return true;
    } else {
      final List<HostType<? super T>> baseTypes = baseTypes();
      for (int i = baseTypes.size() - 1; i >= 0; i -= 1) {
        final HostType<? super T> baseType = baseTypes.get(i);
        if (superType == baseType) {
          return true;
        }
      }
    }
    return false;
  }

  @Override
  public abstract HostStaticMember getOwnStaticMember(Bridge bridge, String key);

  @Override
  public abstract Collection<HostStaticMember> ownStaticMembers(Bridge bridge);

  @Override
  public HostStaticMember getStaticMember(Bridge bridge, String key) {
    HostStaticMember staticMember = getOwnStaticMember(bridge, key);
    if (staticMember == null) {
      final List<HostType<? super T>> baseTypes = baseTypes();
      for (int i = baseTypes.size() - 1; i >= 0; i -= 1) {
        final HostType<? super T> baseType = baseTypes.get(i);
        staticMember = baseType.getOwnStaticMember(bridge, key);
        if (staticMember != null) {
          break;
        }
      }
    }
    return staticMember;
  }

  @Override
  public Collection<HostStaticMember> staticMembers(Bridge bridge) {
    HashTrieMap<String, HostStaticMember> staticMembers = HashTrieMap.empty();
    final List<HostType<? super T>> baseTypes = baseTypes();
    for (int i = 0, n = baseTypes.size(); i < n; i += 1) {
      final HostType<? super T> baseType = baseTypes.get(i);
      for (HostStaticMember baseStaticMember : baseType.ownStaticMembers(bridge)) {
        staticMembers = staticMembers.updated(baseStaticMember.key(), baseStaticMember);
      }
    }
    for (HostStaticMember staticMember : ownStaticMembers(bridge)) {
      staticMembers = staticMembers.updated(staticMember.key(), staticMember);
    }
    return staticMembers.values();
  }
}
