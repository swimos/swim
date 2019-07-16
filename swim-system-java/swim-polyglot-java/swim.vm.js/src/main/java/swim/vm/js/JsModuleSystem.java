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

import org.graalvm.polyglot.Context;
import swim.codec.Format;
import swim.collections.HashTrieMap;
import swim.uri.UriPath;

public class JsModuleSystem {
  final Context jsContext;
  final JsModuleLoader moduleLoader;
  HashTrieMap<UriPath, JsModule> modules;

  public JsModuleSystem(Context jsContext, JsModuleLoader moduleLoader) {
    this.jsContext = jsContext;
    this.moduleLoader = moduleLoader;
    this.modules = HashTrieMap.empty();
  }

  public JsModuleSystem(Context jsContext) {
    this(jsContext, new JsGuestModuleLoader());
  }

  public final Context jsContext() {
    return this.jsContext;
  }

  public final JsModuleLoader moduleLoader() {
    return this.moduleLoader;
  }

  public UriPath resolveModulePath(UriPath basePath, UriPath modulePath) {
    return this.moduleLoader.resolveModulePath(basePath, modulePath);
  }

  public final JsModule getModule(UriPath moduleId) {
    return this.modules.get(moduleId);
  }

  public final JsModule requireModule(UriPath basePath, UriPath modulePath) {
    final UriPath moduleId = resolveModulePath(basePath, modulePath);
    if (moduleId != null) {
      return requireModule(moduleId);
    } else {
      throw new JsModuleException("failed to resolve module " + Format.debug(modulePath.toString())
                                + " relative to " + Format.debug(basePath.toString()));
    }
  }

  public final JsModule requireModule(UriPath moduleId) {
    JsModule module = getModule(moduleId);
    if (module == null) {
      module = openModule(moduleId);
    }
    return module;
  }

  protected final JsModule openModule(UriPath moduleId) {
    final JsModule module = loadModule(moduleId);
    if (module != null) {
      this.modules = this.modules.updated(moduleId, module);
      evalModule(module);
      return module;
    } else {
      throw new JsModuleException("failed to load module " + Format.debug(moduleId.toString()));
    }
  }

  protected JsModule loadModule(UriPath moduleId) {
    return this.moduleLoader.loadModule(this, moduleId);
  }

  protected void evalModule(JsModule module) {
    this.moduleLoader.evalModule(module);
  }

  public static boolean isRelativeModulePath(UriPath modulePath) {
    if (modulePath.isDefined() && modulePath.isRelative()) {
      final String head = modulePath.head();
      return ".".equals(head) || "..".equals(head);
    }
    return false;
  }
}
