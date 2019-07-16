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
import swim.collections.HashTrieMap;

public class JavaHostLibrary implements HostLibrary {
  protected final String libraryName;
  HashTrieMap<String, HostPackage> hostPackages;
  HashTrieMap<String, HostType<?>> hostTypeNames;
  HashTrieMap<Class<?>, HostType<?>> hostTypeClasses;

  public JavaHostLibrary(String libraryName) {
    this.libraryName = libraryName;
    this.hostPackages = HashTrieMap.empty();
    this.hostTypeNames = HashTrieMap.empty();
    this.hostTypeClasses = HashTrieMap.empty();
  }

  @Override
  public final String libraryName() {
    return this.libraryName;
  }

  @Override
  public final HostPackage getHostPackage(String packageName) {
    return this.hostPackages.get(packageName);
  }

  @Override
  public final Collection<HostPackage> hostPackages() {
    return this.hostPackages.values();
  }

  @Override
  public final HostType<?> getHostType(String typeName) {
    return this.hostTypeNames.get(typeName);
  }

  @Override
  public final HostType<?> getHostType(Class<?> typeClass) {
    return this.hostTypeClasses.get(typeClass);
  }

  @Override
  public Collection<HostType<?>> hostTypes() {
    return this.hostTypeClasses.values();
  }

  public void addHostPackage(HostPackage hostPackage) {
    final String packageName = hostPackage.packageName();
    if (!this.hostPackages.containsKey(packageName)) {
      this.hostPackages = this.hostPackages.updated(packageName, hostPackage);
      for (HostType<?> hostType : hostPackage.hostTypes()) {
        addHostType(hostType);
      }
    }
  }

  public void addHostType(HostType<?> hostType) {
    this.hostTypeNames = this.hostTypeNames.updated(hostType.typeName(), hostType);
    this.hostTypeClasses = this.hostTypeClasses.updated(hostType.hostClass(), hostType);
  }
}
