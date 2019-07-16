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

import java.util.Map;
import swim.collections.HashTrieMap;
import swim.dynamic.HostLibrary;
import swim.dynamic.JavaHostRuntime;
import swim.uri.UriPath;

public class JsHostRuntime extends JavaHostRuntime implements JsRuntime {
  JsModuleResolver moduleResolver;
  HashTrieMap<UriPath, HostLibrary> hostModules;

  public JsHostRuntime(JsModuleResolver moduleResolver) {
    this.moduleResolver = moduleResolver;
    this.hostModules = HashTrieMap.empty();
  }

  public JsHostRuntime() {
    this(new JsNodeModuleResolver());
  }

  @Override
  public final JsModuleResolver moduleResolver() {
    return this.moduleResolver;
  }

  @Override
  public void setModuleResolver(JsModuleResolver moduleResolver) {
    this.moduleResolver = moduleResolver;
  }

  @Override
  public final HostLibrary getHostModule(UriPath moduleId) {
    return this.hostModules.get(moduleId);
  }

  @Override
  public final Map<UriPath, HostLibrary> hostModules() {
    return this.hostModules;
  }

  public void addHostModule(UriPath moduleId, HostLibrary hostLibrary) {
    this.hostModules = this.hostModules.updated(moduleId, hostLibrary);
  }

  public void addHostModule(String moduleId, HostLibrary hostLibrary) {
    addHostModule(UriPath.parse(moduleId), hostLibrary);
  }
}
