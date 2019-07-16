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

/**
 * A dynamic object type descriptor that has specialized members for specific
 * guest languages.
 */
public class PolyglotHostObjectType<T> extends AbstractHostObjectType<T> {
  protected final Class<?> hostClass;
  HostType<? super T> superType;
  FingerTrieSeq<HostType<? super T>> baseTypes;
  HashTrieMap<String, HostMember<? super T>> ownMembers;
  HashTrieMap<String, HostStaticMember> ownStaticMembers;
  HashTrieMap<String, PolyglotObjectTypeSpecialization<T>> specializations;
  PolyglotObjectTypeSpecialization<T> unspecialized;

  public PolyglotHostObjectType(Class<?> hostClass) {
    this.hostClass = hostClass;
    this.superType = null;
    this.baseTypes = FingerTrieSeq.empty();
    this.ownMembers = HashTrieMap.empty();
    this.ownStaticMembers = HashTrieMap.empty();
    this.specializations = HashTrieMap.empty();
    this.unspecialized = null;
  }

  @Override
  public final Class<?> hostClass() {
    return this.hostClass;
  }

  @Override
  public boolean isBuiltin() {
    return false;
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
  public HostMember<? super T> getOwnMember(Bridge bridge, T self, String key) {
    HostMember<? super T> member;
    final PolyglotObjectTypeSpecialization<T> specialized = this.specializations.get(bridge.guestLanguage());
    if (specialized != null) {
      member = specialized.ownMembers.get(key);
    } else {
      final PolyglotObjectTypeSpecialization<T> unspecialized = this.unspecialized;
      member = unspecialized != null ? unspecialized.ownMembers.get(key) : null;
    }
    if (member == null) {
      member = this.ownMembers.get(key);
    }
    return member;
  }

  @Override
  public Collection<HostMember<? super T>> ownMembers(Bridge bridge, T self) {
    HashTrieMap<String, HostMember<? super T>> ownMembers = this.ownMembers;
    final PolyglotObjectTypeSpecialization<T> specialized = this.specializations.get(bridge.guestLanguage());
    if (specialized != null) {
      if (!specialized.ownMembers.isEmpty()) {
        ownMembers = ownMembers.updated(specialized.ownMembers);
      }
    } else {
      final PolyglotObjectTypeSpecialization<T> unspecialized = this.unspecialized;
      if (unspecialized != null && !unspecialized.ownMembers.isEmpty()) {
        ownMembers = ownMembers.updated(unspecialized.ownMembers);
      }
    }
    return ownMembers.values();
  }

  @Override
  public HostStaticMember getOwnStaticMember(Bridge bridge, String key) {
    HostStaticMember staticMember;
    final PolyglotObjectTypeSpecialization<T> specialized = this.specializations.get(bridge.guestLanguage());
    if (specialized != null) {
      staticMember = specialized.ownStaticMembers.get(key);
    } else {
      final PolyglotObjectTypeSpecialization<T> unspecialized = this.unspecialized;
      staticMember = unspecialized != null ? unspecialized.ownStaticMembers.get(key) : null;
    }
    if (staticMember == null) {
      staticMember = this.ownStaticMembers.get(key);
    }
    return staticMember;
  }

  @Override
  public Collection<HostStaticMember> ownStaticMembers(Bridge bridge) {
    HashTrieMap<String, HostStaticMember> ownStaticMembers = this.ownStaticMembers;
    final PolyglotObjectTypeSpecialization<T> specialized = this.specializations.get(bridge.guestLanguage());
    if (specialized != null) {
      if (!specialized.ownStaticMembers.isEmpty()) {
        ownStaticMembers = ownStaticMembers.updated(specialized.ownStaticMembers);
      }
    } else {
      final PolyglotObjectTypeSpecialization<T> unspecialized = this.unspecialized;
      if (unspecialized != null && !unspecialized.ownMembers.isEmpty()) {
        ownStaticMembers = ownStaticMembers.updated(unspecialized.ownStaticMembers);
      }
    }
    return ownStaticMembers.values();
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

  public void addSpecializedMember(String language, HostMember<? super T> member) {
    PolyglotObjectTypeSpecialization<T> specialized = this.specializations.get(language);
    if (specialized == null) {
      specialized = new PolyglotObjectTypeSpecialization<T>();
      this.specializations = this.specializations.updated(language, specialized);
    }
    specialized.addMember(member);
  }

  public void addSpecializedStaticMember(String language, HostStaticMember staticMember) {
    PolyglotObjectTypeSpecialization<T> specialized = this.specializations.get(language);
    if (specialized == null) {
      specialized = new PolyglotObjectTypeSpecialization<T>();
      this.specializations = this.specializations.updated(language, specialized);
    }
    specialized.addStaticMember(staticMember);
  }

  public void addUnspecializedMember(HostMember<? super T> member) {
    PolyglotObjectTypeSpecialization<T> unspecialized = this.unspecialized;
    if (unspecialized == null) {
      unspecialized = new PolyglotObjectTypeSpecialization<T>();
      this.unspecialized = unspecialized;
    }
    unspecialized.addMember(member);
  }

  public void addUnspecializedStaticMember(HostStaticMember staticMember) {
    PolyglotObjectTypeSpecialization<T> unspecialized = this.unspecialized;
    if (unspecialized == null) {
      unspecialized = new PolyglotObjectTypeSpecialization<T>();
      this.unspecialized = unspecialized;
    }
    unspecialized.addStaticMember(staticMember);
  }
}

final class PolyglotObjectTypeSpecialization<T> {
  HashTrieMap<String, HostMember<? super T>> ownMembers;
  HashTrieMap<String, HostStaticMember> ownStaticMembers;

  PolyglotObjectTypeSpecialization() {
    this.ownMembers = HashTrieMap.empty();
    this.ownStaticMembers = HashTrieMap.empty();
  }

  void addMember(HostMember<? super T> member) {
    this.ownMembers = this.ownMembers.updated(member.key(), member);
  }

  void addStaticMember(HostStaticMember staticMember) {
    this.ownStaticMembers = this.ownStaticMembers.updated(staticMember.key(), staticMember);
  }
}
