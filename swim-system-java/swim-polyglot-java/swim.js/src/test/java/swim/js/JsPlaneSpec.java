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

public class JsPlaneSpec {
  @Test
  public void testJsPlane() {
    final JsKernel jsKernel = new JsKernel();
    jsKernel.setRootPath(UriPath.parse(System.getProperty("project.dir")));
    final Kernel kernel = ServerLoader.loadServerStack().injectKernel(jsKernel);

    final ActorSpaceDef spaceDef = ActorSpaceDef.fromPlaneDef(JsPlaneDef.from("plane", "./src/test/js/TestPlane"));
    final JsPlane plane = (JsPlane) kernel.openSpace(spaceDef).getPlane("plane");

    try {
      kernel.start();
    } finally {
      kernel.stop();
    }
  }
}
