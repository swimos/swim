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
import org.graalvm.polyglot.Source;
import org.graalvm.polyglot.Value;
import swim.uri.UriPath;

public class JsGuestModule implements JsModule {
  final JsModuleSystem moduleSystem;
  final UriPath moduleId;
  final Source moduleSource;

  Value moduleExports;
  final JsGuestModuleObject moduleObject;
  final JsRequireFunction requireFunction;

  public JsGuestModule(JsModuleSystem moduleSystem, UriPath moduleId, Source moduleSource) {
    this.moduleSystem = moduleSystem;
    this.moduleId = moduleId;
    this.moduleSource = moduleSource;

    this.moduleExports = createModuleExports();
    this.moduleObject = createModuleObject();
    this.requireFunction = createRequireFunction();
  }

  @Override
  public final JsModuleSystem moduleSystem() {
    return this.moduleSystem;
  }

  @Override
  public final UriPath moduleId() {
    return this.moduleId;
  }

  public final Source moduleSource() {
    return this.moduleSource;
  }

  @Override
  public final Value moduleExports() {
    return this.moduleExports;
  }

  void setModuleExports(Value moduleExports) {
    this.moduleExports = moduleExports;
  }

  protected Value createModuleExports() {
    return this.moduleSystem.jsContext.asValue(new JsGuestModuleExports(this));
  }

  protected JsGuestModuleObject createModuleObject() {
    return new JsGuestModuleObject(this);
  }

  protected final JsGuestModuleObject moduleObject() {
    return this.moduleObject;
  }

  protected JsRequireFunction createRequireFunction() {
    return new JsRequireFunction(this);
  }

  public final JsRequireFunction requireFunction() {
    return this.requireFunction;
  }

  @Override
  public void evalModule() {
    final Context jsContext = this.moduleSystem.jsContext;
    final Value bindings = jsContext.getBindings("js");
    bindings.putMember("require", this.requireFunction);
    bindings.putMember("module", this.moduleObject);
    bindings.putMember("exports", this.moduleExports);
    this.moduleSystem.jsContext.eval(this.moduleSource);
    bindings.removeMember("exports");
    bindings.removeMember("module");
    bindings.removeMember("require");
  }

  public JsModule requireModule(UriPath modulePath) {
    return this.moduleSystem.requireModule(this.moduleId, modulePath);
  }
}
