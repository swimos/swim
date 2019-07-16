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
import swim.collections.FingerTrieSeq;
import swim.collections.HashTrieMap;

public class JavaHostObjectType<T> extends AbstractHostObjectType<T> {
  protected final Class<?> hostClass;
  HostType<? super T> superType;
  FingerTrieSeq<HostType<? super T>> baseTypes;
  HashTrieMap<String, HostMember<? super T>> ownMembers;
  HashTrieMap<String, HostStaticMember> ownStaticMembers;

  public JavaHostObjectType(Class<?> hostClass) {
    this.hostClass = hostClass;
    this.superType = null;
    this.baseTypes = FingerTrieSeq.empty();
    this.ownMembers = HashTrieMap.empty();
    this.ownStaticMembers = HashTrieMap.empty();
  }

  @Override
  public final Class<?> hostClass() {
    return this.hostClass;
  }

  @Override
  public final HostType<? super T> superType() {
    return this.superType;
  }

  @Override
  public final List<HostType<? super T>> baseTypes() {
    return this.baseTypes;
  }

  @Override
  public final HostMember<? super T> getOwnMember(Bridge bridge, T self, String key) {
    return this.ownMembers.get(key);
  }

  @Override
  public final Collection<HostMember<? super T>> ownMembers(Bridge bridge, T self) {
    return this.ownMembers.values();
  }

  @Override
  public final HostStaticMember getOwnStaticMember(Bridge bridge, String key) {
    return this.ownStaticMembers.get(key);
  }

  @Override
  public final Collection<HostStaticMember> ownStaticMembers(Bridge bridge) {
    return this.ownStaticMembers.values();
  }

  @SuppressWarnings("unchecked")
  public void extendType(HostType<?> superType) {
    if (this.superType != null) {
      throw new BridgeException();
    } else if (!this.baseTypes.isEmpty()) {
      throw new BridgeException();
    }
    this.superType = (HostType<? super T>) superType;
    this.baseTypes = FingerTrieSeq.from((List<HostType<? super T>>) (List<?>) superType.baseTypes())
                                  .appended((HostType<? super T>) superType);
  }

  @SuppressWarnings("unchecked")
  public void inheritType(HostType<?> superType) {
    if (!inheritsType(superType)) {
      for (HostType<?> baseType : superType.baseTypes()) {
        if (!inheritsType(baseType)) {
          this.baseTypes = this.baseTypes.appended((HostType<? super T>) baseType);
        }
      }
      this.baseTypes = this.baseTypes.appended((HostType<? super T>) superType);
    }
  }

  public void addMember(HostMember<? super T> member) {
    this.ownMembers = this.ownMembers.updated(member.key(), member);
  }

  public void addStaticMember(HostStaticMember staticMember) {
    this.ownStaticMembers = this.ownStaticMembers.updated(staticMember.key(), staticMember);
  }
}
