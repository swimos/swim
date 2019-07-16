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
import swim.collections.HashTrieMap;
import swim.uri.UriPath;

public class JsStaticModuleResolver implements JsModuleResolver {
  HashTrieMap<UriPath, Source> moduleSources;

  public JsStaticModuleResolver() {
    this.moduleSources = HashTrieMap.empty();
  }

  @Override
  public UriPath resolveModulePath(UriPath basePath, UriPath modulePath) {
    return basePath.resolve(modulePath);
  }

  @Override
  public Source loadModuleSource(UriPath moduleId) {
    return this.moduleSources.get(moduleId);
  }

  protected void prefixModuleSource(UriPath moduleId, StringBuilder sourceBuilder) {
    sourceBuilder.append("(function(require,module,exports){");
  }

  protected void suffixModuleSource(UriPath moduleId, StringBuilder sourceBuilder) {
    sourceBuilder.append("})(require,module,exports);");
  }

  protected String processModuleSource(UriPath moduleId, String source) {
    final StringBuilder sourceBuilder = new StringBuilder();
    prefixModuleSource(moduleId, sourceBuilder);
    sourceBuilder.append(source);
    suffixModuleSource(moduleId, sourceBuilder);
    return sourceBuilder.toString();
  }

  public void defineModuleSource(UriPath moduleId, String source) {
    source = processModuleSource(moduleId, source);
    final String moduleName = moduleId.toString();
    final Source moduleSource = Source.newBuilder("js", source, moduleName).buildLiteral();
    this.moduleSources = this.moduleSources.updated(moduleId, moduleSource);
  }

  public void defineModuleSource(String moduleId, String source) {
    defineModuleSource(UriPath.parse(moduleId), source);
  }
}
