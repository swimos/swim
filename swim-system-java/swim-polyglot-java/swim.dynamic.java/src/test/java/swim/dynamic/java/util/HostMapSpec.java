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

package swim.dynamic.java.util;

import java.util.HashMap;
import java.util.Map;
import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.Value;
import org.testng.annotations.Test;
import swim.dynamic.JavaHostRuntime;
import swim.dynamic.java.JavaBase;
import swim.vm.VmBridge;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertNotNull;
import static org.testng.Assert.assertNull;
import static org.testng.Assert.assertTrue;

public class HostMapSpec {
  @Test
  public void testSpecializedMap() {
    try (Context context = Context.create()) {
      final JavaHostRuntime runtime = new JavaHostRuntime();
      final VmBridge bridge = new VmBridge(runtime, "js");
      runtime.addHostLibrary(JavaBase.LIBRARY);

      final Map<String, String> testMap = new HashMap<String, String>();
      testMap.put("foo", "bar");

      final Value bindings = context.getBindings("js");
      bindings.putMember("testMap", bridge.hostToGuest(testMap));

      assertNotNull(context.eval("js", "testMap.has").as(Object.class));
      assertNull(context.eval("js", "testMap.containsKey").as(Object.class));
      assertTrue(context.eval("js", "testMap.has('foo')").asBoolean());
      assertFalse(context.eval("js", "testMap.has('bar')").asBoolean());
    }
  }

  @Test
  public void testUnspecializedMap() {
    try (Context context = Context.create()) {
      final JavaHostRuntime runtime = new JavaHostRuntime();
      final VmBridge bridge = new VmBridge(runtime, "unknown");
      runtime.addHostLibrary(JavaBase.LIBRARY);

      final Map<String, String> testMap = new HashMap<String, String>();
      testMap.put("foo", "bar");

      final Value bindings = context.getBindings("js");
      bindings.putMember("testMap", bridge.hostToGuest(testMap));

      assertNull(context.eval("js", "testMap.has").as(Object.class));
      assertNotNull(context.eval("js", "testMap.containsKey").as(Object.class));
      assertTrue(context.eval("js", "testMap.containsKey('foo')").asBoolean());
      assertFalse(context.eval("js", "testMap.containsKey('bar')").asBoolean());
    }
  }
}
