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
import org.testng.annotations.Test;
import swim.dynamic.structure.SwimStructure;

public class JsHostPrototypeSpec {
  @Test
  public void testHostObjectPrototypeChain() {
    try (Context context = Context.create()) {
      final JsHostRuntime runtime = new JsHostRuntime();
      final JsBridge bridge = new JsBridge(runtime, context);

      runtime.addHostLibrary(SwimStructure.LIBRARY);
      runtime.addHostModule("@swim/structure", SwimStructure.LIBRARY);

      final JsModule module = bridge.eval("test", ""
          + "const {Item, Value, Absent} = require('@swim/structure');\n"
          + "console.log('Item.prototype: ' + Item.prototype);\n"
          + "console.log('Value.prototype: ' + Value.prototype);\n"
          + "console.log('Value.prototype.__proto__: ' + Value.prototype.__proto__);\n"
          + "console.log('Absent.prototype.__proto__: ' + Absent.prototype.__proto__);\n"
          + "console.log('Absent.prototype.__proto__.__proto__: ' + Absent.prototype.__proto__.__proto__);\n"
          + "console.log('Item.absent().__proto__: ' + Item.absent().__proto__);\n"
          + "module.exports = Item.absent().__proto__.constructor;\n");
      System.out.println("Item.absent().__proto__.constructor: " + bridge.guestToHost(module.moduleExports()));
    }
  }
}
