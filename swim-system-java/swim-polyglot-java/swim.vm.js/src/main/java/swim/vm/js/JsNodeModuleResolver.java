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

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import org.graalvm.polyglot.Source;
import swim.codec.Decoder;
import swim.codec.Unicode;
import swim.codec.Utf8;
import swim.json.Json;
import swim.structure.Value;
import swim.uri.UriPath;

public class JsNodeModuleResolver implements JsModuleResolver {
  final UriPath rootPath;

  public JsNodeModuleResolver(UriPath rootPath) {
    this.rootPath = rootPath;
  }

  public JsNodeModuleResolver() {
    this(UriPath.empty());
  }

  public final UriPath rootPath() {
    return this.rootPath;
  }

  @Override
  public UriPath resolveModulePath(UriPath basePath, UriPath modulePath) {
    if (JsModuleSystem.isRelativeModulePath(modulePath)) {
      return resolveRelativeModulePath(basePath, modulePath);
    } else {
      return resolveAbsoluteModulePath(basePath, modulePath);
    }
  }

  protected UriPath resolveRelativeModulePath(UriPath basePath, UriPath modulePath) {
    final UriPath absolutePath = basePath.appended(modulePath).removeDotSegments();
    UriPath moduleId = resolveModuleScript(absolutePath, "js");
    if (moduleId == null) {
      moduleId = resolveModuleDirectory(absolutePath);
    }
    return moduleId;
  }

  protected UriPath resolveAbsoluteModulePath(UriPath basePath, UriPath modulePath) {
    UriPath directoryPath = basePath.base();
    UriPath moduleId;
    do {
      moduleId = resolveNodeModulesPath(directoryPath, modulePath);
      if (moduleId != null) {
        break;
      }
      directoryPath = directoryPath.parent();
    } while (directoryPath.isDefined() && directoryPath.isRelativeTo(this.rootPath));
    return moduleId;
  }

  public UriPath resolveNodeModulesPath(UriPath directoryPath, UriPath modulePath) {
    final UriPath nodeModulesDirectoryPath = directoryPath.appendedSegment("node_modules");
    final File nodeModulesDirectory = new File(nodeModulesDirectoryPath.toString());
    if (nodeModulesDirectory.isDirectory()) {
      return resolveRelativeModulePath(nodeModulesDirectoryPath, modulePath);
    }
    return null;
  }

  public UriPath resolveModuleScript(UriPath modulePath, String extension) {
    final UriPath moduleFoot = modulePath.foot();
    if (moduleFoot.isDefined() && moduleFoot.isRelative()) {
      final String scriptName = moduleFoot.head() + '.' + extension;
      final UriPath scriptPath = modulePath.name(scriptName);
      final File scriptFile = new File(scriptPath.toString());
      if (scriptFile.exists()) {
        return scriptPath;
      }
    }
    return null;
  }

  public UriPath resolveModuleDirectory(UriPath directoryPath) {
    final File directory = new File(directoryPath.toString());
    if (directory.isDirectory()) {
      UriPath modulePath = resolveModuleDirectoryPackage(directoryPath);
      if (modulePath == null) {
        modulePath = resolveModuleDirectoryIndex(directoryPath, "js");
      }
      return modulePath;
    }
    return null;
  }

  public UriPath resolveModuleDirectoryIndex(UriPath directoryPath, String extension) {
    final String scriptName = "index" + '.' + extension;
    final UriPath scriptPath = directoryPath.appendedSegment(scriptName);
    final File scriptFile = new File(scriptPath.toString());
    if (scriptFile.exists()) {
      return scriptPath;
    }
    return null;
  }

  public UriPath resolveModuleDirectoryPackage(UriPath directoryPath) {
    final UriPath packagePath = directoryPath.appendedSegment("package.json");
    final File packageFile = new File(packagePath.toString());
    if (packageFile.exists()) {
      return resolveModulePackage(packagePath);
    }
    return null;
  }

  public UriPath resolveModulePackage(UriPath packagePath) {
    // TODO: cache package values
    final Value packageValue = loadPackage(packagePath);
    final String main = packageValue.get("main").stringValue(null);
    if (main != null) {
      final UriPath scriptPath = packagePath.resolve(UriPath.parse(main));
      if (scriptPath.isRelativeTo(this.rootPath)) {
        final File scriptFile = new File(scriptPath.toString());
        if (scriptFile.exists()) {
          return scriptPath;
        }
      }
    }
    return null;
  }

  public Value loadPackage(UriPath packagePath) {
    FileInputStream packageInput = null;
    try {
      packageInput = new FileInputStream(packagePath.toString());
      return Utf8.read(Json.structureParser().objectParser(), packageInput);
    } catch (IOException cause) {
      throw new JsModuleException(cause);
    } finally {
      try {
        if (packageInput != null) {
          packageInput.close();
        }
      } catch (IOException swallow) {
      }
    }
  }

  protected void prefixModuleSource(UriPath moduleId, StringBuilder sourceBuilder) {
    sourceBuilder.append("(function(require,module,exports){");
  }

  protected void suffixModuleSource(UriPath moduleId, StringBuilder sourceBuilder) {
    sourceBuilder.append("})(require,module,exports);");
  }

  @Override
  public Source loadModuleSource(UriPath moduleId) {
    final String moduleName = moduleId.toString();
    FileInputStream sourceInput = null;
    try {
      sourceInput = new FileInputStream(moduleName.toString());
      final StringBuilder sourceBuilder = new StringBuilder();
      prefixModuleSource(moduleId, sourceBuilder);
      final Decoder<String> sourceDecoder = Utf8.decode(Unicode.stringParser(sourceBuilder), sourceInput);
      if (sourceDecoder.isDone()) {
        suffixModuleSource(moduleId, sourceBuilder);
        final String source = sourceBuilder.toString();
        return Source.newBuilder("js", source, moduleName).buildLiteral();
      } else {
        throw new JsModuleException(sourceDecoder.trap());
      }
    } catch (IOException cause) {
      throw new JsModuleException(cause);
    } finally {
      try {
        if (sourceInput != null) {
          sourceInput.close();
        }
      } catch (IOException swallow) {
      }
    }
  }
}
