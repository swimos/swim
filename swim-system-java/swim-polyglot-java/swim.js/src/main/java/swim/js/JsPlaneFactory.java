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

package swim.js;

import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.Value;
import swim.api.plane.PlaneContext;
import swim.api.plane.PlaneFactory;
import swim.uri.UriPath;
import swim.vm.js.JsBridge;
import swim.vm.js.JsModule;
import swim.vm.js.JsModuleSystem;

public class JsPlaneFactory implements PlaneFactory<JsPlane> {
  protected final JsKernel jsKernel;
  protected final UriPath basePath;
  protected final JsPlaneDef planeDef;

  public JsPlaneFactory(JsKernel jsKernel, UriPath basePath, JsPlaneDef planeDef) {
    this.jsKernel = jsKernel;
    this.basePath = basePath;
    this.planeDef = planeDef;
  }

  public final JsKernel jsKernel() {
    return this.jsKernel;
  }

  public final UriPath basePath() {
    return this.basePath;
  }

  public final JsPlaneDef planeDef() {
    return this.planeDef;
  }

  protected Context createPlaneJsContext(PlaneContext planeContext) {
    return Context.newBuilder("js")
        .engine(this.jsKernel.jsEngine())
        // TODO: .in(...)
        // TODO: .out(...)
        // TODO: .err(...)
        // TODO: .logHandler(...)
        // TODO: .fileSystem(...)
        // TODO: .processHandler(...)
        // TODO: .serverTransport(...)
        .build();
  }

  protected JsBridge createPlaneJsBridge(PlaneContext planeContext, Context jsContext) {
    return new JsBridge(this.jsKernel.jsRuntime(), jsContext);
  }

  protected JsModuleSystem createPlaneModuleSystem(PlaneContext planeContext, Context jsContext, JsBridge jsBridge) {
    return new JsModuleSystem(jsContext, jsBridge);
  }

  protected JsModule requirePlaneModule(PlaneContext planeContext, JsModuleSystem moduleSystem) {
    return moduleSystem.requireModule(basePath(), this.planeDef.modulePath());
  }

  protected Value createGuestPlane(PlaneContext planeContext, JsBridge jsBridge, JsModule planeModule) {
    final Object guestPlaneContext = jsBridge.hostToGuest(planeContext);
    final Value planeExports = planeModule.moduleExports();
    final Value guestPlane;
    if (planeExports.canInstantiate()) {
      guestPlane = planeExports.newInstance(guestPlaneContext);
    } else {
      guestPlane = planeExports;
      if (guestPlane.hasMembers()) {
        guestPlane.putMember("context", guestPlaneContext);
      }
    }
    return guestPlane;
  }

  @Override
  public JsPlane createPlane(PlaneContext planeContext) {
    final Context jsContext = createPlaneJsContext(planeContext);
    final JsBridge jsBridge = createPlaneJsBridge(planeContext, jsContext);
    final JsModuleSystem moduleSystem = createPlaneModuleSystem(planeContext, jsContext, jsBridge);
    final JsModule module = requirePlaneModule(planeContext, moduleSystem);
    final Value guest = createGuestPlane(planeContext, jsBridge, module);
    return new JsPlane(planeContext, jsBridge, module, guest);
  }
}
