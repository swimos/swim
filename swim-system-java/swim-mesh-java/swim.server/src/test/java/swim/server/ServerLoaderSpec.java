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

package swim.server;

import org.testng.annotations.Test;
import swim.actor.ActorKernel;
import swim.auth.AuthenticatorKernel;
import swim.java.JavaKernel;
import swim.kernel.BootKernel;
import swim.kernel.Kernel;
import swim.remote.RemoteKernel;
import swim.service.ServiceKernel;
import swim.service.web.WebServiceKernel;
import swim.store.db.DbStoreKernel;
import swim.store.mem.MemStoreKernel;
import static org.testng.Assert.assertNotNull;

public class ServerLoaderSpec {
  @Test
  public void testLoadServerStack() {
    final Kernel kernel = ServerLoader.loadServerStack();
    assertNotNull(kernel.unwrapKernel(BootKernel.class));
    assertNotNull(kernel.unwrapKernel(MemStoreKernel.class));
    assertNotNull(kernel.unwrapKernel(DbStoreKernel.class));
    assertNotNull(kernel.unwrapKernel(RemoteKernel.class));
    assertNotNull(kernel.unwrapKernel(ServiceKernel.class));
    assertNotNull(kernel.unwrapKernel(WebServiceKernel.class));
    assertNotNull(kernel.unwrapKernel(AuthenticatorKernel.class));
    assertNotNull(kernel.unwrapKernel(ActorKernel.class));
    assertNotNull(kernel.unwrapKernel(JavaKernel.class));
  }

  @Test
  public void testStartStopServerStack() {
    final Kernel kernel = ServerLoader.loadServerStack();
    kernel.start();
    kernel.stop();
  }
}
