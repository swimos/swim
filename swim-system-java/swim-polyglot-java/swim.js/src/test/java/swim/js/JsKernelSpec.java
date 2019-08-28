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

import org.testng.annotations.Test;
import swim.actor.ActorSpaceDef;
import swim.kernel.Kernel;
import swim.server.ServerLoader;
import swim.uri.UriPath;
import swim.vm.js.JsStaticModuleResolver;
import static org.testng.Assert.assertNotNull;

public class JsKernelSpec {
  @Test
  public void testLoadJsPlane() {
    final JsKernel jsKernel = new JsKernel();
    final Kernel kernel = ServerLoader.loadServerStack().injectKernel(jsKernel);

    final JsStaticModuleResolver moduleResolver = new JsStaticModuleResolver();
    jsKernel.jsRuntime().setModuleResolver(moduleResolver);
    jsKernel.setRootPath(UriPath.empty());
    moduleResolver.defineModuleSource("main", ""
        + "class TestPlane {\n"
        + "  constructor(context) {\n"
        + "    this.context = context;\n"
        + "    console.log('TestPlane context:', context);\n"
        + "  }\n"
        + "}\n"
        + "module.exports = TestPlane\n");

    final ActorSpaceDef spaceDef = ActorSpaceDef.fromPlaneDef(JsPlaneDef.fromModulePath("main"));
    final JsPlane plane = (JsPlane) kernel.openSpace(spaceDef).getPlane("main");
    assertNotNull(plane);
  }

  @Test
  public void testRequireHostModuleFromJsPlane() {
    final JsKernel jsKernel = new JsKernel();
    final Kernel kernel = ServerLoader.loadServerStack().injectKernel(jsKernel);

    final JsStaticModuleResolver moduleResolver = new JsStaticModuleResolver();
    jsKernel.jsRuntime().setModuleResolver(moduleResolver);
    jsKernel.setRootPath(UriPath.empty());
    moduleResolver.defineModuleSource("main", ""
        + "const {Item} = require('@swim/structure');\n"
        + "class TestPlane {\n"
        + "  constructor(context) {\n"
        + "    this.context = context;\n"
        + "    console.log(Item.extant().toString());\n"
        + "  }\n"
        + "}\n"
        + "module.exports = TestPlane\n");

    final ActorSpaceDef spaceDef = ActorSpaceDef.fromPlaneDef(JsPlaneDef.fromModulePath("main"));
    final JsPlane plane = (JsPlane) kernel.openSpace(spaceDef).getPlane("main");
    assertNotNull(plane);
  }
}
