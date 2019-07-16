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
import swim.util.HashGenCacheMap;

public class JsCachedModuleResolver implements JsModuleResolver {
  final JsModuleResolver moduleResolver;
  final HashGenCacheMap<UriPath, Source> sourceCache;

  public JsCachedModuleResolver(JsModuleResolver moduleResolver) {
    this.moduleResolver = moduleResolver;
    this.sourceCache = createSourceCache();
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
    Source moduleSource = this.sourceCache.get(moduleId);
    if (moduleSource == null) {
      moduleSource = this.moduleResolver.loadModuleSource(moduleId);
      this.sourceCache.put(moduleId, moduleSource);
    }
    return moduleSource;
  }

  static HashGenCacheMap<UriPath, Source> createSourceCache() {
    int sourceCacheSize;
    try {
      sourceCacheSize = Integer.parseInt(System.getProperty("swim.vm.js.source.cache.size"));
    } catch (NumberFormatException e) {
      sourceCacheSize = 128;
    }
    return new HashGenCacheMap<UriPath, Source>(sourceCacheSize);
  }
}
