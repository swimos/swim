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

public class JavaHostPackage implements HostPackage {
  protected final String packageName;
  HashTrieMap<String, HostType<?>> hostTypeNames;
  HashTrieMap<Class<?>, HostType<?>> hostTypeClasses;

  public JavaHostPackage(String packageName) {
    this.packageName = packageName;
    this.hostTypeNames = HashTrieMap.empty();
    this.hostTypeClasses = HashTrieMap.empty();
  }

  @Override
  public final String packageName() {
    return this.packageName;
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
  public final Collection<HostType<?>> hostTypes() {
    return this.hostTypeClasses.values();
  }

  public void addHostType(HostType<?> hostType) {
    this.hostTypeNames = this.hostTypeNames.updated(hostType.typeName(), hostType);
    this.hostTypeClasses = this.hostTypeClasses.updated(hostType.hostClass(), hostType);
  }
}
