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

public class JavaHostRuntime implements HostRuntime {
  HashTrieMap<String, HostLibrary> hostLibraries;
  HashTrieMap<String, HostPackage> hostPackages;
  HashTrieMap<Class<?>, HostType<?>> hostTypes;

  public JavaHostRuntime() {
    this.hostLibraries = HashTrieMap.empty();
    this.hostPackages = HashTrieMap.empty();
    this.hostTypes = HashTrieMap.empty();
  }

  @Override
  public final HostLibrary getHostLibrary(String libraryName) {
    return this.hostLibraries.get(libraryName);
  }

  @Override
  public final Collection<HostLibrary> hostLibraries() {
    return this.hostLibraries.values();
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
  public final HostType<?> getHostType(Class<?> typeClass) {
    return this.hostTypes.get(typeClass);
  }

  @Override
  public final Collection<HostType<?>> hostTypes() {
    return this.hostTypes.values();
  }

  public void addHostLibrary(HostLibrary hostLibrary) {
    final String libraryName = hostLibrary.libraryName();
    if (!this.hostLibraries.containsKey(libraryName)) {
      this.hostLibraries = this.hostLibraries.updated(libraryName, hostLibrary);
      for (HostPackage hostPackage : hostLibrary.hostPackages()) {
        addHostPackage(hostPackage);
      }
    }
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
    this.hostTypes = this.hostTypes.updated(hostType.hostClass(), hostType);
  }
}
