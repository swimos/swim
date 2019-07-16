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

import org.graalvm.polyglot.Source;
import swim.uri.UriPath;

public class JsGuestModuleLoader implements JsModuleResolver, JsModuleLoader {
  final JsModuleResolver moduleResolver;

  public JsGuestModuleLoader(JsModuleResolver moduleResolver) {
    this.moduleResolver = moduleResolver;
  }

  public JsGuestModuleLoader() {
    this(new JsNodeModuleResolver());
  }

  public final JsModuleResolver moduleResolver() {
    return this.moduleResolver;
  }

  @Override
  public UriPath resolveModulePath(UriPath basePath, UriPath modulePath) {
    return this.moduleResolver.resolveModulePath(basePath, modulePath);
  }

  @Override
  public Source loadModuleSource(UriPath moduleId) {
    return this.moduleResolver.loadModuleSource(moduleId);
  }

  @Override
  public JsModule loadModule(JsModuleSystem moduleSystem, UriPath moduleId) {
    final Source moduleSource = loadModuleSource(moduleId);
    if (moduleSource != null) {
      return createModule(moduleSystem, moduleId, moduleSource);
    }
    return null;
  }

  protected JsModule createModule(JsModuleSystem moduleSystem, UriPath moduleId, Source moduleSource) {
    return new JsGuestModule(moduleSystem, moduleId, moduleSource);
  }

  @Override
  public void evalModule(JsModule module) {
    module.evalModule();
  }
}
