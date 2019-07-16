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

package swim.dynamic.java.lang;

import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.Value;
import org.testng.annotations.Test;
import swim.dynamic.JavaHostRuntime;
import swim.dynamic.java.JavaBase;
import swim.vm.VmBridge;
import static org.testng.Assert.assertEquals;

public class HostThrowableSpec {
  @Test
  public void testThrowables() {
    try (Context context = Context.create()) {
      final JavaHostRuntime runtime = new JavaHostRuntime();
      final VmBridge bridge = new VmBridge(runtime, "js");
      runtime.addHostLibrary(JavaBase.LIBRARY);

      final Throwable testCause = new Throwable("test cause");
      final Throwable testThrowable = new Throwable("test throwable", testCause);

      final Value bindings = context.getBindings("js");
      bindings.putMember("testThrowable", bridge.hostToGuest(testThrowable));

      assertEquals(bridge.guestToHost(context.eval("js", "testThrowable")), testThrowable);
      assertEquals(context.eval("js", "testThrowable.getMessage()").asString(), "test throwable");
      assertEquals(bridge.guestToHost(context.eval("js", "testThrowable.getCause()")), testCause);
    }
  }
}
